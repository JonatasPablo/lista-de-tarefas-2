import { useMemo, useState } from 'react'
import { TaskFilters } from '../../components/TaskFilters/TaskFilters'
import type {
    PriorityFilter,
    TaskSortOption,
} from '../../components/TaskFilters/TaskFilters'
import { TaskList } from '../../components/TaskList/TaskList'
import { TaskStats } from '../../components/TaskStats/TaskStats'
import type { Task, TaskPriority } from '../../types/task'
import { filterTasks, sortTasks } from '../../utils/tasks'

interface CompletedTasksPageProps {
    completedTasks: Task[]
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
    const [sortOption, setSortOption] =
        useState<TaskSortOption>('mais-recentes')

    const filteredTasks = useMemo(() => {
        const filtered = filterTasks(completedTasks, searchTerm, priorityFilter)

        return sortTasks(filtered, sortOption)
    }, [completedTasks, priorityFilter, searchTerm, sortOption])

    const handleClearFilters = () => {
        setSearchTerm('')
        setPriorityFilter('todas')
        setSortOption('mais-recentes')
    }

    return (
        <section className="page-section completed-page-section">
            <TaskStats tasks={filteredTasks} title="Resumo do histórico" />

            <TaskFilters
                searchTerm={searchTerm}
                priorityFilter={priorityFilter}
                sortOption={sortOption}
                onSearchChange={setSearchTerm}
                onPriorityChange={setPriorityFilter}
                onSortChange={setSortOption}
                onClearFilters={handleClearFilters}
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