import React from 'react';
import { AdminTab } from '../../types';
import { AutomationModule } from './AutomationModule';
import { DashboardAlertsWidget } from './DashboardAlertsWidget';
import { DashboardModule } from './DashboardModule';
import { ExecutiveDashboardModule } from './ExecutiveDashboardModule';
import { FinancialModule } from './FinancialModule';
import { FrigobarModule } from './FrigobarModule';
import { GuestsModule } from './GuestsModule';
import { HotelOSCommandCenter } from './HotelOSCommandCenter';
import { KDSPage } from './KDSPage';
import { KanbanWorkspaceModule } from './KanbanWorkspaceModule';
import { PDVPage } from './PDVPage';
import { ReservationsModule } from './ReservationsModule';
import { RoomsModule } from './RoomsModule';
import { SettingsModule } from './SettingsModule';
import { CheckInOutModule } from './CheckInOutModule';
import { UsersOperationalAccessModule } from './UsersOperationalAccessModule';
import { WorkspaceEditorModule } from './WorkspaceEditorModule';

export type NovoHotelRenderableAdminTab = AdminTab | 'workspace_editor';

/**
 * Catálogo de renderização dos módulos administrativos do NovoHotel.
 *
 * O shell de navegação não precisa conhecer a implementação de cada tela. Este
 * componente preserva os módulos existentes e apenas centraliza a resolução da
 * superfície visual correspondente à aba legada durante a transição para rotas
 * SaaS estáveis.
 */
export const NovoHotelModuleRenderer: React.FC<{ activeTab: NovoHotelRenderableAdminTab }> = ({ activeTab }) => (
  <>
    {activeTab === 'dashboard' && <DashboardModule />}
    {activeTab === 'management_bi' && <><ExecutiveDashboardModule /><DashboardAlertsWidget /></>}
    {activeTab === 'command_center' && <HotelOSCommandCenter />}
    {activeTab === 'workspace_editor' && <WorkspaceEditorModule />}
    {activeTab === 'kanban' && <KanbanWorkspaceModule />}
    {activeTab === 'reservations' && <ReservationsModule />}
    {activeTab === 'checkin_out' && <CheckInOutModule />}
    {activeTab === 'rooms' && <RoomsModule />}
    {activeTab === 'guests' && <GuestsModule />}
    {activeTab === 'financial' && <FinancialModule />}
    {activeTab === 'frigobar' && <FrigobarModule />}
    {activeTab === 'automation' && <AutomationModule />}
    {activeTab === 'users' && <UsersOperationalAccessModule />}
    {activeTab === 'pdv' && <PDVPage />}
    {activeTab === 'kds' && <KDSPage />}
    {(activeTab === 'settings' || activeTab === 'design') && <SettingsModule />}
  </>
);
