import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const migration = readFileSync(
  'supabase/migrations/20260930203000_booking_multihotel_foundation.sql',
  'utf8',
);

test('fundação reaproveita o hotel legado sem duplicar dados', () => {
  assert.match(migration, /from public\.hotel_settings hs/);
  assert.match(migration, /BOOKING_MULTI_HOTEL_CUTOVER_REQUIRES_ONE_LEGACY_HOTEL/);
  assert.match(migration, /insert into public\.hoteis/);
  assert.match(migration, /product_plan.*HOTEL_FULL/s);
  assert.match(migration, /hotel_settings_hotel_registry_fkey/);
});

test('usuários atuais recebem membership do hotel legado', () => {
  assert.match(migration, /insert into public\.hotel_memberships/);
  assert.match(migration, /from public\.staff_users su/);
  assert.match(migration, /su\.active = true/);
  assert.match(migration, /unique\(user_id, hotel_id\)/);
  assert.match(migration, /ORGANIZATION_ADMIN/);
});

test('quartos hóspedes e reservas passam a ter hotel_id obrigatório', () => {
  for (const table of ['rooms', 'guests', 'reservations']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} add column if not exists hotel_id text`));
    assert.match(migration, new RegExp(`alter table public\\.${table} alter column hotel_id set not null`));
    assert.match(migration, new RegExp(`${table}_hotel_id_fkey`));
  }
});

test('quarto é único por hotel e não globalmente', () => {
  assert.match(migration, /drop constraint if exists rooms_number_key/);
  assert.match(migration, /rooms_hotel_number_key unique \(hotel_id, number\)/);
});

test('reserva registra origem sem quebrar registros legados', () => {
  assert.match(
    migration,
    /add column if not exists source text not null default 'NOVOHOTEL'/,
  );
  assert.match(migration, /add column if not exists source_reference text/);
  assert.match(migration, /GUIA_MANTIQUEIRA/);
});

test('RLS de booking adiciona fronteira restritiva por hotel', () => {
  assert.match(migration, /create or replace function public\.user_has_hotel_access/);

  for (const table of ['rooms', 'guests', 'reservations']) {
    assert.match(
      migration,
      new RegExp(`create policy ${table}_tenant_scope[\\s\\S]*on public\\.${table} as restrictive`),
    );
    assert.match(
      migration,
      new RegExp(`user_has_hotel_access\\(hotel_id\\)`),
    );
  }
});

test('reserva não pode ligar quarto ou hóspede de outro hotel', () => {
  assert.match(migration, /hotel_os_assert_reservation_tenant_scope/);
  assert.match(migration, /RESERVATION_ROOM_CROSS_TENANT/);
  assert.match(migration, /RESERVATION_GUEST_CROSS_TENANT/);
  assert.match(migration, /reservations_tenant_scope_guard/);
});

test('mesmo hotel_id suporta Reservas Lite e NovoHotel completo', () => {
  assert.match(
    migration,
    /check \(product_plan in \('BOOKING_LITE','HOTEL_FULL'\)\)/,
  );
  assert.match(migration, /Upgrade keeps the same hotel_id and booking data/);
});
