import { apiRequest } from './api'

// ---------------------------------------------------------------
// Tipos da API (snake_case vindos do backend)
// ---------------------------------------------------------------

type ApiChecklistItem = {
    id: number
    task_id: number
    user_id: number
    group_id: number | null
    title: string
    is_completed: number
    created_at: string
    updated_at: string | null
    completed_at: string | null
}

type ApiChecklistGroup = {
    id: number
    task_id: number
    user_id: number
    title: string
    position: number
    created_at: string
    updated_at: string | null
    items: ApiChecklistItem[]
}

// ---------------------------------------------------------------
// Tipos públicos da aplicação (camelCase)
// ---------------------------------------------------------------

export type ChecklistItem = {
    id: string
    taskId: string
    groupId: string | null
    title: string
    isCompleted: boolean
    createdAt: string
    updatedAt?: string
    completedAt?: string
}

export type ChecklistGroup = {
    id: string
    taskId: string
    title: string
    position: number
    createdAt: string
    updatedAt?: string
    items: ChecklistItem[]
}

// ---------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------

const mapItem = (item: ApiChecklistItem): ChecklistItem => ({
    id: String(item.id),
    taskId: String(item.task_id),
    groupId: item.group_id != null ? String(item.group_id) : null,
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

const mapGroup = (group: ApiChecklistGroup): ChecklistGroup => ({
    id: String(group.id),
    taskId: String(group.task_id),
    title: group.title,
    position: group.position,
    createdAt: new Date(group.created_at).toLocaleString('pt-BR'),
    updatedAt: group.updated_at
        ? new Date(group.updated_at).toLocaleString('pt-BR')
        : undefined,
    items: group.items.map(mapItem),
})

// ---------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------

type UpdateItemPayload = {
    title?: string
    is_completed?: boolean
}

// ---------------------------------------------------------------
// API
// ---------------------------------------------------------------

export const checklistApi = {
    // Grupos
    async listGroups(taskId: string): Promise<ChecklistGroup[]> {
        const groups = await apiRequest<ApiChecklistGroup[]>(
            `/tasks/${taskId}/checklist/groups`
        )
        return groups.map(mapGroup)
    },

    async createGroup(taskId: string, title: string): Promise<ChecklistGroup> {
        const group = await apiRequest<ApiChecklistGroup>(
            `/tasks/${taskId}/checklist/groups`,
            { method: 'POST', body: { title } }
        )
        return mapGroup(group)
    },

    async updateGroup(taskId: string, groupId: string, title: string): Promise<ChecklistGroup> {
        const group = await apiRequest<ApiChecklistGroup>(
            `/tasks/${taskId}/checklist/groups/${groupId}`,
            { method: 'PATCH', body: { title } }
        )
        return { ...mapGroup(group), items: [] }
    },

    async deleteGroup(taskId: string, groupId: string): Promise<void> {
        await apiRequest<null>(
            `/tasks/${taskId}/checklist/groups/${groupId}`,
            { method: 'DELETE' }
        )
    },

    // Itens
    async createItem(taskId: string, groupId: string, title: string): Promise<ChecklistItem> {
        const item = await apiRequest<ApiChecklistItem>(
            `/tasks/${taskId}/checklist/groups/${groupId}/items`,
            { method: 'POST', body: { title } }
        )
        return mapItem(item)
    },

    async updateItem(
        taskId: string,
        itemId: string,
        data: UpdateItemPayload
    ): Promise<ChecklistItem> {
        const item = await apiRequest<ApiChecklistItem>(
            `/tasks/${taskId}/checklist/${itemId}`,
            { method: 'PATCH', body: data }
        )
        return mapItem(item)
    },

    async deleteItem(taskId: string, itemId: string): Promise<void> {
        await apiRequest<null>(`/tasks/${taskId}/checklist/${itemId}`, {
            method: 'DELETE',
        })
    },
}
