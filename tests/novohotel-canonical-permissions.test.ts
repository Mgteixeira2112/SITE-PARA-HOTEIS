import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  getNovoHotelCanonicalViewPermission,
  NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS,
} from '../src/navigation/novoHotelCanonicalPermissions';

test('NovoHotel mapeia somente permissoes de visualizacao ja existentes no RBAC canonico', () => {
  assert.equal(getNovoHotelCanonicalViewPermission('reservas'), 'reservations.view');
  assert.equal(getNovoHotelCanonicalViewPermission('recepcao'), 'reservations.view');
  assert.equal(getNovoHotelCanonicalViewPermission('governanca'), 'housekeeping.view');
  assert.equal(getNovoHotelCanonicalViewPermission('manutencao'), 'maintenance.view');
  assert.equal(getNovoHotelCanonicalViewPermission('pdv'), 'pos.view');
  assert.equal(getNovoHotelCanonicalViewPermission('financeiro'), 'finance.view');
});

test('rotas sem permissao equivalente permanecem explicitamente fora do mapa canonico', () => {
  for (const routeId of ['dashboard', 'quartos', 'hospedes', 'kanban', 'kds', 'frigobar', 'indicadores', 'equipe', 'automacoes', 'configuracoes', 'configuracoes-site', 'workspaces'] as const) {
    assert.equal(getNovoHotelCanonicalViewPermission(routeId), null);
  }

  assert.deepEqual(Object.keys(NOVOHOTEL_CANONICAL_VIEW_PERMISSIONS).sort(), [
    'financeiro',
    'governanca',
    'manutencao',
    'pdv',
    'recepcao',
    'reservas',
  ]);
});

test('servico canonico consulta user_has_permission com hotel ativo', () => {
  const source = readFileSync('src/services/novoHotelAuthorizationService.ts', 'utf8');
  assert.match(source, /hotelIdentityService\.getActiveHotelId/);
  assert.match(source, /supabase\.rpc\('user_has_permission'/);
  assert.match(source, /p_hotel_id: hotelId/);
  assert.match(source, /p_permission: permission/);
  assert.match(source, /source: 'unmapped'/);
  assert.match(source, /source: 'unavailable'/);
});
