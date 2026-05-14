import { apiRequest } from './api'

type ApiChecklistItem = {
    id: number
    task_id: number
    user_id: number
    title: string
    is_completed: number
    created_at: string
    updated_at: string | null
    completed_at: string | null
}

export type ChecklistItem = {
    id: string
    taskId: string
    title: string
    isCompleted: boolean
    createdAt: string
    updatedAt?: string
    completedAt?: string
}

const mapApiItem = (item: ApiChecklistItem): ChecklistItem => ({
    id: String(item.id),
    taskId: String(item.task_id),
    title: item.title,
    isCompleted: item.is_completed === 1,
    createdAt: new Date(item.created_at).toLocaleString('pt-BR'),
    updatedAt: item.updated_at
        ? new Date(item.updated_at).toLocaleString('pt-BR')
        : undefined,
    completedAt: item.completed_at
        ? new Date(item.completed_at).toLocaleString('pt-BR')
        : undefined,
})

type UpdateChecklistItemPayload = {
    title?: string
    is_completed?: boolean
}

export const checklistApi = {
    async listItems(taskId: string): Promise<ChecklistItem[]> {
        const items = await apiRequest<ApiChecklistItem[]>(
            `/tasks/${taskId}/checklist`
        )
        return items.map(mapApiItem)
    },

    async createItem(taskId: string, title: string): Promise<ChecklistItem> {
        const item = await apiRequest<ApiChecklistItem>(
            `/tasks/${taskId}/checklist`,
            { method: 'POST', body: { title } }
        )
        return mapApiItem(item)
    },

    async updateItem(
        taskId: string,
        itemId: string,
        data: UpdateChecklistItemPayload
    ): Promise<ChecklistItem> {
        const item = await apiRequest<ApiChecklistItem>(
            `/tasks/${taskId}/checklist/${itemId}`,
            { method: 'PATCH', body: data }
        )
        return mapApiItem(item)
    },

    async deleteItem(taskId: string, itemId: string): Promise<void> {
        await apiRequest<null>(`/tasks/${taskId}/checklist/${itemId}`, {
            method: 'DELETE',
        })
    },
}
