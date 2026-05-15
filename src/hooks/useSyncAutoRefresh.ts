import { useEffect, useRef } from 'react'

interface UseSyncAutoRefreshOptions {
    callback: () => void | Promise<void>
    intervaloMs: number
    ativo: boolean
}

export const useSyncAutoRefresh = ({
    callback,
    intervaloMs,
    ativo,
}: UseSyncAutoRefreshOptions): void => {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    })

    useEffect(() => {
        if (!ativo) return

        const executar = () => void callbackRef.current()

        const intervaloId = setInterval(executar, intervaloMs)

        const handleFoco = () => executar()
        const handleVisibilidade = () => {
            if (document.visibilityState === 'visible') executar()
        }

        window.addEventListener('focus', handleFoco)
        document.addEventListener('visibilitychange', handleVisibilidade)

        return () => {
            clearInterval(intervaloId)
            window.removeEventListener('focus', handleFoco)
            document.removeEventListener('visibilitychange', handleVisibilidade)
        }
    }, [ativo, intervaloMs])
}
