export const getCurrentDateTime = () => {
    const now = new Date()

    return now.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    })
}

export type StatusPrazo = 'vencida' | 'vence-hoje' | 'vence-em-breve' | 'ok' | null

export const getStatusPrazo = (dueDate?: string | null): StatusPrazo => {
    if (!dueDate) return null
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const prazo = new Date(dueDate + 'T00:00:00')
    const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / 86400000)
    if (diffDias < 0) return 'vencida'
    if (diffDias === 0) return 'vence-hoje'
    if (diffDias <= 2) return 'vence-em-breve'
    return 'ok'
}

export const formatarDataVencimento = (dueDate: string): string => {
    return new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
    })
}

export const getDiffDias = (dueDate: string): number => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const prazo = new Date(dueDate + 'T00:00:00')
    return Math.ceil((prazo.getTime() - hoje.getTime()) / 86400000)
}
