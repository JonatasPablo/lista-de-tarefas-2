import { useState, type SyntheticEvent } from 'react'
import type { TaskPriority } from '../../types/task'

interface TaskFormProps {
    onAddTask: (
        title: string,
        description: string,
        priority: TaskPriority
    ) => void
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('alta')

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()
    const canSubmit = normalizedTitle.length > 0

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) return

        onAddTask(normalizedTitle, normalizedDescription, priority)

        setTitle('')
        setDescription('')
        setPriority('alta')
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="task-form-title">Titulo da tarefa</label>

            <input
                id="task-form-title"
                type="text"
                placeholder="Ex: Ajustar relatorio de vendas"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                autoComplete="off"
            />

            <label htmlFor="task-form-description">Descricao</label>

            <textarea
                id="task-form-description"
                placeholder="Detalhes da tarefa..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={600}
            />

            <label htmlFor="task-form-priority">Prioridade</label>

            <select
                id="task-form-priority"
                value={priority}
                onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                }
            >
                <option value="alta">Alta prioridade</option>
                <option value="media">Media prioridade</option>
                <option value="baixa">Baixa prioridade</option>
            </select>

            <button type="submit" disabled={!canSubmit}>
                Adicionar
            </button>
        </form>
    )
}
