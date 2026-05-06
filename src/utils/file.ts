export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

export const formatFileSize = (sizeBytes: number) => {
    if (sizeBytes < 1024) {
        return `${sizeBytes} B`
    }

    if (sizeBytes < 1024 * 1024) {
        return `${(sizeBytes / 1024).toFixed(2)} KB`
    }

    return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`
}

export const getFileExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex === -1) {
        return ''
    }

    return fileName.substring(lastDotIndex)
}

export const getFileNameWithoutExtension = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex === -1) {
        return fileName
    }

    return fileName.substring(0, lastDotIndex)
}

export const buildFileNameWithOriginalExtension = (
    newFileName: string,
    originalFileName: string
) => {
    const extension = getFileExtension(originalFileName)
    const fileNameWithoutExtension = getFileNameWithoutExtension(newFileName)

    return `${fileNameWithoutExtension.trim()}${extension}`
}