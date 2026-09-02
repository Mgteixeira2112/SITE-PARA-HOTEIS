import type { AdminTab } from '../types';
import {
  getNovoHotelRoute,
  getNovoHotelRouteByLegacyAdminTab,
  type NovoHotelRouteId,
} from './novohotelRoutes';

export type NovoHotelCompatibilityTab = AdminTab | 'workspace_editor' | 'command_center';

/**
 * Traduz temporariamente a identidade canônica do NovoHotel para o estado legado
 * de abas ainda mantido pelo HotelContext. Nenhuma tela deve criar mapeamentos
 * próprios durante a transição.
 */
export const getCompatibilityTabForNovoHotelRoute = (
  routeId: NovoHotelRouteId,
): NovoHotelCompatibilityTab | null => {
  if (routeId === 'workspaces') return 'workspace_editor';
  return getNovoHotelRoute(routeId)?.legacyAdminTab || null;
};

/** Resolve o estado legado atual para a rota canônica correspondente. */
export const getNovoHotelRouteIdFromCompatibilityTab = (
  tab: NovoHotelCompatibilityTab,
): NovoHotelRouteId | null => {
  if (tab === 'workspace_editor') return 'workspaces';
  if (tab === 'command_center') return null;
  return getNovoHotelRouteByLegacyAdminTab(tab)?.id || null;
};
