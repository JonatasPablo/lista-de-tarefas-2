import { useEffect, useState } from 'react'
import type { Tag } from '../../types/task'
import { tagsApi } from '../../services/tagsApi'
import { TagBadge } from '../TagBadge/TagBadge'
import './TagPicker.css'

const CORES_PREDEFINIDAS = [
    { hex: '#1a6ef5', label: 'Azul' },
    { hex: '#057401', label: 'Verde' },
    { hex: '#c0001e', label: 'Vermelho' },
    { hex: '#8a6c00', label: 'Âmbar' },
    { hex: '#7c3aed', label: 'Roxo' },
    { hex: '#db2777', label: 'Rosa' },
    { hex: '#808080', label: 'Cinza' },
    { hex: '#ea580c', label: 'Laranja' },
]

interface TagPickerProps {
    taskId: string
    isTaskCompleted: boolean
}

export const TagPicker = ({ taskId, isTaskCompleted }: TagPickerProps) => {
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [taskTags, setTaskTags] = useState<Tag[]>([])
    const [novaTagNome, setNovaTagNome] = useState('')
    const [novaTagCor, setNovaTagCor] = useState(CORES_PREDEFINIDAS[0].hex)
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
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => { mounted = false }
    }, [taskId])

    const isVinculada = (tagId: string) =>
        taskTags.some((t) => t.id === tagId)

    const handleToggleTag = async (tag: Tag) => {
        if (isTaskCompleted) return

        if (isVinculada(tag.id)) {
            await tagsApi.removeTagFromTask(taskId, tag.id)
            setTaskTags((prev) => prev.filter((t) => t.id !== tag.id))
        } else {
            await tagsApi.addTagToTask(taskId, tag.id)
            setTaskTags((prev) => [...prev, tag])
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
            setAllTags((prev) => [...prev, novaTag])
            await tagsApi.addTagToTask(taskId, novaTag.id)
            setTaskTags((prev) => [...prev, novaTag])
            setNovaTagNome('')
            setNovaTagCor(CORES_PREDEFINIDAS[0].hex)
        } finally {
            setCriandoTag(false)
        }
    }

    if (loading) return <p className="tag-picker-loading">Carregando tags...</p>

    return (
        <div className="tag-picker">
            <div className="tag-picker-current">
                {taskTags.length === 0 ? (
                    <span className="tag-picker-empty">Nenhuma tag vinculada</span>
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
                                <label key={tag.id} className="tag-picker-item">
                                    <input
                                        type="checkbox"
                                        checked={isVinculada(tag.id)}
                                        onChange={() => handleToggleTag(tag)}
                                    />
                                    <TagBadge tag={tag} />
                                </label>
                            ))
                        )}
                    </div>

                    <div className="tag-picker-create">
                        <input
                            type="text"
                            placeholder="Nome da nova tag"
                            value={novaTagNome}
                            onChange={(e) => setNovaTagNome(e.target.value)}
                            maxLength={40}
                        />
                        <div className="tag-picker-cores">
                            {CORES_PREDEFINIDAS.map((c) => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    className={`tag-picker-cor ${novaTagCor === c.hex ? 'selected' : ''}`}
                                    style={{ background: c.hex }}
                                    title={c.label}
                                    onClick={() => setNovaTagCor(c.hex)}
                                    aria-label={c.label}
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
