import React from 'react';
import { AdminTab } from '../../types';
import type { NovoHotelRouteId } from '../../navigation/novohotelRoutes';
import { AutomationModule } from './AutomationModule';
import { DashboardAlertsWidget } from './DashboardAlertsWidget';
import { DashboardModule } from './DashboardModule';
import { ExecutiveDashboardModule } from './ExecutiveDashboardModule';
import { FinancialModule } from './FinancialModule';
import { FrigobarModule } from './FrigobarModule';
import { GovernanceModule } from './GovernanceModule';
import { GuestsModule } from './GuestsModule';
import { HotelOSCommandCenter } from './HotelOSCommandCenter';
import { KDSPage } from './KDSPage';
import { KanbanWorkspaceModule } from './KanbanWorkspaceModule';
import { MaintenanceModule } from './MaintenanceModule';
import { PDVPage } from './PDVPage';
import { ReservationsModule } from './ReservationsModule';
import { RoomsModule } from './RoomsModule';
import { SettingsModule } from './SettingsModule';
import { CheckInOutModule } from './CheckInOutModule';
import { UsersOperationalAccessModule } from './UsersOperationalAccessModule';
import { WorkspaceEditorModule } from './WorkspaceEditorModule';

export type NovoHotelRenderableAdminTab = AdminTab | 'workspace_editor';

interface NovoHotelModuleRendererProps {
  routeId?: NovoHotelRouteId | null;
  activeTab: NovoHotelRenderableAdminTab;
}

/**
 * Catálogo de renderização dos módulos administrativos do NovoHotel.
 *
 * As rotas canônicas passam a ser a identidade principal das telas. activeTab
 * permanece somente como ponte de compatibilidade para superfícies técnicas que
 * ainda não possuem rota funcional própria, como a Central Hotel OS.
 */
export const NovoHotelModuleRenderer: React.FC<NovoHotelModuleRendererProps> = ({ routeId, activeTab }) => (
  <>
    {routeId === 'dashboard' && <DashboardModule />}
    {routeId === 'indicadores' && <><ExecutiveDashboardModule /><DashboardAlertsWidget /></>}
    {routeId === 'workspaces' && <WorkspaceEditorModule />}
    {routeId === 'kanban' && <KanbanWorkspaceModule />}
    {routeId === 'reservas' && <ReservationsModule />}
    {routeId === 'recepcao' && <CheckInOutModule />}
    {routeId === 'quartos' && <RoomsModule />}
    {routeId === 'hospedes' && <GuestsModule />}
    {routeId === 'governanca' && <GovernanceModule />}
    {routeId === 'manutencao' && <MaintenanceModule />}
    {routeId === 'financeiro' && <FinancialModule />}
    {routeId === 'frigobar' && <FrigobarModule />}
    {routeId === 'automacoes' && <AutomationModule />}
    {routeId === 'equipe' && <UsersOperationalAccessModule />}
    {routeId === 'pdv' && <PDVPage />}
    {routeId === 'kds' && <KDSPage />}
    {(routeId === 'configuracoes' || routeId === 'configuracoes-site') && <SettingsModule />}

    {!routeId && activeTab === 'command_center' && <HotelOSCommandCenter />}

    {/* Compatibilidade temporária para consumidores que ainda não enviam routeId. */}
    {!routeId && activeTab === 'dashboard' && <DashboardModule />}
    {!routeId && activeTab === 'management_bi' && <><ExecutiveDashboardModule /><DashboardAlertsWidget /></>}
    {!routeId && activeTab === 'workspace_editor' && <WorkspaceEditorModule />}
    {!routeId && activeTab === 'kanban' && <KanbanWorkspaceModule />}
    {!routeId && activeTab === 'reservations' && <ReservationsModule />}
    {!routeId && activeTab === 'checkin_out' && <CheckInOutModule />}
    {!routeId && activeTab === 'rooms' && <RoomsModule />}
    {!routeId && activeTab === 'guests' && <GuestsModule />}
    {!routeId && activeTab === 'financial' && <FinancialModule />}
    {!routeId && activeTab === 'frigobar' && <FrigobarModule />}
    {!routeId && activeTab === 'automation' && <AutomationModule />}
    {!routeId && activeTab === 'users' && <UsersOperationalAccessModule />}
    {!routeId && activeTab === 'pdv' && <PDVPage />}
    {!routeId && activeTab === 'kds' && <KDSPage />}
    {!routeId && (activeTab === 'settings' || activeTab === 'design') && <SettingsModule />}
  </>
);
