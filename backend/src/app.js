const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/auth.routes')
const tasksRoutes = require('./routes/tasks.routes')
const usersRoutes = require('./routes/users.routes')
const tagsRoutes = require('./routes/tags.routes')
const connection = require('./database/connection')
const authMiddleware = require('./middlewares/authMiddleware')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.set('trust proxy', 1)

const isProduction = process.env.NODE_ENV === 'production'
const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const getAllowedOrigins = () => {
    const defaultOrigins = isProduction
        ? []
        : ['http://localhost:5173', 'http://127.0.0.1:5173']

    const clientUrl = process.env.CLIENT_URL

    const clientUrls = process.env.CLIENT_URLS
        ? process.env.CLIENT_URLS.split(',').map((url) => url.trim())
        : []

    return [...defaultOrigins, clientUrl, ...clientUrls].filter(Boolean)
}

const allowedOrigins = getAllowedOrigins()

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            callback(null, true)
            return
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new Error(`Origem não permitida pelo CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'ngrok-skip-browser-warning'],
}

const getOriginFromReferer = (referer) => {
    if (!referer) {
        return null
    }

    try {
        return new URL(referer).origin
    } catch {
        return null
    }
}

const csrfOriginProtection = (req, res, next) => {
    if (!stateChangingMethods.has(req.method)) {
        return next()
    }

    const requestOrigin =
        req.get('origin') || getOriginFromReferer(req.get('referer'))

    if (!requestOrigin) {
        if (isProduction) {
            return res.status(403).json({
                message:
                    'Origem da requisição não identificada. Atualize a página e tente novamente.',
            })
        }

        return next()
    }

    if (!allowedOrigins.includes(requestOrigin)) {
        return res.status(403).json({
            message: 'Origem da requisição não permitida.',
        })
    }

    return next()
}

app.disable('x-powered-by')

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
)

app.use(cors(corsOptions))
app.use(csrfOriginProtection)
app.use(express.json({ limit: '1mb' }))

app.get('/', (req, res) => {
    return res.json({
        message: 'Backend da Lista de Tarefas v2.0.0 está rodando!',
    })
})

app.get('/health', async (req, res, next) => {
    try {
        await connection.query('SELECT 1')

        return res.json({
            status: 'ok',
            database: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return next(error)
    }
})

app.use('/auth', authRoutes)
app.use('/users', authMiddleware, usersRoutes)
app.use('/tasks', authMiddleware, tasksRoutes)
app.use('/tags', authMiddleware, tagsRoutes)

app.use(errorHandler)

module.exports = app
