const mysql = require('mysql2/promise')

const requiredEnvVariables = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
]

requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
        throw new Error(
            `Variável de ambiente obrigatória não configurada: ${envVariable}`
        )
    }
})

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    dateStrings: false,
})

module.exports = connection