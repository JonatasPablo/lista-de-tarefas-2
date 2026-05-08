const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const PASSWORD_MIN_LENGTH = 8
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7)

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

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}

const createSessionExpirationDate = () => {
    const expirationDate = new Date()

    expirationDate.setDate(expirationDate.getDate() + SESSION_DAYS)

    return expirationDate
}

const createSession = async (userId) => {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = hashToken(token)
    const expiresAt = createSessionExpirationDate()

    await connection.query(
        `
            INSERT INTO user_sessions (
                user_id,
                token_hash,
                expires_at
            )
            VALUES (?, ?, ?)
        `,
        [userId, tokenHash, expiresAt]
    )

    return {
        token,
        expiresAt,
    }
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

const findUserBySessionToken = async (token) => {
    if (!token) {
        return null
    }

    const tokenHash = hashToken(token)

    const [sessions] = await connection.query(
        `
            SELECT
                us.id AS session_id,
                us.user_id,
                us.expires_at,
                us.revoked_at,
                u.id,
                u.name,
                u.email,
                u.provider,
                u.role,
                u.created_at,
                u.updated_at
            FROM user_sessions us
            INNER JOIN users u ON u.id = us.user_id
            WHERE us.token_hash = ?
                AND us.revoked_at IS NULL
                AND us.expires_at > NOW()
            LIMIT 1
        `,
        [tokenHash]
    )

    const session = sessions[0]

    if (!session) {
        return null
    }

    await connection.query(
        `
            UPDATE user_sessions
            SET last_used_at = NOW()
            WHERE id = ?
        `,
        [session.session_id]
    )

    return {
        sessionId: session.session_id,
        user: mapUser(session),
    }
}

const revokeSession = async (token) => {
    if (!token) {
        return false
    }

    const tokenHash = hashToken(token)

    const [result] = await connection.query(
        `
            UPDATE user_sessions
            SET revoked_at = NOW()
            WHERE token_hash = ?
                AND revoked_at IS NULL
        `,
        [tokenHash]
    )

    return result.affectedRows > 0
}

const removeExpiredSessions = async () => {
    await connection.query(
        `
            DELETE FROM user_sessions
            WHERE expires_at <= NOW()
                OR revoked_at IS NOT NULL
        `
    )
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
    const session = await createSession(user.id)

    return {
        user: mapUser(user),
        session,
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

    await removeExpiredSessions()

    const session = await createSession(user.id)

    return {
        user: mapUser(user),
        session,
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
    findUserBySessionToken,
    revokeSession,
}