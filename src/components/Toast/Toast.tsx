import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
    id: string
    type: ToastType
    message: string
}

interface ToastProps {
    messages: ToastMessage[]
    onRemoveToast: (toastId: string) => void
}

export const Toast = ({ messages, onRemoveToast }: ToastProps) => {
    if (messages.length === 0) {
        return null
    }

    return (
        <div className="toast-container">
            {messages.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast-message toast-${toast.type}`}
                >
                    <p>{toast.message}</p>

                    <button
                        type="button"
                        onClick={() => onRemoveToast(toast.id)}
                        aria-label="Fechar mensagem"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}