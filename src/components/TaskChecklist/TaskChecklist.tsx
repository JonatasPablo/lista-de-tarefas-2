import { type KeyboardEvent, useEffect } from 'react'
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

    // Notifica o pai sempre que o progresso mudar
    useEffect(() => {
        if (!onProgressChange) return
        if (progressoGeral.total === 0) {
            onProgressChange(null)
        } else {
            onProgressChange({
                total: progressoGeral.total,
                concluidos: progressoGeral.concluidos,
            })
        }
    }, [progressoGeral.total, progressoGeral.concluidos, onProgressChange])

    // ---------------------------------------------------------------
    // Handlers de teclado
    // ---------------------------------------------------------------

    const handleNovoGrupoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') adicionarGrupo()
    }

    const handleEdicaoGrupoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') salvarEdicaoGrupo()
        if (e.key === 'Escape') cancelarEdicaoGrupo()
    }

    const handleNovoItemKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        grupoId: string
    ) => {
        if (e.key === 'Enter') adicionarItem(grupoId)
    }

    const handleEdicaoItemKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        grupoId: string
    ) => {
        if (e.key === 'Enter') salvarEdicaoItem(grupoId)
        if (e.key === 'Escape') cancelarEdicaoItem()
    }

    // ---------------------------------------------------------------
    // Confirmações antes de excluir
    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // Render de item individual
    // ---------------------------------------------------------------

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
                            onKeyDown={(e) => handleEdicaoItemKeyDown(e, grupoId)}
                            autoFocus
                            aria-label="Editar item"
                        />
                        <div className="cl-item-edit-actions">
                            <button
                                type="button"
                                className="cl-btn cl-btn--save"
                                onClick={() => salvarEdicaoItem(grupoId)}
                            >
                                Salvar
                            </button>
                            <button
                                type="button"
                                className="cl-btn cl-btn--cancel"
                                onClick={cancelarEdicaoItem}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </li>
            )
        }

        return (
            <li
                key={item.id}
                className={`cl-item ${item.isCompleted ? 'cl-item--done' : ''}`}
            >
                <label className="cl-item-label">
                    <input
                        type="checkbox"
                        checked={item.isCompleted}
                        disabled={isTaskCompleted}
                        onChange={() => alternarItem(grupoId, item.id)}
                        aria-label={`Marcar "${item.title}"`}
                    />
                    <span className="cl-item-text">{item.title}</span>
                </label>

                {item.isCompleted && item.completedAt && (
                    <span className="cl-item-completed-at" title={`Concluído em ${item.completedAt}`}>
                        {item.completedAt}
                    </span>
                )}

                {!isTaskCompleted && (
                    <div className="cl-item-actions">
                        <button
                            type="button"
                            onClick={() => iniciarEdicaoItem(item)}
                            title="Editar item"
                            aria-label="Editar item"
                            className="cl-icon-btn"
                        >
                            ✎
                        </button>
                        <button
                            type="button"
                            onClick={() => excluirItem(grupoId, item.id)}
                            title="Excluir item"
                            aria-label="Excluir item"
                            className="cl-icon-btn cl-icon-btn--danger"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </li>
        )
    }

    // ---------------------------------------------------------------
    // Render principal
    // ---------------------------------------------------------------

    if (carregando) {
        return <div className="cl-loading">Carregando checklist…</div>
    }

    const temGrupos = grupos.length > 0
    const temProgressoGeral =
        progressoGeral.total > 0 && grupos.length > 1

    return (
        <div className="task-checklist">
            {/* Progresso geral — só exibe quando há 2+ grupos com itens */}
            {temProgressoGeral && (
                <p className="cl-progresso-geral">
                    {progressoGeral.concluidos}/{progressoGeral.total} concluídos no total
                </p>
            )}

            {/* Grupos */}
            {temGrupos && (
                <div className="cl-grupos">
                    {grupos.map((grupo) => {
                        const concluidos = grupo.items.filter((i) => i.isCompleted).length
                        const total = grupo.items.length
                        const estaEditandoGrupo = edicaoGrupo?.id === grupo.id

                        return (
                            <section key={grupo.id} className="cl-grupo">
                                {/* Cabeçalho do grupo */}
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
                                                autoFocus
                                                aria-label="Editar nome da lista"
                                            />
                                            <button
                                                type="button"
                                                className="cl-btn cl-btn--save"
                                                onClick={salvarEdicaoGrupo}
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                className="cl-btn cl-btn--cancel"
                                                onClick={cancelarEdicaoGrupo}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="cl-grupo-titulo">
                                                {grupo.title}
                                            </h4>

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
                                                            iniciarEdicaoGrupo(grupo)
                                                        }
                                                        title="Renomear lista"
                                                        aria-label="Renomear lista"
                                                        className="cl-icon-btn"
                                                    >
                                                        ✎
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            excluirGrupo(grupo.id)
                                                        }
                                                        title="Excluir lista"
                                                        aria-label="Excluir lista"
                                                        className="cl-icon-btn cl-icon-btn--danger"
                                                    >
                                                        ✕
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

                                {/* Itens do grupo */}
                                {grupo.items.length > 0 && (
                                    <ul className="cl-lista">
                                        {grupo.items.map((item) =>
                                            renderItem(item, grupo.id)
                                        )}
                                    </ul>
                                )}

                                {/* Adicionar item */}
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

            {/* Adicionar nova lista */}
            {!isTaskCompleted && (
                <div className="cl-add-grupo">
                    <input
                        type="text"
                        placeholder="Nome da nova lista (ex: Testes, Suporte…)"
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
