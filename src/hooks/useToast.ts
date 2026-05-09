import { useCallback, useState } from 'react'
import type { ToastMessage, ToastType } from '../components/Toast/Toast'

const TOAST_DURATION_IN_MS = 6000

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const removeToast = useCallback((toastId: string) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== toastId)
        )
    }, [])

    const showToast = useCallback(
        (type: ToastType, message: string) => {
            const toastId = crypto.randomUUID()

            const newToast: ToastMessage = {
                id: toastId,
                type,
                message,
            }

            setToasts((currentToasts) => [...currentToasts, newToast])

            window.setTimeout(() => {
                removeToast(toastId)
            }, TOAST_DURATION_IN_MS)
        },
        [removeToast]
    )

    return {
        toasts,
        showToast,
        removeToast,
    }
}