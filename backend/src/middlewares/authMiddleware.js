const authService = require('../services/auth.service')
const AppError = require('../errors/AppError')

const SESSION_COOKIE_NAME = 'lista_tarefas_session'

const parseCookies = (cookieHeader) => {
    if (!cookieHeader) {
        return {}
    }

    return cookieHeader.split(';').reduce((cookies, cookie) => {
        const [rawName, ...rawValue] = cookie.split('=')
        const name = rawName?.trim()
        const value = rawValue.join('=').trim()

        if (!name) {
            return cookies
        }

        cookies[name] = decodeURIComponent(value)

        return cookies
    }, {})
}

const authMiddleware = async (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie)
    const sessionToken = cookies[SESSION_COOKIE_NAME]

    if (!sessionToken) {
        throw new AppError('Sessão de autenticação não informada.', 401)
    }

    const session = await authService.findUserBySessionToken(sessionToken)

    if (!session) {
        throw new AppError('Sessão inválida ou expirada.', 401)
    }

    req.sessionToken = sessionToken
    req.sessionId = session.sessionId
    req.user = session.user

    return next()
}

module.exports = authMiddleware