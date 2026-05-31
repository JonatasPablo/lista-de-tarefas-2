# CLAUDE.md — Lista de Tarefas 2 (raiz do projeto)

## O que é este projeto

Aplicativo web PWA de gerenciamento de tarefas pessoais.
Desenvolvedor: Jonatas Pablo | jonathaspabllo@gmail.com
Versão atual: **2.0.46** (definida em `src/config/app.ts`)

## Stack real com versões

### Frontend
| Pacote | Versão |
|--------|--------|
| react | ^19.2.5 |
| react-dom | ^19.2.5 |
| react-router-dom | ^7.15.0 |
| @react-oauth/google | ^0.13.5 |
| typescript | ~6.0.2 |
| vite | ^8.0.10 |
| vite-plugin-pwa | ^1.3.0 |
| @vitejs/plugin-react | ^6.0.1 |
| concurrently | ^9.2.1 |
| gh-pages | ^6.3.0 |

### Backend
| Pacote | Versão |
|--------|--------|
| express | ^5.2.1 |
| mysql2 | ^3.22.3 |
| jsonwebtoken | ^9.0.3 |
| bcryptjs | ^3.0.3 |
| nodemailer | ^8.0.7 |
| multer | ^2.1.1 |
| sharp | ^0.34.5 |
| helmet | ^8.1.0 |
| cors | ^2.8.6 |
| express-rate-limit | ^8.5.1 |
| google-auth-library | ^10.6.2 |
| dotenv | ^17.4.2 |
| nodemon | ^3.1.14 (dev) |

### Banco
- MySQL 8+
- Banco: `lista_tarefas_v2`
- Usuário da aplicação: `lista_tarefas_app`

## Comandos reais (package.json raiz)

```bash
npm run dev              # frontend + backend simultâneos (concurrently)
npm run dev:frontend     # só o Vite (porta 5173)
npm run dev:backend      # só o Node (porta 3001, via nodemon)
npm run build            # tsc -b && vite build → dist/
npm run lint             # eslint .
npm run preview          # vite preview do dist/
npm run predeploy        # npm run build (automático antes do deploy)
npm run deploy           # gh-pages -d dist → GitHub Pages
```

## Comandos reais (backend/package.json)

```bash
npm run dev          # nodemon src/server.js
npm run start        # node src/server.js
npm run db:test      # testa conexão com o MySQL
npm run db:migrate   # roda todas as migrations pendentes
```

## Estrutura de pastas (simplificada)

```
lista-de-tarefas-2/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   ├── migrations/          # 001 a 007
│   │   │   └── init-local-database.sql
│   │   ├── errors/AppError.js
│   │   ├── helpers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── scripts/
│   │   └── services/
│   └── uploads/
│       ├── avatars/
│       └── tasks/
├── src/                             # frontend React
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── pwa/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── config/app.ts                # APP_VERSION aqui
│   ├── App.tsx
│   └── main.tsx
├── public/                          # assets estáticos (ícones PWA)
├── dist/                            # build de produção (ignorado no git)
├── scripts/                         # PowerShell: backup/restore MySQL, ngrok
├── docs/
├── backups/mysql/
├── .env.example
├── vite.config.ts
├── CONTEXTO_PROJETO.md
└── package.json
```

## Decisões de arquitetura

- **HashRouter**: frontend usa `/#/rota` — necessário para GitHub Pages (sem servidor).
- **Cookie httpOnly**: autenticação por cookie `lista_tarefas_session` — sem localStorage de token.
- **BLOB no banco**: avatares e anexos armazenados como `LONGBLOB` no MySQL (migrations 006 e 007); não usa filesystem persistente.
- **CORS + CSRF**: proteção de origem em todas as rotas de mutação (POST/PUT/PATCH/DELETE).
- **PWA**: `registerType: 'autoUpdate'`; API nunca cacheada (`NetworkOnly`); SW recarrega a página ao detectar nova versão.
- **Versão no frontend**: `APP_VERSION` em `src/config/app.ts` — atualizar só quando houver deploy.
- **ngrok**: expõe o backend local para produção; configurado para iniciar automaticamente com o Windows.

## Funcionalidades implementadas

- Cadastro local com validação de senha forte
- Confirmação de e-mail por código (15 min de expiração)
- Reenvio de código de confirmação
- Login local (cookie httpOnly, sessão de 7 dias)
- Login com Google (`@react-oauth/google` + `google-auth-library`)
- Logout com revogação da sessão no banco
- Redefinição de senha por e-mail com código
- Aviso por e-mail após senha redefinida
- Bloqueio de reutilização da senha atual
- Limpeza de sessões antigas após redefinição
- CRUD de tarefas (pendentes, concluídas, canceladas)
- Toggle e bulk-complete/bulk-delete de tarefas
- Histórico de ações por tarefa e global do usuário
- Checklist por tarefa com grupos (estilo Trello)
- Anexos de tarefa (upload, download, renomear, excluir, thumbnail)
- Perfil de usuário (nome, avatar upload/remoção, troca de senha)
- Tema claro/escuro
- PWA instalável com prompt de instalação
- Rate limiting granular por endpoint
- Políticas legais (privacidade, termos, cookies, LGPD)

## Prioridades abertas (conhecidas)

- Login com Google: em implementação (backend pronto, frontend parcialmente integrado)

## Variáveis de ambiente

### Frontend (`.env.local` / `.env.production`)
```
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=
```

### Backend (`backend/.env`)
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

## Deploy

- **Frontend**: GitHub Pages via `npm run deploy` (`gh-pages -d dist`)
  - Base path: `/lista-de-tarefas-2/`
  - Start URL PWA: `/lista-de-tarefas-2/#/`
- **Backend**: servidor Windows local exposto via ngrok (migrado do Railway)
  - `scripts/start-ngrok.ps1` / `scripts/stop-ngrok.ps1`
  - Backup MySQL: `scripts/backup-mysql.ps1`

## DO NOT

- Não alterar `APP_VERSION` em `src/config/app.ts` sem pedido explícito.
- Não inventar rotas, variáveis ou funcionalidades que não existam no código.
- Não commitar `.env`, `backend/.env` ou qualquer arquivo de credencial.
- Não alterar `vite.config.ts` → `base` sem entender impacto no GitHub Pages.
- Não remover migrations existentes — só criar novas.
- Não trocar HashRouter por BrowserRouter sem discutir impacto no deploy.
- Não adicionar dependências sem avaliar bundle size e segurança.

## [LEARNING LOG]
- 2026-05-31: Validacao visual privada refeita com Playwright temporario fora do repo. Criado usuario local de validacao com tarefas/tags/historico reais. Cobertura: tasks, historico, log, ajuda, minha conta e modal de detalhe em 375/768/1024/1440, light/dark. Resultado final: 48 screenshots em visual-validation-private, sem overflow horizontal e sem erros de console. Bug encontrado/corrigido: MinhaContaPage tinha Link aninhado dentro de anchor; tambem foi reparada codificacao do arquivo apos edicao local.
- 2026-05-31: v2.2.0 finalizado com paleta Indigo SaaS, dark-mode.css refeito, due_time, tags na listagem, TagPicker com edicao/exclusao, filtro por tag, package/package-lock em 2.2.0. Validacao: lint/build/db:test/db:migrate OK. Erro: Playwright require nao estava local; screenshots via CLI bateram timeout parcial e foram limpos.
> Atualizado após cada operação significativa.
> Nunca remover entradas antigas — adicionar novas no topo.

- 2026-05-31: Sprint 2 — v2.2.0. Due date: migration 008, validateDueDate; badge de prazo no TaskItem (4 estados), campo no TaskForm e TaskDetailModal, sort por vencimento. Tags: migration 009 (INT(11) — users.id/tasks.id não são BIGINT), TagBadge, TagPicker, tagsApi. Busca global Ctrl+K com debounce 300ms e endpoint GET /tasks/search. Ctrl+N abre nova tarefa. CSV client-side com BOM UTF-8. React.memo em TaskItem/TaskStats/TaskFilters. preconnect Fonts. aria-live em TaskList, focus trap no modal. Erros: ADD COLUMN IF NOT EXISTS não suportado nesta versão MySQL; schema_migrations vazia mesmo com banco populado — registrar migrations antigas manualmente antes de migrar.
- 2026-05-31: Sprint 1 — v2.1.0. Bugs corrigidos: background-attachment iOS (body::before), sort default, polling 15s. CSS extraído: Header, BottomNav, Toast, ConfirmModal cada um com arquivo próprio. AuthHeroPanel criado; duplicação eliminada nas 4 páginas de auth. TaskEmptyState + TaskSkeleton criados. Badge de filtros ativos. Contraste WCAG AA nas badges de prioridade. Animação card-enter nos cards de auth.
- 2026-05-30: Arquivo criado com base na leitura completa do repositório (package.json, vite.config.ts, rotas, migrations, CONTEXTO_PROJETO.md, .env.example).
