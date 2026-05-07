const connection = require('../database/connection')

const createHistory = async ({
    taskId,
    userId,
    action,
    oldValue = null,
    newValue = null
}) => {
    await connection.query(
        `
            INSERT INTO task_history (
                task_id,
                user_id,
                action,
                old_value,
                new_value
            )
            VALUES (?, ?, ?, ?, ?)
        `,
        [
            taskId,
            userId,
            action,
            oldValue,
            newValue
        ]
    )
}

const listTaskHistory = async (taskId, userId) => {
    const [history] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                action,
                old_value,
                new_value,
                created_at
            FROM task_history
            WHERE task_id = ?
                AND user_id = ?
            ORDER BY id DESC
        `,
        [taskId, userId]
    )

    return history
}

const listUserHistory = async (userId) => {
    const [history] = await connection.query(
        `
            SELECT
                th.id,
                th.task_id,
                th.user_id,
                th.action,
                th.old_value,
                th.new_value,
                th.created_at,
                t.title AS task_title
            FROM task_history th
            INNER JOIN tasks t ON t.id = th.task_id
            WHERE th.user_id = ?
            ORDER BY th.id DESC
        `,
        [userId]
    )

    return history
}

module.exports = {
    createHistory,
    listTaskHistory,
    createHistory,
    listTaskHistory,
    listUserHistory
}