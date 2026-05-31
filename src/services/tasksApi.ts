import { apiRequest } from './api'
import {
    mapApiTaskFileToTaskFile,
    type ApiTaskFile,
} from './taskFilesApi'
import type { Tag, Task, TaskPriority } from '../types/task'

type ApiTaskStatus = 'pendente' | 'concluida' | 'cancelada' | 'arquivada'

type ApiTask = {
    id: number
    user_id: number
    title: string
    description: string | null
    priority: TaskPriority
    due_date: string | null
    due_time: string | null
    status: ApiTaskStatus
    created_at: string
    updated_at: string | null
    completed_at: string | null
    deleted_at: string | null
    files?: ApiTaskFile[]
    tags?: ApiTag[]
    checklist_total?: number
    checklist_concluidos?: number
}

type ApiTag = {
    id: number
    nome: string
    cor: string
}

type CreateTaskPayload = {
    title: string
    description: string
    priority: TaskPriority
    dueDate?: string | null
    dueTime?: string | null
}

type UpdateTaskPayload = {
    title: string
    description: string
    priority: TaskPriority
    dueDate?: string | null
    dueTime?: string | null
}

type ApiSearchResult = {
    id: number
    title: string
    status: ApiTaskStatus
    priority: TaskPriority
    created_at: string
}

export type SearchResult = {
    id: string
    title: string
    status: ApiTaskStatus
    priority: TaskPriority
    createdAt: string
}

const formatDateTime = (date: string | null) => {
    if (!date) {
        return undefined
    }

    return new Date(date).toLocaleString('pt-BR')
}

const parseDueDate = (value: string | null | undefined): string | null => {
    if (!value) return null
    // mysql2 retorna DATE como Date obj serializado em ISO — extrai só YYYY-MM-DD
    return String(value).substring(0, 10)
}

const parseDueTime = (value: string | null | undefined): string | null => {
    if (!value) return null
    return String(value).slice(0, 5)
}

const mapApiTagToTag = (tag: ApiTag): Tag => ({
    id: String(tag.id),
    nome: tag.nome,
    cor: tag.cor,
})

const mapApiTaskToTask = (apiTask: ApiTask): Task => {
    return {
        id: String(apiTask.id),
        title: apiTask.title,
        description: apiTask.description || '',
        priority: apiTask.priority,
        dueDate: parseDueDate(apiTask.due_date),
        dueTime: parseDueTime(apiTask.due_time),
        completed: apiTask.status === 'concluida',
        createdAt: formatDateTime(apiTask.created_at) || '',
        updatedAt: formatDateTime(apiTask.updated_at),
        completedAt: formatDateTime(apiTask.completed_at),
        tags: apiTask.tags?.map(mapApiTagToTag) || [],
        files: apiTask.files?.map(mapApiTaskFileToTaskFile) || [],
        checklistSummary:
            apiTask.checklist_total !== undefined
                ? {
                      total: Number(apiTask.checklist_total) || 0,
                      concluidos: Number(apiTask.checklist_concluidos) || 0,
                  }
                : undefined,
    }
}

export const tasksApi = {
    async listTasks() {
        const apiTasks = await apiRequest<ApiTask[]>('/tasks')

        return apiTasks.map(mapApiTaskToTask)
    },

    async createTask(payload: CreateTaskPayload) {
        const task = await apiRequest<ApiTask>('/tasks', {
            method: 'POST',
            body: payload,
        })

        return mapApiTaskToTask(task)
    },

    async updateTask(taskId: string, payload: UpdateTaskPayload) {
        const task = await apiRequest<ApiTask>(`/tasks/${taskId}`, {
            method: 'PUT',
            body: payload,
        })

        return mapApiTaskToTask(task)
    },

    async toggleTask(taskId: string) {
        const task = await apiRequest<ApiTask>(`/tasks/${taskId}/toggle`, {
            method: 'PATCH',
        })

        return mapApiTaskToTask(task)
    },

    async deleteTask(taskId: string) {
        await apiRequest<null>(`/tasks/${taskId}`, {
            method: 'DELETE',
        })
    },

    async bulkComplete(taskIds: string[]) {
        return apiRequest<{ message: string; completedCount: number }>(
            '/tasks/bulk-complete',
            {
                method: 'PATCH',
                body: { taskIds: taskIds.map(Number) },
            }
        )
    },

    async bulkDelete(taskIds: string[]) {
        return apiRequest<{ message: string; deletedCount: number }>(
            '/tasks/bulk-delete',
            {
                method: 'DELETE',
                body: { taskIds: taskIds.map(Number) },
            }
        )
    },

    async searchTasks(q: string, limit = 20): Promise<SearchResult[]> {
        const results = await apiRequest<ApiSearchResult[]>(
            `/tasks/search?q=${encodeURIComponent(q)}&limit=${limit}`
        )

        return results.map((r) => ({
            id: String(r.id),
            title: r.title,
            status: r.status,
            priority: r.priority,
            createdAt: formatDateTime(r.created_at) || '',
        }))
    },
}
