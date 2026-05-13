const fs = require('fs/promises')

const usersService = require('../services/users.service')

const removeUploadedFileIfNeeded = async (file) => {
    if (!file?.path) {
        return
    }

    await fs.unlink(file.path).catch(() => null)
}

const atualizarDadosBasicos = async (req, res) => {
    const { name } = req.body

    const user = await usersService.atualizarDadosBasicos({
        userId: req.user.id,
        name,
    })

    return res.json({
        user,
        message: 'Nome atualizado com sucesso.',
    })
}

const alterarSenha = async (req, res) => {
    const { currentPassword, newPassword } = req.body

    const result = await usersService.alterarSenha({
        userId: req.user.id,
        currentPassword,
        newPassword,
        currentSessionId: req.sessionId,
    })

    return res.json(result)
}

const atualizarAvatar = async (req, res) => {
    try {
        const user = await usersService.atualizarAvatar({
            userId: req.user.id,
            uploadedFile: req.file,
        })

        return res.json({
            user,
            message: 'Foto de perfil atualizada com sucesso.',
        })
    } catch (error) {
        await removeUploadedFileIfNeeded(req.file)

        throw error
    }
}

const removerAvatar = async (req, res) => {
    const user = await usersService.removerAvatar(req.user.id)

    return res.json({
        user,
        message: 'Foto de perfil removida com sucesso.',
    })
}

const obterAvatar = async (req, res) => {
    const avatar = await usersService.obterAvatar(req.user.id)

    res.setHeader('Content-Type', avatar.mimeType)
    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.sendFile(avatar.filePath)
}

module.exports = {
    atualizarDadosBasicos,
    alterarSenha,
    atualizarAvatar,
    removerAvatar,
    obterAvatar,
}
