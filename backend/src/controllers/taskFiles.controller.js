const fs = require('fs/promises')

const taskFilesService = require('../services/taskFiles.service')
const AppError = require('../errors/AppError')
const { validateTaskId } = require('../helpers/validateTask')

const removeUploadedFileIfNeeded = async (file) => {
    if (!file?.path) {
        return
    }

    await fs.unlink(file.path).catch(() => null)
}

const validateFileId = (id) => {
    const fileId = Number(id)

    if (!Number.isInteger(fileId) || fileId <= 0) {
        throw new AppError('ID do arquivo inválido.', 400)
    }

    return fileId
}

const listTaskFiles = async (req, res) => {
    const { id } = req.params

    const taskId = validateTaskId(id)

    const files = await taskFilesService.listTaskFiles(taskId, req.user.id)

    return res.json(files)
}

const createTaskFile = async (req, res) => {
    const { id } = req.params

    const taskId = validateTaskId(id)

    try {
        const file = await taskFilesService.createTaskFile(
            taskId,
            req.user.id,
            req.file
        )

        return res.status(201).json(file)
    } catch (error) {
        await removeUploadedFileIfNeeded(req.file)

        throw error
    }
}

const renameTaskFile = async (req, res) => {
    const { id, fileId } = req.params
    const { displayName } = req.body

    const taskId = validateTaskId(id)
    const validFileId = validateFileId(fileId)

    const file = await taskFilesService.renameTaskFile(
        taskId,
        validFileId,
        req.user.id,
        displayName
    )

    return res.json(file)
}

const deleteTaskFile = async (req, res) => {
    const { id, fileId } = req.params

    const taskId = validateTaskId(id)
    const validFileId = validateFileId(fileId)

    await taskFilesService.deleteTaskFile(taskId, validFileId, req.user.id)

    return res.status(204).send()
}

const downloadTaskFile = async (req, res) => {
    const { id, fileId } = req.params

    const taskId = validateTaskId(id)
    const validFileId = validateFileId(fileId)

    const file = await taskFilesService.getTaskFileForDownload(
        taskId,
        validFileId,
        req.user.id
    )

    return res.download(file.filePath, file.display_name)
}

module.exports = {
    listTaskFiles,
    createTaskFile,
    renameTaskFile,
    deleteTaskFile,
    downloadTaskFile,
}
