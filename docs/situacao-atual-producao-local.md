# Situacao Atual Da Producao Local

Este documento resume a configuracao atual do projeto Lista de Tarefas apos a migracao do backend e banco para execucao local no computador Windows.

## Arquitetura Atual

```text
Frontend: GitHub Pages
Backend: Node.js/Express no computador local
Gerenciador do backend: PM2
Banco: MySQL local
Exposicao publica da API: ngrok gratuito
```

Fluxo:

```text
GitHub Pages
https://jonataspablo.github.io/lista-de-tarefas-2/

chama API em:
https://rumbling-stopper-rumbling.ngrok-free.dev

que encaminha para:
http://127.0.0.1:3001

e o backend acessa:
MySQL local em 127.0.0.1:3306
```

## URLs Atuais

Frontend publicado:

```text
https://jonataspablo.github.io/lista-de-tarefas-2/
```

Login:

```text
https://jonataspablo.github.io/lista-de-tarefas-2/#/login
```

API publica:

```text
https://rumbling-stopper-rumbling.ngrok-free.dev
```

Health check:

```text
https://rumbling-stopper-rumbling.ngrok-free.dev/health
```

Backend local:

```text
http://127.0.0.1:3001
```

## Situacao Atual

- Backend esta rodando via PM2 com o nome `lista-tarefas-api`.
- Ngrok esta configurado para rodar em segundo plano.
- Existe atalho de inicializacao do Windows para iniciar o ngrok no login.
- Banco MySQL local foi testado com sucesso.
- API publica via ngrok respondeu `status: ok` e `database: ok`.
- Frontend foi publicado no GitHub Pages com `npm run deploy`.
- Build e lint passaram.
- Backup manual do banco foi testado.

## Configuracoes Principais

### Backend

Arquivo:

```text
backend/.env
```

Configuracao relevante:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3001

CLIENT_URL=https://jonataspablo.github.io
CLIENT_URLS=https://jonataspablo.github.io
APP_FRONTEND_URL=https://jonataspablo.github.io/lista-de-tarefas-2
```

Observacao: o arquivo `backend/.env` contem secrets e nao deve ser versionado.

### Frontend

Arquivo:

```text
.env.production
```

Configuracao atual:

```env
VITE_API_URL=https://rumbling-stopper-rumbling.ngrok-free.dev
```

## Arquivos Alterados Ou Criados

### Backend

```text
backend/.env.example
backend/package.json
backend/src/app.js
backend/src/server.js
backend/src/services/taskFiles.service.js
backend/src/database/migrations/003_create_task_checklist_items.sql
backend/src/database/migrations/004_create_task_checklist_groups.sql
backend/src/database/init-local-database.sql
backend/src/scripts/testDbConnection.js
backend/src/scripts/runMigrations.js
```

### Frontend

```text
.env.production
vite.config.ts
src/services/api.ts
src/services/taskFilesApi.ts
src/services/usuariosApi.ts
src/pages/LogPage/LogPage.tsx
```

### Scripts Operacionais

```text
scripts/backup-mysql.ps1
scripts/restore-mysql.ps1
scripts/start-ngrok.ps1
scripts/stop-ngrok.ps1
```

### Documentacao

```text
docs/migracao-servidor-local.md
docs/situacao-atual-producao-local.md
```

### Gitignore

```text
.gitignore
```

Foi adicionado:

```text
backups
```

## O Que Foi Configurado

### Health Check

Foi adicionada a rota:

```text
GET /health
```

Ela testa a API e a conexao com o banco.

### PM2

O backend foi colocado no PM2:

```text
lista-tarefas-api
```

O PM2 tambem foi configurado para iniciar com o Windows usando `pm2-windows-startup`.

### Ngrok Em Segundo Plano

Foram criados:

```text
scripts/start-ngrok.ps1
scripts/stop-ngrok.ps1
```

Tambem foi criado um atalho no Startup do Windows:

```text
C:\Users\EliTE\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\Lista Tarefas Ngrok.lnk
```

Esse atalho inicia o ngrok automaticamente ao fazer login no Windows.

### Header Do Ngrok

Por causa da pagina de aviso do ngrok gratuito, o frontend envia:

```text
ngrok-skip-browser-warning: true
```

O backend tambem foi ajustado para aceitar esse header no CORS.

## Comandos Operacionais

### Verificar Backend

```powershell
pm2 status
```

### Ver Logs Do Backend

```powershell
pm2 logs lista-tarefas-api
```

### Reiniciar Backend

```powershell
pm2 restart lista-tarefas-api
```

### Testar API Publica

```powershell
Invoke-WebRequest https://rumbling-stopper-rumbling.ngrok-free.dev/health -Headers @{ "ngrok-skip-browser-warning"="true" } -UseBasicParsing
```

### Iniciar Ngrok Oculto

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\start-ngrok.ps1
```

### Parar Ngrok

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\stop-ngrok.ps1
```

### Testar Banco

```powershell
cd G:\Projetos\lista-de-tarefas-2\backend
npm run db:test
```

### Fazer Backup Do MySQL

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\backup-mysql.ps1
```

Os backups sao salvos em:

```text
backups/mysql
```

### Restaurar Backup

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\restore-mysql.ps1 -BackupFile .\backups\mysql\NOME_DO_BACKUP.sql
```

### Publicar Frontend

```powershell
cd G:\Projetos\lista-de-tarefas-2
npm run build
npm run deploy
```

## Checklist Para Confirmar Que Esta Online

1. PC ligado.
2. Internet ativa.
3. MySQL rodando.
4. PM2 com `lista-tarefas-api` online.
5. Ngrok rodando.
6. API publica respondendo `/health`.
7. Frontend abrindo no GitHub Pages.
8. Login funcionando.
9. Tarefas carregando.
10. Upload/download de anexos funcionando.

## Pontos De Atencao

- O VS Code nao precisa ficar aberto.
- O terminal do ngrok tambem nao precisa ficar aberto, pois agora existe script em segundo plano.
- Se o PC desligar, suspender ou ficar sem internet, o sistema fica offline.
- Se a URL gratuita do ngrok mudar, sera necessario atualizar `.env.production`, rodar build e publicar novamente.
- O MySQL nao deve ser exposto na internet.
- Backups devem ser copiados para nuvem, HD externo ou outro local seguro.
- Senhas expostas em conversa ou telas devem ser trocadas por seguranca.

## Estado Final Desta Etapa

O sistema esta publicado e operacional com backend e banco no computador local, frontend no GitHub Pages e API publica via ngrok gratuito.

Para proximas atualizacoes, antes de alterar codigo, conferir:

```powershell
pm2 status
Invoke-WebRequest https://rumbling-stopper-rumbling.ngrok-free.dev/health -Headers @{ "ngrok-skip-browser-warning"="true" } -UseBasicParsing
git status
```
