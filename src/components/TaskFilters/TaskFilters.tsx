import type { TaskPriority } from '../../types/task'

export type PriorityFilter = 'todas' | TaskPriority

interface TaskFiltersProps {
    searchTerm: string
    priorityFilter: PriorityFilter
    onSearchChange: (value: string) => void
    onPriorityChange: (value: PriorityFilter) => void
}

export const TaskFilters = ({
    searchTerm,
    priorityFilter,
    onSearchChange,
    onPriorityChange,
}: TaskFiltersProps) => {
    return (
        <div className="task-filters">
            <input
                type="text"
                placeholder="Buscar por tarefa ou arquivo..."
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
            />

            <select
                value={priorityFilter}
                onChange={(event) =>
                    onPriorityChange(event.target.value as PriorityFilter)
                }
            >
                <option value="todas">Todas as prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
            </select>
        </div>
    )
}