import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { AdminTab, UserRole } from '../src/types';
import { canAccessNovoHotelRoute } from '../src/navigation/novoHotelRouteAccess';

const legacyAccess = (role: UserRole, tab: AdminTab) => {
  if (role === 'admin') return true;
  if (tab === 'dashboard') return true;
  if (tab === 'financial') return role === 'gerente' || role === 'financeiro';
  return false;
};

test('rotas comuns delegam ao contrato RBAC legado durante a transição', () => {
  assert.equal(canAccessNovoHotelRoute('dashboard', 'recepcionista', legacyAccess), true);
  assert.equal(canAccessNovoHotelRoute('financeiro', 'financeiro', legacyAccess), true);
  assert.equal(canAccessNovoHotelRoute('financeiro', 'recepcionista', legacyAccess), false);
});

test('rotas de gestão mantêm regras especiais centralizadas', () => {
  assert.equal(canAccessNovoHotelRoute('indicadores', 'financeiro', legacyAccess), true);
  assert.equal(canAccessNovoHotelRoute('indicadores', 'recepcionista', legacyAccess), false);
  assert.equal(canAccessNovoHotelRoute('workspaces', 'gerente', legacyAccess), true);
  assert.equal(canAccessNovoHotelRoute('workspaces', 'financeiro', legacyAccess), false);
});

test('rotas operacionais diretas sem AdminTab legado continuam resolvíveis', () => {
  assert.equal(canAccessNovoHotelRoute('governanca', 'governanca', legacyAccess), true);
  assert.equal(canAccessNovoHotelRoute('manutencao', 'recepcionista', legacyAccess), true);
});

test('AdminLayout prioriza o RBAC canonico e preserva fallback legado', () => {
  const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
  const canonicalHook = readFileSync('src/navigation/useNovoHotelCanonicalRouteAccess.ts', 'utf8');

  assert.match(adminLayout, /useNovoHotelCanonicalRouteAccess\(\)/);
  assert.match(adminLayout, /getCanonicalDecision\(item\.id\)/);
  assert.match(adminLayout, /canonicalDecision\?\.source === 'canonical'/);
  assert.match(adminLayout, /canonicalDecision\.allowed === true/);
  assert.match(adminLayout, /canAccessNovoHotelRoute\(item\.id, userRole, hasTabAccess\)/);

  assert.match(canonicalHook, /hotelIdentityService\.getActiveHotelId\(\)/);
  assert.match(canonicalHook, /getCanonicalRouteAccess\(routeId, hotelId\)/);
  assert.doesNotMatch(adminLayout, /item\.id === 'indicadores'/);
  assert.doesNotMatch(adminLayout, /item\.id === 'workspaces'/);
});
