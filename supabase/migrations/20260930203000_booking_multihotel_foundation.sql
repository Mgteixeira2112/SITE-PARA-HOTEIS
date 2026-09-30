-- Booking multi-hotel foundation adapted to the current production schema.
-- Additive cutover from the legacy single-hotel database.
-- Scope: tenant registry + booking entities only. It does not enable Guia booking UI.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Tenant registry
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE','SUSPENDED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hoteis (
  id text primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null,
  slug text unique not null,
  product_plan text not null default 'BOOKING_LITE'
    check (product_plan in ('BOOKING_LITE','HOTEL_FULL')),
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE','SUSPENDED','ARCHIVED')),
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  locale text not null default 'pt-BR',
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hotel_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  hotel_id text not null references public.hoteis(id) on delete cascade,
  role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, hotel_id)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('PLATFORM_ADMIN','ORGANIZATION_ADMIN','VIEWER')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

-- Legacy cutover is only safe when this database still represents one hotel.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.hotel_settings;
  if v_count <> 1 then
    raise exception 'BOOKING_MULTI_HOTEL_CUTOVER_REQUIRES_ONE_LEGACY_HOTEL: found % hotel_settings rows', v_count;
  end if;
end $$;

insert into public.organizations(name, slug, status)
select
  coalesce(nullif(btrim(hs.hotel_name), ''), hs.id),
  'legacy-' || lower(regexp_replace(hs.id, '[^a-zA-Z0-9]+', '-', 'g')),
  'ACTIVE'
from public.hotel_settings hs
on conflict (slug) do update
set name = excluded.name,
    status = 'ACTIVE',
    updated_at = now();

insert into public.hoteis(
  id, organization_id, name, slug, product_plan, status, timezone, currency, locale
)
select
  hs.id,
  o.id,
  coalesce(nullif(btrim(hs.hotel_name), ''), hs.id),
  lower(regexp_replace(hs.id, '[^a-zA-Z0-9]+', '-', 'g')),
  'HOTEL_FULL',
  'ACTIVE',
  'America/Sao_Paulo',
  'BRL',
  'pt-BR'
from public.hotel_settings hs
join public.organizations o
  on o.slug = 'legacy-' || lower(regexp_replace(hs.id, '[^a-zA-Z0-9]+', '-', 'g'))
on conflict (id) do update
set organization_id = excluded.organization_id,
    name = excluded.name,
    product_plan = 'HOTEL_FULL',
    status = 'ACTIVE',
    updated_at = now();

-- Make hotel_settings a 1:1 settings extension of the canonical hotel registry.
alter table public.hotel_settings
  drop constraint if exists hotel_settings_hotel_registry_fkey;
alter table public.hotel_settings
  add constraint hotel_settings_hotel_registry_fkey
  foreign key (id) references public.hoteis(id) on delete restrict;

-- ---------------------------------------------------------------------------
-- 2. Current users -> current hotel
-- ---------------------------------------------------------------------------

insert into public.hotel_memberships(user_id, organization_id, hotel_id, role, active)
select
  su.id,
  h.organization_id,
  h.id,
  su.role,
  true
from public.staff_users su
cross join public.hoteis h
where su.active = true
  and (select count(*) from public.hoteis) = 1
on conflict (user_id, hotel_id) do update
set organization_id = excluded.organization_id,
    role = excluded.role,
    active = true,
    updated_at = now();

-- Only legacy administrators receive organization-wide administration.
insert into public.organization_memberships(organization_id, user_id, role, active)
select
  h.organization_id,
  su.id,
  'ORGANIZATION_ADMIN',
  true
from public.staff_users su
cross join public.hoteis h
where su.active = true
  and su.role = 'admin'
  and (select count(*) from public.hoteis) = 1
on conflict (organization_id, user_id) do update
set role = 'ORGANIZATION_ADMIN',
    active = true,
    updated_at = now();

-- ---------------------------------------------------------------------------
-- 3. Booking entities become hotel-scoped
-- ---------------------------------------------------------------------------

alter table public.rooms add column if not exists hotel_id text;
alter table public.guests add column if not exists hotel_id text;
alter table public.reservations add column if not exists hotel_id text;
alter table public.reservations add column if not exists source text not null default 'NOVOHOTEL';
alter table public.reservations add column if not exists source_reference text;

do $$
declare
  v_hotel_id text;
begin
  select id into strict v_hotel_id from public.hoteis limit 1;

  update public.rooms
  set hotel_id = v_hotel_id
  where hotel_id is null;

  update public.guests
  set hotel_id = v_hotel_id
  where hotel_id is null;

  update public.reservations
  set hotel_id = v_hotel_id
  where hotel_id is null;
end $$;

alter table public.rooms alter column hotel_id set not null;
alter table public.guests alter column hotel_id set not null;
alter table public.reservations alter column hotel_id set not null;

alter table public.rooms drop constraint if exists rooms_hotel_id_fkey;
alter table public.rooms
  add constraint rooms_hotel_id_fkey
  foreign key (hotel_id) references public.hoteis(id) on delete restrict;

alter table public.guests drop constraint if exists guests_hotel_id_fkey;
alter table public.guests
  add constraint guests_hotel_id_fkey
  foreign key (hotel_id) references public.hoteis(id) on delete restrict;

alter table public.reservations drop constraint if exists reservations_hotel_id_fkey;
alter table public.reservations
  add constraint reservations_hotel_id_fkey
  foreign key (hotel_id) references public.hoteis(id) on delete restrict;

-- Room numbers are unique inside a hotel, not globally across the platform.
alter table public.rooms drop constraint if exists rooms_number_key;
alter table public.rooms drop constraint if exists rooms_hotel_number_key;
alter table public.rooms
  add constraint rooms_hotel_number_key unique (hotel_id, number);

create index if not exists idx_rooms_hotel_status
  on public.rooms(hotel_id, status);
create index if not exists idx_guests_hotel_name
  on public.guests(hotel_id, full_name);
create index if not exists idx_reservations_hotel_dates
  on public.reservations(hotel_id, check_in_date, check_out_date);
create index if not exists idx_reservations_hotel_status
  on public.reservations(hotel_id, status);
create index if not exists idx_reservations_source
  on public.reservations(hotel_id, source, created_at desc);
create index if not exists idx_hotel_memberships_user
  on public.hotel_memberships(user_id, hotel_id) where active;

-- ---------------------------------------------------------------------------
-- 4. Access helpers and RLS scope
-- ---------------------------------------------------------------------------

create or replace function public.user_has_hotel_access(p_hotel_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.hotel_memberships hm
      where hm.user_id = auth.uid()
        and hm.hotel_id = p_hotel_id
        and hm.active
    )
    or exists (
      select 1
      from public.organization_memberships om
      join public.hoteis h on h.organization_id = om.organization_id
      where om.user_id = auth.uid()
        and om.role in ('PLATFORM_ADMIN','ORGANIZATION_ADMIN')
        and om.active
        and h.id = p_hotel_id
    );
$$;

revoke all on function public.user_has_hotel_access(text) from public;
grant execute on function public.user_has_hotel_access(text) to authenticated;

create or replace function public.user_has_organization_access(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.organization_memberships om
      where om.user_id = auth.uid()
        and om.organization_id = p_organization_id
        and om.active
    )
    or exists (
      select 1
      from public.hotel_memberships hm
      join public.hoteis h on h.id = hm.hotel_id
      where hm.user_id = auth.uid()
        and hm.active
        and h.organization_id = p_organization_id
    );
$$;

revoke all on function public.user_has_organization_access(uuid) from public;
grant execute on function public.user_has_organization_access(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.hoteis enable row level security;
alter table public.hotel_memberships enable row level security;
alter table public.organization_memberships enable row level security;

revoke all on public.organizations from anon;
revoke all on public.hoteis from anon;
revoke all on public.hotel_memberships from anon;
revoke all on public.organization_memberships from anon;

grant select on public.organizations to authenticated;
grant select on public.hoteis to authenticated;
grant select on public.hotel_memberships to authenticated;
grant select on public.organization_memberships to authenticated;

drop policy if exists organizations_member_read on public.organizations;
create policy organizations_member_read
on public.organizations
for select to authenticated
using (public.user_has_organization_access(id));

drop policy if exists hotels_member_read on public.hoteis;
create policy hotels_member_read
on public.hoteis
for select to authenticated
using (public.user_has_hotel_access(id));

drop policy if exists hotel_memberships_self_read on public.hotel_memberships;
create policy hotel_memberships_self_read
on public.hotel_memberships
for select to authenticated
using (user_id = auth.uid());

drop policy if exists organization_memberships_self_read on public.organization_memberships;
create policy organization_memberships_self_read
on public.organization_memberships
for select to authenticated
using (user_id = auth.uid());

-- RESTRICTIVE policies combine with the existing role/permission policies.
-- They cannot broaden access; they only add the mandatory hotel boundary.
drop policy if exists rooms_tenant_scope on public.rooms;
create policy rooms_tenant_scope
on public.rooms as restrictive
for all to authenticated
using (public.user_has_hotel_access(hotel_id))
with check (public.user_has_hotel_access(hotel_id));

drop policy if exists guests_tenant_scope on public.guests;
create policy guests_tenant_scope
on public.guests as restrictive
for all to authenticated
using (public.user_has_hotel_access(hotel_id))
with check (public.user_has_hotel_access(hotel_id));

drop policy if exists reservations_tenant_scope on public.reservations;
create policy reservations_tenant_scope
on public.reservations as restrictive
for all to authenticated
using (public.user_has_hotel_access(hotel_id))
with check (public.user_has_hotel_access(hotel_id));

-- ---------------------------------------------------------------------------
-- 5. Cross-tenant booking integrity
-- ---------------------------------------------------------------------------

create or replace function public.hotel_os_assert_reservation_tenant_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room_hotel text;
  v_guest_hotel text;
begin
  if new.room_id is not null then
    select r.hotel_id into v_room_hotel
    from public.rooms r
    where r.id = new.room_id;

    if v_room_hotel is distinct from new.hotel_id then
      raise exception 'RESERVATION_ROOM_CROSS_TENANT';
    end if;
  end if;

  if new.guest_id is not null then
    select g.hotel_id into v_guest_hotel
    from public.guests g
    where g.id = new.guest_id;

    if v_guest_hotel is distinct from new.hotel_id then
      raise exception 'RESERVATION_GUEST_CROSS_TENANT';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.hotel_os_assert_reservation_tenant_scope() from public;

drop trigger if exists reservations_tenant_scope_guard on public.reservations;
create trigger reservations_tenant_scope_guard
before insert or update of hotel_id, room_id, guest_id
on public.reservations
for each row execute function public.hotel_os_assert_reservation_tenant_scope();

comment on table public.hoteis is
  'Canonical hotel registry shared by Reservas Lite and NovoHotel full.';
comment on column public.hoteis.product_plan is
  'BOOKING_LITE or HOTEL_FULL. Upgrade keeps the same hotel_id and booking data.';
comment on column public.reservations.source is
  'Reservation origin, e.g. NOVOHOTEL, GUIA_MANTIQUEIRA, HOTEL_SITE or MANUAL.';
comment on table public.hotel_memberships is
  'User -> hotel -> role boundary used by booking tenant RLS.';
