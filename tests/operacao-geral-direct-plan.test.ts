import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPERACAO_GERAL_DIRECT_PLAN,
  OPERACAO_GERAL_LEGACY_BLOCKS,
} from '../src/modules/operacao/operacaoGeralDirectPlan';

test('Operação Geral cobre todos os blocos do workspace legado sem criar módulos novos', () => {
  assert.deepEqual(Object.keys(OPERACAO_GERAL_DIRECT_PLAN), OPERACAO_GERAL_LEGACY_BLOCKS);
  assert.deepEqual(
    Array.from(new Set(Object.values(OPERACAO_GERAL_DIRECT_PLAN))).sort(),
    [
      'DashboardAlertsWidget',
      'DashboardModule',
      'FrigobarModule',
      'KanbanWorkspaceModule',
      'UsersOperationalAccessModule',
    ].sort(),
  );
});

test('Operação Geral preserva o dashboard como superfície de métricas e ações rápidas', () => {
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN['quick-actions'], 'DashboardModule');
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN.metrics, 'DashboardModule');
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN.dashboard, 'DashboardModule');
});

test('Operação Geral reaproveita os módulos existentes para Kanban, alertas, frigobar e equipe', () => {
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN['task-kanban'], 'KanbanWorkspaceModule');
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN.alerts, 'DashboardAlertsWidget');
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN.frigobar, 'FrigobarModule');
  assert.equal(OPERACAO_GERAL_DIRECT_PLAN.team, 'UsersOperationalAccessModule');
});
