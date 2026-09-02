import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { getWidgetCatalogItem } from '../src/workspace-engine/widgetCatalog';
import {
  createOfficialWorkspaceDefinition,
  OFFICIAL_WORKSPACE_TEMPLATES,
} from '../src/workspace-engine/workspaceOfficialFactory';

const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
const moduleRenderer = readFileSync('src/components/admin/NovoHotelModuleRenderer.tsx', 'utf8');
const navigationBridge = readFileSync('src/navigation/novoHotelLegacyNavigationBridge.ts', 'utf8');
const factoryUi = readFileSync('src/components/admin/WorkspaceEditorModule.tsx', 'utf8');
const runtime = readFileSync('src/workspace-engine/WidgetDrivenWorkspace.tsx', 'utf8');
const routes = readFileSync('src/navigation/novohotelRoutes.ts', 'utf8');

const retiredFinancialUi = [
  'src/components/admin/financial/FinancialOverviewTab.tsx',
  'src/components/admin/financial/TransactionsAuditTab.tsx',
  'src/components/admin/financial/PixConfigTab.tsx',
  'src/components/admin/financial/CreditCardGatewaysTab.tsx',
  'src/components/admin/financial/PaymentLinkModal.tsx',
  'src/components/admin/financial/NewExpenseModal.tsx',
  'src/components/admin/financial/NewReceivableModal.tsx',
];

test('Freeze 2.0: catálogo oficial mantém oito Workspaces gerados pela Fábrica', () => {
  assert.deepEqual(OFFICIAL_WORKSPACE_TEMPLATES.map(item => item.id), [
    'workspace-governanca',
    'workspace-recepcao',
    'workspace-operacao',
    'workspace-manutencao',
    'workspace-cozinha',
    'workspace-financeiro',
    'workspace-administrativo-hotel',
    'workspace-administrativo-sistema',
  ]);
});

test('Freeze 2.0: Workspace Financeiro de compatibilidade mantém composição certificada', () => {
  const financial = createOfficialWorkspaceDefinition('workspace-financeiro');
  assert.equal(financial.layout, 'management');
  assert.deepEqual(financial.sectors, []);
  assert.deepEqual(financial.widgets.map(widget => widget.type), [
    'financial-overview',
    'financial-summary',
    'financial-receivables',
    'financial-payables',
    'financial-transactions',
  ]);
  assert.equal(financial.presentation?.devices?.mobile, 'custom');
  assert.equal(financial.presentation?.devices?.kds, 'disabled');
});

test('Freeze 2.0: Financeiro administrativo entra pela tela direta do NovoHotel', () => {
  assert.match(adminLayout, /<NovoHotelModuleRenderer routeId=\{activeRouteId\} activeTab=\{activeTab\} \/>/);
  assert.match(moduleRenderer, /import \{ FinancialModule \} from '\.\/FinancialModule';/);
  assert.match(moduleRenderer, /routeId === 'financeiro' && <FinancialModule \/>/);
  assert.doesNotMatch(adminLayout, /getWorkspaceDefinition\('workspace-financeiro'/);
  assert.doesNotMatch(moduleRenderer, /getWorkspaceDefinition\('workspace-financeiro'/);
  assert.doesNotMatch(adminLayout, /<WidgetDrivenWorkspace definition=\{financialWorkspace\}/);
  assert.doesNotMatch(moduleRenderer, /<WidgetDrivenWorkspace definition=\{financialWorkspace\}/);
  for (const file of retiredFinancialUi) {
    assert.equal(existsSync(file), false, `caminho financeiro legado retornou: ${file}`);
  }
});

test('Freeze 2.0: Fábrica separa templates e instâncias persistidas', () => {
  assert.match(factoryUi, /Templates operacionais/);
  assert.match(factoryUi, /Templates de gestão/);
  assert.match(factoryUi, />Meus Workspaces</);
  assert.match(factoryUi, /createOfficialWorkspaceDefinition\('workspace-financeiro'\)/);
  assert.match(factoryUi, /createOfficialWorkspaceDefinition\('workspace-administrativo-hotel'\)/);
  assert.match(factoryUi, /createOfficialWorkspaceDefinition\('workspace-administrativo-sistema'\)/);
  assert.match(factoryUi, /loadWorkspaceOverrides\(hotelId\)/);
});

test('Freeze 2.0: Fábrica permanece acessível pela rota técnica do NovoHotel', () => {
  assert.match(routes, /id: 'workspaces', path: '\/app\/sistema\/workspaces'/);
  assert.match(routes, /label: 'Fábrica de Workspaces'/);
  assert.match(routes, /managementOnly: true, technical: true/);
  assert.match(navigationBridge, /if \(routeId === 'workspaces'\) return 'workspace_editor';/);
  assert.match(adminLayout, /getCompatibilityTabForNovoHotelRoute\(route\.id\)/);
  assert.match(moduleRenderer, /routeId === 'workspaces' && <WorkspaceEditorModule \/>/);
});

test('Freeze 2.0: Desktop, Mobile e KDS continuam resolvidos no runtime único de compatibilidade', () => {
  assert.match(runtime, /resolveWidgetPresentation\(definition, widget, viewport\)/);
  assert.match(runtime, /viewport === 'desktop'/);
  assert.match(runtime, /viewport === 'mobile'/);
  assert.match(runtime, /isKds/);
  assert.match(runtime, /data-workspace-runtime="widget-driven"/);
});

test('Freeze 2.0: funcionalidades sem contrato não podem ser promovidas artificialmente', () => {
  assert.equal(getWidgetCatalogItem('orders')?.readiness, 'planned');
  assert.equal(getWidgetCatalogItem('shortcuts')?.readiness, 'planned');
});
