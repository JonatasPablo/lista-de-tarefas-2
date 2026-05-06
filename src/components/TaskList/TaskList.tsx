import type { Task, TaskPriority } from '../../types/task'
import { TaskItem } from '../TaskItem/TaskItem'

interface TaskListProps {
    tasks: Task[]
    emptyMessage?: string
    selectable?: boolean
    selectedTaskIds?: string[]
    onSelectTask?: (taskId: string) => void
    onToggleTask: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onUpdateTask: (
        taskId: string,
        title: string,
        description: string,
        priority: TaskPriority
    ) => void
    onAddFiles: (taskId: string, files: File[]) => void
    onRenameFile: (
        taskId: string,
        fileId: string,
        displayName: string
    ) => void
    onDeleteFile: (taskId: string, fileId: string) => void
}

export const TaskList = ({
    tasks,
    emptyMessage = 'Nenhuma tarefa cadastrada.',
    selectable = false,
    selectedTaskIds = [],
    onSelectTask,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onRenameFile,
    onDeleteFile,
}: TaskListProps) => {
    if (tasks.length === 0) {
        return <p className="empty-message">{emptyMessage}</p>
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    selectable={selectable}
                    selected={selectedTaskIds.includes(task.id)}
                    onSelectTask={onSelectTask}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onUpdateTask={onUpdateTask}
                    onAddFiles={onAddFiles}
                    onRenameFile={onRenameFile}
                    onDeleteFile={onDeleteFile}
                />
            ))}
        </ul>
    )
}