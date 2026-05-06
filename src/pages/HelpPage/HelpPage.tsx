export const HelpPage = () => {
    return (
        <section className="help-page">
            <h2>Ajuda</h2>

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
                <h3>Arquivos reais e backend</h3>
                <p>
                    Nesta etapa, o sistema salva apenas informações dos arquivos.
                    Quando o backend estiver pronto, os arquivos serão salvos no
                    MySQL e poderão ser baixados em outro computador.
                </p>
            </div>
        </section>
    )
}