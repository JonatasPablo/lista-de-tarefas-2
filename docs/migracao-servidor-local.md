# Migracao do Railway para servidor local Windows

Este documento registra a auditoria e o procedimento seguro para manter o frontend no GitHub Pages e mover backend + MySQL para um computador Windows ligado como servidor.

## Auditoria tecnica

- Frontend: React + TypeScript + Vite na raiz do projeto.
- Backend: Node.js + Express em `backend/`.
- Banco: MySQL via `mysql2/promise` em `backend/src/database/connection.js`.
- Variaveis do frontend: `VITE_API_URL` e `VITE_GOOGLE_CLIENT_ID` em `.env.local`, `.env.production` e `.env.example`.
- Variaveis do backend: `backend/.env`; exemplo seguro em `backend/.env.example`.
- URL antiga de producao: `https://lista-de-tarefas-2-production.up.railway.app`.
- Nova URL esperada para API: substitua `https://api.seu-dominio.com` pela URL publica real do seu tunnel/proxy.
- CORS: `backend/src/app.js` usa `CLIENT_URL` e `CLIENT_URLS`; em producao nao inclui localhost automaticamente.
- Autenticacao: cookie HTTP-only `lista_tarefas_session`; tokens de sessao aleatorios sao salvos em hash na tabela `user_sessions`. Nao ha JWT ativo nem `express-session`.
- Cookies: em `NODE_ENV=production`, `secure=true` e `sameSite=none`; exige HTTPS valido.
- Uploads/anexos/avatar: Multer em memoria; anexos ficam em `task_files.file_data` e thumbnails em `task_files.thumbnail_data`; avatar fica em `users.avatar_data`.
- Rotas protegidas: `/users/*` e `/tasks/*` passam por `authMiddleware`; download, thumbnail e avatar exigem sessao.
- Rate limit: login/cadastro/redefinicao em `authRateLimiters.js`; uploads e leitura de anexos/avatar em `routeRateLimiters.js`.
- Migrations existentes: `001_initial_schema.sql` ate `007_task_file_thumbnails.sql`.
- Schema consolidado local: `backend/src/database/init-local-database.sql`.

## Tabelas principais

- `users`: usuarios, aceite de termos/politica, Google OAuth, tokens de confirmacao/redefinicao, avatar BLOB.
- `user_sessions`: sessoes por cookie com `token_hash`, expiracao e revogacao.
- `user_terms_acceptances`: historico de aceite.
- `tasks`: tarefas com `status`, `priority`, `deleted_at`, `completed_at`.
- `task_history`: logs/historico por tarefa e usuario.
- `task_files`: anexos, BLOB principal, thumbnail BLOB e metadados.
- `task_checklist_groups`: listas/grupos de checklist.
- `task_checklist_items`: itens internos de checklist.
- `schema_migrations`: controle local do script de migrations.

## Arquivos alterados

- `.env.production`: troca a API Railway por placeholder seguro `https://api.seu-dominio.com`.
- `vite.config.ts`: PWA passa a usar `VITE_API_URL` para regra `NetworkOnly`, sem Railway fixo.
- `backend/.env.example`: exemplo completo e sem senha real.
- `backend/package.json`: adiciona `db:test` e `db:migrate`.
- `backend/src/app.js`: adiciona `GET /health` com teste de banco.
- `backend/src/server.js`: adiciona `HOST` explicito.
- `backend/src/services/taskFiles.service.js`: gera `stored_name` unico para anexos em BLOB.
- `backend/src/database/migrations/003_create_task_checklist_items.sql`: usa `BIGINT UNSIGNED` compativel com `users/tasks`.
- `backend/src/database/migrations/004_create_task_checklist_groups.sql`: usa `BIGINT UNSIGNED` compativel com `users/tasks`.
- `backend/src/database/init-local-database.sql`: schema consolidado para banco limpo.
- `backend/src/scripts/testDbConnection.js`: teste de conexao MySQL.
- `backend/src/scripts/runMigrations.js`: runner simples das migrations existentes.
- `scripts/backup-mysql.ps1`: backup manual com `mysqldump` e `--hex-blob`.
- `scripts/restore-mysql.ps1`: restauracao de backup local.

## Backend `.env` local

Crie `backend/.env` no computador servidor. Nao versionar.

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3001

CLIENT_URL=https://seu-usuario.github.io
CLIENT_URLS=https://seu-usuario.github.io
APP_FRONTEND_URL=https://seu-usuario.github.io/lista-de-tarefas-2

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=lista_tarefas_app
DB_PASSWORD=troque_por_uma_senha_forte
DB_NAME=lista_tarefas_v2

SESSION_DAYS=7
EMAIL_VERIFICATION_MINUTES=15
PASSWORD_RESET_MINUTES=15
TERMS_VERSION=1.0
EMAIL_ALLOWED_DOMAINS=
TASK_FILES_MAX_PER_TASK=20
TASK_FILES_USER_QUOTA_MB=500

EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.seu-servidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@seudominio.com
SMTP_PASS=sua-senha-ou-senha-de-app
SMTP_FROM_NAME=Lista de Tarefas
SMTP_FROM_EMAIL=seu-email@seudominio.com

GOOGLE_CLIENT_ID=
```

Para desenvolvimento local, use `NODE_ENV=development`, `CLIENT_URL=http://localhost:5173`, `CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173` e `APP_FRONTEND_URL=http://localhost:5173`.

## Frontend `.env.production`

Antes de publicar, troque:

```env
VITE_API_URL=https://api.seu-dominio.com
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
```

Nao use `localhost` no GitHub Pages. O navegador do usuario resolveria `localhost` para a propria maquina dele, nao para seu servidor.

## MySQL local

Recomendado: MySQL 8 no Windows, servico iniciando com Windows, bind local e sem porta 3306 exposta na internet.

Exemplo de criacao de usuario:

```powershell
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS lista_tarefas_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lista_tarefas_app'@'127.0.0.1' IDENTIFIED BY 'TROQUE_POR_SENHA_FORTE';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON lista_tarefas_v2.* TO 'lista_tarefas_app'@'127.0.0.1';
FLUSH PRIVILEGES;
```

Configure `max_allowed_packet` para pelo menos `128M`, porque anexos aceitam ate 100 MB:

```ini
[mysqld]
max_allowed_packet=128M
bind-address=127.0.0.1
```

Depois reinicie o servico MySQL no Windows.

## Banco novo sem dados

```powershell
cd G:\Projetos\lista-de-tarefas-2
mysql -u root -p < backend\src\database\init-local-database.sql
cd backend
npm run db:test
```

Ou use o runner:

```powershell
cd G:\Projetos\lista-de-tarefas-2\backend
npm run db:migrate
npm run db:test
```

## Exportar Railway e importar local

Nao apague Railway antes de validar a versao local.

1. Gere um dump do Railway MySQL com `--single-transaction --routines --triggers --events --hex-blob`.
2. Salve o arquivo fora do Git, por exemplo `C:\Backups\lista-tarefas\railway-2026-05-19.sql`.
3. Importe no MySQL local.
4. Rode `npm run db:test`.
5. Teste anexos, avatar, checklist, historico, logs e usuarios.

Exemplo generico:

```powershell
mysqldump --host=HOST_RAILWAY --port=PORTA_RAILWAY --user=USUARIO_RAILWAY --password --single-transaction --routines --triggers --events --hex-blob BANCO_RAILWAY > C:\Backups\lista-tarefas\railway.sql
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lista_tarefas_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p lista_tarefas_v2 < C:\Backups\lista-tarefas\railway.sql
```

Se o dump ja trouxer `CREATE DATABASE`, confira o nome do banco antes de importar.

## Backend local

Instalar:

```powershell
cd G:\Projetos\lista-de-tarefas-2
npm install
cd backend
npm install
npm run db:test
```

Desenvolvimento:

```powershell
cd G:\Projetos\lista-de-tarefas-2
npm run dev
```

Producao local com PM2:

```powershell
npm install -g pm2 pm2-windows-startup
cd G:\Projetos\lista-de-tarefas-2\backend
pm2 start src/server.js --name lista-tarefas-api
pm2 save
pm2-startup install
pm2 status
pm2 logs lista-tarefas-api
pm2 restart lista-tarefas-api
pm2 stop lista-tarefas-api
```

## Exposicao externa segura

Prioridade recomendada: Cloudflare Tunnel com HTTPS, mantendo `HOST=127.0.0.1` e sem abrir MySQL nem backend direto no roteador.

Exemplo conceitual:

```powershell
cloudflared tunnel login
cloudflared tunnel create lista-tarefas-api
cloudflared tunnel route dns lista-tarefas-api api.seu-dominio.com
cloudflared tunnel run lista-tarefas-api
```

Arquivo `config.yml` esperado:

```yaml
tunnel: lista-tarefas-api
credentials-file: C:\Users\SEU_USUARIO\.cloudflared\ID_DO_TUNNEL.json
ingress:
  - hostname: api.seu-dominio.com
    service: http://127.0.0.1:3001
  - service: http_status:404
```

Alternativas:

- Dominio proprio/DDNS + proxy reverso HTTPS: viavel, mas exige mais manutencao.
- Porta aberta no roteador: use apenas se necessario; nao exponha MySQL; prefira proxy HTTPS na frente.
- ngrok: bom para teste, nao como solucao final.

Se abrir porta no roteador:

- IP fixo local do PC: configure DHCP reservation no roteador.
- Porta externa: 443 se houver proxy HTTPS; evite expor 3001 diretamente.
- Porta interna: 3001 apenas se indispensavel.
- Firewall Windows: liberar somente a porta necessaria e perfil correto.
- Backend: `HOST=0.0.0.0` somente nesse cenario.

## Windows como servidor

- Instale o projeto em pasta fixa, por exemplo `C:\Projetos\lista-de-tarefas-2`.
- Configure energia para nao suspender automaticamente.
- Configure MySQL para iniciar com Windows.
- Use PM2 + `pm2-windows-startup` ou Task Scheduler para reiniciar backend apos reboot.
- Mantenha Windows Update em janela programada.
- Monitore logs com `pm2 logs lista-tarefas-api`.
- Nao exponha `3306` no roteador.

## Backup e restauracao

Backup manual:

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\backup-mysql.ps1
```

Restaurar:

```powershell
cd G:\Projetos\lista-de-tarefas-2
.\scripts\restore-mysql.ps1 -BackupFile .\backups\mysql\lista_tarefas_v2-YYYYMMDD-HHMMSS.sql
```

Rotina recomendada: agendar `backup-mysql.ps1` diario ou semanal no Task Scheduler e copiar a pasta `backups\mysql` para HD externo ou nuvem. Backups com BLOB podem crescer bastante.

## Publicacao do frontend

```powershell
cd G:\Projetos\lista-de-tarefas-2
npm run build
git status
git add .
git commit -m "Migra backend e banco para servidor local"
git push
npm run deploy
```

Antes do deploy, confirme que `.env.production` tem a URL real da API e que `rg -n "railway|localhost" dist src vite.config.ts .env.production` nao mostra Railway nem localhost no build publicado.

## Rotas para teste

Troque `https://api.seu-dominio.com` pela URL real.

- GET `https://api.seu-dominio.com/health`
- GET `https://api.seu-dominio.com/auth/config`
- POST `https://api.seu-dominio.com/auth/register`
- POST `https://api.seu-dominio.com/auth/confirm-email`
- POST `https://api.seu-dominio.com/auth/resend-confirmation`
- POST `https://api.seu-dominio.com/auth/email-confirmation-status`
- POST `https://api.seu-dominio.com/auth/forgot-password`
- POST `https://api.seu-dominio.com/auth/validate-password-reset-code`
- POST `https://api.seu-dominio.com/auth/reset-password`
- POST `https://api.seu-dominio.com/auth/login`
- POST `https://api.seu-dominio.com/auth/logout`
- GET `https://api.seu-dominio.com/auth/me`
- GET `https://api.seu-dominio.com/tasks`
- POST `https://api.seu-dominio.com/tasks`
- PUT `https://api.seu-dominio.com/tasks/{id}`
- PATCH `https://api.seu-dominio.com/tasks/{id}/toggle`
- PATCH `https://api.seu-dominio.com/tasks/{id}/status`
- DELETE `https://api.seu-dominio.com/tasks/{id}`
- GET `https://api.seu-dominio.com/tasks/history`
- GET `https://api.seu-dominio.com/tasks/{id}/history`
- GET `https://api.seu-dominio.com/tasks/{id}/files`
- POST `https://api.seu-dominio.com/tasks/{id}/files`
- GET `https://api.seu-dominio.com/tasks/{id}/files/{fileId}/thumbnail`
- GET `https://api.seu-dominio.com/tasks/{id}/files/{fileId}/download`
- PATCH `https://api.seu-dominio.com/tasks/{id}/files/{fileId}`
- DELETE `https://api.seu-dominio.com/tasks/{id}/files/{fileId}`
- GET `https://api.seu-dominio.com/tasks/{taskId}/checklist/groups`
- POST `https://api.seu-dominio.com/tasks/{taskId}/checklist/groups`
- PATCH `https://api.seu-dominio.com/tasks/{taskId}/checklist/groups/{groupId}`
- DELETE `https://api.seu-dominio.com/tasks/{taskId}/checklist/groups/{groupId}`
- POST `https://api.seu-dominio.com/tasks/{taskId}/checklist/groups/{groupId}/items`
- PATCH `https://api.seu-dominio.com/tasks/{taskId}/checklist/{itemId}`
- DELETE `https://api.seu-dominio.com/tasks/{taskId}/checklist/{itemId}`
- PATCH `https://api.seu-dominio.com/users/me`
- GET `https://api.seu-dominio.com/users/me/avatar`
- POST `https://api.seu-dominio.com/users/me/avatar`
- DELETE `https://api.seu-dominio.com/users/me/avatar`
- PATCH `https://api.seu-dominio.com/users/me/password`

## Checklist final

- Backend local inicia com `npm run start`.
- `GET /health` retorna `status: ok`.
- Login, cadastro, confirmacao de e-mail e redefinicao funcionam.
- Criar, editar, excluir, concluir e restaurar tarefa funcionam.
- Checklist, historico, logs e exportacao CSV funcionam.
- Upload, visualizacao, download, thumbnails e avatar funcionam.
- GitHub Pages acessa a API publica HTTPS.
- PWA e celular funcionam em rede externa.
- Nenhuma chamada publicada aponta para Railway ou localhost.
- Railway permanece intacto ate todos os testes passarem.

## Riscos restantes

- Se o PC desligar, suspender, perder internet ou trocar IP sem DDNS/tunnel, a API ficara offline.
- Backups locais precisam copia externa; BLOBs tornam o banco grande.
- Cloudflare Tunnel ou proxy devem ser monitorados.
- E-mails dependem de SMTP/Brevo com URLs novas em `APP_FRONTEND_URL`.
- Se usar porta aberta, a superficie de ataque aumenta; mantenha Windows, Node, MySQL e dependencias atualizados.
