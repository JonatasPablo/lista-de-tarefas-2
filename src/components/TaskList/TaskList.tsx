import { useCallback, useMemo, useState } from 'react'
import type {
    ChecklistSummary,
    Task,
    TaskFile,
    TaskPriority,
} from '../../types/task'
import { TaskDetailModal } from '../TaskDetailModal/TaskDetailModal'
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
    onAddFiles: (taskId: string, files: File[]) => void | Promise<void>
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
    onDeleteFile,
}: TaskListProps) => {
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const [checklistSummaries, setChecklistSummaries] = useState<
        Record<string, ChecklistSummary | null>
    >({})

    const selectedTaskIdsSet = useMemo(
        () => new Set(selectedTaskIds),
        [selectedTaskIds]
    )

    const tasksWithChecklistSummary = useMemo(
        () =>
            tasks.map((task) => ({
                ...task,
                checklistSummary:
                    task.id in checklistSummaries
                        ? checklistSummaries[task.id] || undefined
                        : task.checklistSummary,
            })),
        [checklistSummaries, tasks]
    )

    const activeTask =
        tasksWithChecklistSummary.find((task) => task.id === activeTaskId) ||
        null

    const handleChecklistProgressChange = useCallback((
        taskId: string,
        summary: ChecklistSummary | null
    ) => {
        setChecklistSummaries((current) => {
            const currentSummary = current[taskId] || null

            if (
                currentSummary?.total === summary?.total &&
                currentSummary?.concluidos === summary?.concluidos
            ) {
                return current
            }

            return {
                ...current,
                [taskId]: summary,
            }
        })
    }, [])

    const handleCloseModal = useCallback(() => {
        setActiveTaskId(null)
    }, [])

    if (tasks.length === 0) {
        return (
            <p className="empty-message task-list-empty">
                {emptyMessage}
            </p>
        )
    }

    return (
        <>
            <ul className="task-list">
                {tasksWithChecklistSummary.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        selected={selectedTaskIdsSet.has(task.id)}
                        selectable={selectable}
                        onOpen={() => setActiveTaskId(task.id)}
                        onSelectTask={onSelectTask}
                    />
                ))}
            </ul>

            {activeTask && (
                <TaskDetailModal
                    task={activeTask}
                    onClose={handleCloseModal}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onUpdateTask={onUpdateTask}
                    onAddFiles={onAddFiles}
                    onDeleteFile={onDeleteFile}
                    onRequestRenameFile={onRequestRenameFile}
                    onChecklistProgressChange={handleChecklistProgressChange}
                />
            )}
        </>
    )
}
