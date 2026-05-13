const fs = require('fs/promises')
const path = require('path')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const uploadsDirectory = path.resolve(__dirname, '../../uploads/tasks')
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

const createTaskFile = async (taskId, userId, uploadedFile) => {
    await ensureTaskExistsAndIsPending(taskId, userId)

    if (!uploadedFile) {
        throw new AppError('Nenhum arquivo enviado.', 400)
    }

    await ensureUploadQuota(taskId, userId, uploadedFile.size)

    const originalName = sanitizeDisplayName(uploadedFile.originalname)
    const displayName = originalName

    try {
        const [result] = await connection.query(
            `
                INSERT INTO task_files (
                    task_id,
                    user_id,
                    original_name,
                    stored_name,
                    display_name,
                    mime_type,
                    size_bytes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                taskId,
                userId,
                originalName,
                uploadedFile.filename,
                displayName,
                uploadedFile.mimetype,
                uploadedFile.size,
            ]
        )

        const file = await getTaskFileById(taskId, result.insertId, userId)

        return mapTaskFile(file)
    } catch (error) {
        const filePath = path.resolve(uploadsDirectory, uploadedFile.filename)

        await fs.unlink(filePath).catch(() => null)

        throw error
    }
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

    const filePath = path.resolve(uploadsDirectory, file.stored_name)

    await fs.unlink(filePath).catch(() => null)

    return true
}

const getTaskFileForDownload = async (taskId, fileId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    const file = await getTaskFileById(taskId, fileId, userId)

    if (!file) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    const filePath = path.resolve(uploadsDirectory, file.stored_name)

    if (!filePath.startsWith(uploadsDirectory)) {
        throw new AppError('Caminho de arquivo inválido.', 400)
    }

    try {
        await fs.access(filePath)
    } catch {
        throw new AppError('Arquivo físico não encontrado.', 404)
    }

    return {
        ...mapTaskFile(file),
        filePath,
    }
}

module.exports = {
    listTaskFiles,
    listTaskFilesByTaskIds,
    createTaskFile,
    renameTaskFile,
    deleteTaskFile,
    getTaskFileForDownload,
}
