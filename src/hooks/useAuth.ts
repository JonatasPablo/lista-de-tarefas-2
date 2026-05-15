import { useEffect, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { ApiError } from '../services/api'
import { authApi, type AuthUser } from '../services/authApi'
import type { ToastType } from '../components/Toast/Toast'

type ShowToast = (type: ToastType, message: string) => void

const AUTH_ME_BACKOFF_MS = 30000
let authMeBackoffUntil = 0

interface UseAuthOptions {
    isGoogleLoginConfigured: boolean
    navigate: NavigateFunction
    showToast: ShowToast
}

export const useAuth = ({
    isGoogleLoginConfigured,
    navigate,
    showToast,
}: UseAuthOptions) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    const isGoogleLoginAvailable = isGoogleLoginConfigured

    const handleLogin = async (email: string, password: string) => {
        try {
            const response = await authApi.login({
                email,
                password,
            })

            setUser(response.user)
            showToast('success', 'Login realizado com sucesso.')
            navigate('/')
        } catch (error) {
            console.error('Erro ao fazer login:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel fazer login.'

            showToast('error', message)

            if (message.toLowerCase().includes('confirme seu e-mail')) {
                navigate('/confirmar-email', {
                    state: {
                        email,
                    },
                })
            }
        }
    }

    const handleLoginGoogle = async (
        credential: string,
        termsAccepted?: boolean
    ) => {
        try {
            const response = await authApi.loginGoogle({
                credential,
                termsAccepted,
            })

            setUser(response.user)
            showToast('success', 'Login com Google realizado com sucesso.')
            navigate('/')
        } catch (error) {
            console.error('Erro ao fazer login com Google:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel entrar com Google.'

            showToast('error', message)
        }
    }

    const handleRegister = async (
        name: string,
        email: string,
        password: string,
        termsAccepted: boolean
    ) => {
        try {
            const response = await authApi.register({
                name,
                email,
                password,
                termsAccepted,
            })

            showToast(
                'success',
                response.message ||
                    'Cadastro criado com sucesso. Verifique seu e-mail para confirmar a conta.'
            )

            navigate('/confirmar-email', {
                state: {
                    email,
                },
            })
        } catch (error) {
            console.error('Erro ao criar cadastro:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel criar o cadastro.'

            showToast('error', message)
        }
    }

    const handleConfirmEmail = async (email: string, code: string) => {
        try {
            const response = await authApi.confirmEmail({
                email,
                code,
            })

            showToast(
                'success',
                response.message ||
                    'E-mail confirmado com sucesso. Agora voce ja pode entrar.'
            )
        } catch (error) {
            console.error('Erro ao confirmar e-mail:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel confirmar o e-mail.'

            showToast('error', message)

            throw error
        }
    }

    const handleResendConfirmation = async (email: string) => {
        try {
            const response = await authApi.resendConfirmation({
                email,
            })

            showToast(
                'success',
                response.message ||
                    'Enviamos um novo codigo de confirmacao para seu e-mail.'
            )
        } catch (error) {
            console.error('Erro ao reenviar codigo:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel reenviar o codigo.'

            showToast('error', message)
        }
    }

    const handleCheckEmailConfirmationStatus = async (email: string) => {
        const response = await authApi.getEmailConfirmationStatus({
            email,
        })

        return response.confirmed
    }

    const handleSolicitarRedefinicaoSenha = async (email: string) => {
        try {
            const response = await authApi.solicitarRedefinicaoSenha({
                email,
            })

            showToast(
                'success',
                response.message ||
                    'Enviamos um codigo de redefinicao para o seu e-mail.'
            )

            if (response.action === 'confirm_email') {
                navigate('/confirmar-email', {
                    state: {
                        email,
                    },
                })
            }

            return response
        } catch (error) {
            console.error('Erro ao solicitar redefinicao de senha:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel solicitar a redefinicao de senha.'

            showToast('error', message)

            throw error
        }
    }

    const handleValidarCodigoRedefinicaoSenha = async (
        email: string,
        code: string
    ) => {
        try {
            const response = await authApi.validarCodigoRedefinicaoSenha({
                email,
                code,
            })

            showToast(
                'success',
                response.message || 'Codigo validado com sucesso.'
            )
        } catch (error) {
            console.error('Erro ao validar codigo de redefinicao:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel validar o codigo.'

            showToast('error', message)

            throw error
        }
    }

    const handleRedefinirSenha = async (
        email: string,
        code: string,
        password: string
    ) => {
        try {
            const response = await authApi.redefinirSenha({
                email,
                code,
                password,
            })

            showToast(
                'success',
                response.message ||
                    'Senha redefinida com sucesso. Entre usando sua nova senha.'
            )

            navigate('/login')
        } catch (error) {
            console.error('Erro ao redefinir senha:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel redefinir a senha.'

            showToast('error', message)

            throw error
        }
    }

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Erro ao encerrar sessao:', error)
        } finally {
            setUser(null)
            showToast('info', 'Voce saiu do sistema.')
            navigate('/login')
        }
    }

    const atualizarUsuarioLogado = (usuarioAtualizado: AuthUser) => {
        setUser(usuarioAtualizado)
    }

    useEffect(() => {
        let isMounted = true

        const checkAuth = async () => {
            if (Date.now() < authMeBackoffUntil) {
                if (isMounted) {
                    setUser(null)
                    setIsCheckingAuth(false)
                }
                return
            }

            try {
                const authenticatedUser = await authApi.me()

                if (isMounted) {
                    setUser(authenticatedUser)
                }
            } catch (error) {
                if (error instanceof ApiError && error.status === 429) {
                    authMeBackoffUntil = Date.now() + AUTH_ME_BACKOFF_MS
                    showToast(
                        'warning',
                        'Muitas validacoes de sessao. Aguarde alguns instantes.'
                    )
                }

                if (isMounted) {
                    setUser(null)
                }
            } finally {
                if (isMounted) {
                    setIsCheckingAuth(false)
                }
            }
        }

        checkAuth()

        return () => {
            isMounted = false
        }
    }, [showToast])

    return {
        user,
        isCheckingAuth,
        isGoogleLoginAvailable,
        handleLogin,
        handleLoginGoogle,
        handleRegister,
        handleConfirmEmail,
        handleResendConfirmation,
        handleCheckEmailConfirmationStatus,
        handleSolicitarRedefinicaoSenha,
        handleValidarCodigoRedefinicaoSenha,
        handleRedefinirSenha,
        handleLogout,
        atualizarUsuarioLogado,
    }
}
