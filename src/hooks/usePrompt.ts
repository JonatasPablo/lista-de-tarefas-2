import { useState } from 'react'

interface PromptOptions {
    title: string
    message: string
    initialValue?: string
    confirmText?: string
    cancelText?: string
}

interface PromptState extends PromptOptions {
    isOpen: boolean
    resolve?: (value: string | null) => void
}

export const usePrompt = () => {
    const [promptState, setPromptState] = useState<PromptState>({
        isOpen: false,
        title: '',
        message: '',
        initialValue: '',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
    })

    const prompt = (options: PromptOptions) => {
        return new Promise<string | null>((resolve) => {
            setPromptState({
                isOpen: true,
                ...options,
                resolve,
            })
        })
    }

    const handleConfirm = (value: string) => {
        promptState.resolve?.(value)

        setPromptState((currentState) => ({
            ...currentState,
            isOpen: false,
        }))
    }

    const handleCancel = () => {
        promptState.resolve?.(null)

        setPromptState((currentState) => ({
            ...currentState,
            isOpen: false,
        }))
    }

    return {
        prompt,
        promptState,
        handlePromptConfirm: handleConfirm,
        handlePromptCancel: handleCancel,
    }
}