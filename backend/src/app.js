const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const tasksRoutes = require('./routes/tasks.routes')
const authMiddleware = require('./middlewares/authMiddleware')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.set('trust proxy', 1)

const getAllowedOrigins = () => {
    const defaultOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]

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
    allowedHeaders: ['Content-Type'],
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message:
            'Muitas requisições foram realizadas. Aguarde alguns minutos e tente novamente.',
    },
})

app.disable('x-powered-by')

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
)

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use(apiLimiter)

app.get('/', (req, res) => {
    return res.json({
        message: 'Backend da Lista de Tarefas v2.0.0 está rodando!',
    })
})

app.use('/auth', authRoutes)
app.use('/tasks', authMiddleware, tasksRoutes)

app.use(errorHandler)

module.exports = app