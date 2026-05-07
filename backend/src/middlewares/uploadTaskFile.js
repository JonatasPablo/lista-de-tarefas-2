const fs = require('fs')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

const AppError = require('../errors/AppError')

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

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