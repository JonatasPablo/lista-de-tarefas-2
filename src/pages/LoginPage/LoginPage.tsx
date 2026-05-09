import { useState, type SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'

import './LoginPage.css'

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            setIsSubmitting(true)

            await onLogin(email, password)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <aside className="login-hero" aria-hidden="true">
                    <p className="login-hero-description">
                        Tarefas, histórico, logs e anexos em um só lugar.
                    </p>

                    <strong className="login-hero-title">
                        Organize seu dia com leveza
                    </strong>
                </aside>

                <section className="login-content">
                    <header className="login-header">
                        <h2>Entrar</h2>
                        <p>
                            Acesse sua Lista de Tarefas com seu e-mail e senha.
                        </p>
                    </header>

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

                        <button
                            type="submit"
                            className="login-submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <footer className="login-footer">
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