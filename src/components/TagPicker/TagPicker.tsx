import { useEffect, useState } from 'react'
import type { Tag } from '../../types/task'
import { tagsApi } from '../../services/tagsApi'
import { TagBadge } from '../TagBadge/TagBadge'
import './TagPicker.css'

const CORES_PREDEFINIDAS = [
    { hex: '#6366f1', label: 'Indigo' },
    { hex: '#8b5cf6', label: 'Violeta' },
    { hex: '#ec4899', label: 'Rosa' },
    { hex: '#ef4444', label: 'Vermelho' },
    { hex: '#f97316', label: 'Laranja' },
    { hex: '#eab308', label: 'Amarelo' },
    { hex: '#22c55e', label: 'Verde' },
    { hex: '#06b6d4', label: 'Ciano' },
]

interface TagPickerProps {
    taskId: string
    isTaskCompleted: boolean
    initialTaskTags?: Tag[]
    onTagsChange?: (tags: Tag[]) => void
}

export const TagPicker = ({
    taskId,
    isTaskCompleted,
    initialTaskTags = [],
    onTagsChange,
}: TagPickerProps) => {
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [taskTags, setTaskTags] = useState<Tag[]>(initialTaskTags)
    const [novaTagNome, setNovaTagNome] = useState('')
    const [novaTagCor, setNovaTagCor] = useState(CORES_PREDEFINIDAS[0].hex)
    const [editandoTagId, setEditandoTagId] = useState<string | null>(null)
    const [editandoNome, setEditandoNome] = useState('')
    const [editandoCor, setEditandoCor] = useState(CORES_PREDEFINIDAS[0].hex)
    const [criandoTag, setCriandoTag] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const load = async () => {
            try {
                const [all, forTask] = await Promise.all([
                    tagsApi.listTags(),
                    tagsApi.listTagsForTask(taskId),
                ])
                if (mounted) {
                    setAllTags(all)
                    setTaskTags(forTask)
                    onTagsChange?.(forTask)
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

        return () => {
            mounted = false
        }
    }, [onTagsChange, taskId])

    const atualizarTaskTags = (updater: (current: Tag[]) => Tag[]) => {
        setTaskTags((current) => {
            const next = updater(current)
            onTagsChange?.(next)
            return next
        })
    }

    const isVinculada = (tagId: string) =>
        taskTags.some((tag) => tag.id === tagId)

    const handleToggleTag = async (tag: Tag) => {
        if (isTaskCompleted) return

        if (isVinculada(tag.id)) {
            await tagsApi.removeTagFromTask(taskId, tag.id)
            atualizarTaskTags((current) =>
                current.filter((item) => item.id !== tag.id)
            )
        } else {
            await tagsApi.addTagToTask(taskId, tag.id)
            atualizarTaskTags((current) => [...current, tag])
        }
    }

    const handleCriarTag = async () => {
        if (!novaTagNome.trim()) return
        setCriandoTag(true)
        try {
            const novaTag = await tagsApi.createTag({
                nome: novaTagNome.trim(),
                cor: novaTagCor,
            })
            setAllTags((current) => [...current, novaTag])
            await tagsApi.addTagToTask(taskId, novaTag.id)
            atualizarTaskTags((current) => [...current, novaTag])
            setNovaTagNome('')
            setNovaTagCor(CORES_PREDEFINIDAS[0].hex)
        } finally {
            setCriandoTag(false)
        }
    }

    const iniciarEdicaoTag = (tag: Tag) => {
        setEditandoTagId(tag.id)
        setEditandoNome(tag.nome)
        setEditandoCor(tag.cor)
    }

    const cancelarEdicaoTag = () => {
        setEditandoTagId(null)
        setEditandoNome('')
        setEditandoCor(CORES_PREDEFINIDAS[0].hex)
    }

    const salvarEdicaoTag = async (tag: Tag) => {
        if (!editandoNome.trim()) return
        const updated = await tagsApi.updateTag(tag.id, {
            nome: editandoNome.trim(),
            cor: editandoCor,
        })

        setAllTags((current) =>
            current.map((item) => (item.id === tag.id ? updated : item))
        )
        atualizarTaskTags((current) =>
            current.map((item) => (item.id === tag.id ? updated : item))
        )
        cancelarEdicaoTag()
    }

    const excluirTag = async (tag: Tag) => {
        await tagsApi.deleteTag(tag.id)
        setAllTags((current) => current.filter((item) => item.id !== tag.id))
        atualizarTaskTags((current) =>
            current.filter((item) => item.id !== tag.id)
        )
    }

    if (loading) return <p className="tag-picker-loading">Carregando tags...</p>

    return (
        <div className="tag-picker">
            <div className="tag-picker-current">
                {taskTags.length === 0 ? (
                    <span className="tag-picker-empty">
                        Nenhuma tag vinculada
                    </span>
                ) : (
                    taskTags.map((tag) => (
                        <TagBadge
                            key={tag.id}
                            tag={tag}
                            onRemove={
                                isTaskCompleted
                                    ? undefined
                                    : () => handleToggleTag(tag)
                            }
                        />
                    ))
                )}
            </div>

            {!isTaskCompleted && (
                <>
                    <div className="tag-picker-list">
                        {allTags.length === 0 ? (
                            <span className="tag-picker-empty">
                                Crie uma tag abaixo
                            </span>
                        ) : (
                            allTags.map((tag) => (
                                <div key={tag.id} className="tag-picker-item">
                                    <label className="tag-picker-check">
                                        <input
                                            type="checkbox"
                                            checked={isVinculada(tag.id)}
                                            onChange={() => handleToggleTag(tag)}
                                        />
                                        <TagBadge tag={tag} />
                                    </label>

                                    {editandoTagId === tag.id ? (
                                        <div className="tag-picker-edit">
                                            <input
                                                type="text"
                                                value={editandoNome}
                                                onChange={(event) =>
                                                    setEditandoNome(
                                                        event.target.value
                                                    )
                                                }
                                                maxLength={40}
                                                aria-label="Nome da tag"
                                            />
                                            <input
                                                type="color"
                                                value={editandoCor}
                                                onChange={(event) =>
                                                    setEditandoCor(
                                                        event.target.value
                                                    )
                                                }
                                                aria-label="Cor da tag"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    salvarEdicaoTag(tag)
                                                }
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelarEdicaoTag}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="tag-picker-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    iniciarEdicaoTag(tag)
                                                }
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => excluirTag(tag)}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="tag-picker-create">
                        <input
                            type="text"
                            placeholder="Nome da nova tag"
                            value={novaTagNome}
                            onChange={(event) =>
                                setNovaTagNome(event.target.value)
                            }
                            maxLength={40}
                        />
                        <div className="tag-picker-cores">
                            {CORES_PREDEFINIDAS.map((cor) => (
                                <button
                                    key={cor.hex}
                                    type="button"
                                    className={`tag-picker-cor ${
                                        novaTagCor === cor.hex ? 'selected' : ''
                                    }`}
                                    style={{ background: cor.hex }}
                                    title={cor.label}
                                    onClick={() => setNovaTagCor(cor.hex)}
                                    aria-label={cor.label}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            className="tag-picker-criar-btn"
                            onClick={handleCriarTag}
                            disabled={criandoTag || !novaTagNome.trim()}
                        >
                            {criandoTag ? 'Criando...' : '+ Criar tag'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
