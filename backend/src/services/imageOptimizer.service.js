const path = require('path')
const sharp = require('sharp')

const AppError = require('../errors/AppError')

const MAIN_IMAGE_MAX_SIZE = 1920
const MAIN_IMAGE_QUALITY = 82
const THUMBNAIL_SIZE = 320
const THUMBNAIL_QUALITY = 76
const AVATAR_SIZE = 512
const AVATAR_QUALITY = 82

const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.heic', '.heif'])

const isImageMimeType = (mimeType) => {
    return typeof mimeType === 'string' && mimeType.startsWith('image/')
}

const buildOutput = ({ buffer, mimeType, sizeBytes }) => ({
    buffer,
    mimeType,
    sizeBytes: sizeBytes || buffer.length,
})

const getPreferredMainFormat = async (image, originalName, mimeType) => {
    const metadata = await image.metadata()
    const extension = path.extname(originalName || '').toLowerCase()

    if (metadata.hasAlpha) {
        return 'webp'
    }

    if (mimeType === 'image/png' && !PHOTO_EXTENSIONS.has(extension)) {
        return 'png'
    }

    return 'jpeg'
}

const toFormat = (image, format, quality) => {
    if (format === 'png') {
        return {
            pipeline: image.png({ compressionLevel: 9, effort: 8 }),
            mimeType: 'image/png',
        }
    }

    if (format === 'webp') {
        return {
            pipeline: image.webp({ quality, effort: 4 }),
            mimeType: 'image/webp',
        }
    }

    return {
        pipeline: image.jpeg({ quality, mozjpeg: true }),
        mimeType: 'image/jpeg',
    }
}

const optimizeAttachmentImage = async (uploadedFile) => {
    const baseImage = sharp(uploadedFile.buffer, {
        animated: false,
        failOn: 'none',
    }).rotate()

    try {
        const format = await getPreferredMainFormat(
            baseImage.clone(),
            uploadedFile.originalname,
            uploadedFile.mimetype
        )
        const mainImage = baseImage.clone().resize({
            width: MAIN_IMAGE_MAX_SIZE,
            height: MAIN_IMAGE_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
        })
        const mainFormat = toFormat(mainImage, format, MAIN_IMAGE_QUALITY)
        const mainBuffer = await mainFormat.pipeline.toBuffer()

        const thumbnailImage = baseImage.clone().resize({
            width: THUMBNAIL_SIZE,
            height: THUMBNAIL_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
        })
        const thumbnailBuffer = await thumbnailImage
            .webp({ quality: THUMBNAIL_QUALITY, effort: 4 })
            .toBuffer()

        return {
            main: buildOutput({
                buffer: mainBuffer,
                mimeType: mainFormat.mimeType,
            }),
            thumbnail: buildOutput({
                buffer: thumbnailBuffer,
                mimeType: 'image/webp',
            }),
        }
    } catch (error) {
        throw new AppError('Nao foi possivel otimizar a imagem enviada.', 400)
    }
}

const optimizeAvatarImage = async (uploadedFile) => {
    try {
        const buffer = await sharp(uploadedFile.buffer, {
            animated: false,
            failOn: 'none',
        })
            .rotate()
            .flatten({ background: '#ffffff' })
            .resize({
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                fit: 'cover',
                position: 'centre',
                withoutEnlargement: true,
            })
            .jpeg({ quality: AVATAR_QUALITY, mozjpeg: true })
            .toBuffer()

        return buildOutput({
            buffer,
            mimeType: 'image/jpeg',
        })
    } catch (error) {
        throw new AppError('Nao foi possivel otimizar a foto de perfil.', 400)
    }
}

module.exports = {
    MAIN_IMAGE_MAX_SIZE,
    MAIN_IMAGE_QUALITY,
    THUMBNAIL_SIZE,
    THUMBNAIL_QUALITY,
    AVATAR_SIZE,
    AVATAR_QUALITY,
    isImageMimeType,
    optimizeAttachmentImage,
    optimizeAvatarImage,
}
