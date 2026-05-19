const path = require('path')

require('dotenv').config({
    path: path.resolve(__dirname, '..', '.env'),
})

const app = require('./app')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'

app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`)
})
