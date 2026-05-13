const rateLimit = require('express-rate-limit')
const { ipKeyGenerator } = require('express-rate-limit')

const normalizeEmail = (email) => {
    if (typeof email !== 'string') {
        return 'sem-email'
    }

    return email.trim().toLowerCase() || 'sem-email'
}

const getEmailFromRequest = (req) => {
    return normalizeEmail(req.body?.email)
}

const getIpKey = (req) => {
    return ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown')
}

const createAuthLimiter = ({ max, windowMs, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `${getIpKey(req)}:${getEmailFromRequest(req)}`,
        message: {
            message,
        },
    })
}

const createAuthenticatedUserLimiter = ({ max, windowMs, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) =>
            `${getIpKey(req)}:${req.user?.id || 'sem-usuario'}`,
        message: {
            message,
        },
    })
}

const loginLimiter = createAuthLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message:
        'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
})

const emailConfirmationLimiter = createAuthLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:
        'Muitas tentativas de confirmacao de e-mail. Aguarde alguns minutos e tente novamente.',
})

const resendConfirmationLimiter = createAuthLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message:
        'Muitos reenvios solicitados. Aguarde antes de pedir um novo codigo.',
})

const passwordResetRequestLimiter = createAuthLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message:
        'Muitas solicitacoes de redefinicao de senha. Aguarde antes de tentar novamente.',
})

const passwordResetAttemptLimiter = createAuthLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message:
        'Muitas tentativas de redefinicao de senha. Aguarde alguns minutos e tente novamente.',
})

const accountPasswordChangeLimiter = createAuthenticatedUserLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message:
        'Muitas tentativas de alteracao de senha. Aguarde alguns minutos e tente novamente.',
})

module.exports = {
    loginLimiter,
    emailConfirmationLimiter,
    resendConfirmationLimiter,
    passwordResetRequestLimiter,
    passwordResetAttemptLimiter,
    accountPasswordChangeLimiter,
}
