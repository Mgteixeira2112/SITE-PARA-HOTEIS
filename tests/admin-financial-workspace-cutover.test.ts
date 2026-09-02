import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
const financialModule = readFileSync('src/components/admin/FinancialModule.tsx', 'utf8');

test('AdminLayout resolve Financeiro pela tela direta do NovoHotel sem carregar Workspace runtime', () => {
  assert.match(adminLayout, /import \{ FinancialModule \} from '\.\/FinancialModule';/);
  assert.match(adminLayout, /activeTab === 'financial' && <FinancialModule \/>/);
  assert.doesNotMatch(adminLayout, /getWorkspaceDefinition\('workspace-financeiro'/);
  assert.doesNotMatch(adminLayout, /<WidgetDrivenWorkspace definition=\{financialWorkspace\}/);
});

test('FinancialModule reutiliza renderers financeiros oficiais sem registry ou Factory', () => {
  assert.match(financialModule, /CertifiedFinancialOverviewWidget/);
  assert.match(financialModule, /FinancialSummaryWidget/);
  assert.match(financialModule, /FinancialReceivablesWidget/);
  assert.match(financialModule, /FinancialPayablesWidget/);
  assert.match(financialModule, /FinancialTransactionsWidget/);
  assert.doesNotMatch(financialModule, /getWorkspaceDefinition/);
  assert.doesNotMatch(financialModule, /workspaceConfigStore/);
  assert.doesNotMatch(financialModule, /WidgetDrivenWorkspace/);
});
