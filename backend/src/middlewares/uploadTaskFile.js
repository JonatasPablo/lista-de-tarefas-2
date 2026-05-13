const fs = require('fs')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

const AppError = require('../errors/AppError')

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Map([
    ['.csv', new Set(['text/csv', 'application/csv', 'text/plain'])],
    ['.doc', new Set(['application/msword'])],
    [
        '.docx',
        new Set([
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]),
    ],
    ['.gif', new Set(['image/gif'])],
    ['.jpeg', new Set(['image/jpeg'])],
    ['.jpg', new Set(['image/jpeg'])],
    ['.pdf', new Set(['application/pdf'])],
    ['.png', new Set(['image/png'])],
    ['.txt', new Set(['text/plain'])],
    ['.webp', new Set(['image/webp'])],
    ['.xls', new Set(['application/vnd.ms-excel'])],
    [
        '.xlsx',
        new Set([
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]),
    ],
    ['.zip', new Set(['application/zip', 'application/x-zip-compressed'])],
])

const uploadsDirectory = path.resolve(__dirname, '../../uploads/tasks')

if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true })
}

const sanitizeOriginalName = (fileName) => {
    return fileName
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadsDirectory)
    },

    filename: (req, file, callback) => {
        const originalName = sanitizeOriginalName(file.originalname)

        if (!originalName) {
            callback(new AppError('Nome do arquivo inválido.', 400))
            return
        }

        const extension = path.extname(originalName).toLowerCase()
        const storedName = `${crypto.randomUUID()}${extension}`

        callback(null, storedName)
    },
})

const fileFilter = (req, file, callback) => {
    const originalName = sanitizeOriginalName(file.originalname)

    if (!originalName) {
        callback(new AppError('Nome do arquivo inválido.', 400))
        return
    }

    const extension = path.extname(originalName).toLowerCase()
    const allowedMimeTypes = ALLOWED_FILE_TYPES.get(extension)

    if (!allowedMimeTypes || !allowedMimeTypes.has(file.mimetype)) {
        callback(
            new AppError(
                'Tipo de arquivo nao permitido. Envie PDF, imagem, texto, CSV, Word, Excel ou ZIP.',
                400
            )
        )
        return
    }

    callback(null, true)
}

const uploadTaskFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
    },
})

module.exports = uploadTaskFile
