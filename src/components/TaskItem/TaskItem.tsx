import { useState } from 'react'
import type { Task, TaskPriority } from '../../types/task'

interface TaskItemProps {
    task: Task
    onToggleTask: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onUpdateTask: (
        taskId: string,
        text: string,
        priority: TaskPriority
    ) => void
}

export const TaskItem = ({
    task,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
}: TaskItemProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(task.text)
    const [editedPriority, setEditedPriority] = useState<TaskPriority>(
        task.priority
    )

    const handleSave = () => {
        if (!editedText.trim()) {
            return
        }

        onUpdateTask(task.id, editedText, editedPriority)
        setIsEditing(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSave()
        }
    }

    return (
        <li
            className={`task-item ${task.completed ? 'completed' : ''}`}
            data-priority={task.priority}
        >
            {isEditing ? (
                <div className="task-edit">
                    <input
                        type="text"
                        value={editedText}
                        onChange={(event) =>
                            setEditedText(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                    <select
                        value={editedPriority}
                        onChange={(event) =>
                            setEditedPriority(
                                event.target.value as TaskPriority
                            )
                        }
                    >
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                    </select>

                    <button type="button" onClick={handleSave}>
                        Salvar
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <>
                    <label>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleTask(task.id)}
                        />

                        <span>
                            {task.text} - Criada em: {task.createdAt} -
                            Prioridade:{' '}
                            {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            {task.updatedAt &&
                                ` - Editada em: ${task.updatedAt}`}
                        </span>
                    </label>

                    <div className="task-actions">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                        >
                            Excluir
                        </button>
                    </div>
                </>
            )}
        </li>
    )
}