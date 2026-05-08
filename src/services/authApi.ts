import { apiRequest } from './api'

export type AuthUser = {
    id: number
    name: string
    email: string
    provider: string
    role: 'user' | 'master'
    email_verified_at?: string | null
    terms_accepted_at?: string | null
    terms_version?: string | null
    created_at: string
    updated_at: string | null
}

type AuthResponse = {
    user: AuthUser
    message?: string
}

type LoginPayload = {
    email: string
    password: string
}

type RegisterPayload = {
    name: string
    email: string
    password: string
    termsAccepted: boolean
}

type ConfirmEmailPayload = {
    email: string
    code: string
}

type ResendConfirmationPayload = {
    email: string
}

type EmailConfirmationStatusPayload = {
    email: string
}

type EmailConfirmationStatusResponse = {
    confirmed: boolean
}

export const authApi = {
    async register(payload: RegisterPayload) {
        return apiRequest<AuthResponse>('/auth/register', {
            method: 'POST',
            body: payload,
            auth: false,
        })
    },

    async confirmEmail(payload: ConfirmEmailPayload) {
        return apiRequest<AuthResponse>('/auth/confirm-email', {
            method: 'POST',
            body: payload,
            auth: false,
        })
    },

    async resendConfirmation(payload: ResendConfirmationPayload) {
        return apiRequest<{ message: string }>('/auth/resend-confirmation', {
            method: 'POST',
            body: payload,
            auth: false,
        })
    },

    async getEmailConfirmationStatus(
        payload: EmailConfirmationStatusPayload
    ) {
        return apiRequest<EmailConfirmationStatusResponse>(
            '/auth/email-confirmation-status',
            {
                method: 'POST',
                body: payload,
                auth: false,
            }
        )
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