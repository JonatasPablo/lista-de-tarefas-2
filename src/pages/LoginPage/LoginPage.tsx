import { useState, type SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-card-header">
                    <h2>Entrar</h2>
                    <p>Acesse sua Lista de Tarefas com seu e-mail e senha.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="login-email">E-mail</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="login-password">Senha</label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
                </p>
            </section>
        </main>
    )
}