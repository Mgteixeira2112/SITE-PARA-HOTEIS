import test from 'node:test';
import assert from 'node:assert/strict';
import { OPERATIONAL_SECTORS } from '../src/domain/operationalSectors';
import {
  NOVOHOTEL_ROUTES,
  getNovoHotelOperationalRouteForSectors,
  getNovoHotelRoute,
  getNovoHotelRouteByLegacyAdminTab,
  getNovoHotelRouteByPath,
  getNovoHotelRoutesByGroup,
} from '../src/navigation/novohotelRoutes';

const EXPECTED_ROUTES = [
  ['dashboard', '/app'],
  ['reservas', '/app/reservas'],
  ['recepcao', '/app/recepcao'],
  ['quartos', '/app/quartos'],
  ['hospedes', '/app/hospedes'],
  ['governanca', '/app/governanca'],
  ['manutencao', '/app/manutencao'],
  ['kanban', '/app/kanban'],
  ['pdv', '/app/pdv'],
  ['kds', '/app/kds'],
  ['frigobar', '/app/frigobar'],
  ['financeiro', '/app/financeiro'],
  ['indicadores', '/app/indicadores'],
  ['equipe', '/app/equipe'],
  ['automacoes', '/app/automacoes'],
  ['configuracoes', '/app/configuracoes'],
  ['configuracoes-site', '/app/configuracoes/site'],
  ['workspaces', '/app/sistema/workspaces'],
] as const;

test('NovoHotel mantém IDs e paths canônicos únicos', () => {
  assert.equal(NOVOHOTEL_ROUTES.length, EXPECTED_ROUTES.length);
  assert.deepEqual(
    NOVOHOTEL_ROUTES.map(route => [route.id, route.path]),
    EXPECTED_ROUTES,
  );
  assert.equal(new Set(NOVOHOTEL_ROUTES.map(route => route.id)).size, NOVOHOTEL_ROUTES.length);
  assert.equal(new Set(NOVOHOTEL_ROUTES.map(route => route.path)).size, NOVOHOTEL_ROUTES.length);
});

test('NovoHotel resolve rotas por id, path e aba administrativa legada', () => {
  assert.equal(getNovoHotelRoute('financeiro')?.path, '/app/financeiro');
  assert.equal(getNovoHotelRouteByPath('/app/recepcao')?.id, 'recepcao');
  assert.equal(getNovoHotelRouteByLegacyAdminTab('financial')?.id, 'financeiro');
  assert.equal(getNovoHotelRouteByLegacyAdminTab('management_bi')?.id, 'indicadores');
  assert.equal(getNovoHotelRouteByPath('/app/inexistente'), null);
});

test('NovoHotel resolve todos os setores operacionais por tela direta', () => {
  assert.equal(getNovoHotelOperationalRouteForSectors(['operacao'])?.id, 'dashboard');
  assert.equal(getNovoHotelOperationalRouteForSectors(['recepcao'])?.id, 'recepcao');
  assert.equal(getNovoHotelOperationalRouteForSectors(['governanca'])?.id, 'governanca');
  assert.equal(getNovoHotelOperationalRouteForSectors(['manutencao'])?.id, 'manutencao');
  assert.equal(getNovoHotelOperationalRouteForSectors(['cozinha'])?.id, 'kds');
  assert.equal(getNovoHotelOperationalRouteForSectors([]), null);
});

test('Nenhum setor operacional oficial depende do fallback de Workspace', () => {
  const fallbackSectors = OPERATIONAL_SECTORS
    .map(sector => sector.id)
    .filter(sectorId => !getNovoHotelOperationalRouteForSectors([sectorId]));

  assert.deepEqual(fallbackSectors, []);
});

test('NovoHotel mantém agrupamento SaaS e Fábrica somente como rota técnica de compatibilidade', () => {
  assert.deepEqual(
    getNovoHotelRoutesByGroup('vendas').map(route => route.id),
    ['pdv', 'kds', 'frigobar'],
  );
  assert.deepEqual(
    getNovoHotelRoutesByGroup('gestao').map(route => route.id),
    ['financeiro', 'indicadores', 'equipe'],
  );

  const workspaces = getNovoHotelRoute('workspaces');
  assert.equal(workspaces?.technical, true);
  assert.equal(workspaces?.managementOnly, true);
  assert.equal(workspaces?.path, '/app/sistema/workspaces');
});
