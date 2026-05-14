import { useState, useEffect, useRef } from 'react'
import { checklistApi, type ChecklistGroup, type ChecklistItem } from '../services/checklistApi'

// ---------------------------------------------------------------
// Estado de edição de grupo
// ---------------------------------------------------------------

type EstadoEdicaoGrupo = {
    id: string
    titulo: string
}

// ---------------------------------------------------------------
// Estado de edição de item
// ---------------------------------------------------------------

type EstadoEdicaoItem = {
    id: string
    titulo: string
}

// ---------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------

export const useChecklist = (
    taskId: string,
    isTaskCompleted: boolean,
    expanded: boolean
) => {
    const [grupos, setGrupos] = useState<ChecklistGroup[]>([])
    const [carregando, setCarregando] = useState(false)

    // Adição de novo grupo
    const [tituloNovoGrupo, setTituloNovoGrupo] = useState('')

    // Edição de grupo
    const [edicaoGrupo, setEdicaoGrupo] = useState<EstadoEdicaoGrupo | null>(null)

    // Adição de item por grupo: { [groupId]: string }
    const [titulosNovoItem, setTitulosNovoItem] = useState<Record<string, string>>({})

    // Edição de item
    const [edicaoItem, setEdicaoItem] = useState<EstadoEdicaoItem | null>(null)

    const inputItemRefs = useRef<Record<string, HTMLInputElement | null>>({})

    // ---------------------------------------------------------------
    // Carregamento
    // ---------------------------------------------------------------

    useEffect(() => {
        if (!expanded) return

        let cancelado = false

        const carregar = async () => {
            setCarregando(true)

            try {
                const dados = await checklistApi.listGroups(taskId)

                if (!cancelado) {
                    setGrupos(dados)
                }
            } catch {
                // silente
            } finally {
                if (!cancelado) {
                    setCarregando(false)
                }
            }
        }

        carregar()

        return () => {
            cancelado = true
        }
    }, [expanded, taskId])

    // ---------------------------------------------------------------
    // Grupos — CRUD
    // ---------------------------------------------------------------

    const adicionarGrupo = async () => {
        const titulo = tituloNovoGrupo.trim()

        if (!titulo || isTaskCompleted) return

        try {
            const grupo = await checklistApi.createGroup(taskId, titulo)
            setGrupos((prev) => [...prev, grupo])
            setTituloNovoGrupo('')
        } catch {
            // silente
        }
    }

    const iniciarEdicaoGrupo = (grupo: ChecklistGroup) => {
        setEdicaoGrupo({ id: grupo.id, titulo: grupo.title })
    }

    const cancelarEdicaoGrupo = () => {
        setEdicaoGrupo(null)
    }

    const salvarEdicaoGrupo = async () => {
        if (!edicaoGrupo || isTaskCompleted) return

        const titulo = edicaoGrupo.titulo.trim()

        if (!titulo || titulo.length < 2) return

        try {
            const atualizado = await checklistApi.updateGroup(taskId, edicaoGrupo.id, titulo)
            setGrupos((prev) =>
                prev.map((g) =>
                    g.id === edicaoGrupo.id
                        ? { ...g, title: atualizado.title }
                        : g
                )
            )
            setEdicaoGrupo(null)
        } catch {
            // silente
        }
    }

    const excluirGrupo = async (grupoId: string) => {
        if (isTaskCompleted) return

        try {
            await checklistApi.deleteGroup(taskId, grupoId)
            setGrupos((prev) => prev.filter((g) => g.id !== grupoId))
        } catch {
            // silente
        }
    }

    // ---------------------------------------------------------------
    // Itens — CRUD
    // ---------------------------------------------------------------

    const getTituloNovoItem = (groupId: string) => titulosNovoItem[groupId] ?? ''

    const setTituloNovoItem = (groupId: string, titulo: string) => {
        setTitulosNovoItem((prev) => ({ ...prev, [groupId]: titulo }))
    }

    const adicionarItem = async (grupoId: string) => {
        const titulo = getTituloNovoItem(grupoId).trim()

        if (!titulo || isTaskCompleted) return

        try {
            const item = await checklistApi.createItem(taskId, grupoId, titulo)

            setGrupos((prev) =>
                prev.map((g) =>
                    g.id === grupoId
                        ? { ...g, items: [...g.items, item] }
                        : g
                )
            )

            setTituloNovoItem(grupoId, '')

            // Manter foco no input do grupo após adicionar
            setTimeout(() => {
                inputItemRefs.current[grupoId]?.focus()
            }, 0)
        } catch {
            // silente
        }
    }

    const alternarItem = async (grupoId: string, itemId: string) => {
        if (isTaskCompleted) return

        const grupo = grupos.find((g) => g.id === grupoId)
        const item = grupo?.items.find((i) => i.id === itemId)

        if (!item) return

        try {
            const atualizado = await checklistApi.updateItem(taskId, itemId, {
                is_completed: !item.isCompleted,
            })

            setGrupos((prev) =>
                prev.map((g) =>
                    g.id === grupoId
                        ? {
                              ...g,
                              items: g.items.map((i) =>
                                  i.id === itemId ? atualizado : i
                              ),
                          }
                        : g
                )
            )
        } catch {
            // silente
        }
    }

    const iniciarEdicaoItem = (item: ChecklistItem) => {
        setEdicaoItem({ id: item.id, titulo: item.title })
    }

    const cancelarEdicaoItem = () => {
        setEdicaoItem(null)
    }

    const salvarEdicaoItem = async (grupoId: string) => {
        if (!edicaoItem || isTaskCompleted) return

        const titulo = edicaoItem.titulo.trim()

        if (!titulo || titulo.length < 2) return

        try {
            const atualizado = await checklistApi.updateItem(taskId, edicaoItem.id, {
                title: titulo,
            })

            setGrupos((prev) =>
                prev.map((g) =>
                    g.id === grupoId
                        ? {
                              ...g,
                              items: g.items.map((i) =>
                                  i.id === edicaoItem.id ? atualizado : i
                              ),
                          }
                        : g
                )
            )

            setEdicaoItem(null)
        } catch {
            // silente
        }
    }

    const excluirItem = async (grupoId: string, itemId: string) => {
        if (isTaskCompleted) return

        try {
            await checklistApi.deleteItem(taskId, itemId)

            setGrupos((prev) =>
                prev.map((g) =>
                    g.id === grupoId
                        ? { ...g, items: g.items.filter((i) => i.id !== itemId) }
                        : g
                )
            )
        } catch {
            // silente
        }
    }

    // ---------------------------------------------------------------
    // Progresso
    // ---------------------------------------------------------------

    const progressoGeral = (() => {
        const total = grupos.reduce((acc, g) => acc + g.items.length, 0)
        const concluidos = grupos.reduce(
            (acc, g) => acc + g.items.filter((i) => i.isCompleted).length,
            0
        )
        return { concluidos, total }
    })()

    return {
        grupos,
        carregando,

        // Novo grupo
        tituloNovoGrupo,
        setTituloNovoGrupo,
        adicionarGrupo,

        // Edição de grupo
        edicaoGrupo,
        setEdicaoGrupo,
        iniciarEdicaoGrupo,
        cancelarEdicaoGrupo,
        salvarEdicaoGrupo,
        excluirGrupo,

        // Novo item
        getTituloNovoItem,
        setTituloNovoItem,
        adicionarItem,
        inputItemRefs,

        // Edição de item
        edicaoItem,
        setEdicaoItem,
        iniciarEdicaoItem,
        cancelarEdicaoItem,
        salvarEdicaoItem,
        excluirItem,

        // Alternância de item
        alternarItem,

        // Progresso geral
        progressoGeral,
    }
}
