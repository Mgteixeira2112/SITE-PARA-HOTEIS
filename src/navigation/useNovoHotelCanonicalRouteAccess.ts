import { useCallback, useEffect, useState } from 'react';
import type { NovoHotelRouteId } from './novohotelRoutes';
import { NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS } from './novoHotelCanonicalPermissions';
import {
  novoHotelAuthorizationService,
  type NovoHotelCanonicalAccessDecision,
} from '../services/novoHotelAuthorizationService';
import { useNovoHotelTenant } from '../tenant/NovoHotelTenantContext';

export type NovoHotelCanonicalRouteDecisions = Partial<
  Record<NovoHotelRouteId, NovoHotelCanonicalAccessDecision>
>;

const CANONICAL_ROUTE_IDS = Object.keys(
  NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS,
) as NovoHotelRouteId[];

/**
 * Mantém no frontend o estado das permissões canônicas já disponíveis.
 * O hotel usado nas RPCs vem do contexto de tenant compartilhado do NovoHotel.
 */
export const useNovoHotelCanonicalRouteAccess = () => {
  const { tenant, loading: tenantLoading } = useNovoHotelTenant();
  const [decisions, setDecisions] = useState<NovoHotelCanonicalRouteDecisions>({});
  const [accessLoading, setAccessLoading] = useState(false);

  const refreshCanonicalAccess = useCallback(async () => {
    if (!tenant?.hotelId) {
      setDecisions({});
      setAccessLoading(false);
      return;
    }

    setAccessLoading(true);

    try {
      const entries = await Promise.all(
        CANONICAL_ROUTE_IDS.map(async routeId => [
          routeId,
          await novoHotelAuthorizationService.getCanonicalRouteAccess(routeId, tenant.hotelId),
        ] as const),
      );

      setDecisions(Object.fromEntries(entries) as NovoHotelCanonicalRouteDecisions);
    } catch {
      setDecisions({});
    } finally {
      setAccessLoading(false);
    }
  }, [tenant?.hotelId]);

  useEffect(() => {
    void refreshCanonicalAccess();
  }, [refreshCanonicalAccess]);

  const getCanonicalDecision = useCallback(
    (routeId: NovoHotelRouteId) => decisions[routeId] || null,
    [decisions],
  );

  return {
    decisions,
    loading: tenantLoading || accessLoading,
    getCanonicalDecision,
    refreshCanonicalAccess,
  };
};
