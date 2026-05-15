import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type {
    PriorityFilter,
    TaskSortOption,
} from '../../components/TaskFilters/TaskFilters'
import { TaskForm } from '../../components/TaskForm/TaskForm'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskFile, TaskPriority } from '../../types/task'
import { filterTasks, sortTasks } from '../../utils/tasks'

import './TasksPage.css'

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
    onBulkCompleteTasks: (taskIds: string[]) => void | Promise<void>
    onBulkDeleteTasks: (taskIds: string[]) => void | Promise<void>
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
}

export const TasksPage = ({
    onRequestRenameFile,
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
    onBulkCompleteTasks,
    onBulkDeleteTasks,
}: TasksPageProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [priorityFilter, setPriorityFilter] =
        useState<PriorityFilter>('todas')
    const [sortOption, setSortOption] =
        useState<TaskSortOption>('Filtros')
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(false)

    const statsTasks = useMemo(() => {
        return filterTasks(pendingTasks, searchTerm, 'todas')
    }, [pendingTasks, searchTerm])

    const filteredTasks = useMemo(() => {
        const filtered = filterTasks(pendingTasks, searchTerm, priorityFilter)

        return sortTasks(filtered, sortOption)
    }, [pendingTasks, priorityFilter, searchTerm, sortOption])

    const selectedVisibleTasks = filteredTasks.filter((task) =>
        selectedTaskIds.includes(task.id)
    )

    const allVisibleSelected =
        filteredTasks.length > 0 &&
        filteredTasks.every((task) => selectedTaskIds.includes(task.id))

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        priorityFilter !== 'todas' ||
        sortOption !== 'Filtros'

    const handleToggleTaskForm = () => {
        setIsTaskFormVisible((currentValue) => !currentValue)
    }

    const handleAddTask = (
        title: string,
        description: string,
        priority: TaskPriority
    ) => {
        onAddTask(title, description, priority)
        setIsTaskFormVisible(false)
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setPriorityFilter('todas')
        setSortOption('Filtros')
        onClearSelectedTasks()
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        onClearSelectedTasks()
    }

    const handleSortChange = (value: TaskSortOption) => {
        setSortOption(value)
        onClearSelectedTasks()
    }

    const handleStatsFilterChange = (value: PriorityFilter) => {
        setPriorityFilter(value)
        onClearSelectedTasks()
    }

    const handleSelectToggle = () => {
        if (allVisibleSelected) {
            onClearSelectedTasks()
        } else {
            onSelectAllVisibleTasks(filteredTasks.map((task) => task.id))
        }
    }

    return (
        <section className="tasks-page">
            <header className="tasks-page-header">
                <div>
                    <h2>Tarefas pendentes</h2>
                    <p>
                        Organize, filtre, anexe arquivos e acompanhe suas
                        tarefas em andamento.
                    </p>
                </div>
            </header>

            {/* Painel superior: botão + resumo (fechado) ou botão + formulário (aberto) */}
            <section
                className={`tasks-top-panel ${
                    isTaskFormVisible ? 'formulario-aberto' : 'resumo-visivel'
                }`}
            >
                <div className="tasks-top-bar">
                    <button
                        type="button"
                        className="tasks-new-task-toggle"
                        onClick={handleToggleTaskForm}
                        aria-expanded={isTaskFormVisible}
                    >
                        {isTaskFormVisible ? 'Fechar formulário' : '+ Nova tarefa'}
                    </button>

                    {!isTaskFormVisible && (
                        <TaskStats
                            tasks={statsTasks}
                            title="Resumo das tarefas pendentes"
                            activeFilter={priorityFilter}
                            onFilterChange={handleStatsFilterChange}
                        />
                    )}
                </div>

                {isTaskFormVisible && (
                    <div className="tasks-form-content">
                        <TaskForm onAddTask={handleAddTask} />
                    </div>
                )}
            </section>

            <section className="tasks-controls-panel">
                <TaskFilters
                    searchTerm={searchTerm}
                    priorityFilter={priorityFilter}
                    sortOption={sortOption}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    onClearFilters={handleClearFilters}
                />

                <div className="tasks-export-toolbar">
                    <button
                        type="button"
                        className="tasks-bulk-select-btn"
                        onClick={handleSelectToggle}
                        disabled={filteredTasks.length === 0}
                    >
                        {allVisibleSelected ? 'Desmarcar todas' : 'Sel. todas'}
                    </button>

                    <button
                        type="button"
                        className="tasks-bulk-complete-btn"
                        onClick={() =>
                            onBulkCompleteTasks(
                                selectedVisibleTasks.map((t) => t.id)
                            )
                        }
                        disabled={selectedVisibleTasks.length === 0}
                    >
                        Concluir sel.
                    </button>

                    <button
                        type="button"
                        className="tasks-bulk-delete-btn"
                        onClick={() =>
                            onBulkDeleteTasks(
                                selectedVisibleTasks.map((t) => t.id)
                            )
                        }
                        disabled={selectedVisibleTasks.length === 0}
                    >
                        Excluir sel.
                    </button>

                    {hasActiveFilters && (
                        <span className="tasks-filter-status">
                            Filtros aplicados
                        </span>
                    )}
                </div>
            </section>

            <section className="tasks-list-panel">
                <div className="tasks-list-header">
                    <h3>Lista de tarefas</h3>

                    <span>
                        {selectedTaskIds.length > 0
                            ? `${selectedVisibleTasks.length} selecionada${
                                  selectedVisibleTasks.length === 1 ? '' : 's'
                              }`
                            : 'Clique em uma tarefa para ver os detalhes'}
                    </span>
                </div>

                <div className="tasks-scroll-area">
                    <TaskList
                        onRequestRenameFile={onRequestRenameFile}
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
