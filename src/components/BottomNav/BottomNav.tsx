import { NavLink } from 'react-router-dom'
import type { AuthUser } from '../../services/authApi'

interface BottomNavProps {
    user: AuthUser | null
}

export const BottomNav = ({ user }: BottomNavProps) => {
    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? 'bottom-nav-link active' : 'bottom-nav-link'

    return (
        <nav className="bottom-nav" aria-label="Navegação principal">
            {user ? (
                <>
                    <NavLink to="/" end className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="4" />
                            <polyline points="7,12 10,15 17,8" />
                        </svg>
                        <span>Pendentes</span>
                    </NavLink>

                    <NavLink to="/historico" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,7 12,12 16,14" />
                        </svg>
                        <span>Histórico</span>
                    </NavLink>

                    <NavLink to="/log" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="1,12 5,12 7,5 9,19 11,8 13,14 15,12 23,12" />
                        </svg>
                        <span>Log</span>
                    </NavLink>

                    <NavLink to="/ajuda" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09,9a3,3 0 0,1 5.83,1c0,2-3,3-3,3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Ajuda</span>
                    </NavLink>
                </>
            ) : (
                <>
                    <NavLink to="/login" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15,3 H19 A2,2 0 0,1 21,5 V19 A2,2 0 0,1 19,21 H15" />
                            <polyline points="10,17 15,12 10,7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span>Entrar</span>
                    </NavLink>

                    <NavLink to="/cadastro" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M16,21 V19 A4,4 0 0,0 8,19 V21" />
                            <circle cx="12" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        <span>Cadastro</span>
                    </NavLink>

                    <NavLink to="/ajuda" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09,9a3,3 0 0,1 5.83,1c0,2-3,3-3,3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Ajuda</span>
                    </NavLink>
                </>
            )}
        </nav>
    )
}
