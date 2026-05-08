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

type ConfirmEmailLocationState = {
    email?: string
}

interface ConfirmEmailPageProps {
    onConfirmEmail: (email: string, code: string) => Promise<void>
    onResendConfirmation: (email: string) => Promise<void>
    onCheckEmailConfirmationStatus: (email: string) => Promise<boolean>
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
            <main className="auth-page confirm-email-page">
                <section className="auth-card confirm-email-card">
                    <div className="auth-card-header">
                        <h2>E-mail confirmado</h2>
                        <p>
                            Seu e-mail já foi confirmado com sucesso. Você será
                            enviado para a tela de login em instantes.
                        </p>
                    </div>

                    <div className="auth-form">
                        <section className="masked-email-box">
                            <span>Status</span>
                            <strong>Confirmação concluída</strong>
                            <small>
                                Agora você já pode entrar no sistema usando seu
                                e-mail e senha.
                            </small>
                        </section>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                        >
                            Ir para login
                        </button>
                    </div>

                    <p className="auth-footer-text">
                        Redirecionando para o login...
                    </p>
                </section>
            </main>
        )
    }

    return (
        <main className="auth-page confirm-email-page">
            <section className="auth-card confirm-email-card">
                <div className="auth-card-header">
                    <h2>Confirmar e-mail</h2>
                    <p>
                        Enviamos um código de 6 caracteres para o e-mail
                        cadastrado. Digite o código abaixo para liberar o login.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {hasEmail ? (
                        <section className="masked-email-box">
                            <span>E-mail cadastrado</span>
                            <strong>{maskedEmail}</strong>
                            <small>
                                Este e-mail é apenas para visualização e não
                                pode ser alterado nesta etapa.
                            </small>
                        </section>
                    ) : (
                        <section className="masked-email-box masked-email-box-warning">
                            <span>E-mail não identificado</span>
                            <strong>Abra o link enviado para seu e-mail</strong>
                            <small>
                                Para sua segurança, volte ao cadastro ou use o
                                botão recebido no e-mail de confirmação.
                            </small>
                        </section>
                    )}

                    <label htmlFor="confirm-code">Código de confirmação</label>
                    <input
                        id="confirm-code"
                        className="confirm-code-input"
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

                    <small className="confirm-email-help">
                        O código possui 6 caracteres e pode conter letras e
                        números.
                    </small>

                    <button
                        type="submit"
                        disabled={isSubmitting || !canSubmit}
                    >
                        {isSubmitting
                            ? 'Confirmando...'
                            : 'Confirmar e-mail'}
                    </button>

                    <button
                        type="button"
                        className="auth-secondary-button"
                        onClick={handleResendCode}
                        disabled={isResending || !hasEmail}
                    >
                        {isResending
                            ? 'Reenviando código...'
                            : 'Reenviar código'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Já confirmou? <Link to="/login">Entrar</Link>
                </p>

                <p className="auth-footer-text confirm-email-footer-link">
                    Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                </p>
            </section>
        </main>
    )
}