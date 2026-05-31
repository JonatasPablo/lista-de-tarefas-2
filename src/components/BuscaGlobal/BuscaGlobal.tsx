import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { tasksApi, type SearchResult } from '../../services/tasksApi'
import './BuscaGlobal.css'

interface BuscaGlobalProps {
    isOpen: boolean
    onClose: () => void
}

const DEBOUNCE_MS = 300

export const BuscaGlobal = ({ isOpen, onClose }: BuscaGlobalProps) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const pendentes = results.filter((r) => r.status === 'pendente')
    const concluidas = results.filter((r) => r.status === 'concluida')
    const todosResultados = [...pendentes, ...concluidas]

    const buscar = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const data = await tasksApi.searchTasks(q)
            setResults(data)
            setActiveIndex(-1)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isOpen) {
            const id = setTimeout(() => {
                setQuery('')
                setResults([])
                setActiveIndex(-1)
            }, 0)
            return () => clearTimeout(id)
        }
        const id = setTimeout(() => inputRef.current?.focus(), 50)
        return () => clearTimeout(id)
    }, [isOpen])

    const handleQueryChange = (val: string) => {
        setQuery(val)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => buscar(val), DEBOUNCE_MS)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onClose()
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, todosResultados.length - 1))
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, -1))
        }
        if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault()
            onClose()
        }
    }

    if (!isOpen) return null

    const renderGroup = (titulo: string, grupo: SearchResult[], offset: number) => {
        if (!grupo.length) return null
        return (
            <div className="busca-global-grupo">
                <div className="busca-global-grupo-titulo">{titulo}</div>
                {grupo.map((r, i) => {
                    const idx = offset + i
                    return (
                        <button
                            key={r.id}
                            type="button"
                            className={`busca-global-item ${activeIndex === idx ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className={`busca-global-item-priority busca-global-item-priority--${r.priority}`} />
                            <span className="busca-global-item-title">{r.title}</span>
                            <span className="busca-global-item-date">{r.createdAt}</span>
                        </button>
                    )
                })}
            </div>
        )
    }

    const overlay = (
        <div
            className="busca-global-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Busca global"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="busca-global-modal">
                <div className="busca-global-search-row">
                    <span className="busca-global-icon" aria-hidden="true">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="busca-global-input"
                        placeholder="Buscar tarefas..."
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        aria-label="Buscar tarefas"
                        autoComplete="off"
                    />
                    <kbd className="busca-global-esc" onClick={onClose}>Esc</kbd>
                </div>

                <div className="busca-global-results">
                    {loading && (
                        <p className="busca-global-status">Buscando...</p>
                    )}
                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <p className="busca-global-status">Nenhuma tarefa encontrada.</p>
                    )}
                    {!loading && results.length > 0 && (
                        <>
                            {renderGroup('Tarefas pendentes', pendentes, 0)}
                            {renderGroup('Tarefas concluídas', concluidas, pendentes.length)}
                        </>
                    )}
                    {!loading && query.trim().length < 2 && (
                        <p className="busca-global-status busca-global-hint">
                            Digite ao menos 2 caracteres para buscar
                        </p>
                    )}
                </div>
            </div>
        </div>
    )

    return createPortal(overlay, document.body)
}
