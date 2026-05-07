import { API_URL, apiRequest } from './api'
import type { TaskFile } from '../types/task'

type ApiTaskFile = {
    id: number
    task_id: number
    user_id: number
    original_name: string
    stored_name: string
    display_name: string
    mime_type: string | null
    size_bytes: number
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

const mapApiTaskFileToTaskFile = (apiFile: ApiTaskFile): TaskFile => {
    return {
        id: String(apiFile.id),
        originalName: apiFile.original_name,
        displayName: apiFile.display_name,
        mimeType: apiFile.mime_type || 'application/octet-stream',
        sizeBytes: apiFile.size_bytes,
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
            body: formData,
        })

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response)

            throw new Error(errorMessage)
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

    getDownloadUrl(taskId: string, fileId: string) {
        return `${API_URL}/tasks/${taskId}/files/${fileId}/download`
    },
}