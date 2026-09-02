import type { AdminTab, UserRole } from '../types';
import { getNovoHotelRoute, type NovoHotelRouteId } from './novohotelRoutes';

export type LegacyTabAccessResolver = (role: UserRole, tab: AdminTab) => boolean;

const MANAGEMENT_ROLES: readonly UserRole[] = ['admin', 'gerente'];
const INDICATOR_ROLES: readonly UserRole[] = ['admin', 'gerente', 'financeiro'];

/**
 * Fronteira única de acesso às rotas estáveis do NovoHotel.
 *
 * Durante a transição, rotas comuns continuam delegando ao contrato legado
 * `hasTabAccess`. Regras especiais que antes ficavam espalhadas no shell ficam
 * centralizadas aqui, sem substituir o RBAC/RLS canônico do Supabase.
 */
export const canAccessNovoHotelRoute = (
  routeId: NovoHotelRouteId,
  role: UserRole,
  hasLegacyTabAccess: LegacyTabAccessResolver,
): boolean => {
  const route = getNovoHotelRoute(routeId);
  if (!route) return false;

  if (routeId === 'indicadores') return INDICATOR_ROLES.includes(role);
  if (route.managementOnly || routeId === 'workspaces') return MANAGEMENT_ROLES.includes(role);

  if (!route.legacyAdminTab) {
    return route.directOperational === true;
  }

  return hasLegacyTabAccess(role, route.legacyAdminTab);
};
