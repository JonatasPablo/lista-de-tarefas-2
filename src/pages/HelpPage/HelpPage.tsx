import {
    APP_DEVELOPER,
    APP_NAME,
    APP_VERSION,
    DEVELOPER_EMAIL,
} from '../../config/app'

import './HelpPage.css'

interface HelpPageProps {
    isDark: boolean
    onToggleTheme: () => void
    isLoggedIn: boolean
}

const helpItems = [
    {
        title: 'Cadastro',
        description:
            'Acesse a tela de cadastro, informe seu nome, e-mail e senha. Após criar a conta, confirme o e-mail pelo código enviado para a sua caixa de entrada antes de fazer o primeiro login.',
    },
    {
        title: 'Login',
        description:
            'Entre com seu e-mail e senha cadastrados. O e-mail precisa estar confirmado para acessar o sistema. Se errar a senha muitas vezes, o acesso será temporariamente bloqueado.',
    },
    {
        title: 'Login com Google',
        description:
            'Clique em "Entrar com Google" na tela de login ou cadastro para usar sua conta Google sem precisar criar uma senha.',
    },
    {
        title: 'Redefinição de senha',
        description:
            'Na tela de login, clique em "Esqueci minha senha". Informe seu e-mail, receba o código de verificação e crie uma nova senha.',
    },
    {
        title: 'Minha Conta',
        description:
            'Acesse Minha Conta pelo menu para alterar seu nome ou senha. A senha atual é exigida para confirmar qualquer alteração.',
    },
    {
        title: 'Foto de perfil',
        description:
            'Em Minha Conta, faça upload de uma imagem de até 20 MB. Você pode trocar ou remover a foto a qualquer momento. Sem foto, o sistema exibe suas iniciais.',
    },
    {
        title: 'Dark mode',
        description:
            'Alterne entre o tema claro e escuro pelo botão de tema no cabeçalho. Sua preferência é salva automaticamente e mantida entre sessões.',
    },
    {
        title: 'Instalar como app (PWA)',
        description:
            'Em navegadores compatíveis (Chrome, Edge, Android), você verá uma opção para instalar o sistema como aplicativo. No iOS, use o botão Compartilhar e depois "Adicionar à Tela de Início". Ao abrir o app, atualizações são aplicadas automaticamente.',
    },
    {
        title: 'Criar e editar tarefas',
        description:
            'Informe o título, uma descrição opcional e escolha a prioridade (baixa, média ou alta). Tarefas pendentes podem ser editadas a qualquer momento.',
    },
    {
        title: 'Concluir e filtrar tarefas',
        description:
            'Marque uma tarefa como concluída para enviá-la ao histórico. Use os filtros disponíveis para encontrar tarefas por título, prioridade ou outros critérios.',
    },
    {
        title: 'Exportar tarefas',
        description:
            'Na página de pendentes, selecione tarefas específicas ou exporte todas as tarefas filtradas de uma vez.',
    },
    {
        title: 'Anexos',
        description:
            'Adicione arquivos a tarefas pendentes. O limite é de 100 MB por arquivo, até 20 arquivos por tarefa e 500 MB de armazenamento total por conta. É possível baixar ou remover arquivos individualmente.',
    },
    {
        title: 'Histórico',
        description:
            'Acesse o histórico para visualizar as tarefas concluídas. Use os filtros para localizar registros e reabra uma tarefa para movê-la de volta à lista de pendentes.',
    },
    {
        title: 'Log de ações',
        description:
            'O log registra automaticamente as principais ações realizadas no sistema. Use os filtros para localizar eventos específicos e exporte os dados em formato CSV.',
    },
    {
        title: 'Segurança',
        description:
            'A sessão é mantida por cookie seguro e httpOnly. O acesso exige e-mail confirmado. Tentativas excessivas de login são bloqueadas automaticamente para proteger a conta.',
    },
    {
        title: 'Responsividade',
        description:
            'O sistema funciona em desktop, notebook, tablet e celular. O layout se adapta automaticamente ao tamanho da tela sem perda de funcionalidade.',
    },
]

export const HelpPage = ({ isDark, onToggleTheme, isLoggedIn }: HelpPageProps) => {
    return (
        <main className="help-page">
            <section className="help-card">
                <aside className="help-hero" aria-hidden="true">
                    <p className="help-hero-description">
                        Tire dúvidas sobre conta, tarefas, anexos e
                        configurações do sistema.
                    </p>

                    <strong className="help-hero-title">
                        Central de ajuda
                    </strong>
                </aside>

                <section className="help-content">
                    <header className="help-header">
                        <div className="auth-header-row">
                            <div>
                                <h2>Ajuda</h2>
                                <span>
                                    {APP_NAME} — versão {APP_VERSION}
                                </span>
                            </div>

                            {!isLoggedIn && (
                                <button
                                    type="button"
                                    className="theme-toggle-btn"
                                    onClick={onToggleTheme}
                                    aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                    title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                >
                                    {isDark ? (
                                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>

                        <p>
                            Consulte abaixo as principais orientações para usar
                            o sistema no dia a dia.
                        </p>
                    </header>

                    <section className="help-about-card">
                        <h3>Sobre o sistema</h3>
                        <p>
                            O {APP_NAME} foi desenvolvido por {APP_DEVELOPER}.
                            Para contato, utilize o e-mail{' '}
                            <a href={`mailto:${DEVELOPER_EMAIL}`}>
                                {DEVELOPER_EMAIL}
                            </a>
                            .
                        </p>
                    </section>

                    <section className="help-items-grid">
                        {helpItems.map((item) => (
                            <article className="help-item-card" key={item.title}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </article>
                        ))}
                    </section>

                    <section className="help-version-card">
                        <h3>Versionamento</h3>
                        <p>
                            A versão atual é{' '}
                            <strong>{APP_VERSION}</strong>. A regra utilizada é:
                            versão maior para nova geração do sistema, versão
                            intermediária para mudanças visuais ou de rotina, e
                            versão final para correções e pequenos ajustes.
                        </p>
                    </section>
                </section>
            </section>
        </main>
    )
}
