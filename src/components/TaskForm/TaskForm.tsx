import { useState, type SyntheticEvent } from 'react'
import type { TaskPriority } from '../../types/task'

interface TaskFormProps {
    onAddTask: (
        title: string,
        description: string,
        priority: TaskPriority,
        dueDate?: string | null
    ) => Promise<boolean> | void
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('alta')
    const [dueDate, setDueDate] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()
    const canSubmit = normalizedTitle.length > 0 && !isSubmitting

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) return

        setIsSubmitting(true)

        try {
            const sucesso = await onAddTask(
                normalizedTitle,
                normalizedDescription,
                priority,
                dueDate || null
            )

            if (sucesso !== false) {
                setTitle('')
                setDescription('')
                setPriority('alta')
                setDueDate('')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="task-form-title">Título da tarefa</label>

            <input
                id="task-form-title"
                type="text"
                placeholder="Ex: Ajustar relatório de vendas"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                autoComplete="off"
                disabled={isSubmitting}
            />

            <label htmlFor="task-form-description">Descrição</label>

            <textarea
                id="task-form-description"
                placeholder="Detalhes da tarefa..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={600}
                disabled={isSubmitting}
            />

            <label htmlFor="task-form-priority">Prioridade</label>

            <select
                id="task-form-priority"
                value={priority}
                onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                }
                disabled={isSubmitting}
            >
                <option value="alta">Alta prioridade</option>
                <option value="media">Média prioridade</option>
                <option value="baixa">Baixa prioridade</option>
            </select>

            <div className="task-form-field">
                <label htmlFor="task-due-date">
                    Vencimento <span className="task-form-field-optional">(opcional)</span>
                </label>
                <div className="task-form-date-wrapper">
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDueDate(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {dueDate && (
                        <button
                            type="button"
                            className="task-form-date-clear"
                            onClick={() => setDueDate('')}
                            aria-label="Remover data de vencimento"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
        </form>
    )
}
