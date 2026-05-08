require('dotenv').config()

const mailService = require('../services/mail.service')

const run = async () => {
    try {
        const to = process.env.SMTP_TEST_TO || process.env.SMTP_FROM_EMAIL

        if (!to) {
            throw new Error(
                'Configure SMTP_TEST_TO ou SMTP_FROM_EMAIL no .env para receber o e-mail de teste.'
            )
        }

        console.log('Testando conexão SMTP...')

        await mailService.testConnection()

        console.log('Conexão SMTP OK.')
        console.log(`Enviando e-mail de teste para: ${to}`)

        await mailService.sendMail({
            to,
            subject: 'Teste SMTP - Lista de Tarefas',
            text: [
                'Olá!',
                '',
                'Este é um e-mail de teste do sistema Lista de Tarefas.',
                '',
                'Se você recebeu este e-mail, o SMTP está funcionando corretamente.',
            ].join('\n'),
            html: `
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
                    <h2>Teste SMTP</h2>

                    <p>Olá!</p>

                    <p>Este é um e-mail de teste do sistema <strong>Lista de Tarefas</strong>.</p>

                    <p>Se você recebeu este e-mail, o SMTP está funcionando corretamente.</p>
                </div>
            `,
        })

        console.log('E-mail de teste enviado com sucesso.')
        process.exit(0)
    } catch (error) {
        console.error('Erro ao testar SMTP:')

        if (error instanceof Error) {
            console.error(error.message)
        } else {
            console.error(error)
        }

        process.exit(1)
    }
}

run()