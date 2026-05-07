import { useState } from 'react'

interface PromptModalProps {
    isOpen: boolean
    title: string
    message: string
    initialValue?: string
    confirmText?: string
    cancelText?: string
    onConfirm: (value: string) => void
    onCancel: () => void
}

export const PromptModal = ({
    isOpen,
    title,
    message,
    initialValue = '',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}: PromptModalProps) => {
    const [value, setValue] = useState(initialValue)

    if (!isOpen) {
        return null
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (!value.trim()) {
            return
        }

        onConfirm(value)
    }

    return (
        <div className="modal-overlay">
            <form className="confirm-modal" onSubmit={handleSubmit}>
                <h2>{title}</h2>

                <p>{message}</p>

                <input
                    type="text"
                    value={value}
                    autoFocus
                    onChange={(event) => setValue(event.target.value)}
                />

                <div className="confirm-modal-actions">
                    <button type="button" onClick={onCancel}>
                        {cancelText}
                    </button>

                    <button type="submit" className="confirm-button">
                        {confirmText}
                    </button>
                </div>
            </form>
        </div>
    )
}