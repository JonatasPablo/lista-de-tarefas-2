interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    if (!isOpen) {
        return null
    }

    return (
        <div className="modal-overlay">
            <section className="confirm-modal">
                <h2>{title}</h2>

                <p>{message}</p>

                <div className="confirm-modal-actions">
                    <button type="button" onClick={onCancel}>
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="confirm-button"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </section>
        </div>
    )
}