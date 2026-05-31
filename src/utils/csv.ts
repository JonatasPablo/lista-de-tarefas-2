import type { Task } from '../types/task'

const escapeCsvField = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}

const priorityLabel: Record<string, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
}

export const exportarTarefasPendentesCsv = (tasks: Task[]): void => {
    const cabecalho = ['Título', 'Descrição', 'Prioridade', 'Vencimento', 'Criado em']
    const linhas = tasks.map((task) => [
        escapeCsvField(task.title || ''),
        escapeCsvField(task.description || ''),
        escapeCsvField(priorityLabel[task.priority] || task.priority),
        escapeCsvField(task.dueDate || ''),
        escapeCsvField(task.createdAt || ''),
    ])

    const csvContent = [cabecalho, ...linhas]
        .map((linha) => linha.join(','))
        .join('\n')

    const bom = '﻿'
    const blob = new Blob([bom + csvContent], {
        type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tarefas-pendentes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
}
