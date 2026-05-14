const checklistService = require('../services/checklist.service')
const AppError = require('../errors/AppError')

// ---------------------------------------------------------------
// Validadores
// ---------------------------------------------------------------

const validateId = (id, label) => {
    const parsed = Number(id)

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${label} inválido.`, 400)
    }

    return parsed
}

const validateTitle = (title, label = 'título') => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        throw new AppError(`O ${label} é obrigatório.`, 400)
    }

    const trimmed = title.trim()

    if (trimmed.length < 2) {
        throw new AppError(`O ${label} deve ter pelo menos 2 caracteres.`, 400)
    }

    if (trimmed.length > 255) {
        throw new AppError(`O ${label} deve ter no máximo 255 caracteres.`, 400)
    }

    return trimmed
}

// ---------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------

const listGroups = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')

    const groups = await checklistService.listChecklistGroups(req.user.id, taskId)

    if (groups === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(groups)
}

const createGroup = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const title = validateTitle(req.body.title, 'título da lista')

    const group = await checklistService.createChecklistGroup(req.user.id, taskId, { title })

    if (group === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.status(201).json(group)
}

const updateGroup = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const groupId = validateId(req.params.groupId, 'ID da lista')
    const title = validateTitle(req.body.title, 'título da lista')

    const group = await checklistService.updateChecklistGroup(req.user.id, taskId, groupId, { title })

    if (group === null) {
        throw new AppError('Lista ou tarefa não encontrada.', 404)
    }

    return res.json(group)
}

const deleteGroup = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const groupId = validateId(req.params.groupId, 'ID da lista')

    const deleted = await checklistService.deleteChecklistGroup(req.user.id, taskId, groupId)

    if (!deleted) {
        throw new AppError('Lista não encontrada.', 404)
    }

    return res.status(204).send()
}

// ---------------------------------------------------------------
// Itens
// ---------------------------------------------------------------

const listChecklist = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')

    const items = await checklistService.listChecklistItems(req.user.id, taskId)

    if (items === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(items)
}

const createChecklistItem = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const groupId = validateId(req.params.groupId, 'ID da lista')
    const title = validateTitle(req.body.title, 'título do item')

    const item = await checklistService.createChecklistItem(req.user.id, taskId, groupId, { title })

    if (item === null) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.status(201).json(item)
}

const updateChecklistItem = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const itemId = validateId(req.params.itemId, 'ID do item')

    const { title, is_completed } = req.body
    const updates = {}

    if (title !== undefined) {
        updates.title = validateTitle(title, 'título do item')
    }

    if (is_completed !== undefined) {
        updates.is_completed = Boolean(is_completed)
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError('Nenhum campo para atualizar fornecido.', 400)
    }

    const item = await checklistService.updateChecklistItem(req.user.id, taskId, itemId, updates)

    if (item === null) {
        throw new AppError('Item ou tarefa não encontrado.', 404)
    }

    return res.json(item)
}

const deleteChecklistItem = async (req, res) => {
    const taskId = validateId(req.params.taskId, 'ID da tarefa')
    const itemId = validateId(req.params.itemId, 'ID do item')

    const deleted = await checklistService.deleteChecklistItem(req.user.id, taskId, itemId)

    if (!deleted) {
        throw new AppError('Item não encontrado.', 404)
    }

    return res.status(204).send()
}

module.exports = {
    listGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    listChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
}
