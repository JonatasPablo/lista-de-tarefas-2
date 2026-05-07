const { Router } = require('express')

const tasksController = require('../controllers/tasks.controller')
const asyncHandler = require('../helpers/asyncHandler')

const tasksRoutes = Router()

tasksRoutes.get('/', asyncHandler(tasksController.listTasks))
tasksRoutes.post('/', asyncHandler(tasksController.createTask))

tasksRoutes.get('/history', asyncHandler(tasksController.listUserHistory))
tasksRoutes.get('/:id/history', asyncHandler(tasksController.listTaskHistory))

tasksRoutes.put('/:id', asyncHandler(tasksController.updateTask))
tasksRoutes.patch('/:id/status', asyncHandler(tasksController.updateTaskStatus))
tasksRoutes.patch('/:id/toggle', asyncHandler(tasksController.toggleTask))
tasksRoutes.delete('/:id', asyncHandler(tasksController.deleteTask))

module.exports = tasksRoutes