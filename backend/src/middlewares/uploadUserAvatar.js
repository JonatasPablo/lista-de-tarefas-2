const fs = require('fs')
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')

const AppError = require('../errors/AppError')

const MAX_AVATAR_SIZE_BYTES = 20 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Map([
    ['.jpeg', new Set(['image/jpeg'])],
    ['.jpg', new Set(['image/jpeg'])],
    ['.png', new Set(['image/png'])],
    ['.webp', new Set(['image/webp'])],
])

const uploadsDirectory = path.resolve(__dirname, '../../uploads/avatars')

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
            callback(new AppError('Nome da imagem invalido.', 400))
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
        callback(new AppError('Nome da imagem invalido.', 400))
        return
    }

    const extension = path.extname(originalName).toLowerCase()
    const allowedMimeTypes = ALLOWED_IMAGE_TYPES.get(extension)

    if (!allowedMimeTypes || !allowedMimeTypes.has(file.mimetype)) {
        callback(
            new AppError(
                'Tipo de imagem nao permitido. Envie JPG, PNG ou WebP.',
                400
            )
        )
        return
    }

    callback(null, true)
}

const uploadUserAvatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_AVATAR_SIZE_BYTES,
        files: 1,
    },
})

module.exports = uploadUserAvatar
