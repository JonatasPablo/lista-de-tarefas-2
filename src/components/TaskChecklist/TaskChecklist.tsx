import type { KeyboardEvent } from 'react'
import { useChecklist } from '../../hooks/useChecklist'
import './TaskChecklist.css'

interface TaskChecklistProps {
    taskId: string
    isTaskCompleted: boolean
    expanded: boolean
}

export const TaskChecklist = ({
    taskId,
    isTaskCompleted,
    expanded,
}: TaskChecklistProps) => {
    const {
        items,
        isLoading,
        newItemTitle,
        setNewItemTitle,
        editingItemId,
        editingTitle,
        setEditingTitle,
        addItem,
        toggleItem,
        startEditing,
        cancelEditing,
        saveEditing,
        deleteItem,
        completedCount,
        totalCount,
    } = useChecklist(taskId, isTaskCompleted, expanded)

    const handleAddKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            addItem()
        }
    }

    const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            saveEditing()
        }

        if (event.key === 'Escape') {
            cancelEditing()
        }
    }

    if (isLoading) {
        return <div className="checklist-loading">Carregando checklist...</div>
    }

    return (
        <div className="task-checklist">
            {totalCount > 0 && (
                <p className="checklist-progress">
                    {completedCount}/{totalCount}{' '}
                    {totalCount === 1 ? 'item concluído' : 'itens concluídos'}
                </p>
            )}

            {items.length > 0 && (
                <ul className="checklist-list">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={`checklist-item ${item.isCompleted ? 'is-completed' : ''}`}
                        >
                            {editingItemId === item.id ? (
                                <div className="checklist-item-edit">
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) =>
                                            setEditingTitle(e.target.value)
                                        }
                                        onKeyDown={handleEditKeyDown}
                                        autoFocus
                                        aria-label="Editar item da checklist"
                                    />
                                    <button
                                        type="button"
                                        onClick={saveEditing}
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <label className="checklist-item-label">
                                        <input
                                            type="checkbox"
                                            checked={item.isCompleted}
                                            disabled={isTaskCompleted}
                                            onChange={() =>
                                                toggleItem(item.id)
                                            }
                                            aria-label={`Marcar "${item.title}"`}
                                        />
                                        <span>{item.title}</span>
                                    </label>

                                    {!isTaskCompleted && (
                                        <div className="checklist-item-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEditing(item)
                                                }
                                                title="Editar item"
                                                aria-label="Editar item"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteItem(item.id)
                                                }
                                                title="Excluir item"
                                                aria-label="Excluir item"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {!isTaskCompleted && (
                <div className="checklist-add">
                    <input
                        type="text"
                        placeholder="Novo item da checklist"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                        aria-label="Novo item da checklist"
                    />
                    <button
                        type="button"
                        onClick={addItem}
                        disabled={!newItemTitle.trim()}
                    >
                        Adicionar
                    </button>
                </div>
            )}
        </div>
    )
}
