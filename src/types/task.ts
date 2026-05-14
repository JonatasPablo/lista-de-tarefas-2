export type TaskPriority = 'alta' | 'media' | 'baixa'

export interface TaskFile {
    id: string
    originalName: string
    displayName: string
    mimeType: string
    sizeBytes: number
    createdAt: string
}

export interface ChecklistSummary {
    total: number
    concluidos: number
}

export interface Task {
    id: string
    title: string
    description?: string
    text?: string
    priority: TaskPriority
    completed: boolean
    createdAt: string
    updatedAt?: string
    completedAt?: string
    files: TaskFile[]
    checklistSummary?: ChecklistSummary
}