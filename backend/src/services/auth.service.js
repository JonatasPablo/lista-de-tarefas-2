const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const dns = require('dns').promises
const { OAuth2Client } = require('google-auth-library')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')
const mailService = require('./mail.service')

const PASSWORD_MIN_LENGTH = 8
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 7)
const EMAIL_VERIFICATION_MINUTES = Number(
    process.env.EMAIL_VERIFICATION_MINUTES || 15
)
const PASSWORD_RESET_MINUTES = Number(process.env.PASSWORD_RESET_MINUTES || 15)
const TERMS_VERSION = process.env.TERMS_VERSION || '1.0'

const PROVEDOR_LOCAL = 'local'
const PROVEDOR_GOOGLE = 'google'
const PROVEDOR_APPLE = 'apple'
let userProfileFieldsAvailableCache = null

const getGoogleClientId = () => {
    return (
        process.env.GOOGLE_CLIENT_ID?.trim() ||
        process.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
        ''
    )
}

const MENSAGEM_REENVIO_CONFIRMACAO =
    'Se existir uma conta pendente de confirmação para este e-mail, enviaremos um novo código.'
const MENSAGEM_REDEFINICAO_SOLICITADA =
    'Se existir uma conta local confirmada para este e-mail, enviaremos um código de redefinição.'
const MENSAGEM_CODIGO_REDEFINICAO_INVALIDO =
    'Código de redefinição inválido ou expirado.'

const DOMINIOS_EMAIL_COMUNS = new Set([
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'yahoo.com',
    'yahoo.com.br',
    'bol.com.br',
    'uol.com.br',
    'terra.com.br',
    'globo.com',
])

const obterDominiosPermitidosPorEnv = () => {
    return String(process.env.EMAIL_ALLOWED_DOMAINS || '')
        .split(',')
        .map((dominio) => dominio.trim().toLowerCase())
        .filter(Boolean)
}

const PALAVRAS_SENHA_FRACA = [
    'senha',
    'password',
    'admin',
    'teste',
    'qwerty',
    'abc123',
    '123456',
    '12345678',
]

const removerAcentos = (texto) => {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

const normalizarTextoParaComparacao = (texto) => {
    return removerAcentos(texto).toLowerCase().trim()
}

const validarFormatoEmail = (email) => {
    if (!email || typeof email !== 'string') {
        throw new AppError('O e-mail é obrigatório.', 400)
    }

    const emailNormalizado = email.trim().toLowerCase()

    if (emailNormalizado.length > 150) {
        throw new AppError(
            'O e-mail não pode ter mais que 150 caracteres.',
            400
        )
    }

    const emailRegex =
        /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i

    if (!emailRegex.test(emailNormalizado)) {
        throw new AppError('Informe um e-mail válido.', 400)
    }

    const [parteLocal, dominio] = emailNormalizado.split('@')

    if (!parteLocal || !dominio || parteLocal.length < 2) {
        throw new AppError('Informe um e-mail válido.', 400)
    }

    const partesDominio = dominio.split('.')
    const extensao = partesDominio[partesDominio.length - 1]

    if (!extensao || extensao.length < 2) {
        throw new AppError('Informe um e-mail válido.', 400)
    }

    return emailNormalizado
}

const verificarDominioEmailExiste = async (email) => {
    const dominio = email.split('@')[1]?.trim().toLowerCase()

    if (!dominio) {
        throw new AppError('Informe um e-mail válido.', 400)
    }

    if (DOMINIOS_EMAIL_COMUNS.has(dominio)) {
        return true
    }

    const dominiosPermitidos = obterDominiosPermitidosPorEnv()

    if (dominiosPermitidos.includes(dominio)) {
        return true
    }

    try {
        const registrosMx = await dns.resolveMx(dominio)

        if (Array.isArray(registrosMx) && registrosMx.length > 0) {
            return true
        }
    } catch {
        // Quando MX falhar, tentamos confirmar o domínio por IPv4.
    }

    try {
        const enderecosIpv4 = await dns.resolve4(dominio)

        if (Array.isArray(enderecosIpv4) && enderecosIpv4.length > 0) {
            return true
        }
    } catch {
        // Quando IPv4 falhar, tentamos confirmar o domínio por IPv6.
    }

    try {
        const enderecosIpv6 = await dns.resolve6(dominio)

        if (Array.isArray(enderecosIpv6) && enderecosIpv6.length > 0) {
            return true
        }
    } catch {
        // Sem confirmação por DNS. Retornamos mensagem clara ao usuário.
    }

    throw new AppError(
        'Não foi possível confirmar o provedor deste e-mail. Verifique se o endereço foi digitado corretamente.',
        400
    )
}

const normalizeEmail = (email) => {
    return validarFormatoEmail(email)
}

const normalizeAndValidateExistingEmailProvider = async (email) => {
    const emailNormalizado = validarFormatoEmail(email)

    await verificarDominioEmailExiste(emailNormalizado)

    return emailNormalizado
}

const validateName = (name) => {
    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError(
            'Informe um nome válido, com pelo menos 3 caracteres e usando letras.',
            400
        )
    }

    const validName = name.trim().replace(/\s+/g, ' ')

    if (validName.length < 3) {
        throw new AppError(
            'Informe um nome válido, com pelo menos 3 caracteres e usando letras.',
            400
        )
    }

    if (validName.length > 150) {
        throw new AppError(
            'O nome não pode ter mais que 150 caracteres.',
            400
        )
    }

    const nomePermitidoRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

    if (!nomePermitidoRegex.test(validName)) {
        throw new AppError(
            'Informe um nome válido, com pelo menos 3 caracteres e usando letras.',
            400
        )
    }

    const letras = validName.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []

    if (letras.length < 2) {
        throw new AppError(
            'Informe um nome válido, com pelo menos 3 caracteres e usando letras.',
            400
        )
    }

    return validName
}

const obterParteLocalEmail = (email) => {
    return normalizarTextoParaComparacao(email.split('@')[0] || '')
}

const validatePassword = (password, options = {}) => {
    const { name, email } = options

    if (!password || typeof password !== 'string') {
        throw new AppError('A senha é obrigatória.', 400)
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new AppError(
            `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
            400
        )
    }

    const temMaiuscula = /[A-ZÀ-Ö]/.test(password)
    const temMinuscula = /[a-zà-öø-ÿ]/.test(password)
    const temNumero = /\d/.test(password)
    const temEspecial = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(password)

    if (!temMaiuscula || !temMinuscula || !temNumero || !temEspecial) {
        throw new AppError(
            'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.',
            400
        )
    }

    const senhaNormalizada = normalizarTextoParaComparacao(password)

    const senhaTemPalavraFraca = PALAVRAS_SENHA_FRACA.some((palavra) =>
        senhaNormalizada.includes(palavra)
    )

    if (senhaTemPalavraFraca) {
        throw new AppError(
            'A senha está muito fácil de adivinhar. Evite palavras comuns como senha, admin, teste ou sequências simples.',
            400
        )
    }

    if (/(.)\1{4,}/.test(password)) {
        throw new AppError(
            'A senha está muito fácil de adivinhar. Evite repetir muitos caracteres iguais.',
            400
        )
    }

    if (email) {
        const parteLocalEmail = obterParteLocalEmail(email)

        if (
            parteLocalEmail.length >= 3 &&
            senhaNormalizada.includes(parteLocalEmail)
        ) {
            throw new AppError(
                'A senha não pode conter parte do seu e-mail.',
                400
            )
        }
    }

    if (name) {
        const partesNome = normalizarTextoParaComparacao(name)
            .split(/\s+/)
            .filter((parte) => parte.length >= 3)

        const senhaContemNome = partesNome.some((parte) =>
            senhaNormalizada.includes(parte)
        )

        if (senhaContemNome) {
            throw new AppError(
                'A senha não pode conter parte do seu nome.',
                400
            )
        }
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

const hasUserProfileFields = async (db = connection) => {
    if (userProfileFieldsAvailableCache !== null) {
        return userProfileFieldsAvailableCache
    }

    const [columns] = await db.query(`
        SHOW COLUMNS FROM users LIKE 'avatar_path'
    `)

    userProfileFieldsAvailableCache = columns.length > 0

    return userProfileFieldsAvailableCache
}

const getUserProfileSelectFields = async (db = connection, tablePrefix = '') => {
    const hasProfileFields = await hasUserProfileFields(db)
    const prefix = tablePrefix ? `${tablePrefix}.` : ''

    if (!hasProfileFields) {
        return `
                NULL AS avatar_path,
                NULL AS avatar_original_name,
                NULL AS avatar_mime_type,
                NULL AS avatar_size_bytes,
                NULL AS profile_updated_at,`
    }

    return `
                ${prefix}avatar_path,
                ${prefix}avatar_original_name,
                ${prefix}avatar_mime_type,
                ${prefix}avatar_size_bytes,
                ${prefix}profile_updated_at,`
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
        has_password: Boolean(user.password_hash),
        has_avatar: Boolean(user.avatar_path),
        avatar_updated_at: user.profile_updated_at,
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

const buildPasswordResetUrl = (email) => {
    const frontendUrl =
        process.env.APP_FRONTEND_URL || process.env.CLIENT_URL || ''

    if (!frontendUrl) {
        return null
    }

    const baseUrl = frontendUrl.replace(/\/$/, '')
    const encodedEmail = encodeURIComponent(email)

    return `${baseUrl}/#/esqueci-senha?email=${encodedEmail}`
}

const createSession = async (userId) => {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = hashToken(token)
    const profileFields = await getUserProfileSelectFields(connection, 'u')
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
    const profileFields = await getUserProfileSelectFields()

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
                apple_id,
                ${profileFields}
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

const findUserByGoogleId = async (googleId) => {
    const profileFields = await getUserProfileSelectFields()

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
                apple_id,
                ${profileFields}
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
            WHERE google_id = ?
            LIMIT 1
        `,
        [googleId]
    )

    return users[0] || null
}

const findUserById = async (id, db = connection) => {
    const profileFields = await getUserProfileSelectFields(db)

    const [users] = await db.query(
        `
            SELECT
                id,
                name,
                email,
                password_hash,
                provider,
                role,
                google_id,
                apple_id,
                ${profileFields}
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
    const profileFields = await getUserProfileSelectFields(connection, 'u')

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
                u.password_hash,
                u.provider,
                u.role,
                ${profileFields}
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

const saveEmailVerificationCode = async (userId, db = connection) => {
    const code = generateCode()
    const codeHash = hashToken(code)
    const expiresAt = createExpirationDate(EMAIL_VERIFICATION_MINUTES)

    await db.query(
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

const salvarCodigoRedefinicaoSenha = async (userId) => {
    const codigo = generateCode()
    const codigoHash = hashToken(codigo)
    const expiraEm = createExpirationDate(PASSWORD_RESET_MINUTES)

    await connection.query(
        `
            UPDATE users
            SET
                password_reset_token = ?,
                password_reset_expires_at = ?
            WHERE id = ?
        `,
        [codigoHash, expiraEm, userId]
    )

    return {
        codigo,
        expiraEm,
    }
}

const validarCodigoRedefinicao = (usuario, codigo) => {
    if (!codigo || typeof codigo !== 'string') {
        throw new AppError('O código de redefinição é obrigatório.', 400)
    }

    const codigoNormalizado = codigo.trim().toUpperCase()

    if (codigoNormalizado.length !== 6) {
        throw new AppError('O código de redefinição deve ter 6 caracteres.', 400)
    }

    if (!usuario || !usuario.password_reset_token) {
        throw new AppError(MENSAGEM_CODIGO_REDEFINICAO_INVALIDO, 400)
    }

    if (
        usuario.password_reset_expires_at &&
        new Date(usuario.password_reset_expires_at) <= new Date()
    ) {
        throw new AppError(
            'O código de redefinição expirou. Solicite um novo código.',
            400
        )
    }

    const codigoHash = hashToken(codigoNormalizado)

    if (codigoHash !== usuario.password_reset_token) {
        throw new AppError(MENSAGEM_CODIGO_REDEFINICAO_INVALIDO, 400)
    }

    return codigoNormalizado
}

const sendVerificationEmail = async (user, db = connection) => {
    const verification = await saveEmailVerificationCode(user.id, db)

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
    db = connection,
}) => {
    await db.query(
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
    const validEmail = await normalizeAndValidateExistingEmailProvider(email)
    const validPassword = validatePassword(password, {
        name: validName,
        email: validEmail,
    })

    validateTermsAccepted(termsAccepted)

    const existingUser = await findUserByEmail(validEmail)

    if (existingUser) {
        throw new AppError('Já existe um usuário com este e-mail.', 409)
    }

    const passwordHash = await bcrypt.hash(validPassword, 10)

    const acceptedIp = limitText(termsAcceptedIp, 45)
    const acceptedUserAgent = limitText(termsAcceptedUserAgent, 500)

    const db = await connection.getConnection()

    try {
        await db.beginTransaction()

        const [result] = await db.query(
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
            db,
        })

        const user = await findUserById(result.insertId, db)

        await sendVerificationEmail(user, db)
        await db.commit()

        return {
            user: mapUser(user),
            message:
                'Cadastro criado com sucesso. Enviamos um código de confirmação para seu e-mail.',
        }
    } catch (error) {
        await db.rollback()

        throw error
    } finally {
        db.release()
    }
}

const confirmEmail = async ({ email, code }) => {
    const validEmail = normalizeEmail(email)

    if (!code || typeof code !== 'string') {
        throw new AppError('O código de confirmação é obrigatório.', 400)
    }

    const codeNormalized = code.trim().toUpperCase()

    if (codeNormalized.length !== 6) {
        throw new AppError('O código de confirmação deve ter 6 caracteres.', 400)
    }

    const user = await findUserByEmail(validEmail)

    if (!user) {
        throw new AppError(
            'Código de confirmação inválido ou expirado. Solicite um novo código.',
            400
        )
    }

    if (user.email_verified_at) {
        return {
            user: mapUser(user),
            message: 'E-mail já confirmado.',
        }
    }

    if (!user.email_verification_token) {
        throw new AppError(
            'Código de confirmação inválido ou expirado. Solicite um novo código.',
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

    const codeHash = hashToken(codeNormalized)

    if (codeHash !== user.email_verification_token) {
        throw new AppError('Código de confirmação inválido.', 400)
    }

    await connection.query(
        `
            UPDATE users
            SET
                email_verified_at = NOW(),
                email_verification_token = NULL,
                email_verification_expires_at = NULL,
                updated_at = NOW()
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
        return {
            message: MENSAGEM_REENVIO_CONFIRMACAO,
        }
    }

    if (user.email_verified_at) {
        return {
            message: MENSAGEM_REENVIO_CONFIRMACAO,
        }
    }

    await sendVerificationEmail(user)

    return {
        message: 'Enviamos um novo código de confirmação para seu e-mail.',
    }
}

const verificarStatusConfirmacaoEmail = async ({ email }) => {
    normalizeEmail(email)

    return {
        confirmed: false,
    }
}

const solicitarRedefinicaoSenha = async ({ email }) => {
    const validEmail = normalizeEmail(email)
    const usuario = await findUserByEmail(validEmail)

    if (!usuario) {
        return {
            message: MENSAGEM_REDEFINICAO_SOLICITADA,
            action: 'reset_password',
        }
    }

    if (!usuario.email_verified_at) {
        return {
            message:
                'Este cadastro ainda não foi confirmado. Confirme seu e-mail para finalizar o cadastro.',
            action: 'confirm_email',
        }
    }

    if (usuario.provider === PROVEDOR_GOOGLE) {
        throw new AppError(
            'Esta conta usa login com Google. Entre usando o botão "Entrar com Google".',
            400
        )
    }

    if (usuario.provider === PROVEDOR_APPLE) {
        throw new AppError(
            'Esta conta usa login com Apple. Entre usando o botão "Entrar com Apple".',
            400
        )
    }

    const redefinicao = await salvarCodigoRedefinicaoSenha(usuario.id)

    await mailService.sendPasswordResetCode({
        to: usuario.email,
        name: usuario.name,
        code: redefinicao.codigo,
        resetUrl: buildPasswordResetUrl(usuario.email),
    })

    return {
        message: 'Enviamos um código de redefinição para o seu e-mail.',
        action: 'reset_password',
    }
}

const validarCodigoRedefinicaoSenha = async ({ email, code }) => {
    const validEmail = normalizeEmail(email)
    const usuario = await findUserByEmail(validEmail)

    if (!usuario) {
        throw new AppError(MENSAGEM_CODIGO_REDEFINICAO_INVALIDO, 400)
    }

    validarCodigoRedefinicao(usuario, code)

    return {
        message: 'Código validado com sucesso.',
    }
}

const redefinirSenha = async ({ email, code, password }) => {
    const validEmail = normalizeEmail(email)
    const usuario = await findUserByEmail(validEmail)

    if (!usuario) {
        throw new AppError(MENSAGEM_CODIGO_REDEFINICAO_INVALIDO, 400)
    }

    if (usuario.provider === PROVEDOR_GOOGLE) {
        throw new AppError(
            'Esta conta usa login com Google. Entre usando o botão "Entrar com Google".',
            400
        )
    }

    if (usuario.provider === PROVEDOR_APPLE) {
        throw new AppError(
            'Esta conta usa login com Apple. Entre usando o botão "Entrar com Apple".',
            400
        )
    }

    if (!usuario.password_hash) {
        throw new AppError(
            'Esta conta não possui senha local cadastrada.',
            400
        )
    }

    const senhaValida = validatePassword(password, {
        name: usuario.name,
        email: usuario.email,
    })

    validarCodigoRedefinicao(usuario, code)

    const senhaIgualAtual = await bcrypt.compare(
        senhaValida,
        usuario.password_hash
    )

    if (senhaIgualAtual) {
        throw new AppError(
            'A nova senha não pode ser igual à senha atual.',
            400
        )
    }

    const novoHashSenha = await bcrypt.hash(senhaValida, 10)

    await connection.query(
        `
            UPDATE users
            SET
                password_hash = ?,
                password_reset_token = NULL,
                password_reset_expires_at = NULL,
                updated_at = NOW()
            WHERE id = ?
        `,
        [novoHashSenha, usuario.id]
    )

    await connection.query(
        `
            UPDATE user_sessions
            SET revoked_at = NOW()
            WHERE user_id = ?
                AND revoked_at IS NULL
        `,
        [usuario.id]
    )

    try {
        await mailService.sendPasswordChangedNotification({
            to: usuario.email,
            name: usuario.name,
            resetUrl: buildPasswordResetUrl(usuario.email),
        })
    } catch (error) {
        console.error(
            'Erro ao enviar e-mail de aviso de senha redefinida:',
            error
        )
    }

    return {
        message: 'Senha redefinida com sucesso. Entre usando sua nova senha.',
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

    if (user.provider !== PROVEDOR_LOCAL) {
        throw new AppError(
            'Essa conta usa login externo. Entre usando o provedor usado no cadastro.',
            403
        )
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

const validarTokenGoogle = async (credential) => {
    if (!credential || typeof credential !== 'string') {
        throw new AppError('Token do Google não informado.', 400)
    }

    const googleClientId = getGoogleClientId()

    if (!googleClientId) {
        throw new AppError(
            'Login com Google não configurado no servidor.',
            500
        )
    }

    const googleClient = new OAuth2Client(googleClientId)

    let ticket

    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        })
    } catch {
        throw new AppError(
            'Não foi possível validar sua conta Google. Tente novamente.',
            401
        )
    }

    const payload = ticket.getPayload()

    if (!payload) {
        throw new AppError(
            'Não foi possível obter os dados da sua conta Google.',
            401
        )
    }

    if (!payload.sub) {
        throw new AppError(
            'Não foi possível identificar sua conta Google.',
            401
        )
    }

    if (!payload.email) {
        throw new AppError(
            'Sua conta Google não retornou um e-mail válido.',
            401
        )
    }

    if (payload.email_verified !== true) {
        throw new AppError(
            'Seu e-mail do Google ainda não está verificado.',
            403
        )
    }

    const emailNormalizado = normalizeEmail(payload.email)
    const nomeGoogle =
        typeof payload.name === 'string' && payload.name.trim()
            ? payload.name.trim()
            : emailNormalizado.split('@')[0]

    return {
        googleId: payload.sub,
        email: emailNormalizado,
        name: validateName(nomeGoogle),
    }
}

const registrarAceiteTermosUsuarioSocial = async ({
    userId,
    termsAcceptedIp,
    termsAcceptedUserAgent,
}) => {
    const acceptedIp = limitText(termsAcceptedIp, 45)
    const acceptedUserAgent = limitText(termsAcceptedUserAgent, 500)

    await connection.query(
        `
            UPDATE users
            SET
                terms_accepted_at = NOW(),
                terms_version = ?,
                terms_accepted_ip = ?,
                terms_accepted_user_agent = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
        [
            TERMS_VERSION,
            acceptedIp,
            acceptedUserAgent,
            userId,
        ]
    )

    await saveTermsAcceptanceHistory({
        userId,
        termsVersion: TERMS_VERSION,
        ipAddress: acceptedIp,
        userAgent: acceptedUserAgent,
    })
}

const criarUsuarioGoogle = async ({
    name,
    email,
    googleId,
    termsAcceptedIp,
    termsAcceptedUserAgent,
}) => {
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
                google_id,
                email_verified_at,
                terms_accepted_at,
                terms_version,
                terms_accepted_ip,
                terms_accepted_user_agent
            )
            VALUES (?, ?, NULL, 'google', 'user', ?, NOW(), NOW(), ?, ?, ?)
        `,
        [
            name,
            email,
            googleId,
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

    return findUserById(result.insertId)
}

const vincularGoogleAoUsuarioExistente = async ({
    user,
    googleId,
    termsAccepted,
    termsAcceptedIp,
    termsAcceptedUserAgent,
}) => {
    if (user.provider === PROVEDOR_APPLE) {
        throw new AppError(
            'Este e-mail já está vinculado a uma conta Apple. Entre usando o botão "Entrar com Apple".',
            409
        )
    }

    if (user.google_id && user.google_id !== googleId) {
        throw new AppError(
            'Este e-mail já está vinculado a outra conta Google.',
            409
        )
    }

    if (!user.terms_accepted_at) {
        validateTermsAccepted(termsAccepted)

        await registrarAceiteTermosUsuarioSocial({
            userId: user.id,
            termsAcceptedIp,
            termsAcceptedUserAgent,
        })
    }

    await connection.query(
        `
            UPDATE users
            SET
                google_id = ?,
                email_verified_at = COALESCE(email_verified_at, NOW()),
                email_verification_token = NULL,
                email_verification_expires_at = NULL,
                updated_at = NOW()
            WHERE id = ?
        `,
        [googleId, user.id]
    )

    return findUserById(user.id)
}

const loginGoogle = async ({
    credential,
    termsAccepted,
    termsAcceptedIp,
    termsAcceptedUserAgent,
}) => {
    const dadosGoogle = await validarTokenGoogle(credential)

    let user = await findUserByGoogleId(dadosGoogle.googleId)

    if (!user) {
        const userByEmail = await findUserByEmail(dadosGoogle.email)

        if (userByEmail) {
            user = await vincularGoogleAoUsuarioExistente({
                user: userByEmail,
                googleId: dadosGoogle.googleId,
                termsAccepted,
                termsAcceptedIp,
                termsAcceptedUserAgent,
            })
        } else {
            validateTermsAccepted(termsAccepted)

            user = await criarUsuarioGoogle({
                name: dadosGoogle.name,
                email: dadosGoogle.email,
                googleId: dadosGoogle.googleId,
                termsAcceptedIp,
                termsAcceptedUserAgent,
            })
        }
    }

    if (!user.email_verified_at) {
        await connection.query(
            `
                UPDATE users
                SET
                    email_verified_at = NOW(),
                    email_verification_token = NULL,
                    email_verification_expires_at = NULL,
                    updated_at = NOW()
                WHERE id = ?
            `,
            [user.id]
        )

        user = await findUserById(user.id)
    }

    if (!user.terms_accepted_at) {
        validateTermsAccepted(termsAccepted)

        await registrarAceiteTermosUsuarioSocial({
            userId: user.id,
            termsAcceptedIp,
            termsAcceptedUserAgent,
        })

        user = await findUserById(user.id)
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
    validateName,
    validatePassword,
    mapUser,
    getUserProfileSelectFields,
    hasUserProfileFields,
    register,
    login,
    loginGoogle,
    me,
    findUserBySessionToken,
    revokeSession,
    confirmEmail,
    resendEmailVerificationCode,
    verificarStatusConfirmacaoEmail,
    solicitarRedefinicaoSenha,
    validarCodigoRedefinicaoSenha,
    redefinirSenha,
}
