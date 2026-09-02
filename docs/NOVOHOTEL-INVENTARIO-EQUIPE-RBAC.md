# NovoHotel — Inventário de Equipe, Autenticação e RBAC

## Objetivo

Fechar o cluster **Equipe/RBAC** da FASE 1 sem criar um segundo sistema de usuários ou permissões. O NovoHotel deve reaproveitar o que já existe e separar claramente quatro responsabilidades: identidade, perfil do colaborador, autorização e setor operacional.

## Fluxo atual confirmado

O login do frontend já entra pelo Supabase Auth. `HotelContext.loginValidatePassword` chama `authenticateSupabaseStaff`; o bridge invoca a Edge Function `auth-migrate-user`, estabelece a sessão Supabase e só então lê `hotel_os_current_user_profile`.

A Edge Function existe para migração gradual dos usuários legados. Quando `usuarios.auth_user_id` ainda não existe, ela valida a credencial legada, cria o usuário em Supabase Auth, liga `usuarios.auth_user_id` ao novo `auth.users.id` e cria a sessão. Quando o vínculo já existe, o login ocorre diretamente pelo Supabase Auth.

A migration `20260901163000_finalize_rbac_auth_boundary.sql` confirma a direção canônica: `auth.uid()` é a origem da identidade e `usuarios` é o perfil de equipe associado a ela. A tabela `usuarios` deixa de aceitar acesso anônimo e suas policies permitem leitura do próprio perfil ou por gestor, enquanto criação/exclusão ficam no limite gerencial.

## Camadas que devem permanecer separadas

| Responsabilidade | Contrato atual | Fonte de verdade | Destino NovoHotel |
|---|---|---|---|
| Identidade e sessão | Supabase Auth + `supabaseAuthBridge` + `auth-migrate-user` | `auth.users` / sessão Supabase | manter; não criar autenticação paralela |
| Perfil do colaborador | `usuarios`, ligado por `auth_user_id` | Supabase `usuarios` | `/app/equipe` |
| Acesso ao hotel | `hotel_memberships` e contexto multi-hotel | Supabase | resolver hotel ativo antes de montar menu |
| Papéis e permissões | `hotel_roles`, `hotel_permissions`, `hotel_role_permissions`, `user_has_permission` | Supabase/RLS/RPC | base do menu e das operações protegidas |
| Setor operacional | `operational_sectors`, `usuario_operational_sectors`, `userSectorService` | Supabase, com fallback legado no cliente | filtro/escopo operacional; não substituir RBAC |
| Matriz visual legada | `useHotelRBAC`, `hotelConfig.rbac_matrix`, `RBACMatrixEditor` | configuração/cache de compatibilidade | manter durante transição; não tratá-la como autorização canônica do banco |

## RBAC e multi-hotel encontrados

`20260826090000_phase2_auth_rbac_multihotel.sql` cria `hotel_memberships`, `hotel_roles`, `hotel_permissions` e `hotel_role_permissions`, além das funções `user_has_hotel_access` e `user_has_permission`. As operações de hotel passam a poder ser autorizadas por identidade Supabase e membership.

`20260827110000_phase13_multi_tenant_saas.sql` estende esse desenho para organização → hotéis, cria `organization_memberships`, amplia `user_has_hotel_access` para aceitar membership direto no hotel ou na organização e consolida papéis de plataforma, organização e hotel. Portanto, o NovoHotel não precisa inventar outro seletor de tenant nem outro modelo de função.

As migrations finais de segurança também revogam do papel `public` e de `anon` a execução de funções operacionais sensíveis e concedem execução ao papel `authenticated`. Esse limite deve ser preservado.

## Setores operacionais

`userSectorService` persiste a associação em `usuario_operational_sectors`, incluindo setor principal, e lê o catálogo de `operational_sectors`. O serviço possui fallback em memória para instalações onde a migration ainda não esteja disponível e ainda usa `default_hotel` como compatibilidade.

A interface `UsersOperationalAccessModule` já expressa corretamente o conceito que será mantido no NovoHotel: **RBAC define o que a pessoa pode fazer; setor define em qual operação ela trabalha**.

A migration `20260827223000_user_operational_sectors.sql` criou inicialmente policies permissivas para `anon` e `authenticated` como compatibilidade temporária. Na varredura das migrations finais consultadas foram encontradas restrições para funções operacionais e para o perfil `usuarios`, mas não foi encontrado ainda um contrato posterior específico que substitua essas policies das tabelas de setor. Portanto, isso fica registrado como **pendência de hardening**, não como motivo para criar outra tabela ou outro modelo de setor.

## Compatibilidade ainda ativa no frontend

Existem duas camadas legadas que não devem ser promovidas ao desenho final:

1. `useHotelRBAC` ainda mantém uma matriz React/configurável (`rbac_matrix`) e regras de fallback por `AdminTab`. Ela é útil para compatibilidade visual e de menu, mas não substitui as permissões/RLS do Supabase.
2. `UsersModule` e os métodos de usuário do `HotelContext` ainda permitem criar/editar/resetar `Usuario.senha` diretamente em `usuarios`, inclusive com senha padrão de demonstração. Isso conflita com o limite final em que Supabase Auth controla credenciais. O login já foi migrado para Supabase Auth, mas o ciclo administrativo de credenciais ainda precisa convergir antes da remoção do campo/fluxo legado.

Nenhuma remoção desse legado será feita durante o inventário. A troca deve ocorrer posteriormente por uma pequena camada administrativa de equipe que preserve perfil, papel e setor, enquanto criação/reset de credencial passa pelo mecanismo seguro de Supabase Auth.

## Decisão de transformação do cluster

A rota estável será **`/app/equipe`**. Ela deve reutilizar a gestão de colaboradores e setores existentes, mas seu contrato final será:

**Sessão Supabase → perfil `usuarios` → hotel/membership → papéis/permissões → setores → menu/rotas autorizadas.**

O setor deixa de ser um roteador obrigatório para Workspace. Ele passa a ser contexto operacional usado para filtrar Kanbans, filas e telas especializadas. Workspace/Fábrica não participa da identidade nem do RBAC canônico.

## Pendências controladas para fases posteriores

- substituir a administração de `Usuario.senha` por administração de credenciais Supabase Auth antes de desativar o campo legado;
- revisar/hardenizar RLS de `operational_sectors` e `usuario_operational_sectors` sem quebrar `UsersOperationalAccessModule`;
- trocar o uso de `default_hotel` pelo hotel ativo resolvido pelo contexto/membership;
- fazer o menu estável consultar o contrato de acesso já existente em vez de duplicar regras no roteador;
- manter `useHotelRBAC` somente como compatibilidade até que o menu e todas as telas estejam apoiados no RBAC canônico.

## Resultado

O cluster **Equipe/RBAC** está funcionalmente mapeado. Não é necessário criar novo sistema de autenticação, nova tabela de usuários, nova matriz de permissões nem nova entidade de setor. O trabalho de transformação é convergência: retirar credenciais do modelo legado do frontend, endurecer o acesso aos setores e usar membership/RBAC existentes para alimentar as rotas estáveis do NovoHotel.
