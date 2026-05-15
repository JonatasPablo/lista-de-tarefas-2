import { apiRequest } from './api'

export type AuthUser = {
    id: number
    name: string
    email: string
    provider: string
    role: 'user' | 'master'
    has_password?: boolean
    has_avatar?: boolean
    avatar_updated_at?: string | null
    email_verified_at?: string | null
    terms_accepted_at?: string | null
    terms_version?: string | null
    privacy_policy_accepted_at?: string | null
    privacy_policy_version?: string | null
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

type LoginGooglePayload = {
    credential: string
    termsAccepted?: boolean
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

type SolicitarRedefinicaoSenhaPayload = {
    email: string
}

type ValidarCodigoRedefinicaoSenhaPayload = {
    email: string
    code: string
}

type RedefinirSenhaPayload = {
    email: string
    code: string
    password: string
}

type EmailConfirmationStatusResponse = {
    confirmed: boolean
}

type SolicitarRedefinicaoSenhaResponse = {
    message: string
    action?: 'confirm_email' | 'reset_password'
}

type AuthConfigResponse = {
    googleLoginEnabled: boolean
}

export const authApi = {
    async getConfig() {
        return apiRequest<AuthConfigResponse>('/auth/config')
    },

    async register(payload: RegisterPayload) {
        return apiRequest<AuthResponse>('/auth/register', {
            method: 'POST',
            body: payload,
        })
    },

    async confirmEmail(payload: ConfirmEmailPayload) {
        return apiRequest<AuthResponse>('/auth/confirm-email', {
            method: 'POST',
            body: payload,
        })
    },

    async resendConfirmation(payload: ResendConfirmationPayload) {
        return apiRequest<{ message: string }>('/auth/resend-confirmation', {
            method: 'POST',
            body: payload,
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
            }
        )
    },

    async solicitarRedefinicaoSenha(payload: SolicitarRedefinicaoSenhaPayload) {
        return apiRequest<SolicitarRedefinicaoSenhaResponse>(
            '/auth/forgot-password',
            {
                method: 'POST',
                body: payload,
            }
        )
    },

    async validarCodigoRedefinicaoSenha(
        payload: ValidarCodigoRedefinicaoSenhaPayload
    ) {
        return apiRequest<{ message: string }>(
            '/auth/validate-password-reset-code',
            {
                method: 'POST',
                body: payload,
            }
        )
    },

    async redefinirSenha(payload: RedefinirSenhaPayload) {
        return apiRequest<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: payload,
        })
    },

    async login(payload: LoginPayload) {
        return apiRequest<AuthResponse>('/auth/login', {
            method: 'POST',
            body: payload,
        })
    },

    async loginGoogle(payload: LoginGooglePayload) {
        return apiRequest<AuthResponse>('/auth/google', {
            method: 'POST',
            body: payload,
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
