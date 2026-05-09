import { useMemo, useState } from 'react'
import type { Task, TaskFile, TaskPriority } from '../../types/task'
import { TaskItem } from '../TaskItem/TaskItem'

interface TaskListProps {
    tasks: Task[]
    emptyMessage?: string
    selectable?: boolean
    selectedTaskIds?: string[]
    onSelectTask?: (taskId: string) => void
    onToggleTask: (taskId: string) => void | Promise<void>
    onDeleteTask: (taskId: string) => void | Promise<void>
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
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
}

export const TaskList = ({
    onRequestRenameFile,
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
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

    const selectedTaskIdsSet = useMemo(
        () => new Set(selectedTaskIds),
        [selectedTaskIds]
    )

    const availableTaskIdsSet = useMemo(
        () => new Set(tasks.map((task) => task.id)),
        [tasks]
    )

    const activeExpandedTaskId =
        expandedTaskId && availableTaskIdsSet.has(expandedTaskId)
            ? expandedTaskId
            : null

    const handleToggleExpandedTask = (taskId: string) => {
        setExpandedTaskId((currentTaskId) =>
            currentTaskId === taskId ? null : taskId
        )
    }

    if (tasks.length === 0) {
        return (
            <p className="empty-message task-list-empty">
                {emptyMessage}
            </p>
        )
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    expanded={activeExpandedTaskId === task.id}
                    selected={selectedTaskIdsSet.has(task.id)}
                    selectable={selectable}
                    onToggleExpanded={() => handleToggleExpandedTask(task.id)}
                    onToggleTask={onToggleTask}
                    onSelectTask={onSelectTask}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onRequestRenameFile={onRequestRenameFile}
                    onAddFiles={onAddFiles}
                    onDeleteFile={onDeleteFile}
                    onRenameFile={onRenameFile}
                />
            ))}
        </ul>
    )
}