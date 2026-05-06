import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type { PriorityFilter } from '../../components/TaskFilters/TaskFilters'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskPriority } from '../../types/task'

interface CompletedTasksPageProps {
    completedTasks: Task[]
    onToggleTask: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onUpdateTask: (
        taskId: string,
        text: string,
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

export const CompletedTasksPage = ({
    completedTasks,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onRenameFile,
    onDeleteFile,
}: CompletedTasksPageProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [priorityFilter, setPriorityFilter] =
        useState<PriorityFilter>('todas')

    const filteredTasks = useMemo(() => {
        return completedTasks.filter((task) => {
            const normalizedSearch = searchTerm.trim().toLowerCase()

            const matchesSearch =
                normalizedSearch === '' ||
                task.text.toLowerCase().includes(normalizedSearch) ||
                task.files.some((file) =>
                    file.displayName.toLowerCase().includes(normalizedSearch)
                )

            const matchesPriority =
                priorityFilter === 'todas' ||
                task.priority === priorityFilter

            return matchesSearch && matchesPriority
        })
    }, [completedTasks, priorityFilter, searchTerm])

    return (
        <section className="page-section">
            <TaskStats tasks={completedTasks} title="Resumo do histórico" />

            <TaskFilters
                searchTerm={searchTerm}
                priorityFilter={priorityFilter}
                onSearchChange={setSearchTerm}
                onPriorityChange={setPriorityFilter}
            />

            <section className="tasks-section">
                <h2>Histórico de concluídas</h2>

                <div className="tasks-scroll-area">
                    <TaskList
                    tasks={filteredTasks}
                    emptyMessage="Nenhuma tarefa concluída encontrada."
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onUpdateTask={onUpdateTask}
                    onAddFiles={onAddFiles}
                    onRenameFile={onRenameFile}
                    onDeleteFile={onDeleteFile}
                    />
                </div>
            </section>
        </section>
    )
}