import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { API_URL, getAuthToken } from '../../services/api'

type TaskHistory = {
    id: number
    task_id: number
    user_id: number
    action: string
    old_value: string | null
    new_value: string | null
    created_at: string
    task_title: string
}

type ActionFilter =
    | 'todas'
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'deleted'

const actionLabels: Record<string, string> = {
    created: 'Criada',
    updated: 'Editada',
    status_changed: 'Status alterado',
    deleted: 'Excluída',
}

const actionClassNames: Record<string, string> = {
    created: 'log-action-created',
    updated: 'log-action-updated',
    status_changed: 'log-action-status',
    deleted: 'log-action-deleted',
}

const fieldLabels: Record<string, string> = {
    title: 'Título',
    description: 'Descrição',
    priority: 'Prioridade',
    status: 'Status',
}

const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
}

const formatDateOnly = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const formatDateToBR = (date: string) => {
    if (!date) {
        return 'Não informado'
    }

    const [year, month, day] = date.split('-')

    return `${day}/${month}/${year}`
}

const getTodayDate = () => {
    return formatDateOnly(new Date())
}

const normalizeText = (text: string) => {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

const parseValue = (value: string | null) => {
    if (!value) {
        return null
    }

    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

const formatValueToText = (value: string | null) => {
    const parsedValue = parseValue(value)

    if (!parsedValue) {
        return 'Nenhum'
    }

    if (typeof parsedValue === 'string') {
        return parsedValue
    }

    if (typeof parsedValue === 'object') {
        const entries = Object.entries(parsedValue)

        if (entries.length === 0) {
            return 'Nenhum'
        }

        return entries
            .map(([key, entryValue]) => {
                const label = fieldLabels[key] || key
                const formattedValue =
                    entryValue === null ||
                    entryValue === undefined ||
                    entryValue === ''
                        ? 'Nenhum'
                        : String(entryValue)

                return `${label}: ${formattedValue}`
            })
            .join(' | ')
    }

    return String(parsedValue)
}

const formatValue = (value: string | null) => {
    const parsedValue = parseValue(value)

    if (!parsedValue) {
        return <span className="log-empty-value">Nenhum</span>
    }

    if (typeof parsedValue === 'string') {
        return <span>{parsedValue}</span>
    }

    if (typeof parsedValue === 'object') {
        const entries = Object.entries(parsedValue)

        if (entries.length === 0) {
            return <span className="log-empty-value">Nenhum</span>
        }

        return (
            <ul className="log-value-list">
                {entries.map(([key, entryValue]) => (
                    <li key={key}>
                        <strong>{fieldLabels[key] || key}:</strong>{' '}
                        <span>
                            {entryValue === null ||
                            entryValue === undefined ||
                            entryValue === ''
                                ? 'Nenhum'
                                : String(entryValue)}
                        </span>
                    </li>
                ))}
            </ul>
        )
    }

    return <span>{String(parsedValue)}</span>
}

const getReportPeriodLabel = (startDate: string, endDate: string) => {
    if (startDate && endDate && startDate === endDate) {
        return formatDateToBR(startDate)
    }

    if (startDate && endDate) {
        return `${formatDateToBR(startDate)} até ${formatDateToBR(endDate)}`
    }

    if (startDate) {
        return `A partir de ${formatDateToBR(startDate)}`
    }

    if (endDate) {
        return `Até ${formatDateToBR(endDate)}`
    }

    return 'Todos os períodos'
}

const getFilePeriodLabel = (startDate: string, endDate: string) => {
    if (startDate && endDate && startDate === endDate) {
        return startDate
    }

    if (startDate && endDate) {
        return `${startDate}_a_${endDate}`
    }

    if (startDate) {
        return `a_partir_de_${startDate}`
    }

    if (endDate) {
        return `ate_${endDate}`
    }

    return 'todos_os_periodos'
}

export function LogPage() {
    const todayDate = getTodayDate()

    const [history, setHistory] = useState<TaskHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionFilter, setActionFilter] = useState<ActionFilter>('todas')
    const [startDate, setStartDate] = useState(todayDate)
    const [endDate, setEndDate] = useState(todayDate)

    useEffect(() => {
        let isMounted = true

        const loadHistory = async () => {
            try {
                const token = getAuthToken()

                if (!token) {
                    throw new Error('Usuário não autenticado.')
                }

                const response = await fetch(`${API_URL}/tasks/history`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(
                        `Erro ao carregar log: ${response.status}`
                    )
                }

                const data = (await response.json()) as TaskHistory[]

                if (isMounted) {
                    setHistory(data)
                }
            } catch (error) {
                console.error('Erro ao carregar log:', error)

                if (isMounted) {
                    setHistory([])
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadHistory()

        return () => {
            isMounted = false
        }
    }, [])

    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const taskTitle = normalizeText(item.task_title || '')
            const search = normalizeText(searchTerm.trim())

            const matchesSearch = search === '' || taskTitle.includes(search)

            const matchesAction =
                actionFilter === 'todas' || item.action === actionFilter

            const itemDate = new Date(item.created_at)
            const itemDateOnly = formatDateOnly(itemDate)

            const matchesStartDate =
                startDate === '' || itemDateOnly >= startDate

            const matchesEndDate = endDate === '' || itemDateOnly <= endDate

            return (
                matchesSearch &&
                matchesAction &&
                matchesStartDate &&
                matchesEndDate
            )
        })
    }, [actionFilter, endDate, history, searchTerm, startDate])

    const logSummary = useMemo(() => {
        return filteredHistory.reduce(
            (summary, item) => {
                if (item.action === 'created') {
                    summary.created += 1
                }

                if (item.action === 'updated') {
                    summary.updated += 1
                }

                if (item.action === 'status_changed') {
                    summary.statusChanged += 1
                }

                if (item.action === 'deleted') {
                    summary.deleted += 1
                }

                return summary
            },
            {
                created: 0,
                updated: 0,
                statusChanged: 0,
                deleted: 0,
            }
        )
    }, [filteredHistory])

    const reportPeriod = getReportPeriodLabel(startDate, endDate)
    const generatedAt = new Date().toLocaleString('pt-BR')
    const actionLabel =
        actionFilter === 'todas'
            ? 'Todas as ações'
            : actionLabels[actionFilter]

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        actionFilter !== 'todas' ||
        startDate !== todayDate ||
        endDate !== todayDate

    const handleClearFilters = () => {
        setSearchTerm('')
        setActionFilter('todas')
        setStartDate(todayDate)
        setEndDate(todayDate)
    }

    const handlePrint = () => {
        window.print()
    }

    const handleExportExcel = () => {
        const workbook = XLSX.utils.book_new()

        const logRows = filteredHistory.map((item) => ({
            ID: item.id,
            'Tarefa ID': item.task_id,
            'Usuário ID': item.user_id,
            'Título da tarefa': item.task_title,
            Ação: actionLabels[item.action] || item.action,
            'Valor anterior': formatValueToText(item.old_value),
            'Novo valor': formatValueToText(item.new_value),
            Data: formatDateTime(item.created_at),
        }))

        const logWorksheet = XLSX.utils.json_to_sheet(logRows)

        logWorksheet['!cols'] = [
            { wch: 8 },
            { wch: 12 },
            { wch: 12 },
            { wch: 35 },
            { wch: 18 },
            { wch: 45 },
            { wch: 45 },
            { wch: 22 },
        ]

        if (logRows.length > 0) {
            logWorksheet['!autofilter'] = {
                ref: `A1:H${logRows.length + 1}`,
            }
        }

        const summaryRows = [
            ['Relatório', 'Log de tarefas'],
            ['Período', reportPeriod],
            ['Busca', searchTerm.trim() || 'Nenhuma'],
            ['Ação', actionLabel],
            ['Gerado em', generatedAt],
            [],
            ['Resumo', 'Quantidade'],
            ['Total de registros', filteredHistory.length],
            ['Criadas', logSummary.created],
            ['Editadas', logSummary.updated],
            ['Status alterado', logSummary.statusChanged],
            ['Excluídas', logSummary.deleted],
        ]

        const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryRows)

        summaryWorksheet['!cols'] = [{ wch: 24 }, { wch: 35 }]

        XLSX.utils.book_append_sheet(workbook, logWorksheet, 'Log filtrado')
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo')

        const filePeriod = getFilePeriodLabel(startDate, endDate)

        XLSX.writeFile(workbook, `log-tarefas-${filePeriod}.xlsx`)
    }

    if (isLoading) {
        return (
            <main className="log-page">
                <p className="empty-message">Carregando log...</p>
            </main>
        )
    }

    return (
        <main className="log-page">
            <header className="log-page-header">
                <div>
                    <h2>Log de tarefas</h2>
                    <p>
                        Acompanhe as alterações realizadas nas tarefas do
                        usuário.
                    </p>
                </div>

                <span>
                    {filteredHistory.length}{' '}
                    {filteredHistory.length === 1
                        ? 'registro encontrado'
                        : 'registros encontrados'}
                </span>
            </header>

            <section className="print-report-summary">
                <h3>Resumo do relatório</h3>

                <div className="print-summary-grid">
                    <p>
                        <strong>Período:</strong> {reportPeriod}
                    </p>

                    <p>
                        <strong>Busca:</strong>{' '}
                        {searchTerm.trim() || 'Nenhuma'}
                    </p>

                    <p>
                        <strong>Ação:</strong> {actionLabel}
                    </p>

                    <p>
                        <strong>Gerado em:</strong> {generatedAt}
                    </p>

                    <p>
                        <strong>Total de registros:</strong>{' '}
                        {filteredHistory.length}
                    </p>

                    <p>
                        <strong>Criadas:</strong> {logSummary.created}
                    </p>

                    <p>
                        <strong>Editadas:</strong> {logSummary.updated}
                    </p>

                    <p>
                        <strong>Status alterado:</strong>{' '}
                        {logSummary.statusChanged}
                    </p>

                    <p>
                        <strong>Excluídas:</strong> {logSummary.deleted}
                    </p>
                </div>
            </section>

            <section className="log-filters">
                <input
                    type="text"
                    placeholder="Buscar por tarefa..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                    value={actionFilter}
                    onChange={(event) =>
                        setActionFilter(event.target.value as ActionFilter)
                    }
                >
                    <option value="todas">Todas as ações</option>
                    <option value="created">Criadas</option>
                    <option value="updated">Editadas</option>
                    <option value="status_changed">Status alterado</option>
                    <option value="deleted">Excluídas</option>
                </select>

                <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    title="Data inicial"
                />

                <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    title="Data final"
                />

                <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                >
                    Limpar filtros
                </button>
            </section>

            <section className="log-actions-toolbar">
                <button
                    type="button"
                    onClick={handlePrint}
                    disabled={filteredHistory.length === 0}
                >
                    Imprimir / PDF
                </button>

                <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={filteredHistory.length === 0}
                >
                    Exportar Excel
                </button>
            </section>

            {filteredHistory.length === 0 ? (
                <p className="empty-message">Nenhum log encontrado.</p>
            ) : (
                <section className="log-list">
                    {filteredHistory.map((item) => (
                        <article key={item.id} className="log-card">
                            <div className="log-card-header">
                                <div>
                                    <h3>{item.task_title}</h3>
                                    <small>
                                        Tarefa #{item.task_id} | Usuário #
                                        {item.user_id}
                                    </small>
                                </div>

                                <span
                                    className={`log-action-badge ${
                                        actionClassNames[item.action] ||
                                        'log-action-default'
                                    }`}
                                >
                                    {actionLabels[item.action] || item.action}
                                </span>
                            </div>

                            <div className="log-values-grid">
                                <div className="log-value-card">
                                    <strong>Valor anterior</strong>
                                    {formatValue(item.old_value)}
                                </div>

                                <div className="log-value-card">
                                    <strong>Novo valor</strong>
                                    {formatValue(item.new_value)}
                                </div>
                            </div>

                            <footer className="log-card-footer">
                                <span>{formatDateTime(item.created_at)}</span>
                            </footer>
                        </article>
                    ))}
                </section>
            )}
        </main>
    )
}