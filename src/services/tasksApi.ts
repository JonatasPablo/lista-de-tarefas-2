import { apiRequest } from './api'
import {
    mapApiTaskFileToTaskFile,
    type ApiTaskFile,
} from './taskFilesApi'
import type { Task, TaskPriority } from '../types/task'

type ApiTaskStatus = 'pendente' | 'concluida' | 'cancelada' | 'arquivada'

type ApiTask = {
    id: number
    user_id: number
    title: string
    description: string | null
    priority: TaskPriority
    status: ApiTaskStatus
    created_at: string
    updated_at: string | null
    completed_at: string | null
    deleted_at: string | null
    files?: ApiTaskFile[]
}

type CreateTaskPayload = {
    title: string
    description: string
    priority: TaskPriority
}

type UpdateTaskPayload = {
    title: string
    description: string
    priority: TaskPriority
}

const formatDateTime = (date: string | null) => {
    if (!date) {
        return undefined
    }

    return new Date(date).toLocaleString('pt-BR')
}

const mapApiTaskToTask = (apiTask: ApiTask): Task => {
    return {
        id: String(apiTask.id),
        title: apiTask.title,
        description: apiTask.description || '',
        priority: apiTask.priority,
        completed: apiTask.status === 'concluida',
        createdAt: formatDateTime(apiTask.created_at) || '',
        updatedAt: formatDateTime(apiTask.updated_at),
        completedAt: formatDateTime(apiTask.completed_at),
        files: apiTask.files?.map(mapApiTaskFileToTaskFile) || [],
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
}
