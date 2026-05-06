import type { Task } from '../../types/task'

interface TaskStatsProps {
    tasks: Task[]
    title?: string
}

export const TaskStats = ({ tasks, title = 'Resumo' }: TaskStatsProps) => {
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
    const totalFiles = tasks.reduce(
        (total, task) => total + task.files.length,
        0
    )

    return (
        <section className="task-stats">
            <h3>{title}</h3>

            <div className="stats-grid">
                <div>
                    <strong>{totalTasks}</strong>
                    <span>Tarefas</span>
                </div>

                <div>
                    <strong>{highPriorityTasks}</strong>
                    <span>Alta</span>
                </div>

                <div>
                    <strong>{mediumPriorityTasks}</strong>
                    <span>Média</span>
                </div>

                <div>
                    <strong>{lowPriorityTasks}</strong>
                    <span>Baixa</span>
                </div>

                <div>
                    <strong>{totalFiles}</strong>
                    <span>Arquivos</span>
                </div>
            </div>
        </section>
    )
}