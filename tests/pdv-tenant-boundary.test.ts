import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync('src/components/admin/PDVPage.tsx', 'utf8');
const service = readFileSync('src/services/pdvService.ts', 'utf8');
const repository = readFileSync('src/repositories/pdvRepository.ts', 'utf8');

test('PDV direto usa tenant compartilhado como identidade do hotel', () => {
  assert.match(page, /useNovoHotelTenant/);
  assert.match(page, /tenant\?\.hotelId/);
  assert.match(page, /listarProdutosPdv\(hotelId\)/);
  assert.match(page, /listarCaixas\(hotelId\)/);
  assert.match(page, /listarSessoesCaixa\(hotelId\)/);
  assert.match(page, /hotelId,/);
  assert.doesNotMatch(page, /hotelConfig\?\.id|hotelConfig\.id|String\(hotelConfig/);
});

test('catálogo do PDV permanece explicitamente isolado pelo hotel ativo', () => {
  assert.match(service, /listarProdutosPdv\(hotelId:string\)/);
  assert.match(service, /pdvRepository\.listProducts\(hotelId\)/);
  assert.match(repository, /listProducts\(hotelId:string\)/);
  assert.match(repository, /\.eq\('hotel_id',hotelId\)/);
});

test('PDV limpa estado dependente de hotel enquanto o tenant não está resolvido', () => {
  assert.match(page, /if \(!hotelId\)/);
  assert.match(page, /setProducts\(\[\]\)/);
  assert.match(page, /setRegisters\(\[\]\)/);
  assert.match(page, /setSessions\(\[\]\)/);
  assert.match(page, /setLoading\(tenantLoading\)/);
});
