import { useEffect, useRef } from 'react'

type GoogleCredentialResponse = {
    credential?: string
}

type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin'

type GoogleSignInButtonProps = {
    clientId: string
    width: number
    text?: GoogleButtonText
    disabled?: boolean
    onSuccess: (credential: string) => void | Promise<void>
    onError?: () => void
}

type GoogleAccounts = {
    id: {
        initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
        }) => void
        renderButton: (
            parent: HTMLElement,
            options: {
                text: GoogleButtonText
                shape: 'pill'
                size: 'large'
                width: string
            }
        ) => void
    }
}

declare global {
    interface Window {
        google?: {
            accounts?: GoogleAccounts
        }
    }
}

let googleScriptPromise: Promise<void> | null = null
let initializedClientId: string | null = null
let activeSuccessHandler:
    | ((response: GoogleCredentialResponse) => void | Promise<void>)
    | null = null
let activeErrorHandler: (() => void) | null = null

const loadGoogleScript = () => {
    if (window.google?.accounts?.id) {
        return Promise.resolve()
    }

    if (googleScriptPromise) {
        return googleScriptPromise
    }

    googleScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
            'script[src="https://accounts.google.com/gsi/client"]'
        )

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), {
                once: true,
            })
            existingScript.addEventListener('error', () => reject(), {
                once: true,
            })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject()

        document.head.appendChild(script)
    })

    return googleScriptPromise
}

const initializeGoogleIdentityOnce = (clientId: string) => {
    if (initializedClientId === clientId) {
        return
    }

    window.google?.accounts?.id.initialize({
        client_id: clientId,
        callback: (response) => {
            if (!response.credential) {
                activeErrorHandler?.()
                return
            }

            void activeSuccessHandler?.(response)
        },
    })

    initializedClientId = clientId
}

export const GoogleSignInButton = ({
    clientId,
    width,
    text = 'signin',
    disabled = false,
    onSuccess,
    onError,
}: GoogleSignInButtonProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        activeSuccessHandler = async (response) => {
            if (!response.credential) return
            await onSuccess(response.credential)
        }
        activeErrorHandler = onError || null

        return () => {
            if (activeSuccessHandler) {
                activeSuccessHandler = null
            }
            if (activeErrorHandler) {
                activeErrorHandler = null
            }
        }
    }, [onError, onSuccess])

    useEffect(() => {
        let cancelled = false

        const renderGoogleButton = async () => {
            if (!clientId || disabled) return

            try {
                await loadGoogleScript()
                if (cancelled || !containerRef.current) return

                initializeGoogleIdentityOnce(clientId)
                containerRef.current.replaceChildren()
                window.google?.accounts?.id.renderButton(
                    containerRef.current,
                    {
                        text,
                        shape: 'pill',
                        size: 'large',
                        width: String(width),
                    }
                )
            } catch {
                if (!cancelled) {
                    activeErrorHandler?.()
                }
            }
        }

        renderGoogleButton()

        return () => {
            cancelled = true
        }
    }, [clientId, disabled, text, width])

    return <div ref={containerRef} />
}
