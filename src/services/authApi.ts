import { apiRequest } from './api'

export type AuthUser = {
    id: number
    name: string
    email: string
    provider: string
    role: 'user' | 'master'
    created_at: string
    updated_at: string | null
}

type AuthResponse = {
    user: AuthUser
}

type LoginPayload = {
    email: string
    password: string
}

type RegisterPayload = {
    name: string
    email: string
    password: string
}

export const authApi = {
    async register(payload: RegisterPayload) {
        return apiRequest<AuthResponse>('/auth/register', {
            method: 'POST',
            body: payload,
            auth: false,
        })
    },

    async login(payload: LoginPayload) {
        return apiRequest<AuthResponse>('/auth/login', {
            method: 'POST',
            body: payload,
            auth: false,
        })
    },

    async logout() {
        return apiRequest<null>('/auth/logout', {
            method: 'POST',
        })
    },

    async me() {
        return apiRequest<AuthUser>('/auth/me')
    },
}