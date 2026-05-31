import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type {
    PriorityFilter,
    TaskSortOption,
} from '../../components/TaskFilters/TaskFilters'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskFile, TaskPriority } from '../../types/task'
import { filterTasks, sortTasks } from '../../utils/tasks'

import './CompletedTasksPage.css'

interface CompletedTasksPageProps {
    completedTasks: Task[]
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

export const CompletedTasksPage = ({
    onRequestRenameFile,
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
    const [sortOption, setSortOption] =
        useState<TaskSortOption>('mais-recentes')

    const statsTasks = useMemo(() => {
        return filterTasks(completedTasks, searchTerm, 'todas')
    }, [completedTasks, searchTerm])

    const filteredTasks = useMemo(() => {
        const filtered = filterTasks(completedTasks, searchTerm, priorityFilter)

        return sortTasks(filtered, sortOption)
    }, [completedTasks, priorityFilter, searchTerm, sortOption])

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        priorityFilter !== 'todas' ||
        sortOption !== 'mais-recentes'

    const handleClearFilters = () => {
        setSearchTerm('')
        setPriorityFilter('todas')
        setSortOption('mais-recentes')
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

    const handleSortChange = (value: TaskSortOption) => {
        setSortOption(value)
    }

    const handleStatsFilterChange = (value: PriorityFilter) => {
        setPriorityFilter(value)
    }

    return (
        <section className="completed-tasks-page">
            <header className="completed-tasks-page-header">
                <div>
                    <h2>Histórico</h2>
                    <p>
                        Consulte tarefas concluídas, filtre por prioridade e
                        reabra quando precisar.
                    </p>
                </div>
            </header>

            <section className="completed-tasks-stats-panel">
                <TaskStats
                    tasks={statsTasks}
                    title="Resumo do histórico"
                    activeFilter={priorityFilter}
                    onFilterChange={handleStatsFilterChange}
                />
            </section>

            <section className="completed-tasks-controls-panel">
                <TaskFilters
                    searchTerm={searchTerm}
                    priorityFilter={priorityFilter}
                    sortOption={sortOption}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    onClearFilters={handleClearFilters}
                />

                {hasActiveFilters && (
                    <span className="completed-tasks-filter-status">
                        Filtros aplicados
                    </span>
                )}
            </section>

            <section className="completed-tasks-list-panel">
                <div className="completed-tasks-list-header">
                    <h3>Tarefas concluídas</h3>
                </div>

                <div className="completed-tasks-scroll-area">
                    <TaskList
                        onRequestRenameFile={onRequestRenameFile}
                        tasks={filteredTasks}
                        tipoEstadoVazio={searchTerm.trim() ? 'busca' : 'concluidas'}
                        termoBusca={searchTerm.trim()}
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
