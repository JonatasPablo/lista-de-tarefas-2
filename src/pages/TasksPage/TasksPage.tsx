import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type { PriorityFilter } from '../../components/TaskFilters/TaskFilters'
import { TaskForm } from '../../components/TaskForm/TaskForm'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskPriority } from '../../types/task'

interface TasksPageProps {
    pendingTasks: Task[]
    selectedTaskIds: string[]
    onSelectTask: (taskId: string) => void
    onSelectAllVisibleTasks: (taskIds: string[]) => void
    onClearSelectedTasks: () => void
    onAddTask: (text: string, priority: TaskPriority) => void
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
    onExportTasks: (tasksToExport: Task[]) => void
}

export const TasksPage = ({
    pendingTasks,
    selectedTaskIds,
    onSelectTask,
    onSelectAllVisibleTasks,
    onClearSelectedTasks,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onRenameFile,
    onDeleteFile,
    onExportTasks,
}: TasksPageProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [priorityFilter, setPriorityFilter] =
        useState<PriorityFilter>('todas')

    const filteredTasks = useMemo(() => {
        return pendingTasks.filter((task) => {
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
    }, [pendingTasks, priorityFilter, searchTerm])

    const selectedVisibleTasks = filteredTasks.filter((task) =>
        selectedTaskIds.includes(task.id)
    )

    const handleExport = () => {
        if (selectedTaskIds.length > 0) {
            onExportTasks(selectedVisibleTasks)
            return
        }

        const confirmExportAll = window.confirm(
            'Nenhuma tarefa foi selecionada. Deseja exportar todas as tarefas pendentes filtradas?'
        )

        if (!confirmExportAll) {
            return
        }

        onExportTasks(filteredTasks)
    }

    return (
        <section className="page-section">
            <TaskForm onAddTask={onAddTask} />

            <TaskStats
                tasks={pendingTasks}
                title="Resumo das tarefas pendentes"
            />

            <TaskFilters
                searchTerm={searchTerm}
                priorityFilter={priorityFilter}
                onSearchChange={setSearchTerm}
                onPriorityChange={setPriorityFilter}
            />

            <div className="export-toolbar">
                <button type="button" onClick={handleExport}>
                    {selectedTaskIds.length > 0
                        ? `Exportar selecionadas (${selectedVisibleTasks.length})`
                        : 'Exportar pendentes'}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onSelectAllVisibleTasks(
                            filteredTasks.map((task) => task.id)
                        )
                    }
                    disabled={filteredTasks.length === 0}
                >
                    Selecionar visíveis
                </button>

                <button
                    type="button"
                    onClick={onClearSelectedTasks}
                    disabled={selectedTaskIds.length === 0}
                >
                    Limpar seleção
                </button>
            </div>

            <section className="tasks-section">
                <h2>Tarefas pendentes</h2>

                <div className="tasks-scroll-area">
                    <TaskList
                    tasks={filteredTasks}
                    selectable
                    selectedTaskIds={selectedTaskIds}
                    onSelectTask={onSelectTask}
                    emptyMessage="Nenhuma tarefa pendente encontrada."
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