const taskFilesService = require('../services/taskFiles.service')
const AppError = require('../errors/AppError')
const { validateTaskId } = require('../helpers/validateTask')

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

    const file = await taskFilesService.createTaskFile(
        taskId,
        req.user.id,
        req.file
    )

    return res.status(201).json(file)
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

    const mimeType = file.mime_type || 'application/octet-stream'
    const fileName = encodeURIComponent(file.display_name || file.original_name)

    res.setHeader('Content-Type', mimeType)
    res.setHeader(
        'Content-Disposition',
        `inline; filename*=UTF-8''${fileName}`
    )
    res.setHeader('Content-Length', file.size_bytes)
    res.setHeader('Cache-Control', 'private, max-age=300')

    return res.end(file.buffer)
}

const getTaskFileThumbnail = async (req, res) => {
    const { id, fileId } = req.params

    const taskId = validateTaskId(id)
    const validFileId = validateFileId(fileId)

    const thumbnail = await taskFilesService.getTaskFileThumbnail(
        taskId,
        validFileId,
        req.user.id
    )

    res.setHeader('Content-Type', thumbnail.mimeType)
    res.setHeader('Content-Length', thumbnail.sizeBytes)
    res.setHeader('Cache-Control', 'private, max-age=3600')

    return res.end(thumbnail.buffer)
}

module.exports = {
    listTaskFiles,
    createTaskFile,
    renameTaskFile,
    deleteTaskFile,
    downloadTaskFile,
    getTaskFileThumbnail,
}
