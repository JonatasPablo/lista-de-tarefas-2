import { type KeyboardEvent, useEffect, useMemo, useRef } from 'react'
import { useChecklist } from '../../hooks/useChecklist'
import type { ChecklistItem } from '../../services/checklistApi'
import './TaskChecklist.css'

interface TaskChecklistProps {
    taskId: string
    isTaskCompleted: boolean
    expanded: boolean
    onProgressChange?: (summary: { total: number; concluidos: number } | null) => void
}

export const TaskChecklist = ({
    taskId,
    isTaskCompleted,
    expanded,
    onProgressChange,
}: TaskChecklistProps) => {
    const {
        grupos,
        carregando,

        tituloNovoGrupo,
        setTituloNovoGrupo,
        adicionarGrupo,

        edicaoGrupo,
        setEdicaoGrupo,
        iniciarEdicaoGrupo,
        cancelarEdicaoGrupo,
        salvarEdicaoGrupo,
        excluirGrupo,

        getTituloNovoItem,
        setTituloNovoItem,
        adicionarItem,
        inputItemRefs,

        edicaoItem,
        setEdicaoItem,
        iniciarEdicaoItem,
        cancelarEdicaoItem,
        salvarEdicaoItem,
        excluirItem,

        alternarItem,
        progressoGeral,
    } = useChecklist(taskId, isTaskCompleted, expanded)
    const shouldSkipBlurSaveRef = useRef(false)
    const lastProgressEmissionRef = useRef<string | null>(null)

    const progressSummary = useMemo(() => {
        if (progressoGeral.total === 0) {
            return null
        }

        return {
            total: progressoGeral.total,
            concluidos: progressoGeral.concluidos,
        }
    }, [progressoGeral.concluidos, progressoGeral.total])

    useEffect(() => {
        if (!onProgressChange) return
        if (carregando) return

        const progressKey = progressSummary
            ? `${taskId}:${progressSummary.total}:${progressSummary.concluidos}`
            : `${taskId}:0:0`

        if (lastProgressEmissionRef.current === progressKey) {
            return
        }

        lastProgressEmissionRef.current = progressKey
        onProgressChange(progressSummary)
    }, [carregando, onProgressChange, progressSummary, taskId])

    const handleNovoGrupoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') adicionarGrupo()
    }

    const finalizarEdicaoGrupo = () => {
        if (!edicaoGrupo) return
        if (shouldSkipBlurSaveRef.current) {
            shouldSkipBlurSaveRef.current = false
            return
        }

        if (edicaoGrupo.titulo.trim()) {
            salvarEdicaoGrupo()
        } else {
            cancelarEdicaoGrupo()
        }
    }

    const handleEdicaoGrupoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            shouldSkipBlurSaveRef.current = true
            cancelarEdicaoGrupo()
        }
    }

    const handleNovoItemKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        grupoId: string
    ) => {
        if (e.key === 'Enter') adicionarItem(grupoId)
    }

    const finalizarEdicaoItem = (grupoId: string) => {
        if (!edicaoItem) return
        if (shouldSkipBlurSaveRef.current) {
            shouldSkipBlurSaveRef.current = false
            return
        }

        if (edicaoItem.titulo.trim()) {
            salvarEdicaoItem(grupoId)
        } else {
            cancelarEdicaoItem()
        }
    }

    const handleEdicaoItemKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            shouldSkipBlurSaveRef.current = true
            cancelarEdicaoItem()
        }
    }

    const handleIniciarEdicaoGrupo = (
        grupo: Parameters<typeof iniciarEdicaoGrupo>[0]
    ) => {
        shouldSkipBlurSaveRef.current = false
        iniciarEdicaoGrupo(grupo)
    }

    const handleIniciarEdicaoItem = (item: ChecklistItem) => {
        shouldSkipBlurSaveRef.current = false
        iniciarEdicaoItem(item)
    }

    const renderItem = (item: ChecklistItem, grupoId: string) => {
        const estaEditando = edicaoItem?.id === item.id

        if (estaEditando) {
            return (
                <li key={item.id} className="cl-item cl-item--editing">
                    <div className="cl-item-edit">
                        <input
                            type="text"
                            value={edicaoItem.titulo}
                            onChange={(e) =>
                                setEdicaoItem({ ...edicaoItem, titulo: e.target.value })
                            }
                            onKeyDown={handleEdicaoItemKeyDown}
                            onBlur={() => finalizarEdicaoItem(grupoId)}
                            autoFocus
                            aria-label="Editar item"
                        />
                    </div>
                </li>
            )
        }

        return (
            <li
                key={item.id}
                className={`cl-item ${item.isCompleted ? 'cl-item--done' : ''}`}
            >
                <div className="cl-item-label">
                    <input
                        type="checkbox"
                        checked={item.isCompleted}
                        disabled={isTaskCompleted}
                        onChange={() => alternarItem(grupoId, item.id)}
                        aria-label={`Marcar "${item.title}"`}
                    />

                    {isTaskCompleted ? (
                        <span className="cl-item-text">{item.title}</span>
                    ) : (
                        <button
                            type="button"
                            className="cl-item-text cl-inline-editable"
                            onClick={() => handleIniciarEdicaoItem(item)}
                            title="Clique para editar"
                        >
                            {item.title}
                        </button>
                    )}
                </div>

                {item.isCompleted && item.completedAt && (
                    <span
                        className="cl-item-completed-at"
                        title={`Concluído em ${item.completedAt}`}
                    >
                        {item.completedAt}
                    </span>
                )}

                {!isTaskCompleted && (
                    <div className="cl-item-actions">
                        <button
                            type="button"
                            onClick={() => excluirItem(grupoId, item.id)}
                            title="Excluir item"
                            aria-label="Excluir item"
                            className="cl-icon-btn cl-icon-btn--danger"
                        >
                            x
                        </button>
                    </div>
                )}
            </li>
        )
    }

    if (carregando) {
        return <div className="cl-loading">Carregando checklist...</div>
    }

    const temGrupos = grupos.length > 0
    const temProgressoGeral =
        progressoGeral.total > 0 && grupos.length > 1

    return (
        <div className="task-checklist">
            {temProgressoGeral && (
                <p className="cl-progresso-geral">
                    {progressoGeral.concluidos}/{progressoGeral.total} concluídos no total
                </p>
            )}

            {temGrupos && (
                <div className="cl-grupos">
                    {grupos.map((grupo) => {
                        const concluidos = grupo.items.filter((i) => i.isCompleted).length
                        const total = grupo.items.length
                        const estaEditandoGrupo = edicaoGrupo?.id === grupo.id

                        return (
                            <section key={grupo.id} className="cl-grupo">
                                <div className="cl-grupo-header">
                                    {estaEditandoGrupo ? (
                                        <div className="cl-grupo-edit">
                                            <input
                                                type="text"
                                                value={edicaoGrupo.titulo}
                                                onChange={(e) =>
                                                    setEdicaoGrupo({
                                                        ...edicaoGrupo,
                                                        titulo: e.target.value,
                                                    })
                                                }
                                                onKeyDown={handleEdicaoGrupoKeyDown}
                                                onBlur={finalizarEdicaoGrupo}
                                                autoFocus
                                                aria-label="Editar nome da lista"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {isTaskCompleted ? (
                                                <h4 className="cl-grupo-titulo">
                                                    {grupo.title}
                                                </h4>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="cl-grupo-titulo cl-inline-editable"
                                                    onClick={() =>
                                                        handleIniciarEdicaoGrupo(grupo)
                                                    }
                                                    title="Clique para editar"
                                                >
                                                    {grupo.title}
                                                </button>
                                            )}

                                            {total > 0 && (
                                                <span className="cl-grupo-progresso">
                                                    {concluidos}/{total}
                                                </span>
                                            )}

                                            {!isTaskCompleted && (
                                                <div className="cl-grupo-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            excluirGrupo(grupo.id)
                                                        }
                                                        title="Excluir lista"
                                                        aria-label="Excluir lista"
                                                        className="cl-icon-btn cl-icon-btn--danger"
                                                    >
                                                        x
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {total > 0 && (
                                    <div className="cl-grupo-progress-bar">
                                        <div
                                            className="cl-grupo-progress-fill"
                                            style={{
                                                width: `${Math.round((concluidos / total) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                )}

                                {grupo.items.length > 0 && (
                                    <ul className="cl-lista">
                                        {grupo.items.map((item) =>
                                            renderItem(item, grupo.id)
                                        )}
                                    </ul>
                                )}

                                {!isTaskCompleted && (
                                    <div className="cl-add-item">
                                        <input
                                            ref={(el) => {
                                                inputItemRefs.current[grupo.id] = el
                                            }}
                                            type="text"
                                            placeholder="Novo item"
                                            value={getTituloNovoItem(grupo.id)}
                                            onChange={(e) =>
                                                setTituloNovoItem(grupo.id, e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                handleNovoItemKeyDown(e, grupo.id)
                                            }
                                            aria-label="Novo item da checklist"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => adicionarItem(grupo.id)}
                                            disabled={!getTituloNovoItem(grupo.id).trim()}
                                            className="cl-btn cl-btn--add"
                                        >
                                            + Adicionar
                                        </button>
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </div>
            )}

            {!isTaskCompleted && (
                <div className="cl-add-grupo">
                    <input
                        type="text"
                        placeholder="Nome da nova lista (ex: Testes, Suporte...)"
                        value={tituloNovoGrupo}
                        onChange={(e) => setTituloNovoGrupo(e.target.value)}
                        onKeyDown={handleNovoGrupoKeyDown}
                        aria-label="Nome da nova lista de checklist"
                    />
                    <button
                        type="button"
                        onClick={adicionarGrupo}
                        disabled={!tituloNovoGrupo.trim()}
                        className="cl-btn cl-btn--add-grupo"
                    >
                        + Nova lista
                    </button>
                </div>
            )}
        </div>
    )
}
