import React, { useMemo, useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { AdminHeader } from '../navigation/AdminHeader';
import { DashboardModule } from './DashboardModule';
import { ExecutiveDashboardModule } from './ExecutiveDashboardModule';
import { DashboardAlertsWidget } from './DashboardAlertsWidget';
import { RoomsModule } from './RoomsModule';
import { ReservationsModule } from './ReservationsModule';
import { CheckInOutModule } from './CheckInOutModule';
import { GuestsModule } from './GuestsModule';
import { FrigobarModule } from './FrigobarModule';
import { AutomationModule } from './AutomationModule';
import { SettingsModule } from './SettingsModule';
import { UsersOperationalAccessModule } from './UsersOperationalAccessModule';
import { KanbanWorkspaceModule } from './KanbanWorkspaceModule';
import { KanbanLocalAutomationBridge } from './KanbanLocalAutomationBridge';
import { WorkspaceEditorModule } from './WorkspaceEditorModule';
import { PDVPage } from './PDVPage';
import { KDSPage } from './KDSPage';
import { HotelOSCommandCenter } from './HotelOSCommandCenter';
import { FinancialModule } from './FinancialModule';
import {
  LayoutDashboard,
  BarChart3,
  BedDouble,
  CalendarDays,
  LogIn,
  Users,
  DollarSign,
  ShoppingBag,
  Bot,
  UserCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  Columns3,
  CreditCard,
  ChefHat,
  Sparkles,
  Layers,
  UtensilsCrossed,
  Briefcase,
  Sliders,
  LayoutTemplate,
  Globe2,
} from 'lucide-react';
import { AdminTab } from '../../types';
import { getTheme, getFontFamilyClass } from '../../utils/themeHelper';
import {
  NOVOHOTEL_ROUTES,
  type NovoHotelRouteGroup,
  type NovoHotelRouteId,
} from '../../navigation/novohotelRoutes';

type NavContextId = NovoHotelRouteGroup;
type ExtendedAdminTab = AdminTab | 'workspace_editor';
interface NavItemConfig {
  id: ExtendedAdminTab;
  routeId?: NovoHotelRouteId;
  path?: string;
  context: NavContextId;
  label: string;
  shortLabel?: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  description?: string;
  managementOnly?: boolean;
  technical?: boolean;
}

const routeIcons: Record<NovoHotelRouteId, React.FC<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  reservas: CalendarDays,
  recepcao: LogIn,
  quartos: BedDouble,
  hospedes: Users,
  governanca: UserCheck,
  manutencao: Sliders,
  kanban: Columns3,
  pdv: CreditCard,
  kds: ChefHat,
  frigobar: ShoppingBag,
  financeiro: DollarSign,
  indicadores: BarChart3,
  equipe: UserCheck,
  automacoes: Bot,
  configuracoes: Sliders,
  'configuracoes-site': Globe2,
  workspaces: LayoutTemplate,
};

export const AdminLayout: React.FC = () => {
  const { hotelConfig, adminActiveTab, setAdminActiveTab, reservations, users, currentUser, hasTabAccess } = useHotel();
  const theme = getTheme(hotelConfig?.tema_cor);
  const fontClass = getFontFamilyClass(hotelConfig?.tipografia);
  const checkinsTodayCount = reservations.filter((r) => r.status === 'confirmada').length;
  const activeUsersCount = users.filter(u => u.ativo).length;
  const pendingKanbanCount = 0;
  const activeTab = adminActiveTab as ExtendedAdminTab;

  const navItems: NavItemConfig[] = useMemo(() => {
    const routeItems = NOVOHOTEL_ROUTES
      .filter(route => route.legacyAdminTab || route.id === 'workspaces')
      .map<NavItemConfig>(route => ({
        id: route.id === 'workspaces' ? 'workspace_editor' : route.legacyAdminTab as AdminTab,
        routeId: route.id,
        path: route.path,
        context: route.group,
        label: route.label,
        icon: routeIcons[route.id],
        badge:
          route.id === 'recepcao' ? checkinsTodayCount :
          route.id === 'equipe' ? activeUsersCount :
          route.id === 'kanban' ? pendingKanbanCount :
          undefined,
        description: route.technical ? 'Ferramenta técnica mantida durante a transição do NovoHotel' : undefined,
        managementOnly: route.managementOnly,
        technical: route.technical,
      }));

    // Central Hotel OS continua acessível durante a transição, mas não define a
    // navegação principal do NovoHotel nem cria uma nova rota funcional.
    routeItems.push({
      id: 'command_center',
      context: 'sistema',
      label: 'Central Hotel OS',
      icon: Sparkles,
      description: 'Compatibilidade administrativa do sistema atual',
      managementOnly: true,
      technical: true,
    });

    return routeItems;
  }, [checkinsTodayCount, activeUsersCount]);

  const contexts: { id: NavContextId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'operacao', label: 'Operação', icon: Layers },
    { id: 'vendas', label: 'Vendas & Consumo', icon: UtensilsCrossed },
    { id: 'gestao', label: 'Gestão & BI', icon: Briefcase },
    { id: 'sistema', label: 'Sistema', icon: Sliders },
  ];

  const currentTab = navItems.find(item => item.id === activeTab) || navItems[0];
  const [activeContext, setActiveContext] = useState<NavContextId>(currentTab.context);
  React.useEffect(() => {
    if (currentTab.context !== activeContext) setActiveContext(currentTab.context);
  }, [activeTab, currentTab.context]);

  const userRole = currentUser?.tipo_usuario || 'recepcionista';
  const isAllowed = (item: NavItemConfig) => {
    // O BI executivo já era acessível ao perfil financeiro no Hotel OS. Preservamos
    // essa regra durante a migração, mesmo com a rota marcada como de gestão.
    if (item.id === 'management_bi') return ['admin', 'gerente', 'financeiro'].includes(userRole);
    if (item.managementOnly || item.id === 'command_center' || item.id === 'workspace_editor') {
      return ['admin', 'gerente'].includes(userRole);
    }
    return hasTabAccess(userRole, item.id as AdminTab);
  };

  const hasPermission = isAllowed(currentTab);
  const contextItems = navItems.filter(item => item.context === activeContext);
  const changeTab = (id: ExtendedAdminTab) => setAdminActiveTab(id as AdminTab);

  return <div className={`min-h-screen bg-stone-100/90 flex flex-col text-stone-900 ${fontClass}`}>
    <KanbanLocalAutomationBridge />
    <AdminHeader />
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-xs mb-6 space-y-2">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1 overflow-x-auto gap-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {contexts.map(ctx => {
              const Icon = ctx.icon;
              const selected = activeContext === ctx.id;
              return <button
                key={ctx.id}
                onClick={() => {
                  setActiveContext(ctx.id);
                  const first = navItems.find(n => n.context === ctx.id && isAllowed(n));
                  if (first && currentTab.context !== ctx.id) changeTab(first.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${selected ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <Icon className={`w-3.5 h-3.5 ${selected ? 'text-amber-400' : 'text-stone-400'}`} />
                {ctx.label}
              </button>;
            })}
          </div>
          <div className="hidden lg:flex text-[11px] text-stone-400 pr-2">
            Rota: <strong className="ml-1 text-stone-700">{currentTab.path || currentTab.label}</strong>
          </div>
        </div>
        <div className="overflow-x-auto">
          <nav className="flex items-center gap-1.5 min-w-max">
            {contextItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const allowed = isAllowed(item);
              return <button
                key={`${item.routeId || 'compat'}:${item.id}`}
                onClick={() => changeTab(item.id)}
                title={item.description || item.path}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${isActive ? `bg-stone-900 ${theme.textAccentClass}` : allowed ? 'text-stone-600 hover:bg-stone-100' : 'text-stone-400 opacity-60'}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.technical && <span className="text-[9px] uppercase tracking-wider opacity-70">técnico</span>}
                {!allowed && <Lock className="w-3 h-3" />}
              </button>;
            })}
          </nav>
        </div>
      </div>

      <main>
        {!hasPermission ? (
          <div className="bg-white p-10 rounded-3xl border text-center max-w-xl mx-auto">
            <ShieldAlert className="w-8 h-8 mx-auto text-amber-600" />
            <h3 className="mt-3 font-bold">Acesso Restrito ao Módulo</h3>
            <button onClick={() => changeTab('dashboard')} className={`mt-4 px-4 py-2 rounded-xl ${theme.buttonClass} text-xs font-bold inline-flex items-center gap-2`}>
              Retornar à Visão Geral <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : <>
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
        </>}
      </main>
    </div>
  </div>;
};
