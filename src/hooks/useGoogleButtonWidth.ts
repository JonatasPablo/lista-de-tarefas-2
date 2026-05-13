import { useEffect, useRef, useState } from 'react'

const GOOGLE_BUTTON_MIN_WIDTH = 200
const GOOGLE_BUTTON_MAX_WIDTH = 400
const GOOGLE_BUTTON_FALLBACK_WIDTH = 320

const clampGoogleButtonWidth = (width: number) => {
    if (!Number.isFinite(width) || width <= 0) {
        return GOOGLE_BUTTON_FALLBACK_WIDTH
    }

    return Math.max(
        GOOGLE_BUTTON_MIN_WIDTH,
        Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.floor(width))
    )
}

export const useGoogleButtonWidth = () => {
    const buttonContainerRef = useRef<HTMLDivElement | null>(null)
    const [buttonWidth, setButtonWidth] = useState(
        GOOGLE_BUTTON_FALLBACK_WIDTH
    )

    useEffect(() => {
        const element = buttonContainerRef.current

        if (!element) {
            return
        }

        const updateButtonWidth = (width: number) => {
            setButtonWidth((currentWidth) => {
                const nextWidth = clampGoogleButtonWidth(width)

                return currentWidth === nextWidth ? currentWidth : nextWidth
            })
        }

        updateButtonWidth(element.getBoundingClientRect().width)

        const resizeObserver = new ResizeObserver((entries) => {
            const [entry] = entries

            if (entry) {
                updateButtonWidth(entry.contentRect.width)
            }
        })

        resizeObserver.observe(element)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return {
        buttonContainerRef,
        buttonWidth,
    }
}
