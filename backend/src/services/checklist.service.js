const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const getTaskById = async (taskId, userId) => {
    const [tasks] = await connection.query(
        `SELECT id, status FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [taskId, userId]
    )
    return tasks[0] || null
}

const listChecklistItems = async (userId, taskId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    const [items] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                title,
                is_completed,
                created_at,
                updated_at,
                completed_at
            FROM task_checklist_items
            WHERE task_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
            ORDER BY id ASC
        `,
        [taskId, userId]
    )

    return items
}

const createChecklistItem = async (userId, taskId, { title }) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    if (task.status === 'concluida') {
        throw new AppError(
            'Não é possível adicionar itens em uma tarefa concluída.',
            400
        )
    }

    const [result] = await connection.query(
        `INSERT INTO task_checklist_items (task_id, user_id, title) VALUES (?, ?, ?)`,
        [taskId, userId, title]
    )

    const [items] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                title,
                is_completed,
                created_at,
                updated_at,
                completed_at
            FROM task_checklist_items
            WHERE id = ?
        `,
        [result.insertId]
    )

    return items[0]
}

const updateChecklistItem = async (userId, taskId, itemId, { title, is_completed }) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    if (task.status === 'concluida') {
        throw new AppError(
            'Não é possível editar itens em uma tarefa concluída.',
            400
        )
    }

    const [existing] = await connection.query(
        `
            SELECT id FROM task_checklist_items
            WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL
        `,
        [itemId, taskId, userId]
    )

    if (!existing[0]) {
        return null
    }

    const setClauses = []
    const params = []

    if (title !== undefined) {
        setClauses.push('title = ?')
        params.push(title)
    }

    if (is_completed !== undefined) {
        setClauses.push('is_completed = ?')
        params.push(is_completed ? 1 : 0)

        if (is_completed) {
            setClauses.push('completed_at = NOW()')
        } else {
            setClauses.push('completed_at = NULL')
        }
    }

    setClauses.push('updated_at = NOW()')
    params.push(itemId, taskId, userId)

    await connection.query(
        `
            UPDATE task_checklist_items
            SET ${setClauses.join(', ')}
            WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL
        `,
        params
    )

    const [updated] = await connection.query(
        `
            SELECT
                id,
                task_id,
                user_id,
                title,
                is_completed,
                created_at,
                updated_at,
                completed_at
            FROM task_checklist_items
            WHERE id = ?
        `,
        [itemId]
    )

    return updated[0]
}

const deleteChecklistItem = async (userId, taskId, itemId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return false
    }

    if (task.status === 'concluida') {
        throw new AppError(
            'Não é possível excluir itens em uma tarefa concluída.',
            400
        )
    }

    const [result] = await connection.query(
        `
            UPDATE task_checklist_items
            SET deleted_at = NOW(), updated_at = NOW()
            WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL
        `,
        [itemId, taskId, userId]
    )

    return result.affectedRows > 0
}

module.exports = {
    listChecklistItems,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
}
