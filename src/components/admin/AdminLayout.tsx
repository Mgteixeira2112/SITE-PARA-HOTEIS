import React, { useMemo, useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { AdminHeader } from '../navigation/AdminHeader';
import { KanbanLocalAutomationBridge } from './KanbanLocalAutomationBridge';
import { NovoHotelModuleRenderer, type NovoHotelRenderableAdminTab } from './NovoHotelModuleRenderer';
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
import { getTheme, getFontFamilyClass } from '../../utils/themeHelper';
import {
  NOVOHOTEL_ROUTES,
  type NovoHotelRouteGroup,
  type NovoHotelRouteId,
} from '../../navigation/novohotelRoutes';
import { getCompatibilityTabForNovoHotelRoute } from '../../navigation/novoHotelLegacyNavigationBridge';
import { resolveNovoHotelRouteAccess, type NovoHotelRouteAccessState } from '../../navigation/resolveNovoHotelRouteAccess';
import { useNovoHotelCanonicalRouteAccess } from '../../navigation/useNovoHotelCanonicalRouteAccess';
import { useNovoHotelNavigation } from '../../navigation/useNovoHotelNavigation';

type NavContextId = NovoHotelRouteGroup;
type ExtendedAdminTab = NovoHotelRenderableAdminTab;
type NavItemId = NovoHotelRouteId | 'command_center';

interface NavItemConfig {
  id: NavItemId;
  compatibilityTab: ExtendedAdminTab;
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
  const { hotelConfig, reservations, users, currentUser, hasTabAccess } = useHotel();
  const {
    activeRouteId,
    activeCompatibilityTab,
    navigateToRoute,
    navigateToCompatibilityTab,
  } = useNovoHotelNavigation();
  const { getCanonicalDecision, loading: canonicalAccessLoading } = useNovoHotelCanonicalRouteAccess();
  const theme = getTheme(hotelConfig?.tema_cor);
  const fontClass = getFontFamilyClass(hotelConfig?.tipografia);
  const checkinsTodayCount = reservations.filter((r) => r.status === 'confirmada').length;
  const activeUsersCount = users.filter(u => u.ativo).length;
  const pendingKanbanCount = 0;
  const activeTab = activeCompatibilityTab as ExtendedAdminTab;

  const navItems: NavItemConfig[] = useMemo(() => {
    const routeItems = NOVOHOTEL_ROUTES
      .map<NavItemConfig | null>(route => {
        const compatibilityTab = getCompatibilityTabForNovoHotelRoute(route.id);
        if (!compatibilityTab) return null;
        return {
          id: route.id,
          compatibilityTab,
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
        };
      })
      .filter((item): item is NavItemConfig => item !== null);

    routeItems.push({
      id: 'command_center',
      compatibilityTab: 'command_center',
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

  const currentTab = navItems.find(item => item.id === activeRouteId)
    || navItems.find(item => item.compatibilityTab === activeTab)
    || navItems[0];
  const [activeContext, setActiveContext] = useState<NavContextId>(currentTab.context);
  React.useEffect(() => {
    if (currentTab.context !== activeContext) setActiveContext(currentTab.context);
  }, [activeTab, activeRouteId, currentTab.context]);

  const userRole = currentUser?.tipo_usuario || 'recepcionista';
  const getAccessState = (item: NavItemConfig): NovoHotelRouteAccessState => {
    if (item.id === 'command_center') {
      return ['admin', 'gerente'].includes(userRole) ? 'allowed' : 'denied';
    }

    return resolveNovoHotelRouteAccess(
      item.id,
      userRole,
      hasTabAccess,
      getCanonicalDecision(item.id),
      canonicalAccessLoading,
    );
  };
  const isAllowed = (item: NavItemConfig) => getAccessState(item) === 'allowed';

  const currentAccessState = getAccessState(currentTab);
  const contextItems = navItems.filter(item => item.context === activeContext);

  const navigateToItem = (item: NavItemConfig) => {
    if (item.id === 'command_center') {
      navigateToCompatibilityTab('command_center');
      return;
    }
    navigateToRoute(item.id);
  };
  const returnToDashboard = () => navigateToRoute('dashboard');

  const selectContext = (contextId: NavContextId) => {
    setActiveContext(contextId);
    const first = navItems.find(item => item.context === contextId && isAllowed(item));
    if (first && currentTab.context !== contextId) navigateToItem(first);
  };

  return <div className={`min-h-screen bg-stone-100 text-stone-900 ${fontClass}`}>
    <KanbanLocalAutomationBridge />
    <AdminHeader />

    <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-3 pb-8 pt-4 sm:px-5 lg:gap-6 lg:px-6">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 text-white shadow-sm">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">NovoHotel SaaS</div>
            <div className="mt-1 text-sm font-bold text-white">Central de trabalho</div>
            <p className="mt-1 text-xs leading-relaxed text-stone-400">Navegação direta por área, perfil e permissão.</p>
          </div>

          <div className="space-y-5 p-3">
            <div className="space-y-1">
              {contexts.map(ctx => {
                const Icon = ctx.icon;
                const selected = activeContext === ctx.id;
                return <button
                  key={ctx.id}
                  type="button"
                  onClick={() => selectContext(ctx.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-bold transition ${selected ? 'bg-white text-stone-950' : 'text-stone-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${selected ? 'bg-amber-100 text-amber-700' : 'bg-white/10 text-stone-300'}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{ctx.label}</span>
                </button>;
              })}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">{contexts.find(ctx => ctx.id === activeContext)?.label}</div>
              <nav className="space-y-1" aria-label="Módulos NovoHotel">
                {contextItems.map(item => {
                  const Icon = item.icon;
                  const isActive = item.id === 'command_center'
                    ? activeTab === 'command_center'
                    : item.id === activeRouteId;
                  const accessState = getAccessState(item);
                  const allowed = accessState === 'allowed';
                  return <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateToItem(item)}
                    title={item.description || item.path}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-xs font-bold transition ${isActive ? 'bg-amber-400 text-stone-950' : allowed ? 'text-stone-300 hover:bg-white/10 hover:text-white' : 'text-stone-600'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-stone-950/10' : 'bg-white/10 text-stone-300'}`}>{item.badge}</span>
                    )}
                    {item.technical && <span className="text-[8px] font-black uppercase tracking-wider opacity-60">téc.</span>}
                    {!allowed && <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />}
                  </button>;
                })}
              </nav>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-500">Rota atual</div>
            <div className="mt-1 truncate text-xs font-bold text-stone-300">{currentTab.path || currentTab.label}</div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-2 shadow-xs lg:hidden">
          <div className="overflow-x-auto border-b border-stone-100 pb-2">
            <div className="flex min-w-max items-center gap-1.5">
              {contexts.map(ctx => {
                const Icon = ctx.icon;
                const selected = activeContext === ctx.id;
                return <button
                  key={ctx.id}
                  type="button"
                  onClick={() => selectContext(ctx.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${selected ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${selected ? 'text-amber-400' : 'text-stone-400'}`} aria-hidden="true" />
                  {ctx.label}
                </button>;
              })}
            </div>
          </div>
          <div className="overflow-x-auto pt-2">
            <nav className="flex min-w-max items-center gap-1.5" aria-label="Módulos NovoHotel">
              {contextItems.map(item => {
                const Icon = item.icon;
                const isActive = item.id === 'command_center'
                  ? activeTab === 'command_center'
                  : item.id === activeRouteId;
                const accessState = getAccessState(item);
                const allowed = accessState === 'allowed';
                return <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateToItem(item)}
                  title={item.description || item.path}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${isActive ? `bg-stone-900 ${theme.textAccentClass}` : allowed ? 'text-stone-600 hover:bg-stone-100' : 'text-stone-400 opacity-60'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {item.technical && <span className="text-[9px] uppercase tracking-wider opacity-70">técnico</span>}
                  {!allowed && <Lock className="h-3 w-3" aria-hidden="true" />}
                </button>;
              })}
            </nav>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-400">Área atual</div>
            <div className="mt-1 text-base font-bold text-stone-900">{currentTab.label}</div>
          </div>
          <div className="text-xs text-stone-400">
            {currentTab.path ? <span className="font-mono text-[11px] text-stone-500">{currentTab.path}</span> : 'Compatibilidade técnica'}
          </div>
        </div>

        <main>
          {currentAccessState === 'loading' ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm font-bold text-stone-500">
              Validando permissões do hotel…
            </div>
          ) : currentAccessState === 'denied' ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-stone-200 bg-white p-10 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
              <h3 className="mt-3 font-bold">Acesso Restrito ao Módulo</h3>
              <button onClick={returnToDashboard} className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold ${theme.buttonClass}`}>
                Retornar à Visão Geral <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : <NovoHotelModuleRenderer routeId={activeRouteId} activeTab={activeTab} />}
        </main>
      </div>
    </div>
  </div>;
};
