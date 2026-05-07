import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type {
    PriorityFilter,
    TaskSortOption,
} from '../../components/TaskFilters/TaskFilters'
import { TaskForm } from '../../components/TaskForm/TaskForm'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskPriority } from '../../types/task'
import { filterTasks, sortTasks } from '../../utils/tasks'

interface TasksPageProps {
    pendingTasks: Task[]
    selectedTaskIds: string[]
    onSelectTask: (taskId: string) => void
    onSelectAllVisibleTasks: (taskIds: string[]) => void
    onClearSelectedTasks: () => void
    onAddTask: (
        title: string,
        description: string,
        priority: TaskPriority
    ) => void
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
    const [sortOption, setSortOption] =
        useState<TaskSortOption>('prioridade')

    const filteredTasks = useMemo(() => {
        const filtered = filterTasks(pendingTasks, searchTerm, priorityFilter)

        return sortTasks(filtered, sortOption)
    }, [pendingTasks, priorityFilter, searchTerm, sortOption])

    const selectedVisibleTasks = filteredTasks.filter((task) =>
        selectedTaskIds.includes(task.id)
    )

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        priorityFilter !== 'todas' ||
        sortOption !== 'prioridade'

    const handleClearFilters = () => {
        setSearchTerm('')
        setPriorityFilter('todas')
        setSortOption('prioridade')
        onClearSelectedTasks()
    }

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

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        onClearSelectedTasks()
    }

    const handlePriorityChange = (value: PriorityFilter) => {
        setPriorityFilter(value)
        onClearSelectedTasks()
    }

    const handleSortChange = (value: TaskSortOption) => {
        setSortOption(value)
        onClearSelectedTasks()
    }

    return (
        <section className="page-section">
            <TaskForm onAddTask={onAddTask} />

            <TaskStats
                tasks={filteredTasks}
                title="Resumo das tarefas pendentes"
            />

            <TaskFilters
                searchTerm={searchTerm}
                priorityFilter={priorityFilter}
                sortOption={sortOption}
                onSearchChange={handleSearchChange}
                onPriorityChange={handlePriorityChange}
                onSortChange={handleSortChange}
                onClearFilters={handleClearFilters}
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

                {hasActiveFilters && (
                    <span className="filter-status">
                        Filtros aplicados
                    </span>
                )}
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