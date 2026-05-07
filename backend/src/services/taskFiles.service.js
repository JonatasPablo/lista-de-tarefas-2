const fs = require('fs/promises')
const path = require('path')

const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const DEFAULT_USER_ID = 1
const uploadsDirectory = path.resolve(__dirname, '../../uploads/tasks')

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

const getTaskById = async (taskId) => {
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
        [taskId, DEFAULT_USER_ID]
    )

    return tasks[0] || null
}

const ensureTaskExistsAndIsPending = async (taskId) => {
    const task = await getTaskById(taskId)

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

const getTaskFileById = async (taskId, fileId) => {
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
        [fileId, taskId, DEFAULT_USER_ID]
    )

    return files[0] || null
}

const listTaskFiles = async (taskId) => {
    const task = await getTaskById(taskId)

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
        [taskId, DEFAULT_USER_ID]
    )

    return files.map(mapTaskFile)
}

const createTaskFile = async (taskId, uploadedFile) => {
    await ensureTaskExistsAndIsPending(taskId)

    if (!uploadedFile) {
        throw new AppError('Nenhum arquivo enviado.', 400)
    }

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
                DEFAULT_USER_ID,
                originalName,
                uploadedFile.filename,
                displayName,
                uploadedFile.mimetype,
                uploadedFile.size,
            ]
        )

        const file = await getTaskFileById(taskId, result.insertId)

        return mapTaskFile(file)
    } catch (error) {
        const filePath = path.resolve(uploadsDirectory, uploadedFile.filename)

        await fs.unlink(filePath).catch(() => null)

        throw error
    }
}

const renameTaskFile = async (taskId, fileId, displayName) => {
    await ensureTaskExistsAndIsPending(taskId)

    const file = await getTaskFileById(taskId, fileId)

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
        [sanitizedDisplayName, fileId, taskId, DEFAULT_USER_ID]
    )

    const updatedFile = await getTaskFileById(taskId, fileId)

    return mapTaskFile(updatedFile)
}

const deleteTaskFile = async (taskId, fileId) => {
    await ensureTaskExistsAndIsPending(taskId)

    const file = await getTaskFileById(taskId, fileId)

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
        [fileId, taskId, DEFAULT_USER_ID]
    )

    if (result.affectedRows === 0) {
        throw new AppError('Arquivo não encontrado.', 404)
    }

    const filePath = path.resolve(uploadsDirectory, file.stored_name)

    await fs.unlink(filePath).catch(() => null)

    return true
}

const getTaskFileForDownload = async (taskId, fileId) => {
    const task = await getTaskById(taskId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    const file = await getTaskFileById(taskId, fileId)

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
    createTaskFile,
    renameTaskFile,
    deleteTaskFile,
    getTaskFileForDownload,
}