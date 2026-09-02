# Mapa Funcional NovoHotel

## Objetivo

Este documento registra o inventário funcional necessário para transformar o HOTEL OS no NovoHotel SaaS simplificado sem recriar regras de negócio, fontes de dados ou engines que já existem.

A regra de transformação é: **Função → Tela → Componente → Hook/Service → Repository/Core → Tabela/Migration → Fonte de verdade → Destino NovoHotel**.

Nenhuma remoção da Fábrica de Workspaces, de adapters operacionais ou de contratos persistidos deve ocorrer antes de suas dependências aparecerem neste mapa.

## Estado da transformação

- FASE 0 concluída com lint, testes, build, audit de produção e preview build verdes.
- FASE 1 em andamento: inventário do produto real.
- Clusters já fechados: Reservas/Recepção/Quartos/Hóspedes; Governança/Manutenção/Kanban; PDV/KDS/Frigobar/Financeiro.
- A navegação administrativa atual já concentra módulos funcionais estáveis, mas ainda usa `adminActiveTab` e, para usuários operacionais, setor → Workspace → runtime.
- O destino é reutilizar os módulos atuais em rotas SaaS estáveis, mantendo Workspace/Fábrica somente como compatibilidade até o fechamento completo do inventário.

## Arquitetura encontrada

### Entrada pública e autenticação

`src/App.tsx` mantém duas superfícies principais: landing page pública e área autenticada. A landing reutiliza componentes de marketing, quartos e reserva. A área autenticada encaminha usuários de gestão ao `AdminLayout`; usuários operacionais ainda passam por setor, resolução de Workspace e `WorkspaceRuntime`.

### Shell administrativo existente

`src/components/admin/AdminLayout.tsx` já funciona como catálogo de módulos do produto e é a base mais simples para o NovoHotel.

### Estado operacional e persistência base

`src/context/HotelContext.tsx` ainda concentra estado e ações de hotel, quartos, tipos de quarto, hóspedes, reservas, bloqueios, automações, usuários, RBAC, autenticação e 2FA. Há persistência local de compatibilidade e sincronização com Supabase.

### Linhagem de migrations

O repositório possui duas séries de migrations:

- `/supabase-migrations/`: série histórica/compatibilidade usada por fases antigas do HOTEL OS.
- `/supabase/migrations/`: série timestampada do Supabase CLI, mais recente e mais completa para os contratos atuais de Recepção, Kanban, PDV, inventário, financeiro, frigobar, RBAC e Workspace.

Para o NovoHotel, a série timestampada deve ser tratada como referência principal do inventário atual; a série antiga permanece preservada até a validação final de compatibilidade.

## Inventário funcional

| Função | Tela atual | Componente/entrada | Hook / Service | Repository / Core | Persistência / migrations verificadas | Fonte de verdade atual | Destino NovoHotel |
|---|---|---|---|---|---|---|---|
| Reservas | Mapa de Reservas + motor público | `ReservationsModule` + `BookingModal` | `HotelContext`; serviços de disponibilidade/Recepção | Supabase | `reservas`, `quartos`, `bloqueios`; `20260828225500_reservation_inventory_engine.sql` | Supabase; UI legada ainda mantém estado local sincronizado | `/app/reservas` |
| Recepção / estadia | Check-in / Out + ambiente de Recepção | `CheckInOutModule`; `ReceptionWorkspaceShared`; boards de Recepção | `receptionGuestStayService`; `receptionRoomKanbanService`; `HotelContext` | Supabase + Kanban | RPCs `reception_*` versionadas em `20260828193000`, `20260828202500`, `20260828225500`, `20260828233000` e migrations relacionadas | Supabase; `quartos` controla estado do quarto | `/app/recepcao` |
| Quartos e tarifas | Quartos & Tarifas + projeções operacionais | `RoomsModule`; componentes da Recepção | `HotelContext`; `receptionRoomKanbanService`; disponibilidade | Supabase + projeções Kanban | `quartos`, `tipos_quarto`, `bloqueios`; lifecycle/projeções em migrations timestampadas | `quartos` é canônico para condição operacional | `/app/quartos` |
| Hóspedes / CRM | Hóspedes & CRM + cadastro da Recepção | `GuestsModule`; formulários da Recepção | `HotelContext`; `receptionGuestStayService` | Supabase | `hospedes`; vínculo com `reservas` | Supabase | `/app/hospedes` |
| Governança | Centro operacional especializado | `GovernancaWorkspace`; `GovernancaKanbanBoard`; modais/insights | `kanbanV2`; `kanbanCardGovernanceService`; `governancaDemandService` | Kanban + regras `kanbanAccess` | `kanban_*`; `governanca_tarefas_quarto`; checkout/projeções timestampadas | Kanban é a superfície operacional; quarto continua canônico para seu estado | `/app/governanca` |
| Manutenção | Board operacional e demandas derivadas | `kanban-board-manutencao`; widgets/atalhos | `kanbanV2`; `kanbanCardGovernanceService`; `governancaDemandService` | Kanban | `kanban_cards`; `20260828043500_related_maintenance_controls_room_status.sql` | tarefa = Kanban; demanda ativa pode controlar `quartos.status` por trigger | `/app/manutencao` |
| Kanban | Kanban Operacional | `KanbanWorkspaceModule`; `KanbanModule`; `KanbanAuditPanel`; boards especializados | `kanbanV2`; `kanbanCardGovernanceService`; bootstrap/realtime | motor Kanban | `kanban_boards`, `kanban_columns`, `kanban_cards`, `kanban_card_events`; migrations timestampadas de persistência, realtime e auditoria | Supabase; `localStorage` é fallback legado | `/app/kanban` |
| PDV | PDV & Caixa | `PDVPage` | `pdvService` | `pdvRepository` | `pdv_produtos`, `pdv_pedidos`, `pdv_itens_pedido`, `pdv_cash_*`; `20260826130000_phase6_pdv_core.sql` e hardenings | Supabase/RPCs do PDV | `/app/pdv` |
| KDS | KDS • Cozinha | `KDSPage` | `pdvService`; realtime KDS | `pdvRepository` | `pdv_kds_items`; RPC `hotel_os_update_kds_item`; `20260826130000_phase6_pdv_core.sql` | KDS é projeção operacional dos itens do PDV | `/app/kds` |
| Frigobar / estoque | Frigobar & Estoque | `FrigobarModule` | `frigobarCore` | `frigobar-core/repository` + Financial Engine | `hotel_os_minibar_*`, `hotel_os_stock_*`; `20260829010000_frigobar_core_supabase.sql` | Supabase; consumo baixa estoque e gera cobrança no Folio na mesma operação | `/app/frigobar` |
| Financeiro / Folio | Financeiro & Folio | renderers atuais do Financeiro + Folio | `financeService`; `folioService`; reporting | `financeRepository` + `financial-engine` | `hotel_os_folios`, `hotel_os_folio_items`, `hotel_os_transactions`, contas a pagar/receber; `20260829000500_financial_engine_v1.sql` e migrations financeiras | Financial Engine/Supabase | `/app/financeiro` |
| BI gerencial | BI & KPIs Gerenciais | `ExecutiveDashboardModule` + alertas | reporting existente | `dashboard-engine` + financeiro | migrations BI ainda a fechar | engines existentes | `/app/indicadores` |
| Equipe e acessos | Equipe & Acessos | `UsersOperationalAccessModule` | `useHotelRBAC`; `userSectorService`; auth Supabase | RBAC/auth | migrations RBAC/auth ainda a fechar no próximo cluster | Supabase + matriz RBAC | `/app/equipe` |
| Automações | Automações & Fechaduras | `AutomationModule` | `HotelContext` + serviços existentes | infraestrutura atual | `automacoes` + migrations relacionadas | Supabase | `/app/automacoes` |
| Configuração / Design | Configurações & Design | `SettingsModule` | `HotelContext`; mídia/identidade | contratos atuais | `hotel_config`, `media_uploads` | Supabase | `/app/configuracoes` |
| Site público | Landing + quartos + reserva | `Navbar`, `HeroSection`, `RoomsShowcase`, `BookingModal` | contexto/serviços de disponibilidade | serviços existentes | dados do hotel, quartos, inventário e reserva | Supabase + conteúdo do hotel | `/` público |
| Workspace / Fábrica | Editor de Workspaces | `WorkspaceEditorModule` | `workspaceConfigStore`; Workspace Engine | `workspace-engine` | persistence timestampada existente | compatibilidade visual | `/app/sistema/workspaces` temporariamente |
| Central Hotel OS | Central Hotel OS | `HotelOSCommandCenter` | eventos/saúde/integrações | infraestrutura atual | rastreio posterior | serviços existentes | ferramenta administrativa, não rota crítica |

## Cluster 1 — Reservas, Recepção, Quartos e Hóspedes

### Reservas

O fluxo legado de `HotelContext.createReservation` ainda cria o objeto no estado React e dispara persistência assíncrona. Esse caminho não deve ser expandido.

A série timestampada contém o motor canônico mais forte em `20260828225500_reservation_inventory_engine.sql`: restrição física contra sobreposição de reservas ativas, validação de bloqueios/capacidade/cama, lock da linha do quarto, busca `reception_find_available_rooms` e criação atômica `reception_create_reservation_with_room`.

**Decisão:** não criar outro motor. A rota `/app/reservas` reutilizará a interface atual, convergindo os writes críticos para os RPCs/constraints canônicos.

### Recepção e estadia

A lacuna anteriormente registrada sobre as RPCs `reception_*` foi resolvida. As definições SQL estão versionadas na série timestampada:

- `20260828193000_reception_guest_reservation_workflow.sql` define `reception_create_reservation_for_guest`.
- `20260828202500_reception_independent_reservations.sql` permite reserva sem quarto e bind/unbind posterior.
- `20260828225500_reservation_inventory_engine.sql` define disponibilidade e criação com quarto.
- `20260828233000_atomic_direct_room_checkin.sql` define check-in direto atômico, serializado pelo quarto e protegido contra reservas/bloqueios conflitantes.

O `receptionGuestStayService` já chama esses contratos. O `receptionRoomKanbanService` confirma o desenho de estado: `quartos` é a entidade operacional e o Kanban é projeção.

**Decisão:** `/app/recepcao` consolida as entradas existentes sem novo serviço de domínio.

### Quartos

`RoomsModule` já é tela direta. A série atual de migrations também possui lifecycle/projeções específicas de quarto, inclusive fonte canônica de status e integridade das projeções de Recepção/Governança.

**Decisão:** manter `quartos` como fonte de verdade da condição operacional e impedir que widgets/boards virem um segundo estado canônico.

### Hóspedes

`GuestsModule` e `receptionGuestStayService` compartilham `hospedes`. O primeiro passa pelo estado sincronizado do contexto; o segundo grava diretamente no Supabase.

**Decisão:** `hospedes` permanece entidade única; `HotelContext` é camada de interface/compatibilidade, não domínio paralelo.

## Cluster 2 — Governança, Manutenção e Kanban

### Governança

`GovernancaWorkspace` é uma tela especializada completa. Embora receba `WorkspaceDefinition`, suas operações reais usam `kanbanV2`, realtime, RBAC operacional e serviços de governança de cards/demandas.

`governancaDemandService` encaminha demandas para Governança, Recepção, Manutenção, Cozinha ou Operação Geral, preservando origem e relação.

Há também `governanca_tarefas_quarto` no workflow SQL legado. Esse contrato permanece preservado até terminar a confirmação de consumidores; não será removido apenas porque o Kanban é hoje a superfície principal.

**Decisão:** `/app/governanca` reutiliza o centro operacional atual; Workspace deixa de ser requisito de navegação, não motor de dados.

### Manutenção

Manutenção continua centrada no board `kanban-board-manutencao`, mas não é apenas uma convenção visual. `20260828043500_related_maintenance_controls_room_status.sql` conecta demandas derivadas de Manutenção ao lifecycle do quarto: enquanto houver demanda ativa, o quarto permanece em `manutencao`; ao fechar a última, o status anterior é restaurado. O próprio SQL preserva o motor Kanban.

**Decisão:** não criar engine/tabela paralela de ordens de serviço. A rota `/app/manutencao` será uma view especializada do Kanban existente, respeitando o trigger que controla o quarto.

### Kanban operacional

`KanbanWorkspaceModule` usa Supabase como banco principal e executa bootstrap do legado local antes da exibição. `localStorage` é fallback de migração, não fonte final.

A auditoria também está versionada: `20260827230000_kanban_card_ownership_audit.sql` cria `kanban_card_events`, normaliza responsabilidade e mantém soft delete/auditoria de forma aditiva.

**Decisão:** `/app/kanban` e as views especializadas continuam sobre `kanban_*`, sem duplicar o motor.

## Cluster 3 — PDV, KDS, Frigobar e Financeiro

### PDV

`PDVPage` já é uma página autônoma. Ela usa `pdvService`, que delega ao `pdvRepository`; o repository fala diretamente com Supabase.

O contrato canônico está em `20260826130000_phase6_pdv_core.sql`: produtos e pedidos são preservados/fortalecidos, `pdv_kds_items` é criado, caixas/sessões/movimentos são persistidos, permissões de PDV/KDS são registradas e `hotel_os_create_order` cria pedido/itens/KDS de forma transacional. O mesmo núcleo possui finalização de pedido, atualização KDS e caixa.

**Decisão:** `/app/pdv` reutiliza `PDVPage` diretamente. Não há motivo para envolver Workspace ou criar um novo motor de vendas.

### KDS

`KDSPage` é uma projeção operacional do PDV. Ele lista `pdv_kds_items`, filtra por setor e usa realtime. A mudança de status passa por `hotel_os_update_kds_item`, que sincroniza KDS, item do pedido e pedido.

**Decisão:** `/app/kds` continua sendo uma tela especializada do domínio PDV/KDS existente; não haverá engine KDS separado.

### Frigobar

`FrigobarModule` usa `frigobarCore`, cujo core valida quantidade/idempotência e delega ao repository Supabase. O repository chama `hotel_os_minibar_room_snapshot`, `hotel_os_minibar_consume` e `hotel_os_minibar_restock`.

`20260829010000_frigobar_core_supabase.sql` confirma a arquitetura correta: não há persistência financeira paralela. O consumo exige estadia/folio ativos, baixa estoque pelo Inventory Core e chama `hotel_os_financial_add_charge` com origem `FRIGOBAR` na mesma operação. Reposição transfere estoque entre localizações canônicas.

**Decisão:** `/app/frigobar` reutiliza o módulo/core atual; estoque e cobrança permanecem nos respectivos engines.

### Financeiro e Folio

Há dois níveis financeiros complementares, não concorrentes:

- `financeService`/`financeRepository` atende gestão administrativa: contas a receber, contas a pagar e transações, inclusive liquidação por RPC.
- `folioService` é facade de compatibilidade para o `financial-engine`, que centraliza cobranças de estadia, pagamentos, estorno de item, elegibilidade de checkout e fechamento de Folio.

`20260829000500_financial_engine_v1.sql` reutiliza o modelo `hotel_os_folios`/`hotel_os_folio_items`/`hotel_os_transactions`, adiciona idempotência e RPCs canônicos para cobrança, pagamento, snapshot, validação de checkout e fechamento.

**Decisão:** não recriar Financeiro. `/app/financeiro` deve extrair/reutilizar os renderers hoje montados pelo `workspace-financeiro` e apontá-los diretamente para `financeService`, `financialReportingService`, `folioService` e `financial-engine`.

### Fonte de verdade e compatibilidade no Cluster 3

- **PDV/KDS:** tabelas `pdv_*` e RPCs da FASE 6.
- **Frigobar:** `hotel_os_minibar_*` + Inventory Core; nenhuma contabilidade paralela.
- **Folio:** `hotel_os_folios`, `hotel_os_folio_items`, `hotel_os_transactions` via Financial Engine.
- **Financeiro administrativo:** contas a pagar/receber/transações via `financeRepository`.
- **Workspace Financeiro:** composição visual atual, não fonte de verdade financeira.

## Constatações que orientam a simplificação

1. **Não é necessário criar um novo PMS.** As telas e engines principais já existem.
2. **O gargalo de complexidade está principalmente na navegação operacional.** O admin já seleciona módulos diretamente; usuários operacionais ainda atravessam setor → Workspace → runtime.
3. **A série `/supabase/migrations/` contém contratos canônicos mais atuais do que a série histórica `/supabase-migrations/`.** Ambas serão preservadas até a revisão final, mas o inventário deve preferir a série timestampada.
4. **Reservas/Recepção já possuem operações atômicas no banco.** O trabalho futuro é convergir a UI legada para elas, não criar outra regra de disponibilidade.
5. **Manutenção é Kanban-centered, mas integrada ao lifecycle do quarto por trigger.** Não criar um segundo motor de OS.
6. **KDS é projeção do PDV.** Não criar domínio duplicado.
7. **Frigobar já integra estoque e Folio transacionalmente.** Não criar estoque ou financeiro paralelo.
8. **Financeiro já possui Financial Engine e camada administrativa.** O acoplamento restante mais visível é de apresentação no Workspace.
9. **`localStorage` é compatibilidade/fallback.** Não deve ser promovido a fonte de verdade do SaaS final.
10. **A Fábrica permanece intacta até o fim do inventário.** A simplificação removerá dependência de navegação antes de considerar qualquer remoção física.

## Rotas-alvo do SaaS simplificado

- `/app` — visão inicial
- `/app/reservas`
- `/app/recepcao`
- `/app/quartos`
- `/app/hospedes`
- `/app/governanca`
- `/app/manutencao`
- `/app/kanban`
- `/app/pdv`
- `/app/kds`
- `/app/frigobar`
- `/app/financeiro`
- `/app/indicadores`
- `/app/equipe`
- `/app/automacoes`
- `/app/configuracoes`
- `/app/sistema/workspaces` — compatibilidade temporária da Fábrica

## Próxima varredura obrigatória

Próximo cluster: **Equipe/RBAC → BI → Automações/Configurações → Site público → Workspace/Fábrica**.

Antes da primeira troca de navegação, fechar para essas funções:

- services/repositories/cores realmente chamados;
- tabelas e migrations timestampadas canônicas;
- fallbacks locais ainda ativos;
- dependências de Workspace/Widget;
- regras RBAC;
- operações críticas e testes que protegem o fluxo.

Depois disso, a primeira mudança estrutural deverá ser pequena: criar um contrato único de rotas/menu do NovoHotel reutilizando os componentes existentes e mantendo o roteamento por Workspace como fallback durante a migração.