import { useEffect, useRef, useState } from 'react'

const DISMISSED_KEY = 'lista_tarefas_pwa_dismissed_at'
const INSTALLED_KEY = 'lista_tarefas_pwa_installed'
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const checkIsIos = () => {
    const ua = navigator.userAgent.toLowerCase()

    return (
        /iphone|ipad|ipod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
}

const checkIsStandalone = () => {
    const nav = navigator as Navigator & { standalone?: boolean }

    if (nav.standalone === true) return true

    return window.matchMedia('(display-mode: standalone)').matches
}

const checkWasDismissedRecently = () => {
    const raw = localStorage.getItem(DISMISSED_KEY)

    if (!raw) return false

    return Date.now() - Number(raw) < DISMISS_COOLDOWN_MS
}

const checkWasInstalled = () => Boolean(localStorage.getItem(INSTALLED_KEY))

const shouldShowIos = () =>
    !checkIsStandalone() &&
    !checkWasInstalled() &&
    !checkWasDismissedRecently() &&
    checkIsIos()

const canShowPrompt = () =>
    !checkIsStandalone() &&
    !checkWasInstalled() &&
    !checkWasDismissedRecently() &&
    !checkIsIos()

export const usePwaInstall = () => {
    const [canInstall, setCanInstall] = useState(false)
    const [showIosInstructions, setShowIosInstructions] = useState(shouldShowIos)
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        if (!canShowPrompt()) return

        const onBeforeInstall = (e: Event) => {
            e.preventDefault()
            deferredPrompt.current = e as BeforeInstallPromptEvent
            setCanInstall(true)
        }

        const onAppInstalled = () => {
            deferredPrompt.current = null
            setCanInstall(false)
            localStorage.setItem(INSTALLED_KEY, '1')
        }

        window.addEventListener('beforeinstallprompt', onBeforeInstall)
        window.addEventListener('appinstalled', onAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall)
            window.removeEventListener('appinstalled', onAppInstalled)
        }
    }, [])

    const install = async () => {
        const prompt = deferredPrompt.current

        if (!prompt) return

        deferredPrompt.current = null
        setCanInstall(false)

        await prompt.prompt()

        const { outcome } = await prompt.userChoice

        if (outcome === 'accepted') {
            localStorage.setItem(INSTALLED_KEY, '1')
        }
    }

    const dismiss = () => {
        localStorage.setItem(DISMISSED_KEY, String(Date.now()))
        setCanInstall(false)
        setShowIosInstructions(false)
    }

    return { canInstall, showIosInstructions, install, dismiss }
}
