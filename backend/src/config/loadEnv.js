const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const backendRoot = path.resolve(__dirname, '..', '..')

const envFilesByEnvironment = {
    development: '.env.development',
    production: '.env.production',
}

const getEnvFilePath = () => {
    const envFileName = envFilesByEnvironment[process.env.NODE_ENV] || '.env'
    const envFilePath = path.resolve(backendRoot, envFileName)

    if (fs.existsSync(envFilePath)) {
        return envFilePath
    }

    return path.resolve(backendRoot, '.env')
}

const loadEnv = () => {
    const envFilePath = getEnvFilePath()

    dotenv.config({
        path: envFilePath,
        quiet: true,
    })
}

module.exports = loadEnv
