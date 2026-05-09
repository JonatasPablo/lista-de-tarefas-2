import { useEffect, useState } from 'react'

export const ScreenSizeDebug = () => {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio,
    })

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
                dpr: window.devicePixelRatio,
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                top: 8,
                left: 8,
                zIndex: 99999,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                lineHeight: 1.3,
            }}
        >
            {size.width}px x {size.height}px | DPR {size.dpr}
        </div>
    )
}