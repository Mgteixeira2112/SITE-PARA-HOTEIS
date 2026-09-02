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
| Reservas | Mapa de Reservas | `ReservationsModule` + `BookingModal` | ações do `HotelContext`; utilitário de disponibilidade | serviços Supabase base; regras de disponibilidade existentes | `reservas`, `hospedes`, `quartos`; migrations versionadas | Supabase sincronizado pelo contexto, com camada local de compatibilidade | `/app/reservas` |
| Recepção / estadia | Check-in / Out + ambiente de Recepção | `CheckInOutModule`; `ReceptionWorkspaceShared`; `ReceptionRoomsKanban`; `ReceptionKanbanBoard` | `receptionGuestStayService`; `receptionRoomKanbanService` | contratos de recepção + engines já existentes | rastreamento detalhado de migrations ainda em inventário | serviços/regras atuais de recepção; não duplicar | `/app/recepcao` |
| Quartos e tarifas | Quartos & Tarifas | `RoomsModule`; componentes da Recepção para projeção operacional | ações de quartos no `HotelContext`; `availabilityService` | camada Supabase base + projeções de recepção | `quartos`, `tipos_quarto`, `bloqueios` | Supabase + regras existentes | `/app/quartos` |
| Hóspedes / CRM | Hóspedes & CRM | `GuestsModule` | ações de hóspedes no `HotelContext`; `receptionGuestStayService` no contexto de estadia | Supabase base + serviços de recepção | `hospedes` | Supabase | `/app/hospedes` |
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

A primeira mudança estrutural posterior ao inventário deve ser pequena: criar um contrato único de rotas/menu do NovoHotel reutilizando os componentes atuais e mantendo o roteamento por Workspace como fallback durante a migração.