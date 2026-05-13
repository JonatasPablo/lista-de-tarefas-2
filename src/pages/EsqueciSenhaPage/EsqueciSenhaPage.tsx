import { useMemo, useState, type SyntheticEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import './EsqueciSenhaPage.css'

type EtapaRedefinicao = 'email' | 'codigo' | 'senha'
type AcaoSolicitacaoRedefinicao = 'confirm_email' | 'reset_password'

type RespostaSolicitacaoRedefinicao = {
    message: string
    action?: AcaoSolicitacaoRedefinicao
}

interface EsqueciSenhaPageProps {
    onSolicitarRedefinicaoSenha: (
        email: string
    ) => Promise<RespostaSolicitacaoRedefinicao>
    onValidarCodigoRedefinicaoSenha: (
        email: string,
        code: string
    ) => Promise<void>
    onRedefinirSenha: (
        email: string,
        code: string,
        password: string
    ) => Promise<void>
}

const limparCodigo = (codigo: string) => {
    return codigo.trim().toUpperCase().replace(/\s/g, '')
}

const obterRequisitosSenha = (senha: string) => {
    return [
        {
            id: 'tamanho',
            texto: 'Mínimo de 8 caracteres',
            valido: senha.length >= 8,
        },
        {
            id: 'maiuscula',
            texto: 'Uma letra maiúscula',
            valido: /[A-ZÀ-Ö]/.test(senha),
        },
        {
            id: 'minuscula',
            texto: 'Uma letra minúscula',
            valido: /[a-zà-öø-ÿ]/.test(senha),
        },
        {
            id: 'numero',
            texto: 'Um número',
            valido: /\d/.test(senha),
        },
        {
            id: 'especial',
            texto: 'Um caractere especial',
            valido: /[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(senha),
        },
    ]
}

const IconeOlhoAberto = () => {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M1 12C2.54 9.2 6.48 5 12 5C17.52 5 21.46 9.2 23 12C21.46 14.8 17.52 19 12 19C6.48 19 2.54 14.8 1 12Z" />
            <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" />
        </svg>
    )
}

const IconeOlhoFechado = () => {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 3L21 21" />
            <path d="M10.73 5.08A10.77 10.77 0 0 1 12 5C17.52 5 21.46 9.2 23 12C22.43 13.04 21.52 14.26 20.33 15.37" />
            <path d="M6.61 6.61C3.8 8.08 1.87 10.74 1 12C2.54 14.8 6.48 19 12 19C13.55 19 14.96 18.67 16.2 18.12" />
            <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
            <path d="M14.7 9.3A3 3 0 0 0 12 9" />
        </svg>
    )
}

export const EsqueciSenhaPage = ({
    onSolicitarRedefinicaoSenha,
    onValidarCodigoRedefinicaoSenha,
    onRedefinirSenha,
}: EsqueciSenhaPageProps) => {
    const [searchParams] = useSearchParams()

    const emailInicial = useMemo(() => {
        return searchParams.get('email')?.trim().toLowerCase() || ''
    }, [searchParams])

    const [etapaAtual, setEtapaAtual] = useState<EtapaRedefinicao>('email')
    const [email, setEmail] = useState(emailInicial)
    const [codigo, setCodigo] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] =
        useState(false)
    const [estaEnviando, setEstaEnviando] = useState(false)

    const codigoNormalizado = limparCodigo(codigo)
    const requisitosSenha = obterRequisitosSenha(senha)
    const senhaAtendeRequisitos = requisitosSenha.every(
        (requisito) => requisito.valido
    )
    const senhasConferem = senha === confirmacaoSenha

    const textoEtapa = {
        email: 'Informe o e-mail cadastrado para receber um código temporário.',
        codigo: 'Digite o código de 6 caracteres enviado para seu e-mail.',
        senha: 'Crie uma nova senha para acessar sua conta com segurança.',
    }

    const handleSolicitarCodigo = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        try {
            setEstaEnviando(true)

            const resposta = await onSolicitarRedefinicaoSenha(email)

            if (resposta.action === 'confirm_email') {
                return
            }

            setEtapaAtual('codigo')
        } finally {
            setEstaEnviando(false)
        }
    }

    const handleValidarCodigo = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (codigoNormalizado.length !== 6) {
            return
        }

        try {
            setEstaEnviando(true)

            await onValidarCodigoRedefinicaoSenha(email, codigoNormalizado)

            setEtapaAtual('senha')
        } finally {
            setEstaEnviando(false)
        }
    }

    const handleRedefinirSenha = async (
        event: SyntheticEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!senhaAtendeRequisitos || !senhasConferem) {
            return
        }

        try {
            setEstaEnviando(true)

            await onRedefinirSenha(email, codigoNormalizado, senha)
        } finally {
            setEstaEnviando(false)
        }
    }

    const voltarParaEmail = () => {
        setCodigo('')
        setSenha('')
        setConfirmacaoSenha('')
        setEtapaAtual('email')
    }

    const renderFormularioEmail = () => {
        return (
            <form
                className="esqueci-senha-form"
                onSubmit={handleSolicitarCodigo}
            >
                <div className="esqueci-senha-field">
                    <label htmlFor="esqueci-senha-email">E-mail</label>

                    <input
                        id="esqueci-senha-email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="esqueci-senha-submit-button"
                    disabled={estaEnviando}
                >
                    {estaEnviando ? 'Enviando...' : 'Enviar código'}
                </button>
            </form>
        )
    }

    const renderFormularioCodigo = () => {
        return (
            <form
                className="esqueci-senha-form"
                onSubmit={handleValidarCodigo}
            >
                <section className="esqueci-senha-status-box">
                    <span>E-mail informado</span>
                    <strong>{email}</strong>
                    <small>
                        Use o código mais recente enviado para esse e-mail.
                    </small>
                </section>

                <div className="esqueci-senha-field">
                    <label htmlFor="esqueci-senha-codigo">Código</label>

                    <input
                        id="esqueci-senha-codigo"
                        className="esqueci-senha-code-input"
                        type="text"
                        placeholder="ABC123"
                        value={codigo}
                        onChange={(event) =>
                            setCodigo(limparCodigo(event.target.value))
                        }
                        maxLength={6}
                        required
                    />

                    <small>O código possui 6 letras ou números.</small>
                </div>

                <div className="esqueci-senha-actions-row">
                    <button
                        type="button"
                        className="esqueci-senha-secondary-button"
                        onClick={voltarParaEmail}
                        disabled={estaEnviando}
                    >
                        Trocar e-mail
                    </button>

                    <button
                        type="submit"
                        className="esqueci-senha-submit-button"
                        disabled={estaEnviando || codigoNormalizado.length !== 6}
                    >
                        {estaEnviando ? 'Validando...' : 'Validar código'}
                    </button>
                </div>
            </form>
        )
    }

    const renderFormularioSenha = () => {
        return (
            <form
                className="esqueci-senha-form"
                onSubmit={handleRedefinirSenha}
            >
                <section className="esqueci-senha-status-box">
                    <span>Código validado</span>
                    <strong>{email}</strong>
                    <small>Agora crie uma senha diferente da senha atual.</small>
                </section>

                <div className="esqueci-senha-field">
                    <label htmlFor="esqueci-senha-nova-senha">
                        Nova senha
                    </label>

                    <div className="esqueci-senha-password-wrapper">
                        <input
                            id="esqueci-senha-nova-senha"
                            type={mostrarSenha ? 'text' : 'password'}
                            placeholder="Mínimo de 8 caracteres"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            minLength={8}
                            required
                        />

                        <button
                            type="button"
                            className="esqueci-senha-password-button"
                            onClick={() =>
                                setMostrarSenha(
                                    (valorAtual) => !valorAtual
                                )
                            }
                            aria-label={
                                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                            }
                            title={
                                mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                            }
                        >
                            {mostrarSenha ? (
                                <IconeOlhoFechado />
                            ) : (
                                <IconeOlhoAberto />
                            )}
                        </button>
                    </div>

                    <div className="esqueci-senha-password-requirements">
                        <span>A senha precisa conter:</span>

                        <ul>
                            {requisitosSenha.map((requisito) => (
                                <li
                                    key={requisito.id}
                                    className={
                                        requisito.valido
                                            ? 'esqueci-senha-password-requirement-ok'
                                            : 'esqueci-senha-password-requirement-error'
                                    }
                                >
                                    {requisito.texto}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="esqueci-senha-field">
                    <label htmlFor="esqueci-senha-confirmar-senha">
                        Confirmar nova senha
                    </label>

                    <div className="esqueci-senha-password-wrapper">
                        <input
                            id="esqueci-senha-confirmar-senha"
                            type={
                                mostrarConfirmacaoSenha ? 'text' : 'password'
                            }
                            placeholder="Digite a senha novamente"
                            value={confirmacaoSenha}
                            onChange={(event) =>
                                setConfirmacaoSenha(event.target.value)
                            }
                            minLength={8}
                            required
                        />

                        <button
                            type="button"
                            className="esqueci-senha-password-button"
                            onClick={() =>
                                setMostrarConfirmacaoSenha(
                                    (valorAtual) => !valorAtual
                                )
                            }
                            aria-label={
                                mostrarConfirmacaoSenha
                                    ? 'Ocultar senha'
                                    : 'Mostrar senha'
                            }
                            title={
                                mostrarConfirmacaoSenha
                                    ? 'Ocultar senha'
                                    : 'Mostrar senha'
                            }
                        >
                            {mostrarConfirmacaoSenha ? (
                                <IconeOlhoFechado />
                            ) : (
                                <IconeOlhoAberto />
                            )}
                        </button>
                    </div>

                    {!senhasConferem && confirmacaoSenha ? (
                        <small className="esqueci-senha-field-error">
                            As senhas não conferem.
                        </small>
                    ) : (
                        <small>Digite novamente a mesma senha informada acima.</small>
                    )}
                </div>

                <button
                    type="submit"
                    className="esqueci-senha-submit-button"
                    disabled={
                        estaEnviando || !senhaAtendeRequisitos || !senhasConferem
                    }
                >
                    {estaEnviando ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
            </form>
        )
    }

    return (
        <main className="esqueci-senha-page">
            <section className="esqueci-senha-card">
                <aside className="esqueci-senha-hero" aria-hidden="true">
                    <p className="esqueci-senha-hero-description">
                        Recupere o acesso com segurança usando um código enviado
                        para seu e-mail.
                    </p>

                    <strong className="esqueci-senha-hero-title">
                        Redefinir senha
                    </strong>
                </aside>

                <section className="esqueci-senha-content">
                    <header className="esqueci-senha-header">
                        <span className="esqueci-senha-step-label">
                            Etapa{' '}
                            {etapaAtual === 'email'
                                ? '1 de 3'
                                : etapaAtual === 'codigo'
                                  ? '2 de 3'
                                  : '3 de 3'}
                        </span>

                        <h2>Esqueci minha senha</h2>
                        <p>{textoEtapa[etapaAtual]}</p>
                    </header>

                    <div className="esqueci-senha-step-indicator">
                        <span
                            className={
                                etapaAtual === 'email'
                                    ? 'esqueci-senha-step-active'
                                    : ''
                            }
                        />
                        <span
                            className={
                                etapaAtual === 'codigo'
                                    ? 'esqueci-senha-step-active'
                                    : ''
                            }
                        />
                        <span
                            className={
                                etapaAtual === 'senha'
                                    ? 'esqueci-senha-step-active'
                                    : ''
                            }
                        />
                    </div>

                    {etapaAtual === 'email' && renderFormularioEmail()}
                    {etapaAtual === 'codigo' && renderFormularioCodigo()}
                    {etapaAtual === 'senha' && renderFormularioSenha()}

                    <footer className="esqueci-senha-footer">
                        <p>
                            Lembrou sua senha? <Link to="/login">Entrar</Link>
                        </p>
                    </footer>
                </section>
            </section>
        </main>
    )
}