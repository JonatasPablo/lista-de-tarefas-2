export type TaskPriority = 'alta' | 'media' | 'baixa'

export interface Tag {
    id: string
    nome: string
    cor: string
}

export interface TaskFile {
    id: string
    originalName: string
    displayName: string
    mimeType: string
    sizeBytes: number
    hasThumbnail?: boolean
    thumbnailMimeType?: string | null
    thumbnailSizeBytes?: number | null
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
    dueDate?: string | null
    completed: boolean
    createdAt: string
    updatedAt?: string
    completedAt?: string
    files: TaskFile[]
    checklistSummary?: ChecklistSummary
}
