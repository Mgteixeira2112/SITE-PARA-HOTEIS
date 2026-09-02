# Mapa Funcional NovoHotel

## Objetivo

Este documento registra o inventário funcional necessário para transformar o HOTEL OS no NovoHotel SaaS simplificado sem recriar regras de negócio, fontes de dados ou engines que já existem.

A regra de transformação é: **Função → Tela → Componente → Hook/Service → Repository/Core → Tabela/Migration → Fonte de verdade → Destino NovoHotel**.

Nenhuma remoção da Fábrica de Workspaces, de adapters operacionais ou de contratos persistidos deve ocorrer antes de suas dependências aparecerem neste mapa.

## Estado da transformação

- FASE 0 concluída com a branch de transformação validada por lint, testes, build, audit de produção e preview build.
- FASE 1 em andamento: inventário do produto real.
- A navegação administrativa atual já concentra módulos funcionais estáveis, mas ainda usa `adminActiveTab` e, para usuários operacionais, o roteamento por setor → Workspace → runtime.
- O destino da FASE 1/2 é reutilizar esses módulos em rotas SaaS estáveis, preservando temporariamente Workspace/Fábrica como compatibilidade até o fechamento do inventário.

## Arquitetura encontrada

### Entrada pública e autenticação

`src/App.tsx` mantém duas superfícies principais: landing page pública e área autenticada. A landing reutiliza componentes de marketing, quartos e reserva. A área autenticada encaminha usuários de gestão ao `AdminLayout`; usuários operacionais ainda passam por setor, resolução de Workspace e `WorkspaceRuntime`.

### Shell administrativo existente

`src/components/admin/AdminLayout.tsx` já funciona como um catálogo de módulos do produto e é a base mais simples para o NovoHotel. Os módulos atuais estão agrupados em Operação, Vendas & Consumo, Gestão & BI e Sistema & Auditoria.

### Estado operacional e persistência base

`src/context/HotelContext.tsx` ainda concentra estado e ações de hotel, quartos, tipos de quarto, hóspedes, reservas, bloqueios, automações, usuários, RBAC, autenticação e 2FA. Há persistência local de compatibilidade e sincronização com Supabase.

`src/services/supabase.ts` registra como tabelas-base: `hotel_config`, `tipos_quarto`, `quartos`, `hospedes`, `reservas`, `bloqueios`, `automacoes`, `usuarios`, `logs_seguranca` e `media_uploads`, além de apontar o histórico versionado em `/supabase-migrations/`.

## Inventário funcional inicial

| Função | Tela atual | Componente/entrada | Hook / Service | Repository / Core | Tabela / Migration verificada | Fonte de verdade atual | Destino NovoHotel |
|---|---|---|---|---|---|---|---|
| Reservas | Mapa de Reservas + motor público | `ReservationsModule` + `BookingModal` | ações do `HotelContext`; `upsertReservationToSupabase`; utilitário de disponibilidade | Supabase base + `kanbanV2` para projeção | `reservas`, `hospedes`, `quartos`; `007_reservation_atomic.sql`; `008_reservation_rpc.sql` | fluxo legado/UI: estado local sincronizado e Supabase; proteção transacional já existe no banco, mas o `HotelContext.createReservation` ainda grava via upsert direto | `/app/reservas`; posteriormente alinhar criação ao RPC transacional sem recriar o motor |
| Recepção / estadia | Check-in / Out + ambiente de Recepção | `CheckInOutModule`; `ReceptionWorkspaceShared`; `ReceptionRoomsKanban`; `ReceptionKanbanBoard` | `HotelContext.updateReservationStatus`; `receptionGuestStayService`; `receptionRoomKanbanService` | Supabase + Kanban oficial | `reservas`, `hospedes`, `quartos`, `kanban_cards`; RPCs `reception_create_reservation_for_guest`, `reception_room_direct_checkin`, `reception_find_available_rooms`, `reception_create_reservation_with_room` são referenciadas pelo cliente; definição SQL ainda não localizada no diretório versionado | adapter de recepção usa Supabase/RPC diretamente; `CheckInOutModule` legado passa pelo `HotelContext` | `/app/recepcao`; consolidar as duas entradas reutilizando os serviços existentes |
| Quartos e tarifas | Quartos & Tarifas + projeção no Kanban de Recepção | `RoomsModule`; `ReceptionRoomsKanban` | ações de quartos no `HotelContext`; `receptionRoomKanbanService`; `availabilityService` | Supabase + `kanbanV2`/governança do card | `quartos`, `tipos_quarto`, `bloqueios`; `007`/`008` também dependem de `quartos` para disponibilidade/reserva | `quartos` é a fonte operacional para status no fluxo de Recepção; `HotelContext` mantém cópia local sincronizada e grava Supabase | `/app/quartos` |
| Hóspedes / CRM | Hóspedes & CRM + cadastro na Recepção | `GuestsModule`; formulários da Recepção | ações de hóspedes no `HotelContext`; `receptionGuestStayService` | Supabase | `hospedes`; vínculo com `reservas` | Supabase é a persistência compartilhada; `GuestsModule` usa estado local sincronizado, enquanto Recepção faz insert/update direto em `hospedes` | `/app/hospedes` |
| Governança | Centro operacional / Kanban de governança | `GovernancaWorkspace`; `GovernancaKanbanBoard`; `GovernancaCardDetailModal`; `GovernancaDemandModal` | `governancaDemandService`; `governanceService`; `kanbanCardGovernanceService` | Kanban e regras operacionais existentes | migrations específicas ainda em inventário | serviços de governança/Kanban existentes | `/app/governanca` |
| Manutenção | Kanban operacional / quarto | atualmente acessível por composição operacional e widgets | `governanceService`/Kanban e serviços associados a manutenção | Kanban + domínio operacional | migrations específicas ainda em inventário | motor Kanban/serviços existentes | `/app/manutencao` |
| Kanban | Kanban Operacional | `KanbanWorkspaceModule`; bridges e boards especializados | `kanbanV2`; `kanbanCardGovernanceService`; `kanbanLocalBootstrapService` e serviços associados | motor Kanban existente | migrations Kanban dentro da série versionada; rastreio individual pendente | Kanban oficial | `/app/kanban` e views especializadas por função |
| PDV | PDV & Caixa | `PDVPage` | serviços já existentes do PDV | Financial/Inventory conforme contratos atuais | migrations PDV dentro do histórico versionado; rastreio individual pendente | serviços/engines existentes | `/app/pdv` |
| KDS | KDS • Cozinha | `KDSPage` | serviços de pedidos/KDS existentes | motores existentes; sem novo runtime | migrations KDS dentro do histórico versionado; rastreio individual pendente | dados operacionais existentes | `/app/kds` |
| Frigobar / estoque | Frigobar & Estoque | `FrigobarModule` | `inventoryService` + adapters existentes | `frigobar-core` + Financial Engine quando há consumo | migrations específicas ainda em inventário | Frigobar Core / Inventory / Finance | `/app/frigobar` |
| Financeiro / Folio | Financeiro & Folio | atualmente `WidgetDrivenWorkspace` com `workspace-financeiro` | `financeService`; `financialReportingService`; `folioService` | `financial-engine` | tabelas financeiras/migrations específicas ainda em inventário | Financial Engine e projeções oficiais | `/app/financeiro` com tela estável reutilizando os renderers atuais |
| BI gerencial | BI & KPIs Gerenciais | `ExecutiveDashboardModule` + `DashboardAlertsWidget` | serviços de reporting existentes | `dashboard-engine` + Financial Engine conforme métrica | rastreio pendente | engines existentes | `/app/indicadores` |
| Equipe e acessos | Equipe & Acessos | `UsersOperationalAccessModule` | `useHotelRBAC`; `userSectorService`; autenticação Supabase | contratos de RBAC/autenticação existentes | `usuarios`; demais tabelas de vínculo/RBAC em inventário | Supabase + matriz RBAC existente | `/app/equipe` |
| Automações | Automações & Fechaduras | `AutomationModule` | ações do `HotelContext` + serviços existentes | infraestrutura atual | `automacoes` + migrations específicas quando aplicável | Supabase/serviços existentes | `/app/automacoes` |
| Configuração / Design | Configurações & Design | `SettingsModule` | `HotelContext`; serviços de identidade/mídia | contratos atuais | `hotel_config`, `media_uploads` | Supabase | `/app/configuracoes` |
| Site público | Landing + quartos + reserva | `Navbar`, `HeroSection`, `RoomsShowcase`, seções institucionais, `BookingModal` | `HotelContext`/disponibilidade na configuração atual | serviços existentes | `hotel_config`, `quartos`, `tipos_quarto`, `reservas`, `hospedes` | dados do hotel + motor de reservas | `/` público, publicável e desacoplado da navegação SaaS |
| Workspace / Fábrica | Editor de Workspaces | `WorkspaceEditorModule` | `workspaceConfigStore` e Workspace Engine | `workspace-engine` | persistência de overrides já existente; rastreio completo pendente | compatibilidade visual atual | manter em `/app/sistema/workspaces` durante a transformação; remover da rota crítica somente após dependências mapeadas |
| Central Hotel OS | Central Hotel OS | `HotelOSCommandCenter` | serviços de eventos/saúde/integrações existentes | infraestrutura atual | rastreio pendente | serviços existentes | manter como ferramenta administrativa/auditoria, não como camada obrigatória de navegação |

## Cluster 1 — Reservas, Recepção, Quartos e Hóspedes

### Reservas

O caminho atualmente usado por `HotelContext.createReservation` é híbrido: cria/localiza o hóspede, calcula valores, cria o objeto de reserva no estado React, chama `upsertReservationToSupabase` de forma assíncrona e projeta a reserva para `kanbanV2`. Portanto, a interface ainda pode refletir a reserva antes da confirmação do banco.

Ao mesmo tempo, o banco já contém uma base mais segura. `007_reservation_atomic.sql` cria `validar_disponibilidade_quarto`, verificando autorização, intervalo e conflitos de reservas por hotel/quarto. `008_reservation_rpc.sql` cria `criar_reserva_segura`, que bloqueia o quarto, valida capacidade e disponibilidade e insere a reserva na mesma transação.

**Decisão de transformação:** não criar outro motor de reservas. A futura estabilização de `/app/reservas` deve reutilizar a tela atual e convergir a operação de criação para o contrato transacional já existente, preservando os campos de negócio que hoje são montados pelo `HotelContext`.

### Recepção e estadia

Existem dois caminhos que precisam ser reunidos, não reescritos:

- `CheckInOutModule` usa `HotelContext.updateReservationStatus`, que também altera o status do quarto e sincroniza o Kanban.
- O adapter especializado `receptionGuestStayService` acessa Supabase diretamente e referencia RPCs próprias para criação de reserva, check-in direto, busca de quartos disponíveis e criação com esquema de cama.

O `receptionRoomKanbanService` confirma explicitamente o desenho correto para estado de quarto: resolve o quarto vinculado, move o card pelo motor Kanban e persiste `quartos.status`; o próprio serviço declara `quartos` como fonte operacional e o Kanban como projeção.

**Lacuna registrada:** as quatro RPCs `reception_*` referenciadas por `receptionGuestStayService` não foram localizadas pelo inventário no diretório de migrations versionadas consultado. Elas não serão assumidas como contrato migrável até a definição SQL ser encontrada ou regularizada em fase posterior.

### Quartos

`RoomsModule` já é uma tela direta e não depende de Workspace. Suas operações chamam `addRoom`, `updateRoom`, `deleteRoom` e `setRoomStatus` do `HotelContext`. Essas ações atualizam o estado local e persistem em Supabase; mudanças de status também são projetadas para `kanbanV2`.

No fluxo especializado da Recepção, `receptionRoomKanbanService` faz o inverso de forma mais rigorosa: persiste `quartos.status` no Supabase e depois confirma o card do board de quartos. Para o NovoHotel, o contrato canônico deve continuar centrado em `quartos`, com Kanban como projeção operacional.

### Hóspedes

`GuestsModule` também já é uma tela direta. Ele consome `guests` e `reservations` do `HotelContext` e usa `addGuest`, `updateGuest` e `deleteGuest`. O contexto mantém cópia local e chama os métodos Supabase correspondentes.

A Recepção possui caminho direto por `receptionGuestStayService.createGuest/updateGuest`, que grava `hospedes` no Supabase sem depender do `HotelContext`. Logo, o dado compartilhado é a tabela `hospedes`; o estado do contexto é uma camada de apresentação/sincronização e não deve virar um segundo domínio no NovoHotel.

### Fonte de verdade e compatibilidade neste cluster

- **Supabase:** persistência compartilhada de `reservas`, `quartos`, `tipos_quarto`, `hospedes` e `bloqueios`.
- **Estado React do `HotelContext`:** cache/estado de interface inicializado também por `localStorage`, sincronizado da nuvem e atualizado por realtime.
- **`localStorage`:** fallback/compatibilidade do frontend; não é a fonte de verdade desejada para o SaaS final.
- **Kanban:** projeção operacional de reservas/quartos e não substituto da entidade de origem.
- **Workspace:** camada de apresentação para partes da Recepção; não é fonte de verdade de reservas, quartos ou hóspedes.

Com este cluster mapeado, as telas `ReservationsModule`, `CheckInOutModule`, `RoomsModule` e `GuestsModule` podem ser preservadas na migração para rotas estáveis. A alteração de rota só deve ocorrer depois que os clusters seguintes também tiverem suas dependências críticas registradas, evitando cortar integrações indiretas do Kanban/Governança.

## Constatações que orientam a simplificação

1. **Não é necessário criar um novo PMS.** As telas principais já existem no `AdminLayout` e podem ser reaproveitadas como páginas estáveis.
2. **O gargalo de complexidade está principalmente na navegação operacional.** O `App` ainda resolve setor → Workspace → runtime para usuários não gerenciais, enquanto o admin já seleciona módulos diretamente.
3. **Financeiro ainda está acoplado visualmente ao Workspace.** A transformação deve extrair uma página estável a partir dos renderers/Financial Engine já existentes, não recriar o financeiro.
4. **Recepção possui adapter visual próprio.** Ele deve ser tratado como fonte de componentes e fluxos durante a migração para `/app/recepcao`, sem regressão funcional.
5. **O `HotelContext` é grande e híbrido.** Nesta transformação ele não será reescrito preventivamente. Primeiro as rotas estáveis reutilizarão suas ações; separações internas só serão feitas quando houver dependência concreta e testável.
6. **Há persistência local de compatibilidade.** Ela não deve ser confundida com a fonte de verdade desejada. O inventário de cada fluxo deverá marcar onde Supabase/engine já é canônico e onde ainda existe fallback local.

## Rotas-alvo do SaaS simplificado

A malha inicial pretendida, sem instalar infraestrutura nova antes de verificar o roteamento existente, é:

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

Antes da primeira troca de navegação, fechar para cada função:

- arquivos de serviço/repository/core realmente chamados;
- tabelas Supabase reais e migrations que as criam/alteram;
- fallbacks `localStorage` ainda ativos;
- dependências de Workspace/Widget que impedem acesso direto;
- regras RBAC usadas pelo módulo;
- operações críticas e testes que protegem o fluxo.

Próximo cluster: **Governança → Manutenção → Kanban**. Depois dele, seguir para **PDV → KDS → Frigobar → Financeiro** e então **Equipe/RBAC → Site público → Workspace/Fábrica**.

A primeira mudança estrutural posterior ao inventário deve ser pequena: criar um contrato único de rotas/menu do NovoHotel reutilizando os componentes atuais e mantendo o roteamento por Workspace como fallback durante a migração.