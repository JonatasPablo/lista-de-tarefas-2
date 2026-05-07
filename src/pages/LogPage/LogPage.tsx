import { useEffect, useState } from 'react'

type TaskHistory = {
    id: number
    task_id: number
    user_id: number
    action: string
    old_value: string | null
    new_value: string | null
    created_at: string
    task_title: string
}

const actionLabels: Record<string, string> = {
    created: 'Criada',
    updated: 'Editada',
    status_changed: 'Status alterado',
    deleted: 'Excluída',
}

export function LogPage() {
    const [history, setHistory] = useState<TaskHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await fetch('http://localhost:3001/tasks/history')
                const data = await response.json()

                setHistory(data)
            } catch (error) {
                console.error('Erro ao carregar log:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadHistory()
    }, [])

    if (isLoading) {
        return <p>Carregando log...</p>
    }

    return (
        <main>
            <h1>Log de tarefas</h1>

            {history.length === 0 ? (
                <p>Nenhum log encontrado.</p>
            ) : (
                <section>
                    {history.map((item) => (
                        <article key={item.id}>
                            <h2>{item.task_title}</h2>

                            <p>
                                <strong>Ação:</strong>{' '}
                                {actionLabels[item.action] || item.action}
                            </p>

                            <p>
                                <strong>Valor anterior:</strong>{' '}
                                {item.old_value || 'Nenhum'}
                            </p>

                            <p>
                                <strong>Novo valor:</strong>{' '}
                                {item.new_value || 'Nenhum'}
                            </p>

                            <p>
                                <strong>Data:</strong>{' '}
                                {new Date(item.created_at).toLocaleString(
                                    'pt-BR'
                                )}
                            </p>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}