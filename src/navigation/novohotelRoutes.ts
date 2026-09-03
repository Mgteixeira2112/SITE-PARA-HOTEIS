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
  directOperational?: boolean;
  technical?: boolean;
}

/**
 * Contrato único de navegação do NovoHotel.
 *
 * Nenhuma regra de negócio é movida para cá. O contrato apenas declara o
 * destino estável e quais áreas já podem abrir uma tela operacional direta.
 * compatibilityWorkspaceId permanece durante a transição para permitir
 * rollback/fallback sem apagar a Fábrica.
 */
export const NOVOHOTEL_ROUTES: readonly NovoHotelRouteDefinition[] = [
  { id: 'dashboard', path: '/app', label: 'Dashboard Operacional', group: 'operacao', legacyAdminTab: 'dashboard', operationalSector: 'operacao', compatibilityWorkspaceId: 'workspace-operacao', directOperational: true },
  { id: 'reservas', path: '/app/reservas', label: 'Mapa de Reservas', group: 'operacao', legacyAdminTab: 'reservations' },
  { id: 'recepcao', path: '/app/recepcao', label: 'Check-in / Out', group: 'operacao', legacyAdminTab: 'checkin_out', operationalSector: 'recepcao', compatibilityWorkspaceId: 'workspace-recepcao', directOperational: true },
  { id: 'quartos', path: '/app/quartos', label: 'Quartos & Tarifas', group: 'operacao', legacyAdminTab: 'rooms' },
  { id: 'hospedes', path: '/app/hospedes', label: 'Hóspedes & CRM', group: 'operacao', legacyAdminTab: 'guests' },
  { id: 'governanca', path: '/app/governanca', label: 'Governança', group: 'operacao', operationalSector: 'governanca', compatibilityWorkspaceId: 'workspace-governanca', directOperational: true },
  { id: 'manutencao', path: '/app/manutencao', label: 'Manutenção', group: 'operacao', operationalSector: 'manutencao', compatibilityWorkspaceId: 'workspace-manutencao', directOperational: true },
  { id: 'kanban', path: '/app/kanban', label: 'Kanban Operacional', group: 'operacao', legacyAdminTab: 'kanban' },
  { id: 'pdv', path: '/app/pdv', label: 'PDV & Caixa', group: 'vendas', legacyAdminTab: 'pdv' },
  { id: 'kds', path: '/app/kds', label: 'KDS • Cozinha', group: 'vendas', legacyAdminTab: 'kds', operationalSector: 'cozinha', compatibilityWorkspaceId: 'workspace-cozinha', directOperational: true },
  { id: 'frigobar', path: '/app/frigobar', label: 'Frigobar & Estoque', group: 'vendas', legacyAdminTab: 'frigobar' },
  { id: 'financeiro', path: '/app/financeiro', label: 'Financeiro & Folio', group: 'gestao', legacyAdminTab: 'financial', compatibilityWorkspaceId: 'workspace-financeiro' },
  { id: 'indicadores', path: '/app/indicadores', label: 'BI & KPIs Gerenciais', group: 'gestao', legacyAdminTab: 'management_bi', managementOnly: true },
  { id: 'equipe', path: '/app/equipe', label: 'Equipe & Acessos', group: 'gestao', legacyAdminTab: 'users' },
  { id: 'automacoes', path: '/app/automacoes', label: 'Automações & Fechaduras', group: 'sistema', legacyAdminTab: 'automation' },
  { id: 'configuracoes', path: '/app/configuracoes', label: 'Configurações', group: 'sistema', legacyAdminTab: 'settings' },
  { id: 'configuracoes-site', path: '/app/configuracoes/site', label: 'Site do Hotel', group: 'sistema', legacyAdminTab: 'design' },
  { id: 'workspaces', path: '/app/sistema/workspaces', label: 'Fábrica de Workspaces', group: 'sistema', managementOnly: true, technical: true },
] as const;

export const getNovoHotelRoute = (id: NovoHotelRouteId) =>
  NOVOHOTEL_ROUTES.find(route => route.id === id) || null;

export const getNovoHotelRouteByPath = (path: string) =>
  NOVOHOTEL_ROUTES.find(route => route.path === path) || null;

export const getNovoHotelRouteByLegacyAdminTab = (tab: AdminTab) =>
  NOVOHOTEL_ROUTES.find(route => route.legacyAdminTab === tab) || null;

/** Resolve a primeira área do usuário que já possui tela operacional direta. */
export const getNovoHotelOperationalRouteForSectors = (sectorIds: OperationalSectorId[]) =>
  NOVOHOTEL_ROUTES.find(route =>
    !!route.operationalSector
    && route.directOperational === true
    && sectorIds.includes(route.operationalSector),
  ) || null;

export const getNovoHotelRoutesByGroup = (group: NovoHotelRouteGroup) =>
  NOVOHOTEL_ROUTES.filter(route => route.group === group);
