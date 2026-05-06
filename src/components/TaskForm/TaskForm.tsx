import { useState } from 'react'
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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (!title.trim()) {
            alert('O título da tarefa não pode ficar vazio.')
            return
        }

        onAddTask(title, description, priority)

        setTitle('')
        setDescription('')
        setPriority('alta')
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="taskTitle">Título da tarefa:</label>

            <input
                id="taskTitle"
                type="text"
                placeholder="Ex: Ajustar relatório de vendas"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
            />

            <label htmlFor="taskDescription">Descrição:</label>

            <textarea
                id="taskDescription"
                placeholder="Detalhes da tarefa..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
            />

            <select
                value={priority}
                onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                }
            >
                <option value="alta">Alta Prioridade</option>
                <option value="media">Média Prioridade</option>
                <option value="baixa">Baixa Prioridade</option>
            </select>

            <button type="submit">Adicionar</button>
        </form>
    )
}