interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = false,
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
                        className={`confirm-button${isDanger ? ' confirm-button-danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </section>
        </div>
    )
}