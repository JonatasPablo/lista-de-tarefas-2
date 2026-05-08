const { Router } = require('express')

const authController = require('../controllers/auth.controller')
const asyncHandler = require('../helpers/asyncHandler')
const authMiddleware = require('../middlewares/authMiddleware')

const authRoutes = Router()

authRoutes.post('/register', asyncHandler(authController.register))
authRoutes.post('/confirm-email', asyncHandler(authController.confirmEmail))
authRoutes.post(
    '/resend-confirmation',
    asyncHandler(authController.resendEmailVerificationCode)
)
authRoutes.post('/login', asyncHandler(authController.login))
authRoutes.post('/logout', authMiddleware, asyncHandler(authController.logout))
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me))

module.exports = authRoutes