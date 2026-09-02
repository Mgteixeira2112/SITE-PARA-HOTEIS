import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const app = readFileSync('src/App.tsx', 'utf8');
const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
const adminHeader = readFileSync('src/components/navigation/AdminHeader.tsx', 'utf8');
const navigationHook = readFileSync('src/navigation/useNovoHotelNavigation.ts', 'utf8');
const navigationContext = readFileSync('src/navigation/NovoHotelNavigationContext.tsx', 'utf8');

test('superfícies principais do NovoHotel não escrevem diretamente em adminActiveTab', () => {
  for (const [name, source] of [
    ['App', app],
    ['AdminLayout', adminLayout],
    ['AdminHeader', adminHeader],
    ['useNovoHotelNavigation', navigationHook],
  ] as const) {
    assert.doesNotMatch(source, /setAdminActiveTab\s*\(/, `${name} voltou a escrever diretamente no estado legado`);
  }
});

test('NovoHotelNavigationProvider concentra o espelhamento legado da rota canônica', () => {
  assert.match(app, /<NovoHotelNavigationProvider>/);
  assert.match(navigationContext, /setActiveRouteId\(routeId\)/);
  assert.match(navigationContext, /setAdminActiveTab\(compatibilityTab as AdminTab\)/);
  assert.match(navigationContext, /getCompatibilityTabForNovoHotelRoute\(routeId\)/);
});

test('router operacional e shell administrativo navegam por NovoHotelRouteId', () => {
  assert.match(app, /navigateToRoute\(stableOperationalRoute\.id\)/);
  assert.match(adminLayout, /navigateToRoute\(item\.id\)/);
  assert.match(adminHeader, /navigateToRoute\('configuracoes'\)/);
  assert.match(adminHeader, /navigateToRoute\('recepcao'\)/);
  assert.match(adminHeader, /navigateToRoute\('equipe'\)/);
});
