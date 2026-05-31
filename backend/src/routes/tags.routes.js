const { Router } = require('express')
const tagsController = require('../controllers/tags.controller')
const asyncHandler = require('../helpers/asyncHandler')
const { taskMutationLimiter, pollingReadLimiter } = require('../middlewares/routeRateLimiters')

const tagsRoutes = Router()

tagsRoutes.get('/', pollingReadLimiter, asyncHandler(tagsController.listTags))
tagsRoutes.post('/', taskMutationLimiter, asyncHandler(tagsController.createTag))
tagsRoutes.put('/:id', taskMutationLimiter, asyncHandler(tagsController.updateTag))
tagsRoutes.delete('/:id', taskMutationLimiter, asyncHandler(tagsController.deleteTag))

module.exports = tagsRoutes
