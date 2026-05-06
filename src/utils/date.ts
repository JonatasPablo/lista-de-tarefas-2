export const getCurrentDateTime = () => {
    const now = new Date()

    return now.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    })
}