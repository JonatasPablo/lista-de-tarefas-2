const fs = require('fs/promises')
const path = require('path')
const bcrypt = require('bcryptjs')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')
const mailService = require('./mail.service')
const authService = require('./auth.service')

const PROVEDOR_GOOGLE = 'google'
const avatarsDirectory = path.resolve(__dirname, '../../uploads/avatars')

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

const buscarUsuarioComSenhaPorId = async (userId) => {
    const profileFields = await authService.getUserProfileSelectFields()

    const [usuarios] = await connection.query(
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
        [userId]
    )

    return usuarios[0] || null
}

const sanitizeOriginalName = (fileName) => {
    if (!fileName || typeof fileName !== 'string') {
        throw new AppError('Nome da imagem invalido.', 400)
    }

    const sanitizedName = fileName
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (!sanitizedName) {
        throw new AppError('Nome da imagem invalido.', 400)
    }

    if (sanitizedName.length > 255) {
        throw new AppError(
            'Nome da imagem nao pode ter mais que 255 caracteres.',
            400
        )
    }

    return sanitizedName
}

const atualizarDadosBasicos = async ({ userId, name }) => {
    const nomeValido = authService.validateName(name)

    await connection.query(
        `
            UPDATE users
            SET
                name = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
        [nomeValido, userId]
    )

    const usuarioAtualizado = await buscarUsuarioComSenhaPorId(userId)

    if (!usuarioAtualizado) {
        throw new AppError('Usuario nao encontrado.', 404)
    }

    return authService.mapUser(usuarioAtualizado)
}

const alterarSenha = async ({
    userId,
    currentPassword,
    newPassword,
    currentSessionId,
}) => {
    if (!currentPassword || typeof currentPassword !== 'string') {
        throw new AppError('A senha atual e obrigatoria.', 400)
    }

    const usuario = await buscarUsuarioComSenhaPorId(userId)

    if (!usuario) {
        throw new AppError('Usuario nao encontrado.', 404)
    }

    if (usuario.provider === PROVEDOR_GOOGLE && !usuario.password_hash) {
        throw new AppError(
            'Esta conta usa login com Google. A senha deve ser gerenciada pela sua conta Google.',
            400
        )
    }

    if (!usuario.password_hash) {
        throw new AppError(
            'Esta conta nao possui senha local cadastrada.',
            400
        )
    }

    const senhaAtualConfere = await bcrypt.compare(
        currentPassword,
        usuario.password_hash
    )

    if (!senhaAtualConfere) {
        throw new AppError('A senha atual esta incorreta.', 400)
    }

    const senhaNovaValida = authService.validatePassword(newPassword, {
        name: usuario.name,
        email: usuario.email,
    })

    const senhaIgualAtual = await bcrypt.compare(
        senhaNovaValida,
        usuario.password_hash
    )

    if (senhaIgualAtual) {
        throw new AppError(
            'A nova senha nao pode ser igual a senha atual.',
            400
        )
    }

    const novoHashSenha = await bcrypt.hash(senhaNovaValida, 10)

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

    if (currentSessionId) {
        await connection.query(
            `
                UPDATE user_sessions
                SET revoked_at = NOW()
                WHERE user_id = ?
                    AND id <> ?
                    AND revoked_at IS NULL
            `,
            [usuario.id, currentSessionId]
        )
    }

    try {
        await mailService.sendPasswordChangedNotification({
            to: usuario.email,
            name: usuario.name,
            resetUrl: buildPasswordResetUrl(usuario.email),
        })
    } catch (error) {
        console.error('Erro ao enviar aviso de senha alterada:', error)
    }

    return {
        message: 'Senha alterada com sucesso.',
    }
}

const atualizarAvatar = async ({ userId, uploadedFile }) => {
    if (!uploadedFile) {
        throw new AppError('Nenhuma imagem enviada.', 400)
    }

    const hasProfileFields = await authService.hasUserProfileFields()

    if (!hasProfileFields) {
        throw new AppError(
            'O banco ainda nao possui os campos de foto de perfil. Aplique a migration 002_add_user_profile_fields.sql e reinicie o backend.',
            500
        )
    }

    const usuario = await buscarUsuarioComSenhaPorId(userId)

    if (!usuario) {
        throw new AppError('Usuario nao encontrado.', 404)
    }

    const originalName = sanitizeOriginalName(uploadedFile.originalname)
    const avatarAnterior = usuario.avatar_path

    try {
        await connection.query(
            `
                UPDATE users
                SET
                    avatar_path = ?,
                    avatar_original_name = ?,
                    avatar_mime_type = ?,
                    avatar_size_bytes = ?,
                    profile_updated_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            `,
            [
                uploadedFile.filename,
                originalName,
                uploadedFile.mimetype,
                uploadedFile.size,
                userId,
            ]
        )

        if (avatarAnterior) {
            const caminhoAnterior = path.resolve(avatarsDirectory, avatarAnterior)

            if (caminhoAnterior.startsWith(avatarsDirectory)) {
                await fs.unlink(caminhoAnterior).catch(() => null)
            }
        }

        const usuarioAtualizado = await buscarUsuarioComSenhaPorId(userId)

        return authService.mapUser(usuarioAtualizado)
    } catch (error) {
        await fs.unlink(uploadedFile.path).catch(() => null)

        throw error
    }
}

const removerAvatar = async (userId) => {
    const hasProfileFields = await authService.hasUserProfileFields()

    if (!hasProfileFields) {
        throw new AppError(
            'O banco ainda nao possui os campos de foto de perfil.',
            500
        )
    }

    const usuario = await buscarUsuarioComSenhaPorId(userId)

    if (!usuario) {
        throw new AppError('Usuario nao encontrado.', 404)
    }

    if (!usuario.avatar_path) {
        throw new AppError('Nenhuma foto de perfil para remover.', 400)
    }

    const caminhoArquivo = path.resolve(avatarsDirectory, usuario.avatar_path)

    await connection.query(
        `
            UPDATE users
            SET
                avatar_path = NULL,
                avatar_original_name = NULL,
                avatar_mime_type = NULL,
                avatar_size_bytes = NULL,
                profile_updated_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        `,
        [userId]
    )

    if (caminhoArquivo.startsWith(avatarsDirectory)) {
        await fs.unlink(caminhoArquivo).catch(() => null)
    }

    const usuarioAtualizado = await buscarUsuarioComSenhaPorId(userId)

    return authService.mapUser(usuarioAtualizado)
}

const obterAvatar = async (userId) => {
    const usuario = await buscarUsuarioComSenhaPorId(userId)

    if (!usuario) {
        throw new AppError('Usuario nao encontrado.', 404)
    }

    if (!usuario.avatar_path) {
        throw new AppError('Foto de perfil nao encontrada.', 404)
    }

    const filePath = path.resolve(avatarsDirectory, usuario.avatar_path)

    if (!filePath.startsWith(avatarsDirectory)) {
        throw new AppError('Caminho de imagem invalido.', 400)
    }

    try {
        await fs.access(filePath)
    } catch {
        throw new AppError('Arquivo de foto nao encontrado.', 404)
    }

    return {
        filePath,
        mimeType: usuario.avatar_mime_type || 'application/octet-stream',
    }
}

module.exports = {
    atualizarDadosBasicos,
    alterarSenha,
    atualizarAvatar,
    removerAvatar,
    obterAvatar,
}
