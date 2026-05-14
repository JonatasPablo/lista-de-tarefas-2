const connection = require('../database/connection')
const AppError = require('../errors/AppError')

// ---------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------

const getTaskById = async (taskId, userId) => {
    const [tasks] = await connection.query(
        `SELECT id, status FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [taskId, userId]
    )
    return tasks[0] || null
}

const requireTaskEditavel = async (taskId, userId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    if (task.status === 'concluida') {
        throw new AppError('Não é possível editar uma tarefa concluída.', 400)
    }

    return task
}

const SELECT_ITEM_FIELDS = `
    id,
    task_id,
    user_id,
    group_id,
    title,
    is_completed,
    created_at,
    updated_at,
    completed_at
`

// ---------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------

const listChecklistGroups = async (userId, taskId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    const [groups] = await connection.query(
        `
        SELECT
            g.id,
            g.task_id,
            g.user_id,
            g.title,
            g.position,
            g.created_at,
            g.updated_at
        FROM task_checklist_groups g
        WHERE g.task_id = ?
          AND g.user_id = ?
          AND g.deleted_at IS NULL
        ORDER BY g.position ASC, g.id ASC
        `,
        [taskId, userId]
    )

    if (groups.length === 0) {
        return []
    }

    const groupIds = groups.map((g) => g.id)
    const placeholders = groupIds.map(() => '?').join(', ')

    const [items] = await connection.query(
        `
        SELECT ${SELECT_ITEM_FIELDS}
        FROM task_checklist_items
        WHERE group_id IN (${placeholders})
          AND user_id = ?
          AND deleted_at IS NULL
        ORDER BY id ASC
        `,
        [...groupIds, userId]
    )

    return groups.map((g) => ({
        ...g,
        items: items.filter((i) => i.group_id === g.id),
    }))
}

const createChecklistGroup = async (userId, taskId, { title }) => {
    const task = await requireTaskEditavel(taskId, userId)

    if (!task) {
        return null
    }

    const [posResult] = await connection.query(
        `SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
         FROM task_checklist_groups
         WHERE task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [taskId, userId]
    )
    const nextPos = posResult[0].next_pos || 0

    const [result] = await connection.query(
        `INSERT INTO task_checklist_groups (task_id, user_id, title, position)
         VALUES (?, ?, ?, ?)`,
        [taskId, userId, title, nextPos]
    )

    const [rows] = await connection.query(
        `SELECT id, task_id, user_id, title, position, created_at, updated_at
         FROM task_checklist_groups
         WHERE id = ?`,
        [result.insertId]
    )

    return { ...rows[0], items: [] }
}

const updateChecklistGroup = async (userId, taskId, groupId, { title }) => {
    const task = await requireTaskEditavel(taskId, userId)

    if (!task) {
        return null
    }

    const [existing] = await connection.query(
        `SELECT id FROM task_checklist_groups
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [groupId, taskId, userId]
    )

    if (!existing[0]) {
        return null
    }

    await connection.query(
        `UPDATE task_checklist_groups
         SET title = ?, updated_at = NOW()
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [title, groupId, taskId, userId]
    )

    const [rows] = await connection.query(
        `SELECT id, task_id, user_id, title, position, created_at, updated_at
         FROM task_checklist_groups WHERE id = ?`,
        [groupId]
    )

    return rows[0]
}

const deleteChecklistGroup = async (userId, taskId, groupId) => {
    const task = await requireTaskEditavel(taskId, userId)

    if (!task) {
        return false
    }

    const [existing] = await connection.query(
        `SELECT id FROM task_checklist_groups
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [groupId, taskId, userId]
    )

    if (!existing[0]) {
        return false
    }

    // Soft delete dos itens do grupo
    await connection.query(
        `UPDATE task_checklist_items
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE group_id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [groupId, taskId, userId]
    )

    // Soft delete do grupo
    const [result] = await connection.query(
        `UPDATE task_checklist_groups
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [groupId, taskId, userId]
    )

    return result.affectedRows > 0
}

// ---------------------------------------------------------------
// Itens
// ---------------------------------------------------------------

const listChecklistItems = async (userId, taskId) => {
    const task = await getTaskById(taskId, userId)

    if (!task) {
        return null
    }

    const [items] = await connection.query(
        `
        SELECT ${SELECT_ITEM_FIELDS}
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

const createChecklistItem = async (userId, taskId, groupId, { title }) => {
    const task = await requireTaskEditavel(taskId, userId)

    if (!task) {
        return null
    }

    const [group] = await connection.query(
        `SELECT id FROM task_checklist_groups
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [groupId, taskId, userId]
    )

    if (!group[0]) {
        throw new AppError('Lista de checklist não encontrada.', 404)
    }

    const [result] = await connection.query(
        `INSERT INTO task_checklist_items (task_id, user_id, group_id, title)
         VALUES (?, ?, ?, ?)`,
        [taskId, userId, groupId, title]
    )

    const [items] = await connection.query(
        `SELECT ${SELECT_ITEM_FIELDS} FROM task_checklist_items WHERE id = ?`,
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
        throw new AppError('Não é possível editar itens em uma tarefa concluída.', 400)
    }

    const [existing] = await connection.query(
        `SELECT id FROM task_checklist_items
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
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
        `UPDATE task_checklist_items
         SET ${setClauses.join(', ')}
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        params
    )

    const [updated] = await connection.query(
        `SELECT ${SELECT_ITEM_FIELDS} FROM task_checklist_items WHERE id = ?`,
        [itemId]
    )

    return updated[0]
}

const deleteChecklistItem = async (userId, taskId, itemId) => {
    const task = await requireTaskEditavel(taskId, userId)

    if (!task) {
        return false
    }

    const [result] = await connection.query(
        `UPDATE task_checklist_items
         SET deleted_at = NOW(), updated_at = NOW()
         WHERE id = ? AND task_id = ? AND user_id = ? AND deleted_at IS NULL`,
        [itemId, taskId, userId]
    )

    return result.affectedRows > 0
}

module.exports = {
    listChecklistGroups,
    createChecklistGroup,
    updateChecklistGroup,
    deleteChecklistGroup,
    listChecklistItems,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
}
