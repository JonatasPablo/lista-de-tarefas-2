const { Router } = require('express')

const tasksController = require('../controllers/tasks.controller')
const taskFilesController = require('../controllers/taskFiles.controller')
const checklistController = require('../controllers/checklist.controller')
const asyncHandler = require('../helpers/asyncHandler')
const uploadTaskFile = require('../middlewares/uploadTaskFile')

const tasksRoutes = Router()

tasksRoutes.get('/', asyncHandler(tasksController.listTasks))
tasksRoutes.post('/', asyncHandler(tasksController.createTask))

tasksRoutes.get('/history', asyncHandler(tasksController.listUserHistory))

tasksRoutes.patch('/bulk-complete', asyncHandler(tasksController.bulkCompleteTasks))
tasksRoutes.delete('/bulk-delete', asyncHandler(tasksController.bulkDeleteTasks))

tasksRoutes.get('/:id/files', asyncHandler(taskFilesController.listTaskFiles))

tasksRoutes.post(
    '/:id/files',
    uploadTaskFile.single('file'),
    asyncHandler(taskFilesController.createTaskFile)
)

tasksRoutes.get(
    '/:id/files/:fileId/download',
    asyncHandler(taskFilesController.downloadTaskFile)
)

tasksRoutes.patch(
    '/:id/files/:fileId',
    asyncHandler(taskFilesController.renameTaskFile)
)

tasksRoutes.delete(
    '/:id/files/:fileId',
    asyncHandler(taskFilesController.deleteTaskFile)
)

tasksRoutes.get('/:id/history', asyncHandler(tasksController.listTaskHistory))

tasksRoutes.get('/:taskId/checklist', asyncHandler(checklistController.listChecklist))
tasksRoutes.post('/:taskId/checklist', asyncHandler(checklistController.createChecklistItem))
tasksRoutes.patch('/:taskId/checklist/:itemId', asyncHandler(checklistController.updateChecklistItem))
tasksRoutes.delete('/:taskId/checklist/:itemId', asyncHandler(checklistController.deleteChecklistItem))

tasksRoutes.put('/:id', asyncHandler(tasksController.updateTask))
tasksRoutes.patch('/:id/status', asyncHandler(tasksController.updateTaskStatus))
tasksRoutes.patch('/:id/toggle', asyncHandler(tasksController.toggleTask))
tasksRoutes.delete('/:id', asyncHandler(tasksController.deleteTask))

module.exports = tasksRoutes