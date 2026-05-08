const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const PASSWORD_MIN_LENGTH = 8

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error('Variável de ambiente JWT_SECRET não configurada.')
    }

    return process.env.JWT_SECRET
}

const getJwtExpiresIn = () => {
    return process.env.JWT_EXPIRES_IN || '7d'
}

const normalizeEmail = (email) => {
    if (!email || typeof email !== 'string') {
        throw new AppError('O e-mail é obrigatório.', 400)
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail.includes('@')) {
        throw new AppError('Informe um e-mail válido.', 400)
    }

    if (normalizedEmail.length > 150) {
        throw new AppError(
            'O e-mail não pode ter mais que 150 caracteres.',
            400
        )
    }

    return normalizedEmail
}

const validateName = (name) => {
    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError('O nome é obrigatório.', 400)
    }

    const validName = name.trim()

    if (validName.length > 150) {
        throw new AppError(
            'O nome não pode ter mais que 150 caracteres.',
            400
        )
    }

    return validName
}

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        throw new AppError('A senha é obrigatória.', 400)
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new AppError(
            `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
            400
        )
    }

    return password
}

const mapUser = (user) => {
    if (!user) {
        return null
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: user.role || 'user',
        created_at: user.created_at,
        updated_at: user.updated_at,
    }
}

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
        },
        getJwtSecret(),
        {
            expiresIn: getJwtExpiresIn(),
        }
    )
}

const findUserByEmail = async (email) => {
    const [users] = await connection.query(
        `
            SELECT
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                created_at,
                updated_at
            FROM users
            WHERE email = ?
            LIMIT 1
        `,
        [email]
    )

    return users[0] || null
}

const findUserById = async (id) => {
    const [users] = await connection.query(
        `
            SELECT
                id,
                name,
                email,
                provider,
                role,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `,
        [id]
    )

    return users[0] || null
}

const register = async ({ name, email, password }) => {
    const validName = validateName(name)
    const validEmail = normalizeEmail(email)
    const validPassword = validatePassword(password)

    const existingUser = await findUserByEmail(validEmail)

    if (existingUser) {
        throw new AppError('Já existe um usuário com este e-mail.', 409)
    }

    const passwordHash = await bcrypt.hash(validPassword, 10)

    const [result] = await connection.query(
        `
            INSERT INTO users (
                name,
                email,
                password_hash,
                provider,
                role
            )
            VALUES (?, ?, ?, 'local', 'user')
        `,
        [validName, validEmail, passwordHash]
    )

    const user = await findUserById(result.insertId)

    const token = generateToken(user)

    return {
        user: mapUser(user),
        token,
    }
}

const login = async ({ email, password }) => {
    const validEmail = normalizeEmail(email)

    if (!password || typeof password !== 'string') {
        throw new AppError('A senha é obrigatória.', 400)
    }

    const user = await findUserByEmail(validEmail)

    if (!user || !user.password_hash) {
        throw new AppError('E-mail ou senha inválidos.', 401)
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatches) {
        throw new AppError('E-mail ou senha inválidos.', 401)
    }

    const token = generateToken(user)

    return {
        user: mapUser(user),
        token,
    }
}

const me = async (userId) => {
    const user = await findUserById(userId)

    if (!user) {
        throw new AppError('Usuário não encontrado.', 404)
    }

    return mapUser(user)
}

module.exports = {
    register,
    login,
    me,
}