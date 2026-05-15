import type { ReactNode } from 'react'
import { Header } from '../components/Header/Header'
import { BottomNav } from '../components/BottomNav/BottomNav'
import type { AuthUser } from '../services/authApi'

interface PrivateLayoutProps {
    children: ReactNode
    user: AuthUser
    onLogout: () => void
    isDark: boolean
    onToggleTheme: () => void
}

export const PrivateLayout = ({
    children,
    user,
    onLogout,
    isDark,
    onToggleTheme,
}: PrivateLayoutProps) => {
    return (
        <>
            <main className="container">
                <Header
                    user={user}
                    onLogout={onLogout}
                    isDark={isDark}
                    onToggleTheme={onToggleTheme}
                />
                {children}
            </main>
            <BottomNav user={user} />
        </>
    )
}
