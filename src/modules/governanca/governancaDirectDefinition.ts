import { WorkspaceDefinition } from '../../workspace-engine/types';
import { normalizeWorkspaceWidgets } from '../../workspace-engine/widgetCatalog';

/**
 * Contrato visual estável da rota direta de Governança no NovoHotel.
 *
 * A rota operacional não consulta a Fábrica de Workspaces. O template oficial
 * legado continua existindo apenas para compatibilidade/editor enquanto a
 * transição do Workspace Engine não é encerrada.
 */
export const GOVERNANCA_DIRECT_DEFINITION: WorkspaceDefinition = {
  id: 'novohotel-governanca',
  name: 'Governança',
  description: 'Operação de quartos e tarefas do setor',
  sectors: ['governanca'],
  layout: 'operational',
  defaultScope: 'sector',
  widgets: normalizeWorkspaceWidgets([
    { id: 'governanca-metrics', type: 'metrics', boardId: 'kanban-board-governanca', order: 10, span: 'full' },
    { id: 'governanca-kanban', type: 'kanban-cards', boardId: 'kanban-board-governanca', title: 'Central de trabalho', order: 20, span: 'full' },
    { id: 'governanca-alerts', type: 'alerts', title: 'Alertas do setor', order: 30, span: 2, enabled: true },
    { id: 'governanca-actions', type: 'quick-actions', title: 'Ações rápidas', order: 40, span: 2, enabled: true },
  ]),
};
