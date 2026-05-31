import React from 'react'
import type { Tag, TaskPriority } from '../../types/task'

export type PriorityFilter = 'todas' | TaskPriority

export type TaskSortOption =
    | 'Filtros'
    | 'mais-recentes'
    | 'mais-antigas'
    | 'ultimas-editadas'
    | 'nome-az'
    | 'nome-za'
    | 'vencimento'

interface TaskFiltersProps {
    searchTerm: string
    priorityFilter: PriorityFilter
    sortOption: TaskSortOption
    availableTags?: Tag[]
    selectedTagId?: string
    onSearchChange: (value: string) => void
    onSortChange: (value: TaskSortOption) => void
    onTagChange?: (value: string) => void
    onClearFilters: () => void
}

export const TaskFilters = React.memo(({
    searchTerm,
    priorityFilter,
    sortOption,
    availableTags = [],
    selectedTagId = 'todas',
    onSearchChange,
    onSortChange,
    onTagChange,
    onClearFilters,
}: TaskFiltersProps) => {
    const filtrosAtivos = [
        searchTerm.trim() !== '',
        priorityFilter !== 'todas',
        sortOption !== 'mais-recentes' && sortOption !== 'Filtros',
        selectedTagId !== 'todas',
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
                <option value="vencimento">Vencimento</option>
            </select>

            {availableTags.length > 0 && onTagChange && (
                <>
                    <label htmlFor="task-filter-tag">Filtrar por tag</label>

                    <select
                        id="task-filter-tag"
                        value={selectedTagId}
                        onChange={(event) => onTagChange(event.target.value)}
                    >
                        <option value="todas">Todas as tags</option>
                        {availableTags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.nome}
                            </option>
                        ))}
                    </select>
                </>
            )}

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
})
