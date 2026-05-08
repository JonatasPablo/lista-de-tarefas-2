const authService = require('../services/auth.service')

const SESSION_COOKIE_NAME = 'lista_tarefas_session'

const isProduction = process.env.NODE_ENV === 'production'

const getCookieOptions = (expiresAt) => {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: expiresAt,
        path: '/',
    }
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
    const { name, email, password } = req.body

    const result = await authService.register({
        name,
        email,
        password,
    })

    setSessionCookie(res, result.session)

    return res.status(201).json({
        user: result.user,
    })
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
    login,
    logout,
    me,
}