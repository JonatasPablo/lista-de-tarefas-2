const checklistService = require('../services/checklist.service')
const AppError = require('../errors/AppError')

const validateTaskId = (id) => {
    const taskId = Number(id)

    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new AppError('ID da tarefa inválido.', 400)
    }

    return taskId
}

const validateItemId = (id) => {
    const itemId = Number(id)

    if (!Number.isInteger(itemId) || itemId <= 0) {
        throw new AppError('ID do item inválido.', 400)
    }

    return itemId
}

const validateItemTitle = (title) => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        throw new AppError('O título do item é obrigatório.', 400)
    }

    const trimmed = title.trim()

    if (trimmed.length < 2) {
        throw new AppError(
            'O título do item deve ter pelo menos 2 caracteres.',
            400
        )
    }

    if (trimmed.length > 255) {
        throw new AppError(
            'O título do item deve ter no máximo 255 caracteres.',
            400
        )
    }

    return trimmed
}

const listChecklist = async (req, res) => {
    const taskId = validateTaskId(req.params.taskId)

    const items = await checklistService.listChecklistItems(req.user.id, taskId)

    if (items === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(items)
}

const createChecklistItem = async (req, res) => {
    const taskId = validateTaskId(req.params.taskId)
    const title = validateItemTitle(req.body.title)

    const item = await checklistService.createChecklistItem(req.user.id, taskId, {
        title,
    })

    if (item === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.status(201).json(item)
}

const updateChecklistItem = async (req, res) => {
    const taskId = validateTaskId(req.params.taskId)
    const itemId = validateItemId(req.params.itemId)

    const { title, is_completed } = req.body
    const updates = {}

    if (title !== undefined) {
        updates.title = validateItemTitle(title)
    }

    if (is_completed !== undefined) {
        updates.is_completed = Boolean(is_completed)
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError('Nenhum campo para atualizar fornecido.', 400)
    }

    const item = await checklistService.updateChecklistItem(
        req.user.id,
        taskId,
        itemId,
        updates
    )

    if (item === null) {
        throw new AppError('Item ou tarefa não encontrado.', 404)
    }

    return res.json(item)
}

const deleteChecklistItem = async (req, res) => {
    const taskId = validateTaskId(req.params.taskId)
    const itemId = validateItemId(req.params.itemId)

    const deleted = await checklistService.deleteChecklistItem(
        req.user.id,
        taskId,
        itemId
    )

    if (!deleted) {
        throw new AppError('Item não encontrado.', 404)
    }

    return res.status(204).send()
}

module.exports = {
    listChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
}
