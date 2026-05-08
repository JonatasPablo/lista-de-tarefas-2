const jwt = require('jsonwebtoken')

const AppError = require('../errors/AppError')

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Variável de ambiente JWT_SECRET não configurada.')
    }

    return process.env.JWT_SECRET
}

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        throw new AppError('Token de autenticação não informado.', 401)
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer' || !token) {
        throw new AppError('Token de autenticação inválido.', 401)
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret())

        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || 'user',
        }

        return next()
    } catch {
        throw new AppError('Token de autenticação inválido ou expirado.', 401)
    }
}

module.exports = authMiddleware