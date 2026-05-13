import { useState, useEffect } from 'react'

const THEME_KEY = 'lista_tarefas_theme'

export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem(THEME_KEY)
        if (stored) return stored === 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = () => setIsDark(prev => !prev)

    return { isDark, toggleTheme }
}
