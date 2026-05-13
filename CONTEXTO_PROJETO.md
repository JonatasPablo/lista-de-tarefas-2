# Contexto do projeto Lista de Tarefas 2

## Regras de trabalho

- Sempre entregar arquivos completos quando sugerir alteração de código.
- Não entregar apenas diff/trecho.
- Separar alterações grandes em blocos: Bloco 1, Bloco 2, Bloco 3...
- Não alterar a versão do sistema enquanto não houver deploy/publicação.
- Manter foco em segurança e responsividade mobile/tablet/notebook/desktop.
- Nomes novos de arquivos, pastas, variáveis e funções devem ser em português sempre que possível.
- Manter em inglês somente o que for exigência técnica, biblioteca, API ou arquivo já existente.
- Backend local roda em http://localhost:3001.
- Frontend usa HashRouter.
- Frontend local roda em http://localhost:5173.
- Deploy frontend é GitHub Pages.
- Backend produção é Railway.

## Projeto

Projeto: Lista de Tarefas 2.

Frontend:
- React
- TypeScript
- Vite
- HashRouter
- PWA

Backend:
- Node.js
- Express
- MySQL
- Sessão via cookie httpOnly

Banco:
- MySQL

Repo local:
G:\Projetos\lista-de-tarefas-2

## Estado atual

O sistema já tem:
- Cadastro local.
- Confirmação de e-mail por código.
- Reenvio de confirmação.
- Login local.
- Logout.
- Sessão via cookie httpOnly.
- Rota /auth/me.
- Redefinição de senha por e-mail com código.
- Aviso por e-mail após senha redefinida.
- Bloqueio para não usar a mesma senha atual.
- Limpeza de sessões antigas após redefinir senha.
- Validação de senha forte.
- Legenda visual de senha no cadastro e na redefinição.
- Preparação do banco para provider local/google/apple.
- Login com Google em implementação.

## Regras importantes da autenticação

Senha:
- Mínimo 8 caracteres.
- Pelo menos 1 maiúscula.
- Pelo menos 1 minúscula.
- Pelo menos 1 número.
- Pelo menos 1 caractere especial.
- Bloquear palavras fracas.
- Bloquear repetição exagerada.
- No cadastro, senha não pode conter parte do nome nem parte do e-mail.
- Na redefinição, senha não pode ser igual à senha atual.

E-mail:
- Validar formato.
- Validar domínio com DNS/MX quando possível.
- Suportar EMAIL_ALLOWED_DOMAINS no backend.
- Não bloquear falsos negativos de domínio corporativo válido.

Login Google:
- Frontend usa @react-oauth/google.
- Backend usa google-auth-library.
- Backend valida credential/id_token.
- Rota backend:
POST http://localhost:3001/auth/google

Variáveis:
Backend:
GOOGLE_CLIENT_ID=

Frontend:
VITE_GOOGLE_CLIENT_ID=

## Arquivos principais de autenticação

Backend:
- backend/src/routes/auth.routes.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/services/mail.service.js

Frontend:
- src/main.tsx
- src/App.tsx
- src/services/authApi.ts
- src/pages/LoginPage/LoginPage.tsx
- src/pages/LoginPage/LoginPage.css
- src/pages/RegisterPage/RegisterPage.tsx
- src/pages/RegisterPage/RegisterPage.css
- src/pages/ConfirmEmailPage/ConfirmEmailPage.tsx
- src/pages/EsqueciSenhaPage/EsqueciSenhaPage.tsx
- src/pages/EsqueciSenhaPage/EsqueciSenhaPage.css

## Instrução para o Codex

Antes de alterar código:
1. Leia este arquivo.
2. Leia os arquivos relacionados à tarefa.
3. Faça um plano curto.
4. Só altere arquivos se solicitado.
5. Preserve responsividade e segurança.
6. Não altere versão sem pedido explícito.