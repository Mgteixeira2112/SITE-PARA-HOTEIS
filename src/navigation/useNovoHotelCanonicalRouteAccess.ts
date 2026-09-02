import { useCallback, useEffect, useState } from 'react';
import type { NovoHotelRouteId } from './novohotelRoutes';
import { NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS } from './novoHotelCanonicalPermissions';
import {
  novoHotelAuthorizationService,
  type NovoHotelCanonicalAccessDecision,
} from '../services/novoHotelAuthorizationService';
import { hotelIdentityService } from '../services/hotelIdentityService';

export type NovoHotelCanonicalRouteDecisions = Partial<
  Record<NovoHotelRouteId, NovoHotelCanonicalAccessDecision>
>;

const CANONICAL_ROUTE_IDS = Object.keys(
  NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS,
) as NovoHotelRouteId[];

/**
 * Mantém no frontend o estado das permissões canônicas já disponíveis.
 * Rotas ainda não mapeadas ou consultas indisponíveis continuam podendo usar
 * a camada de compatibilidade durante a migração do RBAC.
 */
export const useNovoHotelCanonicalRouteAccess = () => {
  const [decisions, setDecisions] = useState<NovoHotelCanonicalRouteDecisions>({});
  const [loading, setLoading] = useState(true);

  const refreshCanonicalAccess = useCallback(async () => {
    setLoading(true);

    try {
      const hotelId = await hotelIdentityService.getActiveHotelId();
      const entries = await Promise.all(
        CANONICAL_ROUTE_IDS.map(async routeId => [
          routeId,
          await novoHotelAuthorizationService.getCanonicalRouteAccess(routeId, hotelId),
        ] as const),
      );

      setDecisions(Object.fromEntries(entries) as NovoHotelCanonicalRouteDecisions);
    } catch {
      // A ausência do hotel ativo não promove acesso: o shell mantém o contrato
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
