import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
const moduleRenderer = readFileSync('src/components/admin/NovoHotelModuleRenderer.tsx', 'utf8');
const financialModule = readFileSync('src/components/admin/FinancialModule.tsx', 'utf8');

test('AdminLayout resolve Financeiro pela tela direta do NovoHotel sem carregar Workspace runtime', () => {
  assert.match(adminLayout, /<NovoHotelModuleRenderer activeTab=\{activeTab\} \/>/);
  assert.match(moduleRenderer, /import \{ FinancialModule \} from '\.\/FinancialModule';/);
  assert.match(moduleRenderer, /activeTab === 'financial' && <FinancialModule \/>/);
  assert.doesNotMatch(adminLayout, /getWorkspaceDefinition\('workspace-financeiro'/);
  assert.doesNotMatch(moduleRenderer, /getWorkspaceDefinition\('workspace-financeiro'/);
  assert.doesNotMatch(adminLayout, /<WidgetDrivenWorkspace definition=\{financialWorkspace\}/);
  assert.doesNotMatch(moduleRenderer, /<WidgetDrivenWorkspace definition=\{financialWorkspace\}/);
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
