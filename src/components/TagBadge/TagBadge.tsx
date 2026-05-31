import type { CSSProperties } from 'react'
import type { Tag } from '../../types/task'
import './TagBadge.css'

interface TagBadgeProps {
    tag: Tag
    onRemove?: () => void
}

export const TagBadge = ({ tag, onRemove }: TagBadgeProps) => (
    <span
        className="tag-badge"
        style={
            {
                '--tag-color': tag.cor,
                '--tag-bg': `${tag.cor}18`,
                '--tag-border': `${tag.cor}38`,
            } as CSSProperties
        }
        title={tag.nome}
    >
        <span className="tag-badge-dot" />
        {tag.nome}
        {onRemove && (
            <button
                type="button"
                className="tag-badge-remove"
                onClick={onRemove}
                aria-label={`Remover tag ${tag.nome}`}
            >
                x
            </button>
        )}
    </span>
)
