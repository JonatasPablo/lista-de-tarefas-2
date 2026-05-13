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
        title: 'Como criar uma tarefa',
        description:
            'Informe o título, uma descrição opcional, escolha a prioridade e clique em Adicionar.',
    },
    {
        title: 'Como anexar arquivos',
        description:
            'Em uma tarefa pendente, clique em Anexar arquivo. Você pode selecionar vários arquivos de uma vez. O limite planejado é de 100 MB por arquivo.',
    },
    {
        title: 'Como concluir uma tarefa',
        description:
            'Marque a tarefa como concluída. Ela será enviada para o histórico e ficará bloqueada para edição e novos anexos.',
    },
    {
        title: 'Como reabrir uma tarefa',
        description:
            'Na página de histórico, clique em Reabrir tarefa. Ela volta para a lista de pendentes.',
    },
    {
        title: 'Como exportar tarefas',
        description:
            'Na página de pendentes, você pode selecionar tarefas específicas ou exportar todas as tarefas filtradas.',
    },
    {
        title: 'Anexos de arquivos',
        description:
            'O sistema salva seus arquivos para que você consiga baixar em outros dispositivos.',
    },
]

export const HelpPage = ({ isDark, onToggleTheme, isLoggedIn }: HelpPageProps) => {
    return (
        <main className="help-page">
            <section className="help-card">
                <aside className="help-hero" aria-hidden="true">
                    <p className="help-hero-description">
                        Tire dúvidas rápidas sobre tarefas, anexos, histórico e
                        versão do sistema.
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