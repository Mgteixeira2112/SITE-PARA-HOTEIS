import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const runtime = readFileSync('src/workspace-engine/WidgetDrivenWorkspace.tsx', 'utf8');

test('runtime Desktop mantém grade automática e aposenta posicionamento espacial ativo', () => {
  assert.match(runtime, /const desktopSpatialEntries: typeof entries = \[\]/);
  assert.match(runtime, /Posicionamento absoluto foi aposentado; a grade automática é a única estratégia/);
  assert.match(runtime, /desktopFlowEntries = viewport === 'desktop'/);
  assert.match(runtime, /entries\.filter\(\(\{ presentation \}\) => !isDesktopSidebarEntry\(presentation\)\)/);
  assert.match(runtime, /desktopFlowEntries\.forEach\(entry =>/);
  assert.match(runtime, /renderDesktopSurface\(\)/);
});

test('superfície visual permanece disponível para a sidebar sem reativar posição livre', () => {
  assert.match(runtime, /desktopSpatialActive = viewport === 'desktop' && desktopSpatialEntries\.length > 0/);
  assert.match(runtime, /desktopVisualSurfaceActive = desktopSpatialActive \|\| desktopSidebarActive/);
  assert.match(runtime, /workspaceSurfaceStyle\(definition\.presentation\?\.surface\)/);
  assert.match(runtime, /style=\{desktopVisualSurfaceStyle\}/);
  assert.match(runtime, /data-workspace-spatial-runtime=\{desktopSpatialActive \? 'true' : undefined\}/);
});

test('compatibilidade geométrica antiga permanece isolada sem alimentar a composição Desktop', () => {
  assert.match(runtime, /desktopSpatialStyle\(widget, presentation\.width\)/);
  assert.match(runtime, /data-desktop-spatial-widget=\{widget\.id\}/);
  assert.match(runtime, /renderWidget\(widget, presentation\)/);
  assert.match(runtime, /const desktopSpatialEntries: typeof entries = \[\]/);
});

test('Mobile e KDS continuam no caminho existente por entries map', () => {
  assert.match(runtime, /viewport === 'desktop'[\s\S]*renderDesktopSurface\(\)[\s\S]*renderDesktopSpatialWidgets\(\)[\s\S]*entries\.map\(\(\{ widget, presentation \}\) =>/);
  assert.match(runtime, /isKds \? kdsSpanClass\(presentation\.width, kdsOrientation\) : ''/);
});
