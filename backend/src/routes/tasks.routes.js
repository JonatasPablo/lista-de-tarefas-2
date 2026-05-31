const { Router } = require('express')

const tasksController = require('../controllers/tasks.controller')
const taskFilesController = require('../controllers/taskFiles.controller')
const checklistController = require('../controllers/checklist.controller')
const tagsController = require('../controllers/tags.controller')
const asyncHandler = require('../helpers/asyncHandler')
const uploadTaskFile = require('../middlewares/uploadTaskFile')
const {
    attachmentReadLimiter,
    pollingReadLimiter,
    taskMutationLimiter,
    uploadLimiter,
} = require('../middlewares/routeRateLimiters')

const tasksRoutes = Router()

tasksRoutes.get('/', pollingReadLimiter, asyncHandler(tasksController.listTasks))
tasksRoutes.post('/', taskMutationLimiter, asyncHandler(tasksController.createTask))

tasksRoutes.get(
    '/history',
    pollingReadLimiter,
    asyncHandler(tasksController.listUserHistory)
)

tasksRoutes.get(
    '/search',
    pollingReadLimiter,
    asyncHandler(tasksController.searchTasks)
)

tasksRoutes.patch(
    '/bulk-complete',
    taskMutationLimiter,
    asyncHandler(tasksController.bulkCompleteTasks)
)
tasksRoutes.delete(
    '/bulk-delete',
    taskMutationLimiter,
    asyncHandler(tasksController.bulkDeleteTasks)
)

tasksRoutes.get(
    '/:id/files',
    attachmentReadLimiter,
    asyncHandler(taskFilesController.listTaskFiles)
)

tasksRoutes.post(
    '/:id/files',
    uploadLimiter,
    uploadTaskFile.single('file'),
    asyncHandler(taskFilesController.createTaskFile)
)

tasksRoutes.get(
    '/:id/files/:fileId/thumbnail',
    attachmentReadLimiter,
    asyncHandler(taskFilesController.getTaskFileThumbnail)
)

tasksRoutes.get(
    '/:id/files/:fileId/download',
    attachmentReadLimiter,
    asyncHandler(taskFilesController.downloadTaskFile)
)

tasksRoutes.patch(
    '/:id/files/:fileId',
    taskMutationLimiter,
    asyncHandler(taskFilesController.renameTaskFile)
)

tasksRoutes.delete(
    '/:id/files/:fileId',
    taskMutationLimiter,
    asyncHandler(taskFilesController.deleteTaskFile)
)

tasksRoutes.get(
    '/:id/history',
    pollingReadLimiter,
    asyncHandler(tasksController.listTaskHistory)
)

tasksRoutes.get(
    '/:taskId/checklist/groups',
    pollingReadLimiter,
    asyncHandler(checklistController.listGroups)
)
tasksRoutes.post(
    '/:taskId/checklist/groups',
    taskMutationLimiter,
    asyncHandler(checklistController.createGroup)
)
tasksRoutes.patch(
    '/:taskId/checklist/groups/:groupId',
    taskMutationLimiter,
    asyncHandler(checklistController.updateGroup)
)
tasksRoutes.delete(
    '/:taskId/checklist/groups/:groupId',
    taskMutationLimiter,
    asyncHandler(checklistController.deleteGroup)
)

tasksRoutes.post(
    '/:taskId/checklist/groups/:groupId/items',
    taskMutationLimiter,
    asyncHandler(checklistController.createChecklistItem)
)

tasksRoutes.patch(
    '/:taskId/checklist/:itemId',
    taskMutationLimiter,
    asyncHandler(checklistController.updateChecklistItem)
)
tasksRoutes.delete(
    '/:taskId/checklist/:itemId',
    taskMutationLimiter,
    asyncHandler(checklistController.deleteChecklistItem)
)

tasksRoutes.put('/:id', taskMutationLimiter, asyncHandler(tasksController.updateTask))
tasksRoutes.patch(
    '/:id/status',
    taskMutationLimiter,
    asyncHandler(tasksController.updateTaskStatus)
)
tasksRoutes.patch(
    '/:id/toggle',
    taskMutationLimiter,
    asyncHandler(tasksController.toggleTask)
)
tasksRoutes.delete(
    '/:id',
    taskMutationLimiter,
    asyncHandler(tasksController.deleteTask)
)

tasksRoutes.get('/:id/tags', pollingReadLimiter, asyncHandler(tagsController.listTagsForTask))
tasksRoutes.post('/:id/tags', taskMutationLimiter, asyncHandler(tagsController.addTagToTask))
tasksRoutes.delete('/:id/tags/:tagId', taskMutationLimiter, asyncHandler(tagsController.removeTagFromTask))

module.exports = tasksRoutes
