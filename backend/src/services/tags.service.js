const connection = require('../database/connection')
const AppError = require('../errors/AppError')

const listTags = async (userId) => {
    const [tags] = await connection.query(
        `SELECT id, user_id, nome, cor, created_at
         FROM tags
         WHERE user_id = ? AND deleted_at IS NULL
         ORDER BY nome ASC`,
        [userId]
    )
    return tags
}

const createTag = async (userId, { nome, cor }) => {
    const [result] = await connection.query(
        `INSERT INTO tags (user_id, nome, cor) VALUES (?, ?, ?)`,
        [userId, nome.trim(), cor]
    )
    const [rows] = await connection.query(
        `SELECT id, user_id, nome, cor, created_at FROM tags WHERE id = ?`,
        [result.insertId]
    )
    return rows[0]
}

const updateTag = async (userId, tagId, { nome, cor }) => {
    const [rows] = await connection.query(
        `SELECT id FROM tags WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [tagId, userId]
    )
    if (!rows.length) return null

    await connection.query(
        `UPDATE tags SET nome = ?, cor = ? WHERE id = ? AND user_id = ?`,
        [nome.trim(), cor, tagId, userId]
    )
    const [updated] = await connection.query(
        `SELECT id, user_id, nome, cor, created_at FROM tags WHERE id = ?`,
        [tagId]
    )
    return updated[0]
}

const deleteTag = async (userId, tagId) => {
    const [rows] = await connection.query(
        `SELECT id FROM tags WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [tagId, userId]
    )
    if (!rows.length) return false

    await connection.query(
        `UPDATE tags SET deleted_at = NOW() WHERE id = ? AND user_id = ?`,
        [tagId, userId]
    )
    return true
}

const addTagToTask = async (userId, taskId, tagId) => {
    const [tagRows] = await connection.query(
        `SELECT id FROM tags WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [tagId, userId]
    )
    if (!tagRows.length) throw new AppError('Tag não encontrada.', 404)

    const [taskRows] = await connection.query(
        `SELECT id FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [taskId, userId]
    )
    if (!taskRows.length) throw new AppError('Tarefa não encontrada.', 404)

    await connection.query(
        `INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)`,
        [taskId, tagId]
    )
}

const removeTagFromTask = async (userId, taskId, tagId) => {
    await connection.query(
        `DELETE tt FROM task_tags tt
         JOIN tasks t ON t.id = tt.task_id
         JOIN tags tg ON tg.id = tt.tag_id
         WHERE tt.task_id = ? AND tt.tag_id = ? AND t.user_id = ? AND tg.user_id = ?`,
        [taskId, tagId, userId, userId]
    )
}

const listTagsForTask = async (userId, taskId) => {
    const [tags] = await connection.query(
        `SELECT tg.id, tg.nome, tg.cor
         FROM task_tags tt
         JOIN tags tg ON tg.id = tt.tag_id
         WHERE tt.task_id = ? AND tg.user_id = ? AND tg.deleted_at IS NULL`,
        [taskId, userId]
    )
    return tags
}

module.exports = {
    listTags,
    createTag,
    updateTag,
    deleteTag,
    addTagToTask,
    removeTagFromTask,
    listTagsForTask,
}
