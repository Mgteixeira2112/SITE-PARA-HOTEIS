import React from 'react';
import { Wrench } from 'lucide-react';
import { MaintenanceWidget } from '../../workspace-engine/widgets/MaintenanceWidget';
import { createOfficialWorkspaceDefinition } from '../../workspace-engine/workspaceOfficialFactory';

const maintenanceWorkspace = createOfficialWorkspaceDefinition('workspace-manutencao');
const maintenanceWidget = maintenanceWorkspace.widgets.find(widget => widget.type === 'maintenance')
  || maintenanceWorkspace.widgets.find(widget => widget.type === 'task-kanban')
  || {
    id: 'manutencao-kanban-direto',
    type: 'task-kanban' as const,
    title: 'Manutenção',
    boardId: 'kanban-board-manutencao',
    order: 10,
    span: 'full' as const,
    enabled: true,
    dataSource: 'kanban' as const,
  };

/**
 * Tela operacional direta de Manutenção do NovoHotel.
 * Reutiliza o board e as regras existentes sem depender do WorkspaceRuntime
 * nem da hidratação de uma composição persistida para iniciar a operação.
 */
export const MaintenanceModule: React.FC = () => (
  <div className="min-h-screen bg-slate-100 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">NovoHotel • Operação</p>
          <h1 className="text-xl font-black">Manutenção</h1>
          <p className="text-xs text-slate-500">Chamados, reparos e ordens de serviço em tempo real.</p>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
      <MaintenanceWidget workspace={maintenanceWorkspace} widget={maintenanceWidget} />
    </main>
  </div>
);
