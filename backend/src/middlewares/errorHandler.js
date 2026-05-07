const multer = require('multer')
const AppError = require('../errors/AppError')

const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
        })
    }

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'O arquivo ultrapassa o limite de 100 MB.',
            })
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Envie apenas um arquivo por requisição.',
            })
        }

        return res.status(400).json({
            message: 'Erro ao processar o upload do arquivo.',
        })
    }

    console.error(error)

    return res.status(500).json({
        message: 'Erro interno do servidor.',
    })
}

module.exports = errorHandler