import React, { useState } from 'react';
import { BellRing, Columns3, LayoutDashboard, ShoppingBag, Users } from 'lucide-react';
import { DashboardModule } from '../../components/admin/DashboardModule';
import { DashboardAlertsWidget } from '../../components/admin/DashboardAlertsWidget';
import { FrigobarModule } from '../../components/admin/FrigobarModule';
import { KanbanWorkspaceModule } from '../../components/admin/KanbanWorkspaceModule';
import { UsersOperationalAccessModule } from '../../components/admin/UsersOperationalAccessModule';

type OperacaoGeralSection = 'overview' | 'kanban' | 'frigobar' | 'team';

const sections: ReadonlyArray<{
  id: OperacaoGeralSection;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Visão operacional', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'frigobar', label: 'Frigobar', icon: ShoppingBag },
  { id: 'team', label: 'Equipe', icon: Users },
];

/**
 * Superfície direta da Operação Geral no NovoHotel.
 *
 * A página apenas compõe módulos já existentes. Dados, comandos, permissões e
 * persistência continuam pertencendo aos serviços e componentes canônicos de
 * cada domínio; nenhuma regra de negócio é duplicada aqui.
 */
export const OperacaoGeralDirectPage: React.FC = () => {
  const [section, setSection] = useState<OperacaoGeralSection>('overview');

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">NovoHotel</p>
          <h1 className="mt-1 text-2xl font-black">Operação Geral</h1>
          <p className="mt-1 text-sm text-stone-500">Visão transversal da operação do hotel usando os módulos oficiais já existentes.</p>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {sections.map(item => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-black ${active ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main>
        {section === 'overview' && (
          <>
            <DashboardModule />
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
              <div className="mb-3 flex items-center gap-2 text-xs font-black text-stone-500">
                <BellRing className="h-4 w-4" /> Alertas operacionais
              </div>
              <DashboardAlertsWidget />
            </div>
          </>
        )}
        {section === 'kanban' && <KanbanWorkspaceModule />}
        {section === 'frigobar' && <FrigobarModule />}
        {section === 'team' && <UsersOperationalAccessModule />}
      </main>
    </div>
  );
};
