import { useCallback, useEffect, useState } from 'react';
import type { NovoHotelRouteId } from './novohotelRoutes';
import { NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS } from './novoHotelCanonicalPermissions';
import {
  novoHotelAuthorizationService,
  type NovoHotelCanonicalAccessDecision,
} from '../services/novoHotelAuthorizationService';
import { novoHotelTenantContextService } from '../services/novoHotelTenantContextService';

export type NovoHotelCanonicalRouteDecisions = Partial<
  Record<NovoHotelRouteId, NovoHotelCanonicalAccessDecision>
>;

const CANONICAL_ROUTE_IDS = Object.keys(
  NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS,
) as NovoHotelRouteId[];

/**
 * Mantém no frontend o estado das permissões canônicas já disponíveis.
 * O hotel usado nas RPCs vem primeiro do membership multi-tenant autenticado;
 * hotel_config permanece apenas como fallback dentro do resolver de tenant.
 */
export const useNovoHotelCanonicalRouteAccess = () => {
  const [decisions, setDecisions] = useState<NovoHotelCanonicalRouteDecisions>({});
  const [loading, setLoading] = useState(true);

  const refreshCanonicalAccess = useCallback(async () => {
    setLoading(true);

    try {
      const tenant = await novoHotelTenantContextService.getActiveTenant();
      const entries = await Promise.all(
        CANONICAL_ROUTE_IDS.map(async routeId => [
          routeId,
          await novoHotelAuthorizationService.getCanonicalRouteAccess(routeId, tenant.hotelId),
        ] as const),
      );

      setDecisions(Object.fromEntries(entries) as NovoHotelCanonicalRouteDecisions);
    } catch {
      // A ausência do tenant ativo não promove acesso: o shell mantém o contrato
      // legado até que o contexto canônico possa ser consultado novamente.
      setDecisions({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCanonicalAccess();
  }, [refreshCanonicalAccess]);

  const getCanonicalDecision = useCallback(
    (routeId: NovoHotelRouteId) => decisions[routeId] || null,
    [decisions],
  );

  return {
    decisions,
    loading,
    getCanonicalDecision,
    refreshCanonicalAccess,
  };
};
