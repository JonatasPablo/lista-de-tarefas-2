import type { Task, TaskPriority } from '../../types/task'
import { TaskItem } from '../TaskItem/TaskItem'

interface TaskListProps {
    tasks: Task[]
    onToggleTask: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onUpdateTask: (
        taskId: string,
        text: string,
        priority: TaskPriority
    ) => void
}

export const TaskList = ({
    tasks,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
}: TaskListProps) => {
    if (tasks.length === 0) {
        return <p className="empty-message">Nenhuma tarefa cadastrada.</p>
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onUpdateTask={onUpdateTask}
                />
            ))}
        </ul>
    )
}