const AppError = require('../errors/AppError')

const validPriorities = ['alta', 'media', 'baixa']
const validStatus = ['pendente', 'concluida', 'cancelada', 'arquivada']

const validateTaskTitle = (title) => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        throw new AppError('O titulo da tarefa e obrigatorio.')
    }

    return title.trim()
}

const validateTaskId = (id) => {
    const taskId = Number(id)

    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw new AppError('ID da tarefa invalido.')
    }

    return taskId
}

const validateTaskDescription = (description) => {
    if (!description) {
        return null
    }

    if (typeof description !== 'string') {
        throw new AppError('A descricao da tarefa deve ser um texto.')
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
        throw new AppError('O status da tarefa e obrigatorio.')
    }

    if (!validStatus.includes(status)) {
        throw new AppError(
            'O status deve ser pendente, concluida, cancelada ou arquivada.'
        )
    }

    return status
}

const validateDueDate = (dueDate) => {
    if (!dueDate) return null
    if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        throw new AppError('Data de vencimento invalida.', 400)
    }

    const parsed = new Date(`${dueDate}T00:00:00`)
    if (isNaN(parsed.getTime())) {
        throw new AppError('Data de vencimento invalida.', 400)
    }

    return dueDate
}

const validateDueTime = (dueTime) => {
    if (!dueTime) return null
    if (typeof dueTime !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(dueTime)) {
        throw new AppError('Horario de vencimento invalido.', 400)
    }

    const [hours, minutes] = dueTime.split(':').map(Number)
    if (hours > 23 || minutes > 59) {
        throw new AppError('Horario de vencimento invalido.', 400)
    }

    return dueTime.slice(0, 5)
}

module.exports = {
    validateTaskTitle,
    validateTaskId,
    validateTaskDescription,
    validateTaskPriority,
    validateTaskStatus,
    validateDueDate,
    validateDueTime,
}
