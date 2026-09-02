import type { AdminTab } from '../types';
import type { OperationalSectorId } from '../domain/operationalSectors';

export type NovoHotelRouteGroup = 'operacao' | 'vendas' | 'gestao' | 'sistema';

export type NovoHotelRouteId =
  | 'dashboard'
  | 'reservas'
  | 'recepcao'
  | 'quartos'
  | 'hospedes'
  | 'governanca'
  | 'manutencao'
  | 'kanban'
  | 'pdv'
  | 'kds'
  | 'frigobar'
  | 'financeiro'
  | 'indicadores'
  | 'equipe'
  | 'automacoes'
  | 'configuracoes'
  | 'configuracoes-site'
  | 'workspaces';

export interface NovoHotelRouteDefinition {
  id: NovoHotelRouteId;
  path: string;
  label: string;
  group: NovoHotelRouteGroup;
  legacyAdminTab?: AdminTab;
  operationalSector?: OperationalSectorId;
  managementOnly?: boolean;
  compatibilityWorkspaceId?: string;
  technical?: boolean;
}

/**
 * Contrato único de navegação do NovoHotel.
 *
 * Nesta primeira etapa ele é deliberadamente declarativo e sem side effects:
 * nenhuma regra de negócio é movida para cá e o runtime de Workspace continua
 * disponível como fallback de compatibilidade. AdminLayout e o roteador
 * autenticado serão migrados incrementalmente para consumir este contrato.
 */
export const NOVOHOTEL_ROUTES: readonly NovoHotelRouteDefinition[] = [
  { id: 'dashboard', path: '/app', label: 'Visão Geral', group: 'operacao', legacyAdminTab: 'dashboard' },
  { id: 'reservas', path: '/app/reservas', label: 'Reservas', group: 'operacao', legacyAdminTab: 'reservations' },
  { id: 'recepcao', path: '/app/recepcao', label: 'Recepção', group: 'operacao', legacyAdminTab: 'checkin_out', operationalSector: 'recepcao', compatibilityWorkspaceId: 'workspace-recepcao' },
  { id: 'quartos', path: '/app/quartos', label: 'Quartos', group: 'operacao', legacyAdminTab: 'rooms' },
  { id: 'hospedes', path: '/app/hospedes', label: 'Hóspedes', group: 'operacao', legacyAdminTab: 'guests' },
  { id: 'governanca', path: '/app/governanca', label: 'Governança', group: 'operacao', operationalSector: 'governanca', compatibilityWorkspaceId: 'workspace-governanca' },
  { id: 'manutencao', path: '/app/manutencao', label: 'Manutenção', group: 'operacao', operationalSector: 'manutencao', compatibilityWorkspaceId: 'workspace-manutencao' },
  { id: 'kanban', path: '/app/kanban', label: 'Kanban', group: 'operacao', legacyAdminTab: 'kanban' },
  { id: 'pdv', path: '/app/pdv', label: 'PDV', group: 'vendas', legacyAdminTab: 'pdv' },
  { id: 'kds', path: '/app/kds', label: 'KDS / Cozinha', group: 'vendas', legacyAdminTab: 'kds', operationalSector: 'cozinha', compatibilityWorkspaceId: 'workspace-cozinha' },
  { id: 'frigobar', path: '/app/frigobar', label: 'Frigobar', group: 'vendas', legacyAdminTab: 'frigobar' },
  { id: 'financeiro', path: '/app/financeiro', label: 'Financeiro', group: 'gestao', legacyAdminTab: 'financial', compatibilityWorkspaceId: 'workspace-financeiro' },
  { id: 'indicadores', path: '/app/indicadores', label: 'Indicadores', group: 'gestao', legacyAdminTab: 'management_bi', managementOnly: true },
  { id: 'equipe', path: '/app/equipe', label: 'Equipe & Acessos', group: 'gestao', legacyAdminTab: 'users' },
  { id: 'automacoes', path: '/app/automacoes', label: 'Automações', group: 'sistema', legacyAdminTab: 'automation' },
  { id: 'configuracoes', path: '/app/configuracoes', label: 'Configurações', group: 'sistema', legacyAdminTab: 'settings' },
  { id: 'configuracoes-site', path: '/app/configuracoes/site', label: 'Site do Hotel', group: 'sistema', legacyAdminTab: 'design' },
  { id: 'workspaces', path: '/app/sistema/workspaces', label: 'Fábrica de Workspaces', group: 'sistema', managementOnly: true, technical: true },
] as const;

export const getNovoHotelRoute = (id: NovoHotelRouteId) =>
  NOVOHOTEL_ROUTES.find(route => route.id === id) || null;

export const getNovoHotelRouteByPath = (path: string) =>
  NOVOHOTEL_ROUTES.find(route => route.path === path) || null;

export const getNovoHotelRoutesByGroup = (group: NovoHotelRouteGroup) =>
  NOVOHOTEL_ROUTES.filter(route => route.group === group);
