const { Router } = require('express')

const authController = require('../controllers/auth.controller')
const asyncHandler = require('../helpers/asyncHandler')
const authMiddleware = require('../middlewares/authMiddleware')
const {
    emailConfirmationLimiter,
    loginLimiter,
    passwordResetAttemptLimiter,
    passwordResetRequestLimiter,
    resendConfirmationLimiter,
} = require('../middlewares/authRateLimiters')

const authRoutes = Router()

authRoutes.post('/register', asyncHandler(authController.register))
authRoutes.post(
    '/confirm-email',
    emailConfirmationLimiter,
    asyncHandler(authController.confirmEmail)
)
authRoutes.post(
    '/resend-confirmation',
    resendConfirmationLimiter,
    asyncHandler(authController.resendEmailVerificationCode)
)
authRoutes.post(
    '/email-confirmation-status',
    emailConfirmationLimiter,
    asyncHandler(authController.verificarStatusConfirmacaoEmail)
)
authRoutes.post(
    '/forgot-password',
    passwordResetRequestLimiter,
    asyncHandler(authController.solicitarRedefinicaoSenha)
)
authRoutes.post(
    '/validate-password-reset-code',
    passwordResetAttemptLimiter,
    asyncHandler(authController.validarCodigoRedefinicaoSenha)
)
authRoutes.post(
    '/reset-password',
    passwordResetAttemptLimiter,
    asyncHandler(authController.redefinirSenha)
)
authRoutes.post('/login', loginLimiter, asyncHandler(authController.login))
authRoutes.post('/google', asyncHandler(authController.loginGoogle))
authRoutes.get('/config', asyncHandler(authController.config))
authRoutes.post('/logout', authMiddleware, asyncHandler(authController.logout))
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me))

module.exports = authRoutes
