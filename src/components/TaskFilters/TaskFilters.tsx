import type { TaskPriority } from '../../types/task'

export type PriorityFilter = 'todas' | TaskPriority

export type TaskSortOption =
    | 'Filtros'
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
    onSortChange: (value: TaskSortOption) => void
    onClearFilters: () => void
}

export const TaskFilters = ({
    searchTerm,
    priorityFilter,
    sortOption,
    onSearchChange,
    onSortChange,
    onClearFilters,
}: TaskFiltersProps) => {
    const filtrosAtivos = [
        searchTerm.trim() !== '',
        priorityFilter !== 'todas',
        sortOption !== 'mais-recentes' && sortOption !== 'Filtros',
    ].filter(Boolean).length

    const hasActiveFilters = filtrosAtivos > 0

    return (
        <div className="task-filters">
            <label htmlFor="task-filter-search">Buscar tarefas</label>

            <input
                id="task-filter-search"
                type="text"
                placeholder="Buscar por tarefa, descrição ou arquivo..."
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                autoComplete="off"
            />

            <label htmlFor="task-filter-sort">Ordenar tarefas</label>

            <select
                id="task-filter-sort"
                value={sortOption}
                onChange={(event) =>
                    onSortChange(event.target.value as TaskSortOption)
                }
            >
                <option value="Filtros">Filtros</option>
                <option value="mais-recentes">Mais recentes</option>
                <option value="mais-antigas">Mais antigas</option>
                <option value="ultimas-editadas">Últimas editadas</option>
                <option value="nome-az">Nome A-Z</option>
                <option value="nome-za">Nome Z-A</option>
            </select>

            <div className="task-filters-actions">
                <button
                    type="button"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters}
                >
                    Limpar filtros
                </button>

                {hasActiveFilters && (
                    <span className="task-filters-badge">
                        {filtrosAtivos} ativo{filtrosAtivos > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        </div>
    )
}
