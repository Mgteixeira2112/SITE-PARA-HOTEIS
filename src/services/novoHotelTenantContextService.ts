import { supabase } from '../lib/supabase';
import { hotelIdentityService } from './hotelIdentityService';

export type NovoHotelTenantSource = 'hotel_membership' | 'organization_membership' | 'legacy_hotel_config';

export interface NovoHotelTenantContext {
  hotelId: string;
  organizationId: string | null;
  role: string | null;
  source: NovoHotelTenantSource;
}

/**
 * Resolve o hotel ativo a partir da identidade autenticada e dos vínculos
 * multi-tenant existentes. O hotel_config permanece apenas como fallback de
 * compatibilidade enquanto instalações antigas ainda não possuem memberships.
 */
export const novoHotelTenantContextService = {
  async getActiveTenant(): Promise<NovoHotelTenantContext> {
    const { data: hotelMembership, error: hotelMembershipError } = await supabase
      .from('hotel_memberships')
      .select('hotel_id, organization_id, role, updated_at')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!hotelMembershipError && typeof hotelMembership?.hotel_id === 'string' && hotelMembership.hotel_id.trim()) {
      return {
        hotelId: hotelMembership.hotel_id.trim(),
        organizationId: typeof hotelMembership.organization_id === 'string' ? hotelMembership.organization_id : null,
        role: typeof hotelMembership.role === 'string' ? hotelMembership.role : null,
        source: 'hotel_membership',
      };
    }

    const { data: organizationMembership, error: organizationMembershipError } = await supabase
      .from('organization_memberships')
      .select('organization_id, role, updated_at')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!organizationMembershipError && typeof organizationMembership?.organization_id === 'string') {
      const organizationId = organizationMembership.organization_id;
      const { data: hotel, error: hotelError } = await supabase
        .from('hoteis')
        .select('id, organization_id, updated_at')
        .eq('organization_id', organizationId)
        .eq('status', 'ACTIVE')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!hotelError && hotel?.id) {
        return {
          hotelId: String(hotel.id),
          organizationId,
          role: typeof organizationMembership.role === 'string' ? organizationMembership.role : null,
          source: 'organization_membership',
        };
      }
    }

    const hotelId = await hotelIdentityService.getActiveHotelId();
    return {
      hotelId,
      organizationId: null,
      role: null,
      source: 'legacy_hotel_config',
    };
  },
};
