import { API_URL, apiRequest } from './api'
import type { AuthUser } from './authApi'

type AtualizarNomePayload = {
    name: string
}

type AlterarSenhaPayload = {
    currentPassword: string
    newPassword: string
}

type AtualizarNomeResponse = {
    user: AuthUser
    message: string
}

type AlterarSenhaResponse = {
    message: string
}

export const usuariosApi = {
    getAvatarUrl(user: AuthUser) {
        if (!user.has_avatar) {
            return null
        }

        const cacheKey =
            user.avatar_updated_at ||
            user.updated_at ||
            String(user.id)

        return `${API_URL}/users/me/avatar?v=${encodeURIComponent(cacheKey)}`
    },

    async atualizarNome(payload: AtualizarNomePayload) {
        return apiRequest<AtualizarNomeResponse>('/users/me', {
            method: 'PATCH',
            body: payload,
        })
    },

    async alterarSenha(payload: AlterarSenhaPayload) {
        return apiRequest<AlterarSenhaResponse>('/users/me/password', {
            method: 'PATCH',
            body: payload,
        })
    },

    async removerAvatar() {
        return apiRequest<AtualizarNomeResponse>('/users/me/avatar', {
            method: 'DELETE',
        })
    },

    async enviarAvatar(file: File) {
        const formData = new FormData()

        formData.append('avatar', file)

        const response = await fetch(`${API_URL}/users/me/avatar`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        if (!response.ok) {
            let errorMessage = `Erro na requisição: ${response.status}`

            try {
                const data = await response.json()

                if (data?.message) {
                    errorMessage = data.message
                }
            } catch {
                const text = await response.text().catch(() => '')

                if (text) {
                    errorMessage = text
                }
            }

            throw new Error(errorMessage)
        }

        return response.json() as Promise<AtualizarNomeResponse>
    },
}
