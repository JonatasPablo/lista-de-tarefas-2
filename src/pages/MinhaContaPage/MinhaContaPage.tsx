import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ToastType } from '../../components/Toast/Toast'
import { ValidacaoSenha } from '../../components/ValidacaoSenha/ValidacaoSenha'
import { LGPD_CONTACT_EMAIL } from '../../config/app'
import type { AuthUser } from '../../services/authApi'
import { usuariosApi } from '../../services/usuariosApi'
import './MinhaContaPage.css'

interface MinhaContaPageProps {
    user: AuthUser
    onUsuarioAtualizado: (user: AuthUser) => void
    showToast: (type: ToastType, message: string) => void
}

const palavrasSenhaFraca = [
    'senha',
    'password',
    'admin',
    'teste',
    'qwerty',
    'abc123',
    '123456',
    '12345678',
]

const obterIniciais = (nome: string) => {
    const partesNome = nome.trim().split(' ').filter(Boolean)

    if (partesNome.length === 0) {
        return 'U'
    }

    if (partesNome.length === 1) {
        return partesNome[0].slice(0, 2).toUpperCase()
    }

    return `${partesNome[0][0]}${
        partesNome[partesNome.length - 1][0]
    }`.toUpperCase()
}

const removerAcentos = (texto: string) => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const normalizarTexto = (texto: string) => {
    return removerAcentos(texto).toLowerCase().trim()
}

const validarNome = (nome: string) => {
    const nomeValido = nome.trim().replace(/\s+/g, ' ')

    if (nomeValido.length < 3) {
        return 'Informe um nome com pelo menos 3 caracteres.'
    }

    if (nomeValido.length > 150) {
        return 'O nome não pode ter mais que 150 caracteres.'
    }

    if (!/^[\p{L}' -]+$/u.test(nomeValido)) {
        return 'Use apenas letras, acentos, espaços, hífen e apóstrofo.'
    }

    const letras = nomeValido.match(/\p{L}/gu) || []

    if (letras.length < 2) {
        return 'Informe um nome com letras suficientes.'
    }

    return ''
}

const senhaAtendeRequisitosBasicos = (senha: string) => {
    return (
        senha.length >= 8 &&
        /\p{Lu}/u.test(senha) &&
        /\p{Ll}/u.test(senha) &&
        /\d/.test(senha) &&
        /[^\p{L}0-9]/u.test(senha)
    )
}

const validarSenhaNova = (senha: string, user: AuthUser) => {
    if (!senha) {
        return 'Informe a nova senha.'
    }

    if (!senhaAtendeRequisitosBasicos(senha)) {
        return 'A nova senha ainda não cumpre todos os requisitos.'
    }

    const senhaNormalizada = normalizarTexto(senha)

    if (
        palavrasSenhaFraca.some((palavra) =>
            senhaNormalizada.includes(palavra)
        )
    ) {
        return 'Evite palavras comuns ou sequências fáceis de adivinhar.'
    }

    if (/(.)\1{4,}/.test(senha)) {
        return 'Evite repetir muitos caracteres iguais.'
    }

    const parteLocalEmail = normalizarTexto(user.email.split('@')[0] || '')

    if (
        parteLocalEmail.length >= 3 &&
        senhaNormalizada.includes(parteLocalEmail)
    ) {
        return 'A senha não pode conter parte do seu e-mail.'
    }

    const partesNome = normalizarTexto(user.name)
        .split(/\s+/)
        .filter((parte) => parte.length >= 3)

    if (partesNome.some((parte) => senhaNormalizada.includes(parte))) {
        return 'A senha não pode conter parte do seu nome.'
    }

    return ''
}

const formatarData = (valor?: string | null) => {
    if (!valor) {
        return 'Não informado'
    }

    const data = new Date(valor)

    if (Number.isNaN(data.getTime())) {
        return 'Não informado'
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(data)
}

const obterProvedor = (provider: string) => {
    if (provider === 'google') {
        return 'Google'
    }

    return 'Local'
}

export const MinhaContaPage = ({
    user,
    onUsuarioAtualizado,
    showToast,
}: MinhaContaPageProps) => {
    const [nome, setNome] = useState(user.name)
    const [senhaAtual, setSenhaAtual] = useState('')
    const [senhaNova, setSenhaNova] = useState('')
    const [confirmarSenhaNova, setConfirmarSenhaNova] = useState('')
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false)
    const [mostrarSenhaNova, setMostrarSenhaNova] = useState(false)
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
    const [salvandoNome, setSalvandoNome] = useState(false)
    const [alterandoSenha, setAlterandoSenha] = useState(false)
    const [enviandoAvatar, setEnviandoAvatar] = useState(false)
    const [removendoAvatar, setRemovendoAvatar] = useState(false)
    const [avatarFalhou, setAvatarFalhou] = useState(false)

    const erroNome = useMemo(() => validarNome(nome), [nome])
    const erroSenhaNova = useMemo(
        () => validarSenhaNova(senhaNova, user),
        [senhaNova, user]
    )
    const senhaNaoConfere =
        confirmarSenhaNova.length > 0 && senhaNova !== confirmarSenhaNova
    const podeAlterarSenhaLocal =
        user.provider !== 'google' || user.has_password
    const nomeNormalizado = nome.trim().replace(/\s+/g, ' ')
    const nomeSemAlteracao = nomeNormalizado === user.name
    const avatarUrl = !avatarFalhou ? usuariosApi.getAvatarUrl(user) : null

    const handleSalvarNome = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (erroNome || nomeSemAlteracao) {
            return
        }

        try {
            setSalvandoNome(true)

            const response = await usuariosApi.atualizarNome({
                name: nomeNormalizado,
            })

            onUsuarioAtualizado(response.user)
            setNome(response.user.name)
            showToast(
                'success',
                response.message || 'Nome atualizado com sucesso.'
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível atualizar seus dados. Tente novamente.'

            showToast('error', message)
        } finally {
            setSalvandoNome(false)
        }
    }

    const handleAlterarSenha = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (erroSenhaNova || senhaNaoConfere || !senhaAtual) {
            return
        }

        try {
            setAlterandoSenha(true)

            const response = await usuariosApi.alterarSenha({
                currentPassword: senhaAtual,
                newPassword: senhaNova,
            })

            setSenhaAtual('')
            setSenhaNova('')
            setConfirmarSenhaNova('')
            showToast(
                'success',
                response.message || 'Senha alterada com sucesso.'
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível alterar a senha. Tente novamente.'

            showToast('error', message)
        } finally {
            setAlterandoSenha(false)
        }
    }

    const handleRemoverAvatar = async () => {
        try {
            setRemovendoAvatar(true)

            const response = await usuariosApi.removerAvatar()

            setAvatarFalhou(false)
            onUsuarioAtualizado(response.user)
            showToast(
                'success',
                response.message || 'Foto de perfil removida com sucesso.'
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível remover a foto. Tente novamente.'

            showToast('error', message)
        } finally {
            setRemovendoAvatar(false)
        }
    }

    const handleEnviarAvatar = async (file?: File) => {
        if (!file) {
            return
        }

        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']

        if (!tiposPermitidos.includes(file.type)) {
            showToast('error', 'Envie uma imagem JPG, PNG ou WebP.')
            return
        }

        if (file.size > 20 * 1024 * 1024) {
            showToast('error', 'A foto deve ter no máximo 20 MB.')
            return
        }

        try {
            setEnviandoAvatar(true)

            const response = await usuariosApi.enviarAvatar(file)

            setAvatarFalhou(false)
            onUsuarioAtualizado(response.user)
            showToast(
                'success',
                response.message || 'Foto de perfil atualizada com sucesso.'
            )
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível enviar a foto. Tente novamente.'

            showToast('error', message)
        } finally {
            setEnviandoAvatar(false)
        }
    }

    const renderBotaoSenha = (
        visivel: boolean,
        onClick: () => void,
        labelInput: string
    ) => (
        <button
            type="button"
            className="minha-conta-password-button"
            onClick={onClick}
            aria-label={
                visivel ? `Ocultar ${labelInput}` : `Mostrar ${labelInput}`
            }
            title={visivel ? `Ocultar ${labelInput}` : `Mostrar ${labelInput}`}
        >
            {visivel ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M3 3L21 21" />
                    <path d="M10.73 5.08A10.77 10.77 0 0 1 12 5C17.52 5 21.46 9.2 23 12C22.43 13.04 21.52 14.26 20.33 15.37" />
                    <path d="M6.61 6.61C3.8 8.08 1.87 10.74 1 12C2.54 14.8 6.48 19 12 19C13.55 19 14.96 18.67 16.2 18.12" />
                    <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                    <path d="M14.7 9.3A3 3 0 0 0 12 9" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M1 12C2.54 9.2 6.48 5 12 5C17.52 5 21.46 9.2 23 12C21.46 14.8 17.52 19 12 19C6.48 19 2.54 14.8 1 12Z" />
                    <path d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z" />
                </svg>
            )}
        </button>
    )

    return (
        <main className="minha-conta-page">
            <header className="minha-conta-header">
                <div>
                    <h2>Minha conta</h2>
                    <p>Gerencie seus dados básicos e a segurança do acesso.</p>
                </div>
                <span>{obterProvedor(user.provider)}</span>
            </header>

            <section className="minha-conta-layout">
                <aside className="minha-conta-card minha-conta-profile-card">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt=""
                            className="minha-conta-avatar minha-conta-avatar-image"
                            onError={() => setAvatarFalhou(true)}
                        />
                    ) : (
                        <div className="minha-conta-avatar">
                            {obterIniciais(user.name)}
                        </div>
                    )}

                    <div className="minha-conta-profile-text">
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                    </div>

                    <div className="minha-conta-avatar-actions">
                        <strong>Foto de perfil</strong>
                        <p>
                            Envie uma imagem JPG, PNG ou WebP com até 20 MB.
                        </p>
                        <label className="minha-conta-upload-button">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={enviandoAvatar || removendoAvatar}
                                onChange={(event) => {
                                    const file = event.target.files?.[0]

                                    void handleEnviarAvatar(file)
                                    event.target.value = ''
                                }}
                            />
                            <span>
                                {enviandoAvatar ? 'Enviando...' : 'Enviar foto'}
                            </span>
                        </label>
                        {user.has_avatar && !avatarFalhou ? (
                            <button
                                type="button"
                                className="minha-conta-remove-avatar-button"
                                disabled={removendoAvatar || enviandoAvatar}
                                onClick={() => void handleRemoverAvatar()}
                            >
                                {removendoAvatar ? 'Removendo...' : 'Remover foto'}
                            </button>
                        ) : null}
                    </div>
                </aside>

                <section className="minha-conta-main">
                    <section className="minha-conta-card">
                        <header className="minha-conta-card-header">
                            <h3>Dados da conta</h3>
                            <span>
                                {user.email_verified_at
                                    ? 'E-mail confirmado'
                                    : 'E-mail pendente'}
                            </span>
                        </header>

                        <dl className="minha-conta-dados">
                            <div>
                                <dt>Nome</dt>
                                <dd>{user.name}</dd>
                            </div>
                            <div>
                                <dt>E-mail</dt>
                                <dd>{user.email}</dd>
                            </div>
                            <div>
                                <dt>Tipo de conta</dt>
                                <dd>{obterProvedor(user.provider)}</dd>
                            </div>
                            <div>
                                <dt>Criada em</dt>
                                <dd>{formatarData(user.created_at)}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="minha-conta-card minha-conta-privacidade-card">
                        <header className="minha-conta-card-header">
                            <h3>Privacidade e dados</h3>
                            <span className="badge badge--accent">LGPD</span>
                        </header>

                        <div className="mc-privacy-grid">
                            <div className="mc-privacy-group">
                                <p className="mc-privacy-group-label">Documentos legais</p>
                                <nav
                                    className="mc-privacy-doc-links"
                                    aria-label="Documentos legais"
                                >
                                    <Link to="/privacidade" className="mc-privacy-doc-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Política de Privacidade
                                    </Link>
                                    <Link to="/termos" className="mc-privacy-doc-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Termos de Uso
                                    </Link>
                                    <Link to="/cookies" className="mc-privacy-doc-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Política de Cookies
                                    </Link>
                                </nav>
                            </div>

                            <div className="mc-privacy-group">
                                <p className="mc-privacy-group-label">Seus direitos</p>
                                <p className="mc-privacy-rights-text">
                                    Acesso, correção e exclusão de dados via canal LGPD.
                                </p>
                                <Link
                                    to="/contato-lgpd"
                                    className="mc-privacy-contact-link"
                                    aria-label={`Enviar solicitação LGPD para ${LGPD_CONTACT_EMAIL}`}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    Enviar solicitação
                                </Link>
                            </div>

                            <div className="mc-privacy-group mc-privacy-actions-group">
                                <p className="mc-privacy-group-label">Ações disponíveis em breve</p>
                                <div className="mc-privacy-actions">
                                    <button
                                        type="button"
                                        className="mc-privacy-action-btn"
                                        disabled
                                        title="Em desenvolvimento"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Exportar meus dados
                                    </button>
                                    <button
                                        type="button"
                                        className="mc-privacy-action-btn mc-privacy-action-btn--danger"
                                        disabled
                                        title="Em desenvolvimento"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                        Solicitar exclusão da conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="minha-conta-grid">
                        <form
                            className="minha-conta-card"
                            onSubmit={handleSalvarNome}
                        >
                            <header className="minha-conta-card-header">
                                <h3>Alterar nome</h3>
                            </header>

                            <label
                                className="minha-conta-field"
                                htmlFor="minha-conta-nome"
                            >
                                <span>Nome</span>
                                <input
                                    id="minha-conta-nome"
                                    type="text"
                                    value={nome}
                                    onChange={(event) =>
                                        setNome(event.target.value)
                                    }
                                    maxLength={150}
                                    required
                                />
                            </label>

                            {erroNome ? (
                                <small className="minha-conta-feedback">
                                    {erroNome}
                                </small>
                            ) : null}

                            <button
                                type="submit"
                                className="minha-conta-submit"
                                disabled={
                                    salvandoNome ||
                                    Boolean(erroNome) ||
                                    nomeSemAlteracao
                                }
                            >
                                {salvandoNome ? 'Salvando...' : 'Salvar nome'}
                            </button>
                        </form>

                        <form
                            className="minha-conta-card"
                            onSubmit={handleAlterarSenha}
                        >
                            <header className="minha-conta-card-header">
                                <h3>Alterar senha</h3>
                            </header>

                            {podeAlterarSenhaLocal ? (
                                <>
                                    <label
                                        className="minha-conta-field"
                                        htmlFor="senha-atual"
                                    >
                                        <span>Senha atual</span>
                                        <div className="minha-conta-password-wrapper">
                                            <input
                                                id="senha-atual"
                                                type={
                                                    mostrarSenhaAtual
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={senhaAtual}
                                                onChange={(event) =>
                                                    setSenhaAtual(
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="current-password"
                                                required
                                            />
                                            {renderBotaoSenha(
                                                mostrarSenhaAtual,
                                                () =>
                                                    setMostrarSenhaAtual(
                                                        (valor) => !valor
                                                    ),
                                                'senha atual'
                                            )}
                                        </div>
                                    </label>

                                    <label
                                        className="minha-conta-field"
                                        htmlFor="senha-nova"
                                    >
                                        <span>Nova senha</span>
                                        <div className="minha-conta-password-wrapper">
                                            <input
                                                id="senha-nova"
                                                type={
                                                    mostrarSenhaNova
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={senhaNova}
                                                onChange={(event) =>
                                                    setSenhaNova(
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                minLength={8}
                                                required
                                            />
                                            {renderBotaoSenha(
                                                mostrarSenhaNova,
                                                () =>
                                                    setMostrarSenhaNova(
                                                        (valor) => !valor
                                                    ),
                                                'nova senha'
                                            )}
                                        </div>
                                    </label>

                                    <ValidacaoSenha senha={senhaNova} />

                                    {senhaNova && erroSenhaNova ? (
                                        <small className="minha-conta-feedback">
                                            {erroSenhaNova}
                                        </small>
                                    ) : null}

                                    <label
                                        className="minha-conta-field"
                                        htmlFor="confirmar-senha-nova"
                                    >
                                        <span>Confirmar nova senha</span>
                                        <div className="minha-conta-password-wrapper">
                                            <input
                                                id="confirmar-senha-nova"
                                                type={
                                                    mostrarConfirmacao
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={confirmarSenhaNova}
                                                onChange={(event) =>
                                                    setConfirmarSenhaNova(
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                minLength={8}
                                                required
                                            />
                                            {renderBotaoSenha(
                                                mostrarConfirmacao,
                                                () =>
                                                    setMostrarConfirmacao(
                                                        (valor) => !valor
                                                    ),
                                                'confirmação da senha'
                                            )}
                                        </div>
                                    </label>

                                    {senhaNaoConfere ? (
                                        <small className="minha-conta-feedback">
                                            A nova senha e a confirmação não
                                            conferem.
                                        </small>
                                    ) : null}

                                    <button
                                        type="submit"
                                        className="minha-conta-submit"
                                        disabled={
                                            alterandoSenha ||
                                            !senhaAtual ||
                                            !senhaNova ||
                                            !confirmarSenhaNova ||
                                            Boolean(erroSenhaNova) ||
                                            senhaNaoConfere
                                        }
                                    >
                                        {alterandoSenha
                                            ? 'Alterando...'
                                            : 'Alterar senha'}
                                    </button>
                                </>
                            ) : (
                                <p className="minha-conta-google-message">
                                    Esta conta usa login com Google. A senha
                                    deve ser gerenciada pela sua conta Google.
                                </p>
                            )}
                        </form>
                    </section>
                </section>
            </section>
        </main>
    )
}
