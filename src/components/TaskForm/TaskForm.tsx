import { useState } from 'react'
import type { TaskPriority } from '../../types/task'

interface TaskFormProps {
    onAddTask: (text: string, priority: TaskPriority) => void
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
    const [text, setText] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('alta')

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (!text.trim()) {
            return
        }

        onAddTask(text, priority)

        setText('')
        setPriority('alta')
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="taskInput">Descrição da Tarefa:</label>

            <input
                id="taskInput"
                type="text"
                placeholder="Adicionar tarefa"
                value={text}
                onChange={(event) => setText(event.target.value)}
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