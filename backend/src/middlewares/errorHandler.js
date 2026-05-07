const AppError = require('../errors/AppError')

const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message
        })
    }

    console.error(error)

    return res.status(500).json({
        message: 'Erro interno do servidor.'
    })
}

module.exports = errorHandler