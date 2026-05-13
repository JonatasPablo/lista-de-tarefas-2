const { Router } = require('express')

const usersController = require('../controllers/users.controller')
const asyncHandler = require('../helpers/asyncHandler')
const { accountPasswordChangeLimiter } = require('../middlewares/authRateLimiters')
const uploadUserAvatar = require('../middlewares/uploadUserAvatar')

const usersRoutes = Router()

usersRoutes.patch('/me', asyncHandler(usersController.atualizarDadosBasicos))
usersRoutes.get('/me/avatar', asyncHandler(usersController.obterAvatar))
usersRoutes.post(
    '/me/avatar',
    uploadUserAvatar.single('avatar'),
    asyncHandler(usersController.atualizarAvatar)
)
usersRoutes.delete('/me/avatar', asyncHandler(usersController.removerAvatar))
usersRoutes.patch(
    '/me/password',
    accountPasswordChangeLimiter,
    asyncHandler(usersController.alterarSenha)
)

module.exports = usersRoutes
