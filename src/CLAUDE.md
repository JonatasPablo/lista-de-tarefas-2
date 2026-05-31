# CLAUDE.md — Frontend React (src/)

## Stack

- React 19.2.5
- TypeScript ~6.0.2
- Vite 8.0.10 + `@vitejs/plugin-react` 6.0.1
- `vite-plugin-pwa` 1.3.0 (Workbox)
- React Router DOM 7.15.0 — **HashRouter** (obrigatório para GitHub Pages)
- `@react-oauth/google` 0.13.5

## Estrutura real de src/

```
src/
├── App.tsx                          # roteamento central, todos os hooks globais
├── main.tsx                         # entrada, inicializa SW, GoogleOAuthProvider
├── config/
│   └── app.ts                       # APP_NAME, APP_VERSION, e-mails
├── components/
│   ├── BottomNav/
│   ├── ConfirmModal/
│   ├── ErrorBoundary/
│   ├── Footer/
│   ├── GoogleSignInButton/
│   ├── Header/
│   ├── ImagePreviewModal/
│   ├── PromptModal/
│   ├── PwaInstallPrompt/
│   ├── TaskChecklist/
│   ├── TaskDetailModal/
│   ├── TaskFiles/
│   ├── TaskFilters/
│   ├── TaskForm/
│   ├── TaskItem/
│   ├── TaskList/
│   ├── TaskStats/
│   ├── Toast/
│   └── ValidacaoSenha/
├── hooks/
│   ├── sincronizacao.ts             # singleton de controle de polling
│   ├── useAuth.ts
│   ├── useChecklist.ts
│   ├── useConfirm.ts
│   ├── useGoogleButtonWidth.ts
│   ├── usePrompt.ts
│   ├── usePwaInstall.ts
│   ├── useSyncAutoRefresh.ts
│   ├── useTaskFiles.ts
│   ├── useTasks.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── layouts/
│   ├── PrivateLayout.tsx
│   └── PublicLayout.tsx / .css
├── pages/
│   ├── CompletedTasksPage/          # /historico
│   ├── ConfirmEmailPage/            # /confirmar-email
│   ├── EsqueciSenhaPage/            # /esqueci-senha
│   ├── HelpPage/                    # /ajuda
│   ├── LegalPage/                   # /privacidade, /termos, /cookies, /contato-lgpd
│   ├── LoginPage/                   # /login
│   ├── LogPage/                     # /log
│   ├── MinhaContaPage/              # /minha-conta
│   ├── RegisterPage/                # /cadastro
│   └── TasksPage/                   # / (raiz, privada)
├── pwa/
│   └── updateServiceWorker.ts       # registro do SW via vite-pwa
├── services/
│   ├── api.ts                       # axios/fetch base
│   ├── authApi.ts
│   ├── checklistApi.ts
│   ├── taskFilesApi.ts
│   ├── tasksApi.ts
│   └── usuariosApi.ts
├── styles/
│   ├── global.css
│   ├── dark-mode.css
│   └── design-tokens.css
├── types/
│   └── task.ts
└── utils/
    ├── date.ts
    ├── file.ts
    └── tasks.ts
```

## Roteamento (HashRouter)

| Rota | Página | Acesso |
|------|--------|--------|
| `/#/` | TasksPage | Privada |
| `/#/historico` | CompletedTasksPage | Privada |
| `/#/log` | LogPage | Privada |
| `/#/minha-conta` | MinhaContaPage | Privada |
| `/#/ajuda` | HelpPage | Pública + Privada |
| `/#/login` | LoginPage | Pública |
| `/#/cadastro` | RegisterPage | Pública |
| `/#/confirmar-email` | ConfirmEmailPage | Pública |
| `/#/esqueci-senha` | EsqueciSenhaPage | Pública |
| `/#/privacidade` | LegalPage | Pública |
| `/#/termos` | LegalPage | Pública |
| `/#/cookies` | LegalPage | Pública |
| `/#/contato-lgpd` | LegalPage | Pública |
| `/#/*` | → `/` | Redirect |

Rotas privadas redirecionam para `/login` se não autenticado.
Rotas públicas de auth redirecionam para `/` se já autenticado.

## Convenções de código

- Nomes de arquivos, pastas, variáveis e funções em **português** quando possível.
- Inglês apenas onde for exigência técnica (nome de lib, tipo do React, etc).
- Componentes: PascalCase em inglês (convenção React).
- Hooks: camelCase começando com `use` em inglês.
- CSS: classes em kebab-case, em português.
- Cada componente tem sua própria pasta: `ComponenteName/ComponenteName.tsx`.
- CSS co-localizado: `ComponenteName/ComponenteName.css` quando tem estilos.
- Sem CSS-in-JS — usar arquivos `.css` separados.
- Sem `any` em TypeScript sem justificativa explícita.

## Regras CSS

- Tokens de design em `src/styles/design-tokens.css` — usar variáveis CSS, não valores hard-coded.
- Modo escuro em `src/styles/dark-mode.css` — usar seletor `[data-theme="dark"]`.
- Responsividade: mobile-first. Breakpoints: 480px, 768px, 1024px, 1280px.
- Não usar cores hard-coded sem antes verificar se existe token equivalente.

## Regras PWA

- `registerType: 'autoUpdate'` — SW atualiza automaticamente.
- API **nunca** é cacheada (handler `NetworkOnly` no workbox — ver `vite.config.ts`).
- `updateServiceWorker.ts` controla recarga automática da página ao detectar novo SW.
- `App.tsx` limpa cache PWA ao detectar mudança de versão (`APP_VERSION`).
- Não adicionar rotas de API ao cache do workbox — isso quebraria logout e 401.
- Icons PWA: `public/pwa-192x192.png` e `public/pwa-512x512.png`.

## Controle de sincronização (polling)

- Singleton `src/hooks/sincronizacao.ts` controla polling automático.
- Chamar `sincronizacao.pausar()` antes de operações manuais; `sincronizacao.liberar()` depois.
- Para operações com burst (upload): usar `sincronizacao.liberarComCooldown(ms)`.
- Nunca fazer polling durante operação manual em andamento.

## Comandos

```bash
npm run dev:frontend     # Vite dev server → http://localhost:5173
npm run build            # tsc -b && vite build → dist/
npm run lint             # eslint .
npm run deploy           # build + gh-pages -d dist
```

## DO NOT

- Não trocar HashRouter por BrowserRouter (quebra GitHub Pages).
- Não cachear respostas de API no Service Worker.
- Não alterar `APP_VERSION` em `src/config/app.ts` sem pedido explícito.
- Não criar páginas sem adicionar a rota correspondente em `App.tsx`.
- Não usar `localStorage` para armazenar token de sessão (cookie httpOnly).
- Não usar valores de cor hard-coded sem verificar `design-tokens.css`.

## [LEARNING LOG]
> Atualizado após cada operação significativa.
> Nunca remover entradas antigas — adicionar novas no topo.

- 2026-05-31: Sprint 1 — v2.1.0. Novos componentes: AuthHeroPanel, TaskEmptyState, TaskSkeleton. CSS co-localizado: Header.css, BottomNav.css, Toast.css, ConfirmModal.css, PromptModal.css. TaskList agora aceita tipoEstadoVazio, isLoading e onNovaTarefa. TaskFilters tem badge de filtros ativos. Regra: sortOption default = 'mais-recentes' (não 'Filtros').
- 2026-05-30: Arquivo criado com base na leitura de src/App.tsx, vite.config.ts, package.json e estrutura de pastas.
