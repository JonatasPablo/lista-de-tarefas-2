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
                    <input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo de 8 caracteres"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        required
                    />

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