import './TaskEmptyState.css'

interface TaskEmptyStateProps {
    tipo: 'pendentes' | 'concluidas' | 'busca'
    termoBusca?: string
    onNovaTarefa?: () => void
}

const IconeClipboard = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="task-empty-icon"
    >
        <rect x="8" y="2" width="8" height="4" rx="1.5" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
)

const IconeTrofeu = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="task-empty-icon"
    >
        <path d="M8 21h8M12 17v4" />
        <path d="M5 4H2v5a7 7 0 0 0 7 7h6a7 7 0 0 0 7-7V4h-3" />
        <path d="M5 4h14" />
    </svg>
)

const IconeLupa = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="task-empty-icon"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

export const TaskEmptyState = ({
    tipo,
    termoBusca,
    onNovaTarefa,
}: TaskEmptyStateProps) => {
    if (tipo === 'pendentes') {
        return (
            <div className="task-empty-state">
                <IconeClipboard />
                <p className="task-empty-titulo">Nenhuma tarefa pendente</p>
                <p className="task-empty-subtitulo">
                    Comece criando sua primeira tarefa.
                </p>
                {onNovaTarefa && (
                    <button
                        type="button"
                        className="task-empty-action"
                        onClick={onNovaTarefa}
                    >
                        Criar primeira tarefa
                    </button>
                )}
            </div>
        )
    }

    if (tipo === 'concluidas') {
        return (
            <div className="task-empty-state">
                <IconeTrofeu />
                <p className="task-empty-titulo">Nenhuma tarefa concluída ainda</p>
                <p className="task-empty-subtitulo">
                    Conclua tarefas para vê-las aqui.
                </p>
            </div>
        )
    }

    return (
        <div className="task-empty-state">
            <IconeLupa />
            <p className="task-empty-titulo">Nenhum resultado encontrado</p>
            {termoBusca && (
                <p className="task-empty-subtitulo">
                    Nenhuma tarefa encontrada para "{termoBusca}".
                </p>
            )}
        </div>
    )
}
