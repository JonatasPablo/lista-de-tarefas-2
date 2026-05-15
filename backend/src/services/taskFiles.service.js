const connection = require('../database/connection')
const AppError = require('../errors/AppError')
const {
    isImageMimeType,
    optimizeAttachmentImage,
} = require('./imageOptimizer.service')

const MAX_FILES_PER_TASK = Number(process.env.TASK_FILES_MAX_PER_TASK || 20)
const USER_STORAGE_QUOTA_BYTES =
    Number(process.env.TASK_FILES_USER_QUOTA_MB || 500) * 1024 * 1024

const mapTaskFile = (file) => {
    if (!file) {
        return null
    }

    return {
        id: file.id,
        task_id: file.task_id,
        user_id: file.user_id,
        original_name: file.original_name,
        stored_name: file.stored_name,
        display_name: file.display_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        thumbnail_mime_type: file.thumbnail_mime_type,
        thumbnail_size_bytes: file.thumbnail_size_bytes,
        has_thumbnail: Boolean(file.thumbnail_size_bytes),
        created_at: file.created_at,
        updated_at: file.updated_at,
        deleted_at: file.deleted_at,
    }
}

const listTaskFilesByTaskIds = async (taskIds, userId) => {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return new Map()
    }

    const placeholders = taskIds.map(() => '?').join(', ')

    const [files] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                original_name,
                stored_name,
                display_name,
                mime_type,
                size_bytes,
                thumbnail_mime_type,
                thumbnail_size_bytes,
                created_at,
                updated_at,
                deleted_at
            FROM task_files
            WHERE user_id = ?
                AND task_id IN (${placeholders})
                AND deleted_at IS NULL
            ORDER BY id DESC
        `,
        [userId, ...taskIds]
    )

    return files.reduce((filesByTaskId, file) => {
        const taskFiles = filesByTaskId.get(file.task_id) || []

        taskFiles.push(mapTaskFile(file))
        filesByTaskId.set(file.task_id, taskFiles)

        return filesByTaskId
    }, new Map())
}

const sanitizeDisplayName = (displayName) => {
    if (typeof displayName !== 'string') {
        throw new AppError('Nome do arquivo inválido.', 400)
    }

    const sanitizedName = displayName
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (!sanitizedName) {
        throw new AppError('Nome do arquivo não pode ficar vazio.', 400)
    }

    if (sanitizedName.length > 255) {
        throw new AppError(
            'Nome do arquivo não pode ter mais que 255 caracteres.',
            400
        )
    }

    return sanitizedName
}

const getTaskById = async (taskId, userId) => {
    const [tasks] = await connection.query(
        `
            SELECT
                id,
                user_id,
                status,
                deleted_at
            FROM tasks
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [taskId, userId]
    )

    return tasks[0] || null
}

const ensureTaskExistsAndIsPending = async (taskId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    if (task.status === 'concluida') {
        throw new AppError(
            'Não é possível alterar anexos de uma tarefa concluída.',
            400
        )
    }

    return task
}

const getTaskFileById = async (taskId, fileId, userId) => {
    const [files] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                original_name,
                stored_name,
                display_name,
                mime_type,
                size_bytes,
                thumbnail_mime_type,
                thumbnail_size_bytes,
                created_at,
                updated_at,
                deleted_at
            FROM task_files
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [fileId, taskId, userId]
    )

    return files[0] || null
}

const listTaskFiles = async (taskId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    const [files] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                original_name,
                stored_name,
                display_name,
                mime_type,
                size_bytes,
                thumbnail_mime_type,
                thumbnail_size_bytes,
                created_at,
                updated_at,
                deleted_at
            FROM task_files
            WHERE task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
            ORDER BY id DESC
        `,
        [taskId, userId]
    )

    return files.map(mapTaskFile)
}

const ensureUploadQuota = async (taskId, userId, uploadedFileSize) => {
    const [[taskFileStats]] = await connection.query(
        `
            SELECT
                COUNT(*) AS task_files_count
            FROM task_files
            WHERE task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [taskId, userId]
    )

    if (Number(taskFileStats.task_files_count) >= MAX_FILES_PER_TASK) {
        throw new AppError(
            `Esta tarefa ja atingiu o limite de ${MAX_FILES_PER_TASK} anexos.`,
            400
        )
    }

    const [[userFileStats]] = await connection.query(
        `
            SELECT
                COALESCE(SUM(size_bytes), 0) AS total_size_bytes
            FROM task_files
            WHERE user_id = ?
                AND deleted_at IS NULL
        `,
        [userId]
    )

    const nextTotalSize =
        Number(userFileStats.total_size_bytes) + Number(uploadedFileSize || 0)

    if (nextTotalSize > USER_STORAGE_QUOTA_BYTES) {
        const quotaInMb = Math.round(USER_STORAGE_QUOTA_BYTES / 1024 / 1024)

        throw new AppError(
            `Voce atingiu o limite de armazenamento de ${quotaInMb} MB para anexos.`,
            400
        )
    }
}

const buildStoredTaskFile = async (uploadedFile) => {
    if (!isImageMimeType(uploadedFile.mimetype)) {
        return {
            mimeType: uploadedFile.mimetype,
            sizeBytes: uploadedFile.size,
            buffer: uploadedFile.buffer,
            thumbnailMimeType: null,
            thumbnailSizeBytes: null,
            thumbnailBuffer: null,
        }
    }

    const optimizedImage = await optimizeAttachmentImage(uploadedFile)

    return {
        mimeType: optimizedImage.main.mimeType,
        sizeBytes: optimizedImage.main.sizeBytes,
        buffer: optimizedImage.main.buffer,
        thumbnailMimeType: optimizedImage.thumbnail.mimeType,
        thumbnailSizeBytes: optimizedImage.thumbnail.sizeBytes,
        thumbnailBuffer: optimizedImage.thumbnail.buffer,
    }
}

const createTaskFile = async (taskId, userId, uploadedFile) => {
    await ensureTaskExistsAndIsPending(taskId, userId)

    if (!uploadedFile) {
        throw new AppError('Nenhum arquivo enviado.', 400)
    }

    if (!uploadedFile.buffer) {
        throw new AppError('Conteudo do arquivo nao recebido.', 400)
    }

    const storedFile = await buildStoredTaskFile(uploadedFile)

    await ensureUploadQuota(taskId, userId, storedFile.sizeBytes)

    const originalName = sanitizeDisplayName(uploadedFile.originalname)
    const displayName = originalName

    // stored_name não é mais usado para armazenamento em disco; mantido como vazio
    // para compatibilidade de schema com registros antigos.
    const [result] = await connection.query(
        `
            INSERT INTO task_files (
                task_id,
                user_id,
                original_name,
                stored_name,
                display_name,
                mime_type,
                size_bytes,
                file_data,
                thumbnail_data,
                thumbnail_mime_type,
                thumbnail_size_bytes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            taskId,
            userId,
            originalName,
            '',
            displayName,
            storedFile.mimeType,
            storedFile.sizeBytes,
            storedFile.buffer,
            storedFile.thumbnailBuffer,
            storedFile.thumbnailMimeType,
            storedFile.thumbnailSizeBytes,
        ]
    )

    const file = await getTaskFileById(taskId, result.insertId, userId)

    return mapTaskFile(file)
}

const renameTaskFile = async (taskId, fileId, userId, displayName) => {
    await ensureTaskExistsAndIsPending(taskId, userId)

    const file = await getTaskFileById(taskId, fileId, userId)

    if (!file) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    const sanitizedDisplayName = sanitizeDisplayName(displayName)

    await connection.query(
        `
            UPDATE task_files
            SET
                display_name = ?,
                updated_at = NOW()
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [sanitizedDisplayName, fileId, taskId, userId]
    )

    const updatedFile = await getTaskFileById(taskId, fileId, userId)

    return mapTaskFile(updatedFile)
}

const deleteTaskFile = async (taskId, fileId, userId) => {
    await ensureTaskExistsAndIsPending(taskId, userId)

    const file = await getTaskFileById(taskId, fileId, userId)

    if (!file) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    const [result] = await connection.query(
        `
            UPDATE task_files
            SET deleted_at = NOW()
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [fileId, taskId, userId]
    )

    if (result.affectedRows === 0) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    return true
}

const getTaskFileForDownload = async (taskId, fileId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    // Busca o conteúdo binário do arquivo diretamente do banco de dados.
    const [rows] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                original_name,
                stored_name,
                display_name,
                mime_type,
                size_bytes,
                thumbnail_mime_type,
                thumbnail_size_bytes,
                created_at,
                updated_at,
                deleted_at,
                file_data
            FROM task_files
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [fileId, taskId, userId]
    )

    const file = rows[0]

    if (!file) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    if (!file.file_data) {
        throw new AppError(
            'Conteúdo do arquivo não disponível. O arquivo pode ter sido enviado antes da migração para armazenamento no banco.',
            404
        )
    }

    return {
        ...mapTaskFile(file),
        buffer: file.file_data,
    }
}

const getTaskFileThumbnail = async (taskId, fileId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        throw new AppError('Tarefa nÃ£o encontrada.', 404)
    }

    const [rows] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                mime_type,
                file_data,
                thumbnail_data,
                thumbnail_mime_type,
                thumbnail_size_bytes
            FROM task_files
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [fileId, taskId, userId]
    )

    const file = rows[0]

    if (!file) {
        throw new AppError('Arquivo nÃ£o encontrado.', 404)
    }

    if (file.thumbnail_data) {
        return {
            buffer: file.thumbnail_data,
            mimeType: file.thumbnail_mime_type || 'image/webp',
            sizeBytes: file.thumbnail_size_bytes || file.thumbnail_data.length,
        }
    }

    if (!isImageMimeType(file.mime_type) || !file.file_data) {
        throw new AppError('Miniatura nÃ£o disponÃ­vel para este arquivo.', 404)
    }

    const optimizedImage = await optimizeAttachmentImage({
        buffer: file.file_data,
        mimetype: file.mime_type,
        originalname: 'thumbnail-image',
    })

    await connection.query(
        `
            UPDATE task_files
            SET
                thumbnail_data = ?,
                thumbnail_mime_type = ?,
                thumbnail_size_bytes = ?,
                updated_at = NOW()
            WHERE id = ?
                AND task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [
            optimizedImage.thumbnail.buffer,
            optimizedImage.thumbnail.mimeType,
            optimizedImage.thumbnail.sizeBytes,
            fileId,
            taskId,
            userId,
        ]
    )

    return {
        buffer: optimizedImage.thumbnail.buffer,
        mimeType: optimizedImage.thumbnail.mimeType,
        sizeBytes: optimizedImage.thumbnail.sizeBytes,
    }
}

module.exports = {
    listTaskFiles,
    listTaskFilesByTaskIds,
    createTaskFile,
    renameTaskFile,
    deleteTaskFile,
    getTaskFileForDownload,
    getTaskFileThumbnail,
}
