export type OperacaoGeralLegacyBlock =
  | 'quick-actions'
  | 'metrics'
  | 'dashboard'
  | 'task-kanban'
  | 'alerts'
  | 'frigobar'
  | 'team';

export type OperacaoGeralDirectModule =
  | 'DashboardModule'
  | 'KanbanWorkspaceModule'
  | 'DashboardAlertsWidget'
  | 'FrigobarModule'
  | 'UsersOperationalAccessModule';

/**
 * Plano de convergência da Operação Geral para uma página direta do NovoHotel.
 *
 * Este contrato não cria engines, consultas ou regras novas. Cada bloco do
 * antigo workspace-operacao aponta para uma superfície já existente que será
 * reutilizada na página direta. A Fábrica continua sendo o fallback enquanto
 * a composição final não estiver pronta e validada.
 */
export const OPERACAO_GERAL_DIRECT_PLAN: Readonly<Record<OperacaoGeralLegacyBlock, OperacaoGeralDirectModule>> = {
  'quick-actions': 'DashboardModule',
  metrics: 'DashboardModule',
  dashboard: 'DashboardModule',
  'task-kanban': 'KanbanWorkspaceModule',
  alerts: 'DashboardAlertsWidget',
  frigobar: 'FrigobarModule',
  team: 'UsersOperationalAccessModule',
};

export const OPERACAO_GERAL_LEGACY_BLOCKS: readonly OperacaoGeralLegacyBlock[] = [
  'quick-actions',
  'metrics',
  'dashboard',
  'task-kanban',
  'alerts',
  'frigobar',
  'team',
] as const;
