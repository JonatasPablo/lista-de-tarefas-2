# CLAUDE.md — Backend Node.js (backend/)

## Stack

- Node.js >= 22 (CommonJS — `"type": "commonjs"`)
- Express 5.2.1
- MySQL 8+ via `mysql2` 3.22.3
- Autenticação: cookie httpOnly (`lista_tarefas_session`) — sem JWT externo
- bcryptjs 3.0.3 (hash de senha)
- nodemailer 8.0.7 (e-mail SMTP)
- multer 2.1.1 (upload de arquivos)
- sharp 0.34.5 (otimização de imagem / thumbnails)
- helmet 8.1.0 + cors 2.8.6 + express-rate-limit 8.5.1
- google-auth-library 10.6.2 (validação de token Google)
- nodemon 3.1.14 (dev)

## Estrutura real do backend

```
backend/
├── src/
│   ├── app.js                       # express app, cors, rotas
│   ├── server.js                    # listen, porta
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── checklist.controller.js
│   │   ├── taskFiles.controller.js
│   │   ├── tasks.controller.js
│   │   └── users.controller.js
│   ├── database/
│   │   ├── connection.js            # pool mysql2
│   │   ├── init-local-database.sql
│   │   └── migrations/
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_add_user_profile_fields.sql
│   │       ├── 003_create_task_checklist_items.sql
│   │       ├── 004_create_task_checklist_groups.sql
│   │       ├── 005_add_privacy_policy_acceptance_fields.sql
│   │       ├── 006_blob_storage.sql
│   │       └── 007_task_file_thumbnails.sql
│   ├── errors/
│   │   └── AppError.js              # erro com statusCode
│   ├── helpers/
│   │   ├── asyncHandler.js          # wrapper try/catch para controllers
│   │   └── validateTask.js
│   ├── middlewares/
│   │   ├── authMiddleware.js        # valida cookie lista_tarefas_session
│   │   ├── authRateLimiters.js      # rate limit por rota de auth
│   │   ├── errorHandler.js          # handler global de erros
│   │   ├── routeRateLimiters.js     # rate limit por rota de tasks/users
│   │   ├── uploadTaskFile.js        # multer para anexos
│   │   └── uploadUserAvatar.js      # multer para avatares
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── tasks.routes.js
│   │   └── users.routes.js
│   ├── scripts/
│   │   ├── runMigrations.js
│   │   ├── testDbConnection.js
│   │   └── testMail.js
│   └── services/
│       ├── auth.service.js
│       ├── checklist.service.js
│       ├── imageOptimizer.service.js
│       ├── mail.service.js
│       ├── taskFiles.service.js
│       ├── taskHistory.service.js
│       ├── tasks.service.js
│       └── users.service.js
└── uploads/
    ├── avatars/                     # avatares físicos (legado, agora em BLOB)
    └── tasks/                       # anexos físicos (legado, agora em BLOB)
```

## Comandos

```bash
npm run dev          # nodemon src/server.js
npm run start        # node src/server.js (produção)
npm run db:test      # testa conexão com o MySQL
npm run db:migrate   # roda todas as migrations pendentes
```

URLs locais:
- Backend: `http://localhost:3001`
- Health check: `GET http://localhost:3001/health`

## Todas as rotas de API

### GET /health — sem autenticação
Retorna status do servidor e do banco de dados.

### Auth — prefixo `/auth`

| Método | Rota | Rate Limit | Descrição |
|--------|------|------------|-----------|
| POST | `/auth/register` | registerLimiter | Cadastro local |
| POST | `/auth/confirm-email` | emailConfirmationLimiter | Confirmar e-mail por código |
| POST | `/auth/resend-confirmation` | resendConfirmationLimiter | Reenviar código de confirmação |
| POST | `/auth/email-confirmation-status` | emailConfirmationLimiter | Verificar status de confirmação |
| POST | `/auth/forgot-password` | passwordResetRequestLimiter | Solicitar redefinição de senha |
| POST | `/auth/validate-password-reset-code` | passwordResetAttemptLimiter | Validar código de redefinição |
| POST | `/auth/reset-password` | passwordResetAttemptLimiter | Redefinir senha |
| POST | `/auth/login` | loginLimiter | Login local |
| POST | `/auth/google` | googleLoginLimiter | Login com Google |
| GET | `/auth/config` | — | Configurações públicas do auth |
| POST | `/auth/logout` | authMiddleware | Logout (requer sessão) |
| GET | `/auth/me` | authMiddleware + authMeLimiter | Dados do usuário logado |

### Usuários — prefixo `/users` (requer authMiddleware)

| Método | Rota | Rate Limit | Descrição |
|--------|------|------------|-----------|
| PATCH | `/users/me` | — | Atualizar nome/dados básicos |
| GET | `/users/me/avatar` | avatarReadLimiter | Obter avatar |
| POST | `/users/me/avatar` | avatarUploadLimiter | Upload de avatar |
| DELETE | `/users/me/avatar` | — | Remover avatar |
| PATCH | `/users/me/password` | accountPasswordChangeLimiter | Alterar senha |

### Tarefas — prefixo `/tasks` (requer authMiddleware)

| Método | Rota | Rate Limit | Descrição |
|--------|------|------------|-----------|
| GET | `/tasks` | pollingReadLimiter | Listar tarefas |
| POST | `/tasks` | taskMutationLimiter | Criar tarefa |
| GET | `/tasks/history` | pollingReadLimiter | Histórico global do usuário |
| PATCH | `/tasks/bulk-complete` | taskMutationLimiter | Concluir tarefas em lote |
| DELETE | `/tasks/bulk-delete` | taskMutationLimiter | Excluir tarefas em lote |
| PUT | `/tasks/:id` | taskMutationLimiter | Atualizar tarefa completa |
| PATCH | `/tasks/:id/status` | taskMutationLimiter | Atualizar status da tarefa |
| PATCH | `/tasks/:id/toggle` | taskMutationLimiter | Alternar concluída/pendente |
| DELETE | `/tasks/:id` | taskMutationLimiter | Excluir tarefa |
| GET | `/tasks/:id/history` | pollingReadLimiter | Histórico de uma tarefa |
| GET | `/tasks/:id/files` | attachmentReadLimiter | Listar anexos da tarefa |
| POST | `/tasks/:id/files` | uploadLimiter | Upload de anexo |
| GET | `/tasks/:id/files/:fileId/thumbnail` | attachmentReadLimiter | Thumbnail do anexo |
| GET | `/tasks/:id/files/:fileId/download` | attachmentReadLimiter | Download do anexo |
| PATCH | `/tasks/:id/files/:fileId` | taskMutationLimiter | Renomear anexo |
| DELETE | `/tasks/:id/files/:fileId` | taskMutationLimiter | Excluir anexo |
| GET | `/tasks/:taskId/checklist/groups` | pollingReadLimiter | Listar grupos de checklist |
| POST | `/tasks/:taskId/checklist/groups` | taskMutationLimiter | Criar grupo de checklist |
| PATCH | `/tasks/:taskId/checklist/groups/:groupId` | taskMutationLimiter | Atualizar grupo |
| DELETE | `/tasks/:taskId/checklist/groups/:groupId` | taskMutationLimiter | Excluir grupo |
| POST | `/tasks/:taskId/checklist/groups/:groupId/items` | taskMutationLimiter | Criar item de checklist |
| PATCH | `/tasks/:taskId/checklist/:itemId` | taskMutationLimiter | Atualizar item |
| DELETE | `/tasks/:taskId/checklist/:itemId` | taskMutationLimiter | Excluir item |

## Autenticação (cookie httpOnly)

- Cookie: `lista_tarefas_session`
- Valor: token de sessão (não JWT) armazenado hasheado no banco (`user_sessions.token_hash`)
- Validação: `authMiddleware.js` — lê cookie, busca sessão no banco, injeta `req.user`
- Expiração: `SESSION_DAYS` dias (padrão: 7)
- Logout: revoga a sessão no banco (`revoked_at`)
- Redefinição de senha: limpa todas as sessões do usuário

## Regras de segurança

- CORS restrito a origens definidas em `CLIENT_URL` e `CLIENT_URLS`.
- Proteção CSRF por verificação de `Origin`/`Referer` em todas as rotas de mutação.
- `helmet` ativo com `crossOriginResourcePolicy: false`.
- `express-rate-limit` com limites distintos por tipo de operação.
- Senhas hasheadas com `bcryptjs` — nunca armazenar em texto plano.
- Tokens de e-mail (confirmação, redefinição) expiram em minutos (`EMAIL_VERIFICATION_MINUTES`, `PASSWORD_RESET_MINUTES`).
- Nunca expor stack trace em produção — `errorHandler.js` controla isso.
- `app.set('trust proxy', 1)` — necessário para rate limit funcionar atrás do ngrok.

## Regras de migration

- Nunca editar migrations já aplicadas — criar uma nova.
- Nomenclatura: `NNN_descricao_snake_case.sql` (ex: `008_nova_feature.sql`).
- Rodar com `npm run db:migrate` (script `src/scripts/runMigrations.js`).
- Sempre testar com `npm run db:test` antes de migrar.
- Migrations devem ser idempotentes quando possível (`IF NOT EXISTS`, `IF EXISTS`).
- Migrations destrutivas (DROP, remover coluna) exigem confirmação explícita.

## Variáveis de ambiente (backend/.env)

```
NODE_ENV=development
HOST=127.0.0.1
PORT=3001
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
APP_FRONTEND_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=lista_tarefas_app
DB_PASSWORD=
DB_NAME=lista_tarefas_v2
SESSION_DAYS=7
EMAIL_VERIFICATION_MINUTES=15
PASSWORD_RESET_MINUTES=15
TERMS_VERSION=1.0
EMAIL_ALLOWED_DOMAINS=
TASK_FILES_MAX_PER_TASK=20
TASK_FILES_USER_QUOTA_MB=500
EMAIL_PROVIDER=smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Lista de Tarefas
SMTP_FROM_EMAIL=
GOOGLE_CLIENT_ID=
```

## DO NOT

- Não remover ou editar migrations já aplicadas.
- Não armazenar token de sessão em texto plano no banco.
- Não retornar `password_hash` em nenhuma resposta da API.
- Não desativar o `authMiddleware` em rotas de tarefas ou usuários.
- Não commitar `backend/.env`.
- Não expor stack trace em produção.
- Não mockar banco de dados em testes — usar banco real.
- Não adicionar rotas sem rate limiter adequado.

## [LEARNING LOG]
> Atualizado após cada operação significativa.
> Nunca remover entradas antigas — adicionar novas no topo.

- 2026-05-31: Sprint 2 — v2.2.0. Novas rotas: GET /tasks/search, /tags (CRUD), /tasks/:id/tags (vincular/desvincular). due_date nos queries de tasks (createTask, updateTask, listTasks, getTaskById). Migrations: 008 (due_date — sem IF NOT EXISTS), 009 (tags/task_tags — INT(11) para bater com users.id e tasks.id). users.id e tasks.id são INT(11) não BIGINT, charset latin1.
- 2026-05-30: Arquivo criado com base na leitura de app.js, todas as rotas, middlewares, migrations e .env.example.
