import {
    APP_DEVELOPER,
    APP_NAME,
    APP_VERSION,
    DEVELOPER_EMAIL,
} from '../../config/app'

import './HelpPage.css'

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

export const HelpPage = () => {
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
                        <div>
                            <h2>Ajuda</h2>
                            <span>
                                {APP_NAME} — versão {APP_VERSION}
                            </span>
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