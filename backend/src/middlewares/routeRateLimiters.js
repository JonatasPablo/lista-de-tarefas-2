const rateLimit = require('express-rate-limit')
const { ipKeyGenerator } = require('express-rate-limit')

const getIpKey = (req) => {
    return ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown')
}

const getAuthenticatedKey = (req, scope) => {
    const userKey = req.user?.id ? `user:${req.user.id}` : 'user:anonymous'

    return `${scope}:${userKey}:${getIpKey(req)}`
}

const createAuthenticatedLimiter = ({ scope, windowMs, max, message }) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => getAuthenticatedKey(req, scope),
        message: {
            message,
        },
    })
}

const pollingReadLimiter = createAuthenticatedLimiter({
    scope: 'tasks:polling',
    windowMs: 15 * 60 * 1000,
    max: 3000,
    message:
        'Muitas sincronizacoes foram realizadas. Aguarde alguns instantes e tente novamente.',
})

const taskMutationLimiter = createAuthenticatedLimiter({
    scope: 'tasks:mutation',
    windowMs: 15 * 60 * 1000,
    max: 450,
    message:
        'Muitas alteracoes foram realizadas. Aguarde alguns instantes e tente novamente.',
})

const uploadLimiter = createAuthenticatedLimiter({
    scope: 'upload',
    windowMs: 15 * 60 * 1000,
    max: 120,
    message:
        'Muitos uploads foram realizados. Aguarde alguns instantes e tente novamente.',
})

const attachmentReadLimiter = createAuthenticatedLimiter({
    scope: 'attachments:read',
    windowMs: 15 * 60 * 1000,
    max: 1800,
    message:
        'Muitos anexos foram acessados. Aguarde alguns instantes e tente novamente.',
})

const avatarUploadLimiter = createAuthenticatedLimiter({
    scope: 'avatar:upload',
    windowMs: 15 * 60 * 1000,
    max: 30,
    message:
        'Muitos envios de avatar foram realizados. Aguarde alguns instantes e tente novamente.',
})

const avatarReadLimiter = createAuthenticatedLimiter({
    scope: 'avatar:read',
    windowMs: 15 * 60 * 1000,
    max: 900,
    message:
        'Muitos acessos ao avatar foram realizados. Aguarde alguns instantes e tente novamente.',
})

module.exports = {
    pollingReadLimiter,
    taskMutationLimiter,
    uploadLimiter,
    attachmentReadLimiter,
    avatarUploadLimiter,
    avatarReadLimiter,
}
