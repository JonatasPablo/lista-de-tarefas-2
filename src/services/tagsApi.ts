import { apiRequest } from './api'
import type { Tag } from '../types/task'

type ApiTag = {
    id: number
    user_id: number
    nome: string
    cor: string
    created_at: string
}

const mapApiTag = (t: ApiTag): Tag => ({
    id: String(t.id),
    nome: t.nome,
    cor: t.cor,
})

export const tagsApi = {
    async listTags(): Promise<Tag[]> {
        const tags = await apiRequest<ApiTag[]>('/tags')
        return tags.map(mapApiTag)
    },

    async createTag(payload: { nome: string; cor: string }): Promise<Tag> {
        const tag = await apiRequest<ApiTag>('/tags', {
            method: 'POST',
            body: payload,
        })
        return mapApiTag(tag)
    },

    async updateTag(
        tagId: string,
        payload: { nome: string; cor: string }
    ): Promise<Tag> {
        const tag = await apiRequest<ApiTag>(`/tags/${tagId}`, {
            method: 'PUT',
            body: payload,
        })
        return mapApiTag(tag)
    },

    async deleteTag(tagId: string): Promise<void> {
        await apiRequest<null>(`/tags/${tagId}`, { method: 'DELETE' })
    },

    async listTagsForTask(taskId: string): Promise<Tag[]> {
        const tags = await apiRequest<ApiTag[]>(`/tasks/${taskId}/tags`)
        return tags.map(mapApiTag)
    },

    async addTagToTask(taskId: string, tagId: string): Promise<void> {
        await apiRequest<null>(`/tasks/${taskId}/tags`, {
            method: 'POST',
            body: { tagId: Number(tagId) },
        })
    },

    async removeTagFromTask(taskId: string, tagId: string): Promise<void> {
        await apiRequest<null>(`/tasks/${taskId}/tags/${tagId}`, {
            method: 'DELETE',
        })
    },
}
