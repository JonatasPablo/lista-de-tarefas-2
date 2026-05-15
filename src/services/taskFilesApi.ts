import { API_URL, ApiError, apiRequest } from './api'
import type { TaskFile } from '../types/task'

export type ApiTaskFile = {
    id: number
    task_id: number
    user_id: number
    original_name: string
    stored_name: string
    display_name: string
    mime_type: string | null
    size_bytes: number
    thumbnail_mime_type?: string | null
    thumbnail_size_bytes?: number | null
    has_thumbnail?: boolean
    created_at: string
    updated_at: string | null
    deleted_at: string | null
}

const formatDateTime = (date: string | null) => {
    if (!date) {
        return undefined
    }

    return new Date(date).toLocaleString('pt-BR')
}

const getErrorMessage = async (response: Response) => {
    try {
        const data = await response.json()

        if (data?.message) {
            return data.message
        }
    } catch {
        return `Erro na requisição: ${response.status}`
    }

    return `Erro na requisição: ${response.status}`
}

export const mapApiTaskFileToTaskFile = (apiFile: ApiTaskFile): TaskFile => {
    return {
        id: String(apiFile.id),
        originalName: apiFile.original_name,
        displayName: apiFile.display_name,
        mimeType: apiFile.mime_type || 'application/octet-stream',
        sizeBytes: apiFile.size_bytes,
        hasThumbnail: Boolean(apiFile.has_thumbnail),
        thumbnailMimeType: apiFile.thumbnail_mime_type || null,
        thumbnailSizeBytes: apiFile.thumbnail_size_bytes || null,
        createdAt: formatDateTime(apiFile.created_at) || '',
    }
}

export const taskFilesApi = {
    async listTaskFiles(taskId: string) {
        const files = await apiRequest<ApiTaskFile[]>(`/tasks/${taskId}/files`)

        return files.map(mapApiTaskFileToTaskFile)
    },

    async uploadTaskFile(taskId: string, file: File) {
        const formData = new FormData()

        formData.append('file', file)

        const response = await fetch(`${API_URL}/tasks/${taskId}/files`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response)

            throw new ApiError(response.status, errorMessage)
        }

        const uploadedFile = (await response.json()) as ApiTaskFile

        return mapApiTaskFileToTaskFile(uploadedFile)
    },

    async renameTaskFile(
        taskId: string,
        fileId: string,
        displayName: string
    ) {
        const file = await apiRequest<ApiTaskFile>(
            `/tasks/${taskId}/files/${fileId}`,
            {
                method: 'PATCH',
                body: {
                    displayName,
                },
            }
        )

        return mapApiTaskFileToTaskFile(file)
    },

    async deleteTaskFile(taskId: string, fileId: string) {
        await apiRequest<null>(`/tasks/${taskId}/files/${fileId}`, {
            method: 'DELETE',
        })
    },

    async getImagePreviewBlob(taskId: string, fileId: string): Promise<string> {
        const response = await fetch(
            `${API_URL}/tasks/${taskId}/files/${fileId}/download`,
            { method: 'GET', credentials: 'include' }
        )

        if (!response.ok) {
            throw new Error(`Erro ao carregar imagem: ${response.status}`)
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
    },

    async getImageThumbnailBlob(
        taskId: string,
        fileId: string
    ): Promise<string> {
        const response = await fetch(
            `${API_URL}/tasks/${taskId}/files/${fileId}/thumbnail`,
            { method: 'GET', credentials: 'include' }
        )

        if (!response.ok) {
            throw new Error(`Erro ao carregar miniatura: ${response.status}`)
        }

        const blob = await response.blob()
        return URL.createObjectURL(blob)
    },

    async downloadTaskFile(taskId: string, file: TaskFile) {
        const response = await fetch(
            `${API_URL}/tasks/${taskId}/files/${file.id}/download`,
            {
                method: 'GET',
                credentials: 'include',
            }
        )

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response)

            throw new Error(errorMessage)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = file.displayName
        link.click()

        URL.revokeObjectURL(url)
    },
}
