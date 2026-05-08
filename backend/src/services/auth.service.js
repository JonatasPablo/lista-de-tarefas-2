const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')
const mailService = require('./mail.service')

const PASSWORD_MIN_LENGTH = 8
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7)
const EMAIL_VERIFICATION_MINUTES = Number(
    process.env.EMAIL_VERIFICATION_MINUTES || 15
)
const TERMS_VERSION = process.env.TERMS_VERSION || '1.0'

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

const validateTermsAccepted = (termsAccepted) => {
    if (termsAccepted !== true) {
        throw new AppError(
            'É necessário aceitar os Termos de Uso e a Política de Privacidade para criar a conta.',
            400
        )
    }
}

const limitText = (value, maxLength) => {
    if (!value || typeof value !== 'string') {
        return null
    }

    return value.trim().slice(0, maxLength)
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
        email_verified_at: user.email_verified_at,
        terms_accepted_at: user.terms_accepted_at,
        terms_version: user.terms_version,
        created_at: user.created_at,
        updated_at: user.updated_at,
    }
}

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}

const generateCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''

    for (let index = 0; index < 6; index += 1) {
        const randomIndex = crypto.randomInt(0, characters.length)
        code += characters[randomIndex]
    }

    return code
}

const createExpirationDate = (minutes) => {
    const expirationDate = new Date()

    expirationDate.setMinutes(expirationDate.getMinutes() + minutes)

    return expirationDate
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
                google_id,
                created_at,
                email_verified_at,
                terms_accepted_at,
                terms_version,
                terms_accepted_ip,
                terms_accepted_user_agent,
                email_verification_token,
                email_verification_expires_at,
                password_reset_token,
                password_reset_expires_at,
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
                google_id,
                created_at,
                email_verified_at,
                terms_accepted_at,
                terms_version,
                terms_accepted_ip,
                terms_accepted_user_agent,
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
                u.email_verified_at,
                u.terms_accepted_at,
                u.terms_version,
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

const saveEmailVerificationCode = async (userId) => {
    const code = generateCode()
    const codeHash = hashToken(code)
    const expiresAt = createExpirationDate(EMAIL_VERIFICATION_MINUTES)

    await connection.query(
        `
            UPDATE users
            SET
                email_verification_token = ?,
                email_verification_expires_at = ?
            WHERE id = ?
        `,
        [codeHash, expiresAt, userId]
    )

    return {
        code,
        expiresAt,
    }
}

const buildEmailConfirmationUrl = (email) => {
    const frontendUrl =
        process.env.APP_FRONTEND_URL || process.env.CLIENT_URL || ''

    if (!frontendUrl) {
        return null
    }

    const baseUrl = frontendUrl.replace(/\/$/, '')
    const encodedEmail = encodeURIComponent(email)

    return `${baseUrl}/#/confirmar-email?email=${encodedEmail}`
}

const sendVerificationEmail = async (user) => {
    const verification = await saveEmailVerificationCode(user.id)

    await mailService.sendEmailVerificationCode({
        to: user.email,
        name: user.name,
        code: verification.code,
        confirmationUrl: buildEmailConfirmationUrl(user.email),
    })

    return verification
}

const saveTermsAcceptanceHistory = async ({
    userId,
    termsVersion,
    ipAddress,
    userAgent,
}) => {
    await connection.query(
        `
            INSERT INTO user_terms_acceptances (
                user_id,
                terms_version,
                ip_address,
                user_agent
            )
            VALUES (?, ?, ?, ?)
        `,
        [userId, termsVersion, ipAddress, userAgent]
    )
}

const register = async ({
    name,
    email,
    password,
    termsAccepted,
    termsAcceptedIp,
    termsAcceptedUserAgent,
}) => {
    const validName = validateName(name)
    const validEmail = normalizeEmail(email)
    const validPassword = validatePassword(password)

    validateTermsAccepted(termsAccepted)

    const existingUser = await findUserByEmail(validEmail)

    if (existingUser) {
        throw new AppError('Já existe um usuário com este e-mail.', 409)
    }

    const passwordHash = await bcrypt.hash(validPassword, 10)

    const acceptedIp = limitText(termsAcceptedIp, 45)
    const acceptedUserAgent = limitText(termsAcceptedUserAgent, 500)

    const [result] = await connection.query(
        `
            INSERT INTO users (
                name,
                email,
                password_hash,
                provider,
                role,
                terms_accepted_at,
                terms_version,
                terms_accepted_ip,
                terms_accepted_user_agent
            )
            VALUES (?, ?, ?, 'local', 'user', NOW(), ?, ?, ?)
        `,
        [
            validName,
            validEmail,
            passwordHash,
            TERMS_VERSION,
            acceptedIp,
            acceptedUserAgent,
        ]
    )

    await saveTermsAcceptanceHistory({
        userId: result.insertId,
        termsVersion: TERMS_VERSION,
        ipAddress: acceptedIp,
        userAgent: acceptedUserAgent,
    })

    const user = await findUserById(result.insertId)

    await sendVerificationEmail(user)

    return {
        user: mapUser(user),
        message:
            'Cadastro criado com sucesso. Enviamos um código de confirmação para o seu e-mail.',
    }
}

const confirmEmail = async ({ email, code }) => {
    const validEmail = normalizeEmail(email)

    if (!code || typeof code !== 'string') {
        throw new AppError('O código de confirmação é obrigatório.', 400)
    }

    const normalizedCode = code.trim().toUpperCase()

    if (normalizedCode.length !== 6) {
        throw new AppError('O código de confirmação deve ter 6 caracteres.', 400)
    }

    const user = await findUserByEmail(validEmail)

    if (!user) {
        throw new AppError('Usuário não encontrado.', 404)
    }

    if (user.email_verified_at) {
        return {
            user: mapUser(user),
            message: 'E-mail já confirmado.',
        }
    }

    if (!user.email_verification_token) {
        throw new AppError(
            'Nenhum código de confirmação foi gerado para este usuário.',
            400
        )
    }

    if (
        user.email_verification_expires_at &&
        new Date(user.email_verification_expires_at) <= new Date()
    ) {
        throw new AppError(
            'O código de confirmação expirou. Solicite um novo código.',
            400
        )
    }

    const codeHash = hashToken(normalizedCode)

    if (codeHash !== user.email_verification_token) {
        throw new AppError('Código de confirmação inválido.', 400)
    }

    await connection.query(
        `
            UPDATE users
            SET
                email_verified_at = NOW(),
                email_verification_token = NULL,
                email_verification_expires_at = NULL
            WHERE id = ?
        `,
        [user.id]
    )

    const updatedUser = await findUserById(user.id)

    return {
        user: mapUser(updatedUser),
        message: 'E-mail confirmado com sucesso. Agora você já pode entrar.',
    }
}

const resendEmailVerificationCode = async ({ email }) => {
    const validEmail = normalizeEmail(email)
    const user = await findUserByEmail(validEmail)

    if (!user) {
        throw new AppError('Usuário não encontrado.', 404)
    }

    if (user.email_verified_at) {
        return {
            message: 'Este e-mail já está confirmado.',
        }
    }

    await sendVerificationEmail(user)

    return {
        message: 'Enviamos um novo código de confirmação para o seu e-mail.',
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

    if (!user.email_verified_at) {
        throw new AppError(
            'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
            403
        )
    }

    if (!user.terms_accepted_at) {
        throw new AppError(
            'É necessário aceitar os Termos de Uso e a Política de Privacidade antes de entrar.',
            403
        )
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
    confirmEmail,
    resendEmailVerificationCode,
}