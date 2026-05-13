const authService = require('../services/auth.service')

const SESSION_COOKIE_NAME = 'lista_tarefas_session'

const isProduction = process.env.NODE_ENV === 'production'

const getGoogleClientId = () => {
    return (
        process.env.GOOGLE_CLIENT_ID?.trim() ||
        process.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
        ''
    )
}

const getCookieOptions = (expiresAt) => {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: expiresAt,
        path: '/',
    }
}

const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for']

    if (typeof forwardedFor === 'string') {
        return forwardedFor.split(',')[0].trim()
    }

    return req.ip || req.socket?.remoteAddress || null
}

const getUserAgent = (req) => {
    return req.get('user-agent') || null
}

const setSessionCookie = (res, session) => {
    res.cookie(
        SESSION_COOKIE_NAME,
        session.token,
        getCookieOptions(session.expiresAt)
    )
}

const clearSessionCookie = (res) => {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    })
}

const register = async (req, res) => {
    const { name, email, password, termsAccepted } = req.body

    const result = await authService.register({
        name,
        email,
        password,
        termsAccepted,
        termsAcceptedIp: getClientIp(req),
        termsAcceptedUserAgent: getUserAgent(req),
    })

    return res.status(201).json(result)
}

const confirmEmail = async (req, res) => {
    const { email, code } = req.body

    const result = await authService.confirmEmail({
        email,
        code,
    })

    return res.json(result)
}

const resendEmailVerificationCode = async (req, res) => {
    const { email } = req.body

    const result = await authService.resendEmailVerificationCode({
        email,
    })

    return res.json(result)
}

const verificarStatusConfirmacaoEmail = async (req, res) => {
    const { email } = req.body

    const result = await authService.verificarStatusConfirmacaoEmail({
        email,
    })

    return res.json(result)
}

const solicitarRedefinicaoSenha = async (req, res) => {
    const { email } = req.body

    const result = await authService.solicitarRedefinicaoSenha({
        email,
    })

    return res.json(result)
}

const validarCodigoRedefinicaoSenha = async (req, res) => {
    const { email, code } = req.body

    const result = await authService.validarCodigoRedefinicaoSenha({
        email,
        code,
    })

    return res.json(result)
}

const redefinirSenha = async (req, res) => {
    const { email, code, password } = req.body

    const result = await authService.redefinirSenha({
        email,
        code,
        password,
    })

    return res.json(result)
}

const login = async (req, res) => {
    const { email, password } = req.body

    const result = await authService.login({
        email,
        password,
    })

    setSessionCookie(res, result.session)

    return res.json({
        user: result.user,
    })
}

const loginGoogle = async (req, res) => {
    const { credential, termsAccepted } = req.body

    const result = await authService.loginGoogle({
        credential,
        termsAccepted,
        termsAcceptedIp: getClientIp(req),
        termsAcceptedUserAgent: getUserAgent(req),
    })

    setSessionCookie(res, result.session)

    return res.json({
        user: result.user,
    })
}

const config = async (req, res) => {
    return res.json({
        googleLoginEnabled: Boolean(getGoogleClientId()),
    })
}

const logout = async (req, res) => {
    if (req.sessionToken) {
        await authService.revokeSession(req.sessionToken)
    }

    clearSessionCookie(res)

    return res.status(204).send()
}

const me = async (req, res) => {
    const user = await authService.me(req.user.id)

    return res.json(user)
}

module.exports = {
    register,
    confirmEmail,
    resendEmailVerificationCode,
    verificarStatusConfirmacaoEmail,
    solicitarRedefinicaoSenha,
    validarCodigoRedefinicaoSenha,
    redefinirSenha,
    login,
    loginGoogle,
    config,
    logout,
    me,
}
