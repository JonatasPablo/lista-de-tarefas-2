import { useState, type SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'

interface RegisterPageProps {
    onRegister: (
        name: string,
        email: string,
        password: string
    ) => Promise<void>
}

export const RegisterPage = ({ onRegister }: RegisterPageProps) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            setIsSubmitting(true)

            await onRegister(name, email, password)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-card-header">
                    <h2>Criar conta</h2>
                    <p>Cadastre-se para acessar suas próprias tarefas.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="register-name">Nome</label>
                    <input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />

                    <label htmlFor="register-email">E-mail</label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="register-password">Senha</label>

                    <div className="password-input-wrapper">
                        <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo de 8 caracteres"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            minLength={8}
                            required
                        />

                        <button
                            type="button"
                            className="password-icon-button"
                            onClick={() =>
                                setShowPassword((currentValue) => !currentValue)
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

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Já tem conta? <Link to="/login">Entrar</Link>
                </p>
            </section>
        </main>
    )
}