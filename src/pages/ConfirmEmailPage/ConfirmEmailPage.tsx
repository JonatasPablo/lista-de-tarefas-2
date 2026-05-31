import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type SyntheticEvent,
} from 'react'
import {
    Link,
    useLocation,
    useNavigate,
    useSearchParams,
} from 'react-router-dom'
import { AuthHeroPanel } from '../../components/AuthHeroPanel/AuthHeroPanel'

import './ConfirmEmailPage.css'

type ConfirmEmailLocationState = {
    email?: string
}

interface ConfirmEmailPageProps {
    onConfirmEmail: (email: string, code: string) => Promise<void>
    onResendConfirmation: (email: string) => Promise<void>
    onCheckEmailConfirmationStatus: (email: string) => Promise<boolean>
    isDark: boolean
    onToggleTheme: () => void
}

const EMAIL_CONFIRMED_STORAGE_KEY = 'lista_tarefas_email_confirmed_at'
const EMAIL_CONFIRMATION_CHECK_INTERVAL_MS = 10000

const maskEmail = (email: string) => {
    const normalizedEmail = email.trim()

    if (!normalizedEmail.includes('@')) {
        return ''
    }

    const [localPart, domain] = normalizedEmail.split('@')

    if (!localPart || !domain) {
        return ''
    }

    const visibleStart = localPart.slice(0, Math.min(4, localPart.length))
    const maskedLength = Math.max(localPart.length - visibleStart.length, 4)
    const maskedLocalPart = `${visibleStart}${'*'.repeat(maskedLength)}`

    return `${maskedLocalPart}@${domain}`
}

export const ConfirmEmailPage = ({
    onConfirmEmail,
    onResendConfirmation,
    onCheckEmailConfirmationStatus,
    isDark,
    onToggleTheme,
}: ConfirmEmailPageProps) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const confirmationIntervalRef = useRef<number | null>(null)

    const locationState = location.state as ConfirmEmailLocationState | null

    const initialEmail =
        locationState?.email || searchParams.get('email') || ''

    const [email] = useState(initialEmail)
    const [code, setCode] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false)

    const maskedEmail = useMemo(() => maskEmail(email), [email])

    const normalizedCode = code.trim().toUpperCase()
    const hasEmail = email.trim() !== ''
    const canSubmit = hasEmail && normalizedCode.length === 6

    const stopConfirmationStatusCheck = useCallback(() => {
        if (confirmationIntervalRef.current) {
            window.clearInterval(confirmationIntervalRef.current)
            confirmationIntervalRef.current = null
        }
    }, [])

    const goToLoginAfterConfirmation = useCallback(() => {
        stopConfirmationStatusCheck()
        setIsAlreadyConfirmed(true)

        window.setTimeout(() => {
            navigate('/login')
        }, 2200)
    }, [navigate, stopConfirmationStatusCheck])

    const handleCodeChange = (value: string) => {
        const formattedCode = value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 6)

        setCode(formattedCode)
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!canSubmit) {
            return
        }

        try {
            setIsSubmitting(true)

            await onConfirmEmail(email, normalizedCode)

            localStorage.setItem(
                EMAIL_CONFIRMED_STORAGE_KEY,
                String(Date.now())
            )

            goToLoginAfterConfirmation()
        } catch {
            /*
                O App.tsx já mostra o toast de erro.
                Aqui apenas impedimos que a tela siga para o login
                quando o código for inválido ou a confirmação falhar.
            */
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleResendCode = async () => {
        if (!hasEmail) {
            return
        }

        try {
            setIsResending(true)

            await onResendConfirmation(email)
        } finally {
            setIsResending(false)
        }
    }

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === EMAIL_CONFIRMED_STORAGE_KEY && event.newValue) {
                goToLoginAfterConfirmation()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [goToLoginAfterConfirmation])

    useEffect(() => {
        let isMounted = true

        if (!hasEmail || isAlreadyConfirmed) {
            return () => {
                isMounted = false
            }
        }

        const checkStatus = async () => {
            try {
                const confirmed = await onCheckEmailConfirmationStatus(email)

                if (confirmed && isMounted) {
                    goToLoginAfterConfirmation()
                }
            } catch (error) {
                console.error('Erro ao verificar confirmação do e-mail:', error)
            }
        }

        checkStatus()

        confirmationIntervalRef.current = window.setInterval(
            checkStatus,
            EMAIL_CONFIRMATION_CHECK_INTERVAL_MS
        )

        return () => {
            isMounted = false
            stopConfirmationStatusCheck()
        }
    }, [
        email,
        hasEmail,
        isAlreadyConfirmed,
        goToLoginAfterConfirmation,
        onCheckEmailConfirmationStatus,
        stopConfirmationStatusCheck,
    ])

    if (isAlreadyConfirmed) {
        return (
            <main className="confirm-email-page">
                <section className="confirm-email-card">
                    <AuthHeroPanel
                        titulo="Confirmação concluída"
                        descricao="Seu e-mail foi confirmado e sua conta já está pronta para uso."
                    />

                    <section className="confirm-email-content">
                        <header className="confirm-email-header">
                            <div className="auth-header-row">
                                <h2>E-mail confirmado</h2>
                                <button
                                    type="button"
                                    className="theme-toggle-btn"
                                    onClick={onToggleTheme}
                                    aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                    title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                >
                                    {isDark ? (
                                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p>
                                Seu e-mail já foi confirmado com sucesso. Você
                                será enviado para a tela de login em instantes.
                            </p>
                        </header>

                        <section className="confirm-email-status-box">
                            <span>Status</span>
                            <strong>Confirmação concluída</strong>
                            <small>
                                Agora você já pode entrar no sistema usando seu
                                e-mail e senha.
                            </small>
                        </section>

                        <button
                            type="button"
                            className="confirm-email-submit-button"
                            onClick={() => navigate('/login')}
                        >
                            Ir para login
                        </button>

                        <footer className="confirm-email-footer">
                            <p>Redirecionando para o login...</p>
                        </footer>
                    </section>
                </section>
            </main>
        )
    }

    return (
        <main className="confirm-email-page">
            <section className="confirm-email-card">
                <AuthHeroPanel
                    titulo="Falta só confirmar"
                    descricao="Confirme seu e-mail para proteger sua conta e liberar o acesso ao sistema."
                />

                <section className="confirm-email-content">
                    <header className="confirm-email-header">
                        <div className="auth-header-row">
                            <h2>Confirmar e-mail</h2>
                            <button
                                type="button"
                                className="theme-toggle-btn"
                                onClick={onToggleTheme}
                                aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                                title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                            >
                                {isDark ? (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p>
                            Enviamos um código de 6 caracteres para o e-mail
                            cadastrado. Digite o código abaixo para liberar o
                            login.
                        </p>
                    </header>

                    <form
                        className="confirm-email-form"
                        onSubmit={handleSubmit}
                    >
                        {hasEmail ? (
                            <section className="confirm-email-status-box">
                                <span>E-mail cadastrado</span>
                                <strong>{maskedEmail}</strong>
                                <small>
                                    Este e-mail é apenas para visualização e não
                                    pode ser alterado nesta etapa.
                                </small>
                            </section>
                        ) : (
                            <section className="confirm-email-status-box confirm-email-status-box-warning">
                                <span>E-mail não identificado</span>
                                <strong>
                                    Abra o link enviado para seu e-mail
                                </strong>
                                <small>
                                    Para sua segurança, volte ao cadastro ou use
                                    o botão recebido no e-mail de confirmação.
                                </small>
                            </section>
                        )}

                        <div className="confirm-email-field">
                            <label htmlFor="confirm-code">
                                Código de confirmação
                            </label>

                            <input
                                id="confirm-code"
                                className="confirm-email-code-input"
                                type="text"
                                placeholder="ABC123"
                                value={code}
                                onChange={(event) =>
                                    handleCodeChange(event.target.value)
                                }
                                maxLength={6}
                                autoComplete="one-time-code"
                                required
                                disabled={!hasEmail}
                            />

                            <small>
                                O código possui 6 caracteres e pode conter
                                letras e números.
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="confirm-email-submit-button"
                            disabled={isSubmitting || !canSubmit}
                        >
                            {isSubmitting
                                ? 'Confirmando...'
                                : 'Confirmar e-mail'}
                        </button>

                        <button
                            type="button"
                            className="confirm-email-secondary-button"
                            onClick={handleResendCode}
                            disabled={isResending || !hasEmail}
                        >
                            {isResending
                                ? 'Reenviando código...'
                                : 'Reenviar código'}
                        </button>
                    </form>

                    <footer className="confirm-email-footer">
                        <p>
                            Já confirmou? <Link to="/login">Entrar</Link>
                        </p>

                        <p>
                            Ainda não tem conta?{' '}
                            <Link to="/cadastro">Criar conta</Link>
                        </p>
                    </footer>
                </section>
            </section>
        </main>
    )
}