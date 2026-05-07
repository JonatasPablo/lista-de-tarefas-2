import { useEffect, useMemo, useState } from 'react'
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
    onExportTasks: (tasksToExport: Task[]) => void | Promise<void>
    onConfirm: (options: {
        title: string
        message: string
        confirmText?: string
        cancelText?: string
    }) => Promise<boolean>
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
}

const collapsibleFormQuery =
    '(max-height: 850px) and (min-width: 901px), (max-width: 700px)'

const isCollapsibleFormScreen = () => {
    if (typeof window === 'undefined') {
        return false
    }

    return window.matchMedia(collapsibleFormQuery).matches
}

const getInitialFormVisibility = () => {
    if (typeof window === 'undefined') {
        return true
    }

    return !window.matchMedia(collapsibleFormQuery).matches
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
    onExportTasks,
    onConfirm,
}: TasksPageProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [priorityFilter, setPriorityFilter] =
        useState<PriorityFilter>('todas')
    const [sortOption, setSortOption] =
        useState<TaskSortOption>('Filtros')
    const [isTaskFormVisible, setIsTaskFormVisible] = useState(
        getInitialFormVisibility
    )

    useEffect(() => {
        const mediaQuery = window.matchMedia(collapsibleFormQuery)

        const handleScreenChange = () => {
            setIsTaskFormVisible(!mediaQuery.matches)
        }

        handleScreenChange()

        mediaQuery.addEventListener('change', handleScreenChange)

        return () => {
            mediaQuery.removeEventListener('change', handleScreenChange)
        }
    }, [])

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

        if (isCollapsibleFormScreen()) {
            setIsTaskFormVisible(false)
        }
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setPriorityFilter('todas')
        setSortOption('Filtros')
        onClearSelectedTasks()
    }

    const handleExport = async () => {
        if (selectedTaskIds.length > 0) {
            onExportTasks(selectedVisibleTasks)
            return
        }

        const confirmExportAll = await onConfirm({
            title: 'Exportar tarefas',
            message:
                'Nenhuma tarefa foi selecionada. Deseja exportar todas as tarefas pendentes filtradas?',
            confirmText: 'Exportar',
            cancelText: 'Cancelar',
        })

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
            <div
                className={`task-form-panel ${
                    isTaskFormVisible ? 'is-open' : 'is-closed'
                }`}
            >
                <button
                    type="button"
                    className="new-task-toggle"
                    onClick={handleToggleTaskForm}
                    aria-expanded={isTaskFormVisible}
                >
                    {isTaskFormVisible ? 'Fechar formulário' : '+ Nova tarefa'}
                </button>

                {isTaskFormVisible && (
                    <TaskForm onAddTask={handleAddTask} />
                )}
            </div>

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
                        ? `Exportar (${selectedVisibleTasks.length})`
                        : 'Exportar'}
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
                    Selecionar
                </button>

                <button
                    type="button"
                    onClick={onClearSelectedTasks}
                    disabled={selectedTaskIds.length === 0}
                >
                    Limpar
                </button>

                {hasActiveFilters && (
                    <span className="filter-status">Filtros aplicados</span>
                )}
            </div>

            <section className="tasks-section">
                <h2>Tarefas pendentes</h2>

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