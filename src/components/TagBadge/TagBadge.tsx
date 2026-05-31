import type { Tag } from '../../types/task'
import './TagBadge.css'

interface TagBadgeProps {
    tag: Tag
    onRemove?: () => void
}

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
}

const escurecer = (hex: string, fator: number): string => {
    const { r, g, b } = hexToRgb(hex)
    return `rgb(${Math.round(r * fator)}, ${Math.round(g * fator)}, ${Math.round(b * fator)})`
}

export const TagBadge = ({ tag, onRemove }: TagBadgeProps) => {
    const { r, g, b } = hexToRgb(tag.cor)
    const bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`
    const borderColor = `rgba(${r}, ${g}, ${b}, 0.25)`
    const textColor = escurecer(tag.cor, 0.7)

    return (
        <span
            className="tag-badge"
            style={{
                background: bgColor,
                borderColor,
                color: textColor,
            }}
            title={tag.nome}
        >
            {tag.nome}
            {onRemove && (
                <button
                    type="button"
                    className="tag-badge-remove"
                    onClick={onRemove}
                    aria-label={`Remover tag ${tag.nome}`}
                >
                    ×
                </button>
            )}
        </span>
    )
}
