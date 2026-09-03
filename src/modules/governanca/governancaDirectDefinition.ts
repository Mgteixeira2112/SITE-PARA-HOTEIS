import { OperationalSectorId } from '../../domain/operationalSectors';

export type GovernancaDirectScope = 'mine' | 'sector';

export interface GovernancaDirectWidgetDefinition {
  id: string;
  type: 'metrics' | 'kanban-cards' | 'alerts' | 'quick-actions';
  boardId?: string;
  title?: string;
  order?: number;
  span?: 1 | 2 | 3 | 4 | 'full' | 'button';
  enabled?: boolean;
}

export interface GovernancaDirectDefinition {
  id: string;
  name: string;
  description: string;
  sectors: OperationalSectorId[];
  layout: 'operational';
  defaultScope: GovernancaDirectScope;
  widgets: GovernancaDirectWidgetDefinition[];
}

/**
 * Contrato visual estável da rota direta de Governança no NovoHotel.
 *
 * A rota operacional não consulta a Fábrica de Workspaces nem depende dos tipos
 * do Workspace Engine. O template oficial legado continua existindo somente
 * para compatibilidade/editor durante a transição.
 */
export const GOVERNANCA_DIRECT_DEFINITION: GovernancaDirectDefinition = {
  id: 'novohotel-governanca',
  name: 'Governança',
  description: 'Operação de quartos e tarefas do setor',
  sectors: ['governanca'],
  layout: 'operational',
  defaultScope: 'sector',
  widgets: [
    { id: 'governanca-metrics', type: 'metrics', boardId: 'kanban-board-governanca', order: 10, span: 'full' },
    { id: 'governanca-kanban', type: 'kanban-cards', boardId: 'kanban-board-governanca', title: 'Central de trabalho', order: 20, span: 'full' },
    { id: 'governanca-alerts', type: 'alerts', title: 'Alertas do setor', order: 30, span: 2, enabled: true },
    { id: 'governanca-actions', type: 'quick-actions', title: 'Ações rápidas', order: 40, span: 2, enabled: true },
  ],
};
