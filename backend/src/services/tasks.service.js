const connection = require('../database/connection')
const taskHistoryService = require('./taskHistory.service')
const taskFilesService = require('./taskFiles.service')
const AppError = require('../errors/AppError')

const getTaskById = async (id, userId) => {
    const [tasks] = await connection.query(
        `
            SELECT
                id,
                user_id,
                title,
                description,
                priority,
                status,
                created_at,
                updated_at,
                completed_at,
                deleted_at
            FROM tasks
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [id, userId]
    )

    return tasks[0] || null
}

const listTasks = async (userId) => {
    const [tasks] = await connection.query(
        `
            SELECT
                id,
                user_id,
                title,
                description,
                priority,
                status,
                created_at,
                updated_at,
                completed_at,
                deleted_at
            FROM tasks
            WHERE user_id = ?
                AND deleted_at IS NULL
            ORDER BY id DESC
        `,
        [userId]
    )

    const taskIds = tasks.map((task) => task.id)
    const filesByTaskId = await taskFilesService.listTaskFilesByTaskIds(
        taskIds,
        userId
    )

    return tasks.map((task) => ({
        ...task,
        files: filesByTaskId.get(task.id) || [],
    }))
}

const createTask = async (userId, { title, description, priority }) => {
    const [result] = await connection.query(
        `
            INSERT INTO tasks (
                user_id,
                title,
                description,
                priority
            )
            VALUES (?, ?, ?, ?)
        `,
        [userId, title, description, priority]
    )

    const task = await getTaskById(result.insertId, userId)

    await taskHistoryService.createHistory({
        taskId: task.id,
        userId,
        action: 'created',
        oldValue: null,
        newValue: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
        }),
    })

    return task
}

const updateTask = async (userId, id, { title, description, priority }) => {
    const oldTask = await getTaskById(id, userId)

    if (!oldTask) {
        return null
    }

    if (oldTask.status === 'concluida') {
        throw new AppError('Não é possível editar uma tarefa concluída.', 400)
    }

    await connection.query(
        `
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                priority = ?,
                updated_at = NOW()
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [title, description, priority, id, userId]
    )

    const updatedTask = await getTaskById(id, userId)

    await taskHistoryService.createHistory({
        taskId: id,
        userId,
        action: 'updated',
        oldValue: JSON.stringify({
            title: oldTask.title,
            description: oldTask.description,
            priority: oldTask.priority,
        }),
        newValue: JSON.stringify({
            title: updatedTask.title,
            description: updatedTask.description,
            priority: updatedTask.priority,
        }),
    })

    return updatedTask
}

const toggleTask = async (userId, id) => {
    const task = await getTaskById(id, userId)

    if (!task) {
        return null
    }

    const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida'
    const completedAt = newStatus === 'concluida' ? new Date() : null

    await connection.query(
        `
            UPDATE tasks
            SET
                status = ?,
                completed_at = ?,
                updated_at = NOW()
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [newStatus, completedAt, id, userId]
    )

    const updatedTask = await getTaskById(id, userId)

    await taskHistoryService.createHistory({
        taskId: id,
        userId,
        action: 'status_changed',
        oldValue: task.status,
        newValue: updatedTask.status,
    })

    return updatedTask
}

const updateTaskStatus = async (userId, id, status) => {
    const task = await getTaskById(id, userId)

    if (!task) {
        return null
    }

    const completedAt = status === 'concluida' ? new Date() : null

    await connection.query(
        `
            UPDATE tasks
            SET
                status = ?,
                completed_at = ?,
                updated_at = NOW()
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [status, completedAt, id, userId]
    )

    const updatedTask = await getTaskById(id, userId)

    await taskHistoryService.createHistory({
        taskId: id,
        userId,
        action: 'status_changed',
        oldValue: task.status,
        newValue: updatedTask.status,
    })

    return updatedTask
}

const deleteTask = async (userId, id) => {
    const task = await getTaskById(id, userId)

    if (!task) {
        return false
    }

    const [result] = await connection.query(
        `
            UPDATE tasks
            SET
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [id, userId]
    )

    if (result.affectedRows === 0) {
        return false
    }

    await taskHistoryService.createHistory({
        taskId: id,
        userId,
        action: 'deleted',
        oldValue: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
        }),
        newValue: null,
    })

    return true
}

const bulkCompleteTasks = async (userId, taskIds) => {
    if (!taskIds.length) {
        return { completedCount: 0 }
    }

    const placeholders = taskIds.map(() => '?').join(', ')

    const [tasks] = await connection.query(
        `
            SELECT id, title, description, priority, status
            FROM tasks
            WHERE id IN (${placeholders})
                AND user_id = ?
                AND status = 'pendente'
                AND deleted_at IS NULL
        `,
        [...taskIds, userId]
    )

    if (!tasks.length) {
        return { completedCount: 0 }
    }

    const validIds = tasks.map((t) => t.id)
    const validPlaceholders = validIds.map(() => '?').join(', ')

    await connection.query(
        `
            UPDATE tasks
            SET
                status = 'concluida',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id IN (${validPlaceholders})
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [...validIds, userId]
    )

    for (const task of tasks) {
        await taskHistoryService.createHistory({
            taskId: task.id,
            userId,
            action: 'status_changed',
            oldValue: task.status,
            newValue: 'concluida',
        })
    }

    return { completedCount: validIds.length }
}

const bulkDeleteTasks = async (userId, taskIds) => {
    if (!taskIds.length) {
        return { deletedCount: 0 }
    }

    const placeholders = taskIds.map(() => '?').join(', ')

    const [tasks] = await connection.query(
        `
            SELECT id, title, description, priority, status
            FROM tasks
            WHERE id IN (${placeholders})
                AND user_id = ?
                AND status = 'pendente'
                AND deleted_at IS NULL
        `,
        [...taskIds, userId]
    )

    if (!tasks.length) {
        return { deletedCount: 0 }
    }

    const validIds = tasks.map((t) => t.id)
    const validPlaceholders = validIds.map(() => '?').join(', ')

    await connection.query(
        `
            UPDATE tasks
            SET
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE id IN (${validPlaceholders})
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [...validIds, userId]
    )

    for (const task of tasks) {
        await taskHistoryService.createHistory({
            taskId: task.id,
            userId,
            action: 'deleted',
            oldValue: JSON.stringify({
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
            }),
            newValue: null,
        })
    }

    return { deletedCount: validIds.length }
}

const listTaskHistory = async (userId, id) => {
    const task = await getTaskById(id, userId)

    if (!task) {
        return null
    }

    const history = await taskHistoryService.listTaskHistory(id, userId)

    return history
}

const listUserHistory = async (userId) => {
    const history = await taskHistoryService.listUserHistory(userId)

    return history
}

module.exports = {
    listTasks,
    createTask,
    updateTask,
    toggleTask,
    updateTaskStatus,
    deleteTask,
    bulkCompleteTasks,
    bulkDeleteTasks,
    listTaskHistory,
    listUserHistory,
}
