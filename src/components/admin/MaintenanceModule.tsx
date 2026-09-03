import React from 'react';
import { MaintenanceWidget } from '../../workspace-engine/widgets/MaintenanceWidget';
import { createOfficialWorkspaceDefinition } from '../../workspace-engine/workspaceOfficialFactory';
import { SectionTitle } from '../common/DesignSystem';

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
  <section className="space-y-4" data-novohotel-maintenance-module>
    <SectionTitle
      title="Manutenção"
      description="Chamados, reparos e ordens de serviço em tempo real."
    />

    <MaintenanceWidget workspace={maintenanceWorkspace} widget={maintenanceWidget} />
  </section>
);
