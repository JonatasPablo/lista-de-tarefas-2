export type TaskPriority = 'alta' | 'media' | 'baixa'

export interface TaskFile {
    id: string
    originalName: string
    displayName: string
    mimeType: string
    sizeBytes: number
    createdAt: string
}

export interface Task {
    id: string
    text: string
    priority: TaskPriority
    completed: boolean
    createdAt: string
    updatedAt?: string
    files: TaskFile[]
}