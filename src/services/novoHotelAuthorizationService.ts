import { supabase } from '../lib/supabase';
import type { NovoHotelRouteId } from '../navigation/novohotelRoutes';
import { getNovoHotelCanonicalViewPermission } from '../navigation/novoHotelCanonicalPermissions';
import { hotelIdentityService } from './hotelIdentityService';

export type NovoHotelCanonicalAccessSource = 'canonical' | 'unmapped' | 'unavailable';

export interface NovoHotelCanonicalAccessDecision {
  allowed: boolean | null;
  source: NovoHotelCanonicalAccessSource;
  permission: string | null;
  hotelId: string | null;
  error?: string;
}

/**
 * Consulta o RBAC canônico do Supabase sem substituir ainda o fallback visual.
 *
 * `allowed: null` significa que a rota ainda não possui permissão mapeada ou
 * que o backend canônico não pôde ser consultado. O chamador pode manter a
 * compatibilidade atual sem transformar indisponibilidade em autorização.
 */
export const novoHotelAuthorizationService = {
  async getCanonicalRouteAccess(
    routeId: NovoHotelRouteId,
    preferredHotelId?: string | null,
  ): Promise<NovoHotelCanonicalAccessDecision> {
    const permission = getNovoHotelCanonicalViewPermission(routeId);
    if (!permission) {
      return {
        allowed: null,
        source: 'unmapped',
        permission: null,
        hotelId: null,
      };
    }

    try {
      const hotelId = await hotelIdentityService.getActiveHotelId(preferredHotelId);
      const { data, error } = await supabase.rpc('user_has_permission', {
        p_hotel_id: hotelId,
        p_permission: permission,
      });

      if (error) {
        return {
          allowed: null,
          source: 'unavailable',
          permission,
          hotelId,
          error: error.message,
        };
      }

      return {
        allowed: data === true,
        source: 'canonical',
        permission,
        hotelId,
      };
    } catch (error) {
      return {
        allowed: null,
        source: 'unavailable',
        permission,
        hotelId: preferredHotelId?.trim() || null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
