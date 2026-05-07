const express = require('express')
const cors = require('cors')

const tasksRoutes = require('./routes/tasks.routes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    return res.json({
        message: 'Backend da Lista de Tarefas v2.0.0 está rodando!'
    })
})

app.use('/tasks', tasksRoutes)

app.use(errorHandler)

module.exports = app