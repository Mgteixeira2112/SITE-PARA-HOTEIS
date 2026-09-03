import type { UserRole } from '../types';
import type { NovoHotelCanonicalAccessDecision } from '../services/novoHotelAuthorizationService';
import { getNovoHotelCanonicalViewPermission } from './novoHotelCanonicalPermissions';
import { canAccessNovoHotelRoute, type LegacyTabAccessResolver } from './novoHotelRouteAccess';
import type { NovoHotelRouteId } from './novohotelRoutes';

export type NovoHotelRouteAccessState = 'loading' | 'allowed' | 'denied';

/**
 * Resolve a autorização efetiva de uma rota estável do NovoHotel.
 *
 * Rotas já mapeadas no RBAC canônico aguardam a primeira consulta antes de
 * montar a tela. Uma decisão canônica sempre prevalece sobre o RBAC visual
 * legado. Apenas rotas não mapeadas ou consultas indisponíveis continuam pela
 * ponte de compatibilidade durante a migração.
 */
export const resolveNovoHotelRouteAccess = (
  routeId: NovoHotelRouteId,
  role: UserRole,
  hasLegacyTabAccess: LegacyTabAccessResolver,
  canonicalDecision: NovoHotelCanonicalAccessDecision | null,
  canonicalLoading: boolean,
): NovoHotelRouteAccessState => {
  const canonicalPermission = getNovoHotelCanonicalViewPermission(routeId);

  if (canonicalPermission && canonicalLoading && !canonicalDecision) {
    return 'loading';
  }

  if (canonicalDecision?.source === 'canonical') {
    return canonicalDecision.allowed === true ? 'allowed' : 'denied';
  }

  return canAccessNovoHotelRoute(routeId, role, hasLegacyTabAccess)
    ? 'allowed'
    : 'denied';
};
