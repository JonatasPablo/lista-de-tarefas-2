const AppError = require('../errors/AppError')

const validPriorities = ['alta', 'media', 'baixa']
const validStatus = ['pendente', 'concluida', 'cancelada', 'arquivada']

const validateTaskTitle = (title) => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        throw new AppError('O título da tarefa é obrigatório.')
    }

    return title.trim()
}

const validateTaskId = (id) => {
    const taskId = Number(id)

    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new AppError('ID da tarefa inválido.')
    }

    return taskId
}

const validateTaskDescription = (description) => {
    if (!description) {
        return null
    }

    if (typeof description !== 'string') {
        throw new AppError('A descrição da tarefa deve ser um texto.')
    }

    return description.trim() || null
}

const validateTaskPriority = (priority) => {
    if (!priority) {
        return 'media'
    }

    if (!validPriorities.includes(priority)) {
        throw new AppError('A prioridade deve ser alta, media ou baixa.')
    }

    return priority
}

const validateTaskStatus = (status) => {
    if (!status || typeof status !== 'string') {
        throw new AppError('O status da tarefa é obrigatório.')
    }

    if (!validStatus.includes(status)) {
        throw new AppError(
            'O status deve ser pendente, concluida, cancelada ou arquivada.'
        )
    }

    return status
}

module.exports = {
    validateTaskTitle,
    validateTaskId,
    validateTaskDescription,
    validateTaskPriority,
    validateTaskStatus
}