import { useState } from 'react'

interface ConfirmOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean
    resolve?: (value: boolean) => void
}

export const useConfirm = () => {
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
    })

    const confirm = (options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                isOpen: true,
                ...options,
                resolve,
            })
        })
    }

    const handleConfirm = () => {
        confirmState.resolve?.(true)

        setConfirmState((currentState) => ({
            ...currentState,
            isOpen: false,
        }))
    }

    const handleCancel = () => {
        confirmState.resolve?.(false)

        setConfirmState((currentState) => ({
            ...currentState,
            isOpen: false,
        }))
    }

    return {
        confirm,
        confirmState,
        handleConfirm,
        handleCancel,
    }
}