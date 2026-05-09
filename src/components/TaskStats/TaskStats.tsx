import type { Task, TaskPriority } from '../../types/task'

type TaskStatsFilter = 'todas' | TaskPriority

interface TaskStatsProps {
    tasks: Task[]
    title?: string
    activeFilter?: TaskStatsFilter
    onFilterChange?: (filter: TaskStatsFilter) => void
}

export const TaskStats = ({
    tasks,
    title = 'Resumo',
    activeFilter = 'todas',
    onFilterChange,
}: TaskStatsProps) => {
    const totalTasks = tasks.length
    const highPriorityTasks = tasks.filter(
        (task) => task.priority === 'alta'
    ).length
    const mediumPriorityTasks = tasks.filter(
        (task) => task.priority === 'media'
    ).length
    const lowPriorityTasks = tasks.filter(
        (task) => task.priority === 'baixa'
    ).length

    return (
        <section className="task-stats">
            <h3>{title}</h3>

            <div className="stats-grid">
                <button
                    type="button"
                    className={`stats-card stats-card-total ${
                        activeFilter === 'todas' ? 'is-active' : ''
                    }`}
                    onClick={() => onFilterChange?.('todas')}
                    aria-pressed={activeFilter === 'todas'}
                >
                    <strong>{totalTasks}</strong>
                    <span>Tarefas</span>
                </button>

                <button
                    type="button"
                    className={`stats-card stats-card-high ${
                        activeFilter === 'alta' ? 'is-active' : ''
                    }`}
                    onClick={() => onFilterChange?.('alta')}
                    aria-pressed={activeFilter === 'alta'}
                >
                    <strong>{highPriorityTasks}</strong>
                    <span>Alta</span>
                </button>

                <button
                    type="button"
                    className={`stats-card stats-card-medium ${
                        activeFilter === 'media' ? 'is-active' : ''
                    }`}
                    onClick={() => onFilterChange?.('media')}
                    aria-pressed={activeFilter === 'media'}
                >
                    <strong>{mediumPriorityTasks}</strong>
                    <span>Média</span>
                </button>

                <button
                    type="button"
                    className={`stats-card stats-card-low ${
                        activeFilter === 'baixa' ? 'is-active' : ''
                    }`}
                    onClick={() => onFilterChange?.('baixa')}
                    aria-pressed={activeFilter === 'baixa'}
                >
                    <strong>{lowPriorityTasks}</strong>
                    <span>Baixa</span>
                </button>
            </div>
        </section>
    )
}