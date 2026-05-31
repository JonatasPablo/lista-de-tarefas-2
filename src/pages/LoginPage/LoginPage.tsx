import { useCallback, useState, type SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'
import { GoogleSignInButton } from '../../components/GoogleSignInButton/GoogleSignInButton'
import { AuthHeroPanel } from '../../components/AuthHeroPanel/AuthHeroPanel'
import { useGoogleButtonWidth } from '../../hooks/useGoogleButtonWidth'

import './LoginPage.css'

const LOGIN_HERO_ITENS = [
    'Tarefas com prazo e prioridade',
    'Histórico completo de alterações',
    'Log detalhado de todas as ações',
    'Login seguro com e-mail ou Google',
    'Redefinição de senha por e-mail',
    'Confirmação de e-mail no cadastro',
]

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>
    onLoginGoogle?: (credential: string) => Promise<void>
    googleClientId: string
    isLoginTemporarilyBlocked?: boolean
    isDark: boolean
    onToggleTheme: () => void
}

export const LoginPage = ({
    onLogin,
    onLoginGoogle,
    googleClientId,
    isLoginTemporarilyBlocked = false,
    isDark,
    onToggleTheme,
}: LoginPageProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false)
    const { buttonContainerRef, buttonWidth } = useGoogleButtonWidth()

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            setIsSubmitting(true)

            await onLogin(email, password)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLoginGoogleSuccess = useCallback(async (credential: string) => {
        if (!onLoginGoogle) {
            return
        }

        try {
            setIsSubmittingGoogle(true)

            await onLoginGoogle(credential)
        } finally {
            setIsSubmittingGoogle(false)
        }
    }, [onLoginGoogle])

    const handleLoginGoogleError = useCallback(() => {
        setIsSubmittingGoogle(false)
    }, [])

    return (
        <main className="login-page">
            <section className="login-card">
                <AuthHeroPanel
                    titulo="Organize seu dia com leveza"
                    descricao="Tarefas, histórico, logs e anexos em um só lugar."
                    itens={LOGIN_HERO_ITENS}
                />

                <section className="login-content">
                    <header className="login-header">
                        <div className="auth-header-row">
                            <h2>Entrar</h2>
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
                            Acesse sua Lista de Tarefas com seu e-mail e senha.
                        </p>
                    </header>

                    <div className="login-google-area">
                        {onLoginGoogle ? (
                            <>
                                <div
                                    ref={buttonContainerRef}
                                    className="login-google-button-wrapper"
                                >
                                    <GoogleSignInButton
                                        clientId={googleClientId}
                                        onSuccess={handleLoginGoogleSuccess}
                                        onError={handleLoginGoogleError}
                                        text="signin"
                                        width={buttonWidth}
                                    />
                                </div>

                                {isSubmittingGoogle && (
                                    <small className="login-google-status">
                                        Entrando com Google...
                                    </small>
                                )}

                                <div className="login-divider">
                                    <span>ou entre com e-mail</span>
                                </div>
                            </>
                        ) : null}
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="login-email">E-mail</label>

                            <input
                                id="login-email"
                                type="email"
                                placeholder="seuemail@exemplo.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="login-password">Senha</label>

                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-button"
                                    onClick={() =>
                                        setShowPassword(
                                            (currentValue) => !currentValue
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Ocultar senha'
                                            : 'Mostrar senha'
                                    }
                                    title={
                                        showPassword
                                            ? 'Ocultar senha'
                                            : 'Mostrar senha'
                                    }
                                >
                                    {showPassword ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path d="M3 3L21 21" />
                                            <path d="M10.73 5.08A10.77 10.77 0 0 1 12 5C17.52 5 21.46 9.2 23 12C22.43 13.04 21.52 14.26 20.33 15.37" />
                                            <path d="M6.61 6.61C3.8 8.08 1.87 10.74 1 12C2.54 14.8 6.48 19 12 19C13.55 19 14.96 18.67 16.2 18.12" />
                                            <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                                            <path d="M14.7 9.3A3 3 0 0 0 12 9" />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path d="M1 12C2.54 9.2 6.48 5 12 5C17.52 5 21.46 9.2 23 12C21.46 14.8 17.52 19 12 19C6.48 19 2.54 14.8 1 12Z" />
                                            <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Link
                            to="/esqueci-senha"
                            className="login-forgot-password-link"
                        >
                            Esqueci minha senha
                        </Link>

                        <button
                            type="submit"
                            className="login-submit-button"
                            disabled={
                                isSubmitting ||
                                isSubmittingGoogle ||
                                isLoginTemporarilyBlocked
                            }
                        >
                            {isSubmitting
                                ? 'Entrando...'
                                : isLoginTemporarilyBlocked
                                  ? 'Aguarde...'
                                  : 'Entrar'}
                        </button>
                    </form>

                    <footer className="login-footer">
                        <p>
                            Ainda não tem conta?{' '}
                            <Link to="/cadastro">Criar conta</Link>
                        </p>
                        <p className="login-legal-links">
                            <Link to="/termos">Termos de Uso</Link>
                            <span aria-hidden="true">·</span>
                            <Link to="/privacidade">
                                Política de Privacidade
                            </Link>
                            <span aria-hidden="true">·</span>
                            <Link to="/cookies">Cookies</Link>
                        </p>
                    </footer>
                </section>
            </section>
        </main>
    )
}
