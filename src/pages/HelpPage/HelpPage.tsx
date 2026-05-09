import {
    APP_DEVELOPER,
    APP_NAME,
    APP_VERSION,
    DEVELOPER_EMAIL,
} from '../../config/app'

export const HelpPage = () => {
    return (
        <section className="help-page">
            <div className="help-page-header">
                <div>
                    <h2>Ajuda</h2>
                    <span>
                        {APP_NAME} — versão {APP_VERSION}
                    </span>
                </div>
            </div>

            <div className="help-card">
                <h3>Sobre o sistema</h3>
                <p>
                    O {APP_NAME} foi desenvolvido por {APP_DEVELOPER}. Para
                    contato, utilize o e-mail{' '}
                    <a href={`mailto:${DEVELOPER_EMAIL}`}>
                        {DEVELOPER_EMAIL}
                    </a>
                    .
                </p>
            </div>

            <div className="help-card">
                <h3>Como criar uma tarefa</h3>
                <p>
                    Informe o título, uma descrição opcional, escolha a
                    prioridade e clique em Adicionar.
                </p>
            </div>

            <div className="help-card">
                <h3>Como anexar arquivos</h3>
                <p>
                    Em uma tarefa pendente, clique em Anexar arquivo. Você pode
                    selecionar vários arquivos de uma vez. O limite planejado é
                    de 100 MB por arquivo.
                </p>
            </div>

            <div className="help-card">
                <h3>Como concluir uma tarefa</h3>
                <p>
                    Marque a tarefa como concluída. Ela será enviada para o
                    histórico e ficará bloqueada para edição e novos anexos.
                </p>
            </div>

            <div className="help-card">
                <h3>Como reabrir uma tarefa</h3>
                <p>
                    Na página de histórico, clique em Reabrir tarefa. Ela volta
                    para a lista de pendentes.
                </p>
            </div>

            <div className="help-card">
                <h3>Como exportar tarefas</h3>
                <p>
                    Na página de pendentes, você pode selecionar tarefas
                    específicas ou exportar todas as tarefas filtradas.
                </p>
            </div>

            <div className="help-card">
                <h3>Anexos de arquivos</h3>
                <p>
                    O sistema vai salvar seus arquivos e você vai conseguir baixar em outros dispositivos.
                </p>
            </div>

            <div className="help-card">
                <h3>Versionamento</h3>
                <p>
                    A versão atual é <strong>{APP_VERSION}</strong>. A regra
                    utilizada é: versão maior para nova geração do sistema,
                    versão intermediária para mudanças visuais ou de rotina, e
                    versão final para correções e pequenos ajustes.
                </p>
            </div>
        </section>
    )
}