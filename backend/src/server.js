const loadEnv = require('./config/loadEnv')

loadEnv()
const app = require('./app')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'
const ENVIRONMENT = process.env.NODE_ENV || 'development'

app.listen(PORT, HOST, () => {
    console.log(
        `Backend iniciado | ambiente=${ENVIRONMENT} | host=${HOST} | porta=${PORT}`
    )
})
