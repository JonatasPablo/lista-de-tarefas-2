const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const loadEnv = require('../config/loadEnv')

loadEnv()

const requiredEnvVariables = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
]

requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
        throw new Error(`Variavel de ambiente obrigatoria: ${envVariable}`)
    }
})

const escapeIdentifier = (identifier) => {
    return `\`${String(identifier).replace(/`/g, '``')}\``
}

const migrationsDirectory = path.resolve(__dirname, '..', 'database', 'migrations')

const main = async () => {
    const dbName = process.env.DB_NAME
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        multipleStatements: true,
    })

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(dbName)}
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
        await connection.query(`USE ${escapeIdentifier(dbName)}`)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                filename VARCHAR(255) NOT NULL,
                applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY schema_migrations_filename_unique (filename)
            )
        `)

        const migrationFiles = fs
            .readdirSync(migrationsDirectory)
            .filter((file) => file.endsWith('.sql'))
            .sort()

        for (const migrationFile of migrationFiles) {
            const [existing] = await connection.query(
                'SELECT id FROM schema_migrations WHERE filename = ? LIMIT 1',
                [migrationFile]
            )

            if (existing.length > 0) {
                console.log(`Ignorada: ${migrationFile}`)
                continue
            }

            const migrationPath = path.join(migrationsDirectory, migrationFile)
            const sql = fs.readFileSync(migrationPath, 'utf8')

            console.log(`Aplicando: ${migrationFile}`)
            await connection.beginTransaction()

            try {
                await connection.query(sql)
                await connection.query(
                    'INSERT INTO schema_migrations (filename) VALUES (?)',
                    [migrationFile]
                )
                await connection.commit()
            } catch (error) {
                await connection.rollback()
                throw error
            }
        }

        console.log('Migrations concluidas.')
    } finally {
        await connection.end()
    }
}

main().catch((error) => {
    console.error('Falha ao rodar migrations:', error.message)
    process.exitCode = 1
})
