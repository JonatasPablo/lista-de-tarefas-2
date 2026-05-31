const loadEnv = require('../config/loadEnv')

loadEnv()
const connection = require('../database/connection')

const main = async () => {
    const [[ping]] = await connection.query(`
        SELECT
            1 AS ok,
            DATABASE() AS database_name,
            VERSION() AS mysql_version
    `)

    const [[tables]] = await connection.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
    `)

    console.log(
        `Conexao MySQL OK | database=${ping.database_name} | version=${ping.mysql_version} | tables=${tables.total}`
    )
}

main()
    .catch((error) => {
        console.error('Falha ao testar conexao MySQL:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await connection.end()
    })
