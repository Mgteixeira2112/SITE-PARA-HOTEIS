# NovoHotel — Inventário de BI e Indicadores

## Objetivo

Fechar o inventário funcional do cluster **BI / Indicadores** antes da criação das rotas estáveis do NovoHotel SaaS simplificado.

A regra continua sendo: **Função → Tela → Componente → Service/Engine → Repository/Core → Persistência → Fonte de verdade → Destino NovoHotel**.

Nenhum novo motor de BI deve ser criado. O repositório já possui métricas oficiais, alertas, relatórios, metas e um Dashboard Engine independente de Workspace.

## Tela atual

A tela administrativa principal é `src/components/admin/ExecutiveDashboardModule.tsx`.

Ela já é uma página funcional direta, sem depender de Workspace para carregar dados. O módulo:

- resolve os hotéis autorizados pelo `tenantService`;
- permite escopo por hotel ou todos os hotéis autorizados;
- trabalha com períodos operacionais pré-definidos;
- chama `metricService.dashboard(...)` para obter métricas oficiais;
- agrega resultados multi-hotel na camada de apresentação;
- exibe ocupação, ADR, RevPAR, receita total, ticket médio, check-ins, check-outs, cancelamentos, no-show, booking window, lead time, produtividade de governança e MTTR de manutenção;
- mantém apenas um fallback visual local para ocupação/check-ins/check-outs quando o carregamento oficial falha.

O widget `DashboardAlertsWidget` complementa a visão gerencial, atualizando e listando alertas oficiais por hotel autorizado.

## Service canônico

`src/services/metricService.ts` é a fachada direta do frontend para o BI persistido no Supabase.

Contratos verificados:

- `dashboard(hotelId, start, end)` → RPC `hotel_os_dashboard_metrics`;
- `refreshDaily(hotelId, start, end)` → RPC `hotel_os_refresh_daily_metrics`;
- `refreshAlerts(hotelId)` → RPC `hotel_os_refresh_dashboard_alerts`;
- `alerts(hotelId)` → tabela `hotel_os_dashboard_alerts`;
- `definitions()` → tabela `hotel_os_metric_definitions`.

A seleção de hotéis autorizados é feita por `tenantService`, que usa `tenantRepository` para memberships, organizações, hotéis, checagem de acesso e permissões.

## Persistência e migrations canônicas

### Métricas oficiais

`supabase/migrations/20260827150000_phase15_bi_metrics_dashboard.sql` cria e versiona:

- `hotel_os_metric_definitions`;
- `hotel_os_dashboard_goals`;
- `hotel_os_dashboard_layouts`;
- `hotel_os_report_definitions`;
- `hotel_os_daily_metrics`.

As definições oficiais incluem, entre outras:

- OCCUPANCY;
- ADR;
- REVPAR;
- TOTAL_REVENUE;
- ROOM_REVENUE;
- POS_REVENUE;
- AVERAGE_TICKET;
- CHECKINS;
- CHECKOUTS;
- CANCELLATIONS;
- NO_SHOWS;
- BOOKING_WINDOW;
- LEAD_TIME;
- HOUSEKEEPING_PRODUCTIVITY;
- MAINTENANCE_MTTR.

As fontes do cálculo são os domínios já inventariados: `quartos`, `reservas`, `bloqueios`, `hotel_os_stays`, `hotel_os_folio_items`, `hotel_os_orders` e `hotel_os_tasks`. Portanto o BI é derivado dos dados operacionais/financeiros oficiais e não constitui uma segunda fonte de verdade.

### Hardening do cálculo

`20260827151000_phase15_bi_hardening.sql` corrige o snapshot diário e redefine `hotel_os_dashboard_metrics` para executar refresh do período antes de devolver a consolidação.

Isso torna `hotel_os_daily_metrics` um snapshot/cache analítico derivado, não o registro operacional primário.

### Relatórios e exportações

`20260827152000_phase15_reports_alerts.sql` adiciona:

- `hotel_os_dashboard_alerts`;
- `hotel_os_report_exports`;
- `hotel_os_scheduled_reports`;
- definições oficiais de relatórios de hospedagem, reservas, financeiro, PDV, estoque e operação.

Os formatos previstos no banco são PDF, CSV e XLSX. O inventário confirma o contrato persistido, mas não implica que toda a experiência de geração/entrega desses arquivos já esteja concluída na UI atual.

### Alertas gerenciais

`20260827153000_phase15_alert_engine.sql` define `hotel_os_refresh_dashboard_alerts`.

Alertas atualmente derivados no banco incluem:

- ocupação abaixo da meta configurada;
- manutenção crítica pendente;
- estoque abaixo do ponto de reposição;
- pagamentos recentes com falha;
- pedidos acima do SLA de 30 minutos.

O `DashboardAlertsWidget` consome exatamente essa camada, portanto não deve surgir um segundo sistema de alertas no NovoHotel.

## Dashboard Engine personalizado

Além da tela gerencial oficial existe `src/dashboard-engine/`.

O `dashboardEngine` permite registrar fontes/métricas e também listar, criar, alterar e remover dashboards e blocos.

O `dashboardRepository` persiste diretamente em:

- `hotel_os_dashboards`;
- `hotel_os_dashboard_blocks`.

`20260829001000_dashboard_engine_v1.sql` confirma que esse engine é apenas uma camada de **composição de visualizações sobre fontes autorizadas**. A própria migration declara que ele não substitui as métricas existentes.

Os dashboards possuem escopo `PERSONAL`, `ROLE` ou `HOTEL`, e os blocos suportam KPI, gráfico, tabela, alerta, ranking e progresso. A proteção é feita por RLS e `usuario_pode_hotel(...)`.

## Fonte de verdade

A hierarquia correta para o NovoHotel é:

1. **Dados operacionais/financeiros** — fontes primárias dos respectivos domínios já inventariados.
2. **RPCs de métricas + `hotel_os_daily_metrics`** — camada analítica oficial derivada.
3. **`hotel_os_dashboard_alerts`, metas e relatórios** — derivados gerenciais.
4. **Dashboard Engine** — composição/personalização visual; nunca fonte de verdade.
5. **Fallback local do `ExecutiveDashboardModule`** — somente degradação visual temporária, não dado oficial do SaaS.

## Dependência de Workspace

O núcleo de BI não exige Workspace.

`ExecutiveDashboardModule`, `metricService`, `tenantService`, `dashboardEngine` e suas tabelas/RPCs funcionam como contratos independentes.

Assim, a futura rota `/app/indicadores` pode renderizar diretamente o módulo atual e, quando necessário, incorporar os dashboards personalizados sem passar pela Fábrica de Workspaces.

## Decisão para o NovoHotel

- Reutilizar `ExecutiveDashboardModule` como base de `/app/indicadores`.
- Reutilizar `DashboardAlertsWidget` para alertas gerenciais.
- Manter `metricService` e as RPCs da FASE 15 como contrato oficial de KPIs.
- Preservar `dashboard-engine` para personalização de dashboards, sem transformá-lo em novo Workspace.
- Não duplicar cálculos de ADR, RevPAR, ocupação, receita ou produtividade no frontend.
- Não promover o fallback local a fonte oficial.
- Não recriar relatórios ou alertas que já possuem contratos persistidos.

## Pendências posteriores, fora deste inventário

Antes de considerar BI totalmente modernizado na interface final, ainda será necessário validar:

- quais telas atuais expõem criação/edição de dashboards personalizados;
- quais fluxos de exportação e relatórios agendados estão efetivamente conectados à UI;
- se metas (`hotel_os_dashboard_goals`) já possuem editor administrativo completo;
- permissões finais específicas para visualização/gestão de BI e relatórios.

Essas pendências não bloqueiam a simplificação da navegação, porque a leitura gerencial principal já é independente de Workspace.

## Resultado do cluster

**BI / Indicadores: inventário funcional fechado para a transformação estrutural.**

Destino definido: **`/app/indicadores`**, reutilizando os contratos atuais e preservando o Dashboard Engine como composição opcional, não como requisito de navegação.
