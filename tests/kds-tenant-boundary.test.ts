import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync('src/components/admin/KDSPage.tsx', 'utf8');
const service = readFileSync('src/services/pdvService.ts', 'utf8');
const repository = readFileSync('src/repositories/pdvRepository.ts', 'utf8');

test('KDS direto usa tenant compartilhado e consulta dados pelo hotel ativo', () => {
  assert.match(page, /useNovoHotelTenant/);
  assert.match(page, /tenant\?\.hotelId/);
  assert.match(page, /listarKds\(hotelId, sector\)/);
  assert.doesNotMatch(page, /hotelConfig\.id|hotelIdentityService|getActiveHotelId/);
});

test('consulta KDS permanece encapsulada e filtrada por hotel_id', () => {
  assert.match(service, /listarKds\(hotelId:string,sector\?:string\)/);
  assert.match(service, /pdvRepository\.listKds\(hotelId,sector\)/);
  assert.match(repository, /listKds\(hotelId:string,sector\?:string\)/);
  assert.match(repository, /\.eq\('hotel_id',hotelId\)/);
  assert.match(repository, /\.eq\('sector',sector\)/);
});
