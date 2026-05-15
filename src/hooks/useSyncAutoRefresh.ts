import { useEffect, useRef } from 'react'

interface UseSyncAutoRefreshOptions {
    callback: () => void | Promise<void>
    intervaloMs: number
    ativo: boolean
}

const COOLDOWN_FOCO_MS = 2000

export const useSyncAutoRefresh = ({
    callback,
    intervaloMs,
    ativo,
}: UseSyncAutoRefreshOptions): void => {
    const callbackRef = useRef(callback)
    const ultimoEventoFocoRef = useRef(0)

    useEffect(() => {
        callbackRef.current = callback
    })

    useEffect(() => {
        if (!ativo) return

        const executar = () => void callbackRef.current()

        const intervaloId = setInterval(executar, intervaloMs)

        const handleFoco = () => {
            const agora = Date.now()
            if (agora - ultimoEventoFocoRef.current < COOLDOWN_FOCO_MS) return
            ultimoEventoFocoRef.current = agora
            executar()
        }

        const handleVisibilidade = () => {
            if (document.visibilityState !== 'visible') return
            const agora = Date.now()
            if (agora - ultimoEventoFocoRef.current < COOLDOWN_FOCO_MS) return
            ultimoEventoFocoRef.current = agora
            executar()
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
