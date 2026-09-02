# NovoHotel — Transformação para SaaS Simplificado

## Objetivo

Transformar o HOTEL OS existente em um SaaS hoteleiro mais simples, organizando e reutilizando o que já existe em vez de criar novos engines ou duplicar regras de negócio.

O novo conceito separa claramente:

1. **Site público estático/publicável** — vitrine do hotel, quartos, conteúdo institucional e entrada para reserva.
2. **SaaS administrativo/operacional** — operação do hotel, usuários, reservas, recepção, governança, manutenção, financeiro e demais funções já existentes.
3. **Banco e serviços existentes** — preservar Supabase, repositories, services, domínio e regras válidas antes de qualquer remoção.

---

# FASE 0 — Base segura

## Estado inicial confirmado

- Branch base: `main`.
- SHA de partida: `e0d94e1b0ffe68b9ef89edd788e4dcf9771bfe17`.
- Branch de transformação: `refactor/novohotel-saas-simplificado`.
- Nenhuma alteração destrutiva nesta fase.
- CI deve permanecer como gate de avanço.

## Scripts de validação existentes

O `package.json` atual define:

- `bun run lint` → `tsc --noEmit`
- `bun run test` → `tsx --test tests/**/*.test.ts`
- `bun run build` → `vite build`
- `bun run audit:production` → `node scripts/phase17-production-audit.mjs`

## Regra de governança

Nenhuma remoção, consolidação de engine, migration destrutiva ou mudança estrutural será realizada antes de:

1. inventário funcional;
2. mapa de dependências;
3. identificação da fonte de verdade de cada função;
4. CI verde ou falha de baseline documentada e corrigida isoladamente.

---

# FASE 1 — Inventário funcional

## Estrutura já identificada

A aplicação atual possui, entre outras, as seguintes áreas estruturais dentro de `src/`:

- `auth`
- `components`
- `context`
- `core`
- `dashboard-engine`
- `data`
- `domain`
- `financial-engine`
- `frigobar-core`
- `hooks`
- `lib`

Também existem workflows de CI em `.github/workflows/`, incluindo:

- `hotel-os-validation.yml`
- `preview-build.yml`
- `deploy-pages.yml`

E existe histórico extenso de fases e auditorias dentro de `docs/`, que será tratado como documentação legada a ser confrontada com o código real — nunca como fonte única de verdade.

## Mapa obrigatório

Para cada função operacional, preencher:

| Função | Tela/Entrada | Componente | Hook/Service | Repository/Core | Tabela/Migration | Fonte de verdade | Destino NovoHotel |
|---|---|---|---|---|---|---|---|
| Reserva | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Recepção | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Quartos | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Governança | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Manutenção | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Kanban | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Financeiro | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Usuários/RBAC | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | manter/simplificar |
| Site público | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | separar como camada pública |
| Workspace/Fábrica | a mapear | a mapear | a mapear | a mapear | a mapear | a validar | reduzir dependência/aposentar onde possível |

## Critério de classificação

Cada módulo encontrado será classificado em uma destas categorias:

- **CORE — MANTER**: regra de negócio ou fonte de verdade necessária ao SaaS.
- **APRESENTAÇÃO — SIMPLIFICAR**: UI útil, mas excessivamente acoplada ou complexa.
- **LEGADO — APOSENTAR**: duplicação, renderer antigo, engine sem consumidor ou caminho substituído.
- **PÚBLICO — SEPARAR**: parte pertencente ao site público estático/publicável.
- **DÚVIDA — NÃO ALTERAR**: dependência ainda não comprovada.

## Próxima execução

A continuação desta fase deve percorrer, nesta ordem:

1. `src/App.tsx` e entradas de navegação;
2. componentes/telas principais;
3. hooks e services;
4. `core`, `domain` e repositories;
5. Supabase e migrations;
6. Workspace/Fábrica e seus consumidores;
7. testes que protegem cada fluxo;
8. completar a tabela Função → Tela → Componente → Service → Repository → Tabela.

Somente após esse mapa será proposta a arquitetura final simplificada e a ordem segura de remoção/consolidação.
