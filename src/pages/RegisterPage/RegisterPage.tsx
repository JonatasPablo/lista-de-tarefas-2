import { useState, type SyntheticEvent, type UIEvent } from 'react'
import { Link } from 'react-router-dom'

import './RegisterPage.css'

interface RegisterPageProps {
    onRegister: (
        name: string,
        email: string,
        password: string,
        termsAccepted: boolean
    ) => Promise<void>
}

const TERMS_VERSION = '1.0'

export const RegisterPage = ({ onRegister }: RegisterPageProps) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [hasScrolledTermsToEnd, setHasScrolledTermsToEnd] = useState(false)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleTermsScroll = (event: UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget

        const reachedBottom =
            element.scrollTop + element.clientHeight >=
            element.scrollHeight - 12

        if (reachedBottom) {
            setHasScrolledTermsToEnd(true)
        }
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!hasScrolledTermsToEnd || !termsAccepted) {
            return
        }

        try {
            setIsSubmitting(true)

            await onRegister(name, email, password, termsAccepted)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="register-page">
            <section className="register-card">
                <aside className="register-hero" aria-hidden="true">
                    <p className="register-hero-description">
                        Crie sua conta, confirme seu e-mail e organize suas
                        tarefas com segurança.
                    </p>

                    <strong className="register-hero-title">
                        Comece sua organização
                    </strong>
                </aside>

                <section className="register-content">
                    <header className="register-header">
                        <h2>Criar conta</h2>
                        <p>
                            Cadastre-se para acessar suas próprias tarefas.
                            Antes de concluir, leia e aceite os Termos de Uso e
                            a Política de Privacidade.
                        </p>
                    </header>

                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-fields-grid">
                            <div className="register-field">
                                <label htmlFor="register-name">Nome</label>

                                <input
                                    id="register-name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-email">E-mail</label>

                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-field">
                            <label htmlFor="register-password">Senha</label>

                            <div className="register-password-wrapper">
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
                                    className="register-password-button"
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

                        <section className="register-terms-box">
                            <div className="register-terms-header">
                                <div>
                                    <strong>
                                        Termos de Uso e Política de Privacidade
                                    </strong>
                                    <span>Versão {TERMS_VERSION}</span>
                                </div>

                                {hasScrolledTermsToEnd ? (
                                    <span className="register-terms-status register-terms-status-ok">
                                        Leitura concluída
                                    </span>
                                ) : (
                                    <span className="register-terms-status">
                                        Leia até o final
                                    </span>
                                )}
                            </div>

                            <div
                                className="register-terms-scroll"
                                onScroll={handleTermsScroll}
                                tabIndex={0}
                            >
                                <h3>1. Identificação do sistema</h3>
                                <p>
                                    A Lista de Tarefas é um sistema criado para
                                    organização de tarefas, histórico, logs e
                                    anexos. Ao criar uma conta, o usuário
                                    declara estar ciente das regras descritas
                                    nestes Termos de Uso e nesta Política de
                                    Privacidade.
                                </p>

                                <h3>2. Aceite dos termos</h3>
                                <p>
                                    Para criar uma conta, é necessário ler estes
                                    termos até o final e marcar a opção de
                                    aceite. Ao marcar a opção, o usuário declara
                                    que leu, compreendeu e concorda com as
                                    condições de uso do sistema.
                                </p>

                                <h3>3. Conta do usuário</h3>
                                <p>
                                    O usuário é responsável por informar dados
                                    corretos no cadastro, manter sua senha em
                                    segurança e não compartilhar o acesso com
                                    terceiros. O sistema poderá bloquear ou
                                    limitar acessos em caso de uso indevido.
                                </p>

                                <h3>4. Confirmação de e-mail</h3>
                                <p>
                                    Após o cadastro, o sistema poderá enviar um
                                    código de confirmação para o e-mail
                                    informado. O login poderá ser liberado
                                    somente após a confirmação do e-mail.
                                </p>

                                <h3>5. Uso permitido</h3>
                                <p>
                                    O sistema deve ser utilizado para fins
                                    lícitos, relacionados à organização pessoal
                                    ou profissional de tarefas. O usuário deve
                                    utilizar a plataforma de forma responsável e
                                    respeitando a legislação aplicável.
                                </p>

                                <h3>6. Uso proibido</h3>
                                <p>
                                    É proibido tentar invadir, explorar falhas,
                                    copiar indevidamente dados, prejudicar o
                                    funcionamento do sistema, inserir conteúdo
                                    malicioso ou utilizar a plataforma para
                                    qualquer finalidade ilegal.
                                </p>

                                <h3>7. Dados coletados</h3>
                                <p>
                                    Para funcionamento e segurança, o sistema
                                    poderá tratar dados como nome, e-mail, senha
                                    criptografada, tarefas, histórico de ações,
                                    anexos, data e hora de cadastro, data e hora
                                    de aceite dos termos, versão dos termos
                                    aceita, endereço IP e informações do
                                    navegador ou dispositivo.
                                </p>

                                <h3>8. Cookies e sessão</h3>
                                <p>
                                    O sistema utiliza cookie de sessão com
                                    proteção HttpOnly para manter o usuário
                                    autenticado com mais segurança. Esse cookie
                                    é usado para identificar a sessão ativa e
                                    não deve ser manipulado diretamente pelo
                                    usuário.
                                </p>

                                <h3>9. Registros de acesso e segurança</h3>
                                <p>
                                    O sistema poderá registrar informações
                                    técnicas, como IP, data, hora, navegador e
                                    ações realizadas, com a finalidade de
                                    segurança, auditoria, prevenção contra
                                    fraudes e melhoria do serviço.
                                </p>

                                <h3>10. Armazenamento e proteção</h3>
                                <p>
                                    Serão adotadas medidas técnicas razoáveis
                                    para proteger os dados, como criptografia de
                                    senha, controle de sessão, restrição de
                                    acesso e validações no backend. Mesmo assim,
                                    nenhum sistema é totalmente imune a falhas
                                    ou ataques.
                                </p>

                                <h3>11. Redefinição de senha</h3>
                                <p>
                                    O usuário poderá solicitar redefinição de
                                    senha por e-mail. O sistema poderá enviar um
                                    código temporário para confirmação antes de
                                    permitir a criação de uma nova senha.
                                </p>

                                <h3>12. Responsabilidades do usuário</h3>
                                <p>
                                    O usuário deve manter seus dados corretos,
                                    proteger sua senha, utilizar dispositivos
                                    seguros e comunicar qualquer suspeita de
                                    acesso indevido.
                                </p>

                                <h3>13. Limitação de responsabilidade</h3>
                                <p>
                                    O sistema é fornecido para auxiliar na
                                    organização de tarefas. Não há garantia de
                                    que o serviço estará disponível de forma
                                    ininterrupta ou livre de erros em todos os
                                    momentos.
                                </p>

                                <h3>14. Atualizações dos termos</h3>
                                <p>
                                    Estes termos poderão ser atualizados. Quando
                                    houver alteração relevante, o sistema poderá
                                    solicitar novo aceite do usuário,
                                    registrando a nova versão aceita.
                                </p>

                                <h3>15. Contato</h3>
                                <p>
                                    Em caso de dúvidas sobre estes Termos de Uso
                                    ou sobre a Política de Privacidade, o
                                    usuário poderá entrar em contato com o
                                    responsável pelo sistema pelos canais
                                    informados na aplicação.
                                </p>

                                <p className="register-terms-final-text">
                                    Ao marcar a opção de aceite, você declara
                                    que leu, compreendeu e concorda com estes
                                    Termos de Uso e com esta Política de
                                    Privacidade.
                                </p>
                            </div>

                            {!hasScrolledTermsToEnd && (
                                <small className="register-terms-help">
                                    Role o texto até o final para liberar o
                                    aceite.
                                </small>
                            )}

                            <label className="register-terms-checkbox">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    disabled={!hasScrolledTermsToEnd}
                                    onChange={(event) =>
                                        setTermsAccepted(event.target.checked)
                                    }
                                />

                                <span>
                                    Li e aceito os Termos de Uso e a Política de
                                    Privacidade.
                                </span>
                            </label>
                        </section>

                        <button
                            type="submit"
                            className="register-submit-button"
                            disabled={
                                isSubmitting ||
                                !hasScrolledTermsToEnd ||
                                !termsAccepted
                            }
                        >
                            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    <footer className="register-footer">
                        <p>
                            Já tem conta? <Link to="/login">Entrar</Link>
                        </p>
                    </footer>
                </section>
            </section>
        </main>
    )
}