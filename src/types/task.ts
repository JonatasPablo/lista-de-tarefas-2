export type TaskPriority = 'alta' | 'media' | 'baixa'

export interface Task {
    id: string
    text: string
    priority: TaskPriority
    completed: boolean
    createdAt: string
    updatedAt?: string
}