# NovoHotel — Inventário final de Workspace/Fábrica

## Status

FASE 1 — inventário funcional concluído.

Este documento identifica exatamente o que a Fábrica de Workspaces faz hoje, onde ela ainda participa do runtime e qual será o corte mínimo para o NovoHotel.

## 1. Papel real do registry

`src/workspace-engine/registry.ts` declara explicitamente que o registry é uma camada de compatibilidade/runtime. As instâncias oficiais são geradas pela Fábrica e expostas pela API histórica para consumidores ainda dependentes desse modelo.

O registry:

- carrega templates oficiais;
- mescla overrides por hotel;
- inclui áreas customizadas persistidas;
- filtra por usuário;
- resolve Workspace por setor e associação explícita.

Conclusão: o registry não é um motor de negócio do hotel. Ele é uma camada de composição/roteamento visual.

## 2. Onde o Workspace ainda controla a entrada

O acoplamento estrutural principal está em `src/App.tsx`.

Após autenticação:

- perfis de gestão (`admin`/`gerente`) recebem `AdminLayout` diretamente;
- demais usuários carregam seus setores;
- `resolveWorkspaceForUserAndSectors` escolhe uma definição;
- `WorkspaceRuntime` renderiza a experiência operacional;
- se nenhuma definição for encontrada, há fallback para `AdminLayout`.

Esse fluxo é exatamente o trecho que deverá ser substituído gradualmente por rota estável + RBAC + setor operacional.

## 3. Runtime atual

`src/workspace-engine/WorkspaceRuntime.tsx` possui dois caminhos:

1. Recepção → `ReceptionWorkspaceShared`.
2. Demais áreas → `WidgetDrivenWorkspace`.

A Recepção já possui apresentação operacional própria e não depende de um renderer genérico para seu conteúdo principal.

## 4. Templates oficiais existentes

`workspaceOfficialFactory.ts` define as áreas oficiais:

- Governança;
- Recepção;
- Operação Geral;
- Manutenção;
- Cozinha & Room Service;
- Financeiro;
- Administrativo do Hotel;
- Administrativo do Sistema.

O antigo `workspace-administrativo` é apenas alias de compatibilidade para `workspace-administrativo-hotel`.

## 5. Widgets que são apenas adaptadores de módulos existentes

O registry de widgets comprova que vários tipos apenas conectam componentes já existentes à camada visual de Workspace.

Exemplos confirmados:

- `automation-admin` → `AutomationAdminWidget` → `AutomationModule`;
- `settings-admin` → `SettingsAdminWidget` → `SettingsModule`;
- `user-access` → camada de equipe/acesso existente;
- `financial-*` → componentes/serviços financeiros existentes;
- `frigobar` → domínio Frigobar existente;
- `task-kanban` → Kanban existente;
- recepção → quartos, hóspedes, reservas, estadias e calendário existentes.

`AutomationAdminWidget` e `SettingsAdminWidget` documentam no próprio código que são adaptadores de apresentação: regras e mutações permanecem nos módulos originais/`useHotel`.

Conclusão: remover a obrigatoriedade de Workspace não remove essas funcionalidades. Elas podem ser roteadas diretamente.

## 6. Financeiro

O Financeiro aparece hoje como Workspace de gestão, mas seu inventário já comprovou que a fonte de verdade está no Financial Engine, serviços e tabelas/RPCs próprias.

Portanto `workspace-financeiro` deve deixar de ser a rota conceitual do produto e passar a ser, no máximo, compatibilidade visual. O destino é `/app/financeiro`.

## 7. Governança e Manutenção

São as duas áreas em que a camada Workspace ainda tem relevância operacional maior na apresentação.

Mesmo assim, seus motores e fontes de verdade já foram mapeados fora da Fábrica:

- Governança possui módulo, serviços e Kanban próprios;
- Manutenção utiliza tarefas/Kanban e lifecycle do quarto;
- o estado operacional não pertence à definição visual do Workspace.

Na FASE 2 serão criadas entradas estáveis para essas áreas reutilizando os componentes existentes. Durante o corte, o Workspace continuará como fallback até os testes confirmarem equivalência funcional.

## 8. Cozinha/KDS

O template `workspace-cozinha` é uma composição visual do fluxo de pedidos. O domínio real já está no PDV/KDS e nas tabelas de pedidos/itens.

Destino: `/app/kds` e `/app/pdv`, sem exigir Workspace.

## 9. Persistência da Fábrica

`src/workspace-engine/workspaceConfigStore.ts` persiste overrides em:

- Supabase: `workspace_engine_configs`;
- `localStorage`: cache/fallback e fila de alterações ainda não confirmadas.

O salvamento escreve localmente, faz `upsert` no Supabase e só considera a alteração persistida após leitura de confirmação equivalente. A exclusão também é confirmada no Supabase antes de limpar o estado local.

Essa persistência não deve ser apagada durante a FASE 2. Ela será mantida para compatibilidade e rollback até o encerramento da transformação.

## 10. Fábrica atual

`WorkspaceEditorModule.tsx` é uma ferramenta de composição visual que permite:

- visualizar templates;
- criar Workspace a partir de template;
- criar área customizada;
- duplicar/remover;
- escolher setor/board;
- adicionar/remover/reordenar widgets;
- configurar apresentação desktop/mobile/KDS;
- persistir overrides por hotel.

Ela não deve continuar como porta obrigatória para construir o produto SaaS comum.

### Destino

Durante a transformação:

- manter acessível apenas como ferramenta técnica/compatibilidade;
- remover da navegação SaaS principal somente depois das rotas estáveis estarem homologadas;
- não excluir tabelas, configs ou código enquanto houver fallback dependente deles.

## 11. Funcionalidades que precisam de rota direta

Com base no inventário completo, o contrato estável do NovoHotel será:

- `/app` — dashboard operacional;
- `/app/reservas`;
- `/app/recepcao`;
- `/app/quartos`;
- `/app/hospedes`;
- `/app/governanca`;
- `/app/manutencao`;
- `/app/kanban`;
- `/app/pdv`;
- `/app/kds`;
- `/app/frigobar`;
- `/app/financeiro`;
- `/app/indicadores`;
- `/app/equipe`;
- `/app/automacoes`;
- `/app/configuracoes`;
- `/app/configuracoes/site`;
- `/app/sistema/workspaces` — compatibilidade/técnico durante a migração.

O menu deve ser derivado desse contrato único e filtrado por RBAC/escopo do hotel.

## 12. Estratégia de corte da FASE 2

A substituição será incremental:

1. criar um contrato tipado único de rotas do NovoHotel;
2. mapear cada rota para o módulo/componente existente;
3. fazer o menu usar o mesmo contrato;
4. manter `AuthenticatedWorkspaceRouter` como fallback temporário para usuários/áreas ainda não migrados;
5. migrar Recepção, Governança, Manutenção e KDS para entradas diretas;
6. validar RBAC e setores em cada rota;
7. somente depois retirar a resolução obrigatória por Workspace;
8. manter a Fábrica em `/app/sistema/workspaces` até homologação final.

## 13. Regra de segurança da transformação

Nenhuma regra de negócio será movida para o novo roteador.

O roteador decide apenas:

- rota;
- módulo a renderizar;
- permissão de acesso;
- contexto do hotel;
- fallback de compatibilidade.

Reservas, financeiro, quartos, Kanban, governança, manutenção, PDV/KDS, mídia, autenticação e demais operações continuam em seus engines/services/repositories atuais.

## 14. Encerramento da FASE 1

O inventário agora cobre:

Reservas → Recepção → Quartos → Hóspedes → Governança → Manutenção → Kanban → PDV → KDS → Frigobar → Financeiro → Equipe/Auth/RBAC → BI/Indicadores → Automações → Configurações/White-label → Site público → Workspace/Fábrica.

A FASE 1 está funcionalmente fechada.

A FASE 2 deve começar pela criação do contrato único de rotas/menu, sem remover o runtime legado e sem alterar regras de negócio.