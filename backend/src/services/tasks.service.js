const connection = require('../database/connection')
const taskHistoryService = require('./taskHistory.service')

const DEFAULT_USER_ID = 1

const getTaskById = async (id) => {
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
        [id, DEFAULT_USER_ID]
    )

    return tasks[0] || null
}

const listTasks = async () => {
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
        [DEFAULT_USER_ID]
    )

    return tasks
}

const createTask = async ({ title, description, priority }) => {
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
        [DEFAULT_USER_ID, title, description, priority]
    )

    const task = await getTaskById(result.insertId)

    await taskHistoryService.createHistory({
        taskId: task.id,
        userId: DEFAULT_USER_ID,
        action: 'created',
        oldValue: null,
        newValue: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status
        })
    })

    return task
}

const updateTask = async (id, { title, description, priority }) => {
    const oldTask = await getTaskById(id)

    if (!oldTask) {
        return null
    }

    await connection.query(
        `
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                priority = ?
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [title, description, priority, id, DEFAULT_USER_ID]
    )

    const updatedTask = await getTaskById(id)

    await taskHistoryService.createHistory({
        taskId: id,
        userId: DEFAULT_USER_ID,
        action: 'updated',
        oldValue: JSON.stringify({
            title: oldTask.title,
            description: oldTask.description,
            priority: oldTask.priority
        }),
        newValue: JSON.stringify({
            title: updatedTask.title,
            description: updatedTask.description,
            priority: updatedTask.priority
        })
    })

    return updatedTask
}

const toggleTask = async (id) => {
    const task = await getTaskById(id)

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
                completed_at = ?
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [newStatus, completedAt, id, DEFAULT_USER_ID]
    )

    const updatedTask = await getTaskById(id)

    await taskHistoryService.createHistory({
        taskId: id,
        userId: DEFAULT_USER_ID,
        action: 'status_changed',
        oldValue: task.status,
        newValue: updatedTask.status
    })

    return updatedTask
}

const updateTaskStatus = async (id, status) => {
    const task = await getTaskById(id)

    if (!task) {
        return null
    }

    const completedAt = status === 'concluida' ? new Date() : null

    await connection.query(
        `
            UPDATE tasks
            SET
                status = ?,
                completed_at = ?
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [status, completedAt, id, DEFAULT_USER_ID]
    )

    const updatedTask = await getTaskById(id)

    await taskHistoryService.createHistory({
        taskId: id,
        userId: DEFAULT_USER_ID,
        action: 'status_changed',
        oldValue: task.status,
        newValue: updatedTask.status
    })

    return updatedTask
}

const deleteTask = async (id) => {
    const task = await getTaskById(id)

    if (!task) {
        return false
    }

    const [result] = await connection.query(
        `
            UPDATE tasks
            SET deleted_at = NOW()
            WHERE id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        `,
        [id, DEFAULT_USER_ID]
    )

    if (result.affectedRows === 0) {
        return false
    }

    await taskHistoryService.createHistory({
        taskId: id,
        userId: DEFAULT_USER_ID,
        action: 'deleted',
        oldValue: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status
        }),
        newValue: null
    })

    return true
}

const listTaskHistory = async (id) => {
    const task = await getTaskById(id)

    if (!task) {
        return null
    }

    const history = await taskHistoryService.listTaskHistory(id, DEFAULT_USER_ID)

    return history
}

const listUserHistory = async () => {
    const history = await taskHistoryService.listUserHistory(DEFAULT_USER_ID)

    return history
}

module.exports = {
    listTasks,
    createTask,
    updateTask,
    toggleTask,
    updateTaskStatus,
    deleteTask,
    listTaskHistory,
    listUserHistory
}