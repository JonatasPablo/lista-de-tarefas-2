# Lista de Tarefas 2

Aplicacao full stack para gerenciar tarefas, historico, anexos, autenticacao por e-mail/senha e login social com Google.

## Stack

- Frontend: React, TypeScript, Vite e PWA.
- Backend: Node.js, Express, MySQL, cookies HTTP-only e upload com Multer.
- Autenticacao: cadastro local com confirmacao por e-mail, redefinicao de senha e Google OAuth opcional.

## Requisitos

- Node.js 22 ou superior.
- MySQL 8 ou superior.
- Conta SMTP para envio de e-mails.
- Google OAuth Client ID, se o login com Google for habilitado.

## Setup local

Instale as dependencias do frontend:

```bash
npm install
```

Instale as dependencias do backend:

```bash
cd backend
npm install
```

Crie o banco e aplique o schema:

```bash
mysql -u seu_usuario -p seu_banco < backend/src/database/migrations/001_initial_schema.sql
```

Configure os arquivos de ambiente:

- Frontend: `.env.local`
- Backend: `backend/.env`

Exemplo do frontend:

```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

Exemplo do backend:

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173
APP_FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=lista_tarefas
DB_PORT=3306

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario
SMTP_PASS=senha
MAIL_FROM="Lista de Tarefas <no-reply@example.com>"

GOOGLE_CLIENT_ID=seu_google_client_id
SESSION_DAYS=7
EMAIL_VERIFICATION_MINUTES=15
PASSWORD_RESET_MINUTES=15
TERMS_VERSION=1.0
TASK_FILES_MAX_PER_TASK=20
TASK_FILES_USER_QUOTA_MB=500
```

Para o Google OAuth, use o mesmo client id em `VITE_GOOGLE_CLIENT_ID` e
`GOOGLE_CLIENT_ID`. No Google Cloud Console, cadastre
`http://localhost:5173` em "Authorized JavaScript origins" para testes locais e
a URL final do frontend em producao.

Suba frontend e backend juntos pela raiz do projeto:

```bash
npm run dev
```

Se precisar rodar separado, suba o backend:

```bash
npm run dev:backend
```

E o frontend:

```bash
npm run dev:frontend
```

## Checks

Frontend:

```bash
npm run lint
npm run build
npm audit --omit=dev
```

Backend:

```bash
node --check src/app.js
node --check src/server.js
node --check src/routes/auth.routes.js
node --check src/routes/tasks.routes.js
npm audit --omit=dev
```

## Seguranca e deploy

- Para migrar backend e MySQL do Railway para um servidor local Windows, siga
  `docs/migracao-servidor-local.md`.
- Em producao, configure `NODE_ENV=production`.
- Em producao, `CLIENT_URL` e `CLIENT_URLS` devem conter apenas as origens reais do frontend.
- Cookies usam `secure` e `sameSite=none` em producao, entao use HTTPS.
- Rotas sensiveis de autenticacao possuem rate limit por IP e e-mail.
- Uploads aceitam apenas extensoes e MIME types permitidos, com limite por tarefa e quota por usuario.
- Para deploy publico, prefira storage externo para anexos e acrescente varredura de malware no pipeline de upload.

## Exportacao

O log exporta CSV nativo para evitar dependencia em bibliotecas vulneraveis de planilha. A impressao/PDF continua disponivel pela tela de log.
