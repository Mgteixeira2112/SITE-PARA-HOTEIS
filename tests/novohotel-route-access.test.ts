import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { AdminTab, UserRole } from '../src/types';
import { canAccessNovoHotelRoute } from '../src/navigation/novoHotelRouteAccess';
import { resolveNovoHotelRouteAccess } from '../src/navigation/resolveNovoHotelRouteAccess';

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

test('rota mapeada aguarda a primeira decisão canônica antes de abrir a tela', () => {
  assert.equal(
    resolveNovoHotelRouteAccess('financeiro', 'financeiro', legacyAccess, null, true),
    'loading',
  );
});

test('negação canônica prevalece sobre permissão visual legada', () => {
  assert.equal(
    resolveNovoHotelRouteAccess(
      'financeiro',
      'financeiro',
      legacyAccess,
      { allowed: false, source: 'canonical', permission: 'finance.view', hotelId: 'hotel-1' },
      false,
    ),
    'denied',
  );
});

test('indisponibilidade canônica mantém somente a ponte de compatibilidade prevista', () => {
  assert.equal(
    resolveNovoHotelRouteAccess(
      'financeiro',
      'financeiro',
      legacyAccess,
      { allowed: null, source: 'unavailable', permission: 'finance.view', hotelId: 'hotel-1' },
      false,
    ),
    'allowed',
  );
});

test('shell e router protegem a montagem das telas com a mesma decisão efetiva', () => {
  const adminLayout = readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
  const app = readFileSync('src/App.tsx', 'utf8');
  const canonicalHook = readFileSync('src/navigation/useNovoHotelCanonicalRouteAccess.ts', 'utf8');

  assert.match(adminLayout, /resolveNovoHotelRouteAccess\(/);
  assert.match(adminLayout, /currentAccessState === 'loading'/);
  assert.match(adminLayout, /currentAccessState === 'denied'/);
  assert.match(app, /resolveNovoHotelRouteAccess\(/);
  assert.match(app, /stableRouteAccess === 'loading'/);
  assert.match(app, /stableRouteAccess === 'denied'/);

  assert.match(canonicalHook, /hotelIdentityService\.getActiveHotelId\(\)/);
  assert.match(canonicalHook, /getCanonicalRouteAccess\(routeId, hotelId\)/);
  assert.doesNotMatch(adminLayout, /item\.id === 'indicadores'/);
  assert.doesNotMatch(adminLayout, /item\.id === 'workspaces'/);
});
