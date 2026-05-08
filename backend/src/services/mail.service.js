const nodemailer = require('nodemailer')

const AppError = require('../errors/AppError')

const getRequiredEnv = (key) => {
    const value = process.env[key]

    if (!value) {
        throw new AppError(
            `A variável de ambiente ${key} não foi configurada.`,
            500
        )
    }

    return value
}

const getSmtpConfig = () => {
    const host = getRequiredEnv('SMTP_HOST')
    const port = Number(getRequiredEnv('SMTP_PORT'))
    const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    const user = getRequiredEnv('SMTP_USER')
    const pass = getRequiredEnv('SMTP_PASS')

    return {
        host,
        port,
        secure,

        // Força IPv4 para evitar erro ENETUNREACH em ambientes cloud/Railway
        family: 4,

        // Evita ficar pendurado por muito tempo se o SMTP não responder
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,

        auth: {
            user,
            pass,
        },
    }
}

const getTransporter = () => {
    return nodemailer.createTransport(getSmtpConfig())
}

const getFromAddress = () => {
    const fromName = process.env.SMTP_FROM_NAME || 'Lista de Tarefas'
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

    return `"${fromName}" <${fromEmail}>`
}

const sendMail = async ({ to, subject, html, text }) => {
    if (!to) {
        throw new AppError('O destinatário do e-mail é obrigatório.', 500)
    }

    const transporter = getTransporter()

    await transporter.sendMail({
        from: getFromAddress(),
        to,
        subject,
        html,
        text,
    })
}

const testConnection = async () => {
    const transporter = getTransporter()

    await transporter.verify()

    return true
}

const sendEmailVerificationCode = async ({
    to,
    name,
    code,
    confirmationUrl,
}) => {
    const subject = 'Confirme seu e-mail - Lista de Tarefas'

    const text = [
        `Olá, ${name}.`,
        '',
        'Recebemos seu cadastro na Lista de Tarefas.',
        '',
        'Use o código abaixo para confirmar seu e-mail:',
        '',
        code,
        '',
        confirmationUrl
            ? `Acesse a tela de confirmação por este link: ${confirmationUrl}`
            : '',
        '',
        'Se você não criou essa conta, ignore este e-mail.',
    ]
        .filter(Boolean)
        .join('\n')

    const buttonHtml = confirmationUrl
        ? `
            <a
                href="${confirmationUrl}"
                style="
                    display: inline-block;
                    margin-top: 18px;
                    padding: 13px 22px;
                    border-radius: 999px;
                    background: #111827;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                "
            >
                Confirmar meu e-mail
            </a>
        `
        : ''

    const html = `
        <div style="
            margin: 0;
            padding: 28px 14px;
            background: #f3f4f6;
            font-family: Arial, sans-serif;
            color: #1f2937;
            line-height: 1.6;
        ">
            <div style="
                max-width: 520px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 22px;
                padding: 28px;
                box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
            ">
                <div style="
                    width: 54px;
                    height: 54px;
                    border-radius: 18px;
                    background: #111827;
                    color: #ffffff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 800;
                    margin-bottom: 18px;
                ">
                    ✓
                </div>

                <h2 style="
                    margin: 0 0 8px;
                    color: #111827;
                    font-size: 24px;
                    line-height: 1.25;
                ">
                    Confirme seu e-mail
                </h2>

                <p style="margin: 0 0 16px;">
                    Olá, <strong>${name}</strong>.
                </p>

                <p style="margin: 0 0 16px;">
                    Recebemos seu cadastro na <strong>Lista de Tarefas</strong>.
                    Use o código abaixo para confirmar seu e-mail e liberar o login.
                </p>

                <div style="
                    display: block;
                    width: fit-content;
                    padding: 14px 22px;
                    margin: 18px 0;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 14px;
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: 5px;
                    color: #111827;
                ">
                    ${code}
                </div>

                ${buttonHtml}

                <p style="
                    margin: 18px 0 0;
                    color: #6b7280;
                    font-size: 13px;
                ">
                    Se o botão não funcionar, acesse o sistema e informe o código manualmente.
                </p>

                <hr style="
                    border: 0;
                    border-top: 1px solid #e5e7eb;
                    margin: 24px 0;
                " />

                <p style="
                    margin: 0;
                    color: #6b7280;
                    font-size: 12px;
                ">
                    Se você não criou essa conta, ignore este e-mail.
                </p>
            </div>
        </div>
    `

    await sendMail({
        to,
        subject,
        html,
        text,
    })
}

const sendPasswordResetCode = async ({ to, name, code }) => {
    const subject = 'Código para redefinir sua senha - Lista de Tarefas'

    const text = [
        `Olá, ${name}.`,
        '',
        'Use o código abaixo para redefinir sua senha:',
        '',
        code,
        '',
        'Esse código é temporário. Se você não solicitou a redefinição, ignore este e-mail.',
    ].join('\n')

    const html = `
        <div style="
            margin: 0;
            padding: 28px 14px;
            background: #f3f4f6;
            font-family: Arial, sans-serif;
            color: #1f2937;
            line-height: 1.6;
        ">
            <div style="
                max-width: 520px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 22px;
                padding: 28px;
                box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
            ">
                <h2 style="
                    margin: 0 0 8px;
                    color: #111827;
                    font-size: 24px;
                    line-height: 1.25;
                ">
                    Redefinição de senha
                </h2>

                <p>Olá, <strong>${name}</strong>.</p>

                <p>Use o código abaixo para redefinir sua senha:</p>

                <div style="
                    display: block;
                    width: fit-content;
                    padding: 14px 22px;
                    margin: 18px 0;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 14px;
                    font-size: 28px;
                    font-weight: 900;
                    letter-spacing: 5px;
                    color: #111827;
                ">
                    ${code}
                </div>

                <p style="color: #6b7280; font-size: 13px;">
                    Esse código é temporário.
                </p>

                <p style="color: #6b7280; font-size: 12px;">
                    Se você não solicitou a redefinição, ignore este e-mail.
                </p>
            </div>
        </div>
    `

    await sendMail({
        to,
        subject,
        html,
        text,
    })
}

module.exports = {
    sendMail,
    testConnection,
    sendEmailVerificationCode,
    sendPasswordResetCode,
}