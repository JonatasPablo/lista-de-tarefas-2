import type { TaskPriority } from '../../types/task'

export type PriorityFilter = 'todas' | TaskPriority

export type TaskSortOption =
    | 'prioridade'
    | 'mais-recentes'
    | 'mais-antigas'
    | 'ultimas-editadas'
    | 'nome-az'
    | 'nome-za'

interface TaskFiltersProps {
    searchTerm: string
    priorityFilter: PriorityFilter
    sortOption: TaskSortOption
    onSearchChange: (value: string) => void
    onPriorityChange: (value: PriorityFilter) => void
    onSortChange: (value: TaskSortOption) => void
    onClearFilters: () => void
}

export const TaskFilters = ({
    searchTerm,
    priorityFilter,
    sortOption,
    onSearchChange,
    onPriorityChange,
    onSortChange,
    onClearFilters,
}: TaskFiltersProps) => {
    return (
        <div className="task-filters">
            <input
                type="text"
                placeholder="Buscar por tarefa, descrição ou arquivo..."
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

            <select
                value={sortOption}
                onChange={(event) =>
                    onSortChange(event.target.value as TaskSortOption)
                }
            >
                <option value="prioridade">Prioridade</option>
                <option value="mais-recentes">Mais recentes</option>
                <option value="mais-antigas">Mais antigas</option>
                <option value="ultimas-editadas">Últimas editadas</option>
                <option value="nome-az">Nome A-Z</option>
                <option value="nome-za">Nome Z-A</option>
            </select>

            <button type="button" onClick={onClearFilters}>
                Limpar filtros
            </button>
        </div>
    )
}