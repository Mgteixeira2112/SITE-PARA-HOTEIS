# NovoHotel — Inventário funcional: Automações, Configurações e Site Público

## Status

FASE 1 — inventário funcional. Este documento fecha o cluster de Automações, Configurações/White-label e Site público antes da auditoria final de Workspace/Fábrica.

## 1. Automações

### Tela atual

`src/components/admin/AutomationModule.tsx`

A tela existente é um módulo administrativo direto. Ela consome `automations`, `reservations`, `guests`, `rooms`, `updateAutomation`, `simulateMessageDispatch` e `hotelConfig` diretamente do `HotelContext`.

Funções existentes:

- listar réguas de comunicação;
- habilitar/desabilitar regras;
- trabalhar com canais WhatsApp/e-mail;
- selecionar reserva e regra;
- renderizar uma simulação da mensagem;
- abrir o WhatsApp com a mensagem formatada;
- exibir informações de PIN/fechadura associadas ao fluxo da reserva.

### Fonte de verdade e limite atual

As regras de automação fazem parte do estado/persistência operacional já exposto pelo `HotelContext`. O módulo não depende de Workspace para funcionar.

O envio apresentado nessa tela é principalmente uma simulação/renderização de template e um link para WhatsApp. Portanto, no NovoHotel não devemos representar isso como um motor de mensageria assíncrona completo enquanto não existir evidência de fila, scheduler e provider transacional correspondentes.

### Destino NovoHotel

Rota proposta: `/app/automacoes`.

Reutilizar o módulo atual como base, separando conceitualmente:

1. **Regras e templates de comunicação** — manter.
2. **Simulador/preview** — manter como ferramenta administrativa.
3. **Fechaduras** — manter apenas o que estiver realmente integrado ao lifecycle de reserva/quarto; textos promocionais não devem ser tratados como integração comprovada.
4. **Entrega automática real** — somente habilitar como funcionalidade oficial quando houver provider/fila/scheduler versionados e auditados.

Não criar um segundo sistema de automações nesta transformação.

## 2. Configurações do hotel

### Tela atual

`src/components/admin/SettingsModule.tsx`

A Central de Configurações já reúne:

- personalização do site público;
- presets e portabilidade JSON;
- dados cadastrais e regras operacionais;
- integração/diagnóstico Supabase;
- galeria de mídia;
- atalhos relacionados à equipe/demonstração.

Ela usa o `HotelContext` para `hotelConfig`, sincronização, dados operacionais e navegação.

### Separação necessária no NovoHotel

A tela atual mistura três responsabilidades que deverão ser preservadas, mas reorganizadas:

#### A. Configuração do hotel

Dados cadastrais, políticas, horários, taxas e demais parâmetros operacionais pertencem a `/app/configuracoes`.

A fonte deve continuar sendo `hotelConfig` persistido no Supabase. `localStorage` permanece apenas como compatibilidade/cache durante a migração, não como fonte oficial do SaaS.

#### B. Configuração do site público

Branding, hero, tipografia, cores, textos, comodidades, depoimentos, FAQ, localização e visibilidade pertencem ao escopo do site público e podem continuar editáveis pelo hotel.

`LandingCustomizerTab.tsx` já implementa esse editor diretamente sobre `hotelConfig`, sem dependência da Fábrica de Workspaces.

#### C. Ferramentas técnicas/legadas

Credenciais Supabase editáveis no navegador, SQL de bootstrap, exportação manual integral da base, restauração de dados demo e outras funções de diagnóstico não devem compor a experiência SaaS comum.

Durante a transformação elas ficam preservadas, mas devem migrar para uma área técnica restrita ou ser retiradas da navegação normal somente depois da validação de dependências e operação.

## 3. White-label e presets

### Componentes existentes

- `src/components/admin/settings/LandingCustomizerTab.tsx`
- `src/components/admin/settings/PresetsPortabilityTab.tsx`
- `src/utils/themeHelper.ts`

O editor atual controla diretamente elementos do site público, incluindo hero/background, branding, cores, tipografia, conteúdo institucional, comodidades, quartos, depoimentos, FAQ, localização, contato e visibilidade.

Os presets aplicam configurações ao `hotelConfig`, e a portabilidade JSON exporta/importa a configuração do hotel.

### Decisão

O conceito de white-label é compatível com o NovoHotel e será preservado, mas simplificado como **Configuração do Site**, não como uma “fábrica” de frontend.

Não será criado um novo editor visual genérico para substituir o site estático nesta fase.

## 4. Mídia

### Serviço existente

`src/services/mediaService.ts`

O serviço já delega para o Supabase Storage e para a tabela `media_uploads`:

- upload de imagem;
- leitura da galeria;
- exclusão;
- atualização de metadados;
- catalogação de logos, hero, foto institucional, quartos, depoimentos e avatares.

### Destino NovoHotel

Preservar o serviço existente e a galeria atual. O site público e a administração devem compartilhar os mesmos registros de mídia, sem criar biblioteca paralela.

## 5. Site público existente

### Estrutura

O `App.tsx` já contém uma composição pública explícita e independente de Workspace:

- `Navbar`;
- `HeroSection`;
- `RoomsShowcase`;
- `AmenitiesSection`;
- `AboutSection`;
- `LocationSection`;
- `TestimonialsSection`;
- `FaqSection`;
- `ContactSection`;
- `Footer`;
- `FloatingWhatsapp`;
- `BookingModal`.

O diretório `src/components/landing/` já concentra as seções do site.

### Conclusão arquitetural

O produto já possui a base necessária para o conceito desejado de **site público estático/publicável + aplicação SaaS separada**.

A transformação não precisa criar uma nova “fábrica de sites”. O caminho é estabilizar a composição existente como site público e manter apenas configurações controladas pelo hotel.

## 6. Motor de reservas no site

`BookingModal.tsx` já oferece o wizard público de reserva e usa `searchRooms` e `createReservation` do `HotelContext`.

Entretanto, o inventário anterior comprovou que `createReservation` do contexto ainda persiste de forma otimista e não usa diretamente a RPC canônica transacional de reserva segura.

Portanto:

- a interface pública pode ser preservada;
- a busca e criação deverão convergir para o Inventory/Reservation Engine canônico já existente no Supabase;
- não criar outro motor de reservas para o novo site;
- não considerar o fluxo atual pronto para produção até essa convergência ser executada e testada.

## 7. Navegação atual e ponto de corte

`App.tsx` ainda faz a seleção principal por `currentView` (`landing`/`admin`). Após autenticação, usuários de gestão vão para `AdminLayout`; usuários operacionais ainda passam por `AuthenticatedWorkspaceRouter`, que resolve setores e Workspace.

Esse é o principal acoplamento estrutural que resta antes da FASE 2.

O site público em si não depende da Fábrica. A dependência da Fábrica está concentrada na entrada operacional autenticada.

## 8. Contrato de destino

### Público

- `/` — site do hotel
- motor de reserva acionado pelo site
- conteúdo controlado pelo hotel
- sem Workspace/Fábrica

### SaaS

- `/app/configuracoes` — dados do hotel, políticas e configurações funcionais
- `/app/configuracoes/site` — conteúdo/branding/mídia do site
- `/app/automacoes` — regras/templates/simulações e integrações comprovadas

### Área técnica temporária

Manter, fora da navegação SaaS comum enquanto houver dependências:

- credenciais/diagnóstico Supabase;
- seed/exportação integral;
- reset demo;
- SQL/manual bootstrap;
- ferramentas de compatibilidade.

## 9. Decisões de não expansão

Nesta transformação:

- não criar CMS separado;
- não criar outro Storage;
- não criar outro sistema de temas;
- não criar outro motor de automação;
- não criar outra landing page;
- não criar outro motor de reservas;
- não remover ferramentas técnicas antes de confirmar que não são necessárias para operação/homologação.

## 10. Próximo passo obrigatório

Realizar a auditoria final de **Workspace/Fábrica**, identificando:

1. quais telas ainda entram exclusivamente por Workspace;
2. quais widgets são apenas composição visual de módulos já existentes;
3. quais funcionalidades reais ainda não possuem tela direta no `AdminLayout`;
4. quais tabelas/configurações de Workspace podem permanecer apenas como compatibilidade;
5. qual é o menor contrato de rotas/menu capaz de substituir `AuthenticatedWorkspaceRouter` sem perda funcional.

Somente após esse fechamento começa a FASE 2 com a introdução incremental das rotas estáveis do NovoHotel.