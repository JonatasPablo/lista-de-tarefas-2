const tasksService = require('../services/tasks.service')
const AppError = require('../errors/AppError')

const {
    validateTaskTitle,
    validateTaskId,
    validateTaskDescription,
    validateTaskPriority,
    validateTaskStatus,
} = require('../helpers/validateTask')

const listTasks = async (req, res) => {
    const tasks = await tasksService.listTasks(req.user.id)

    return res.json(tasks)
}

const createTask = async (req, res) => {
    const { title, description, priority } = req.body

    const validTitle = validateTaskTitle(title)
    const validDescription = validateTaskDescription(description)
    const validPriority = validateTaskPriority(priority)

    const newTask = await tasksService.createTask(req.user.id, {
        title: validTitle,
        description: validDescription,
        priority: validPriority,
    })

    return res.status(201).json(newTask)
}

const updateTask = async (req, res) => {
    const { id } = req.params
    const { title, description, priority } = req.body

    const taskId = validateTaskId(id)
    const validTitle = validateTaskTitle(title)
    const validDescription = validateTaskDescription(description)
    const validPriority = validateTaskPriority(priority)

    const task = await tasksService.updateTask(req.user.id, taskId, {
        title: validTitle,
        description: validDescription,
        priority: validPriority,
    })

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(task)
}

const toggleTask = async (req, res) => {
    const { id } = req.params

    const taskId = validateTaskId(id)

    const task = await tasksService.toggleTask(req.user.id, taskId)

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(task)
}

const updateTaskStatus = async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    const taskId = validateTaskId(id)
    const validStatus = validateTaskStatus(status)

    const task = await tasksService.updateTaskStatus(
        req.user.id,
        taskId,
        validStatus
    )

    if (!task) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(task)
}

const deleteTask = async (req, res) => {
    const { id } = req.params

    const taskId = validateTaskId(id)

    const deleted = await tasksService.deleteTask(req.user.id, taskId)

    if (!deleted) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.status(204).send()
}

const listTaskHistory = async (req, res) => {
    const { id } = req.params

    const taskId = validateTaskId(id)

    const history = await tasksService.listTaskHistory(req.user.id, taskId)

    if (!history) {
        throw new AppError('Tarefa não encontrada.', 404)
    }

    return res.json(history)
}

const listUserHistory = async (req, res) => {
    const history = await tasksService.listUserHistory(req.user.id)

    return res.json(history)
}

module.exports = {
    listTasks,
    createTask,
    updateTask,
    toggleTask,
    updateTaskStatus,
    deleteTask,
    listTaskHistory,
    listUserHistory,
}