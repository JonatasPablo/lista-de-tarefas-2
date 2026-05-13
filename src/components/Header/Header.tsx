import { NavLink, useNavigate } from 'react-router-dom'
import type { AuthUser } from '../../services/authApi'
import { usuariosApi } from '../../services/usuariosApi'

interface HeaderProps {
    user: AuthUser | null
    onLogout: () => void
    isDark: boolean
    onToggleTheme: () => void
}

const appLogoUrl = `${import.meta.env.BASE_URL}favicon.svg`

const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ').filter(Boolean)

    if (nameParts.length === 0) {
        return 'U'
    }

    if (nameParts.length === 1) {
        return nameParts[0].slice(0, 2).toUpperCase()
    }

    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
}

export const Header = ({ user, onLogout, isDark, onToggleTheme }: HeaderProps) => {
    const navigate = useNavigate()
    const avatarUrl = user ? usuariosApi.getAvatarUrl(user) : null

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        return isActive ? 'nav-link active' : 'nav-link'
    }

    return (
        <header className="header">
                <div className="header-brand">
                    {user ? (
                        <img
                            src={appLogoUrl}
                            alt="Lista de Tarefas"
                            className="header-logo"
                        />
                    ) : (
                        <h1>Lista de Tarefas</h1>
                    )}
                </div>

                <div className="header-content">
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={onToggleTheme}
                        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {isDark ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="4"/>
                                <line x1="12" y1="2" x2="12" y2="4"/>
                                <line x1="12" y1="20" x2="12" y2="22"/>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                <line x1="2" y1="12" x2="4" y2="12"/>
                                <line x1="20" y1="12" x2="22" y2="12"/>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        )}
                    </button>

                    <nav className="main-nav">
                        {user ? (
                            <>
                                <NavLink
                                    to="/minha-conta"
                                    className={getNavLinkClass}
                                >
                                    Minha conta
                                </NavLink>

                                <NavLink to="/" end className={getNavLinkClass}>
                                    Pendentes
                                </NavLink>

                                <NavLink
                                    to="/historico"
                                    className={getNavLinkClass}
                                >
                                    Histórico
                                </NavLink>

                                <NavLink to="/log" className={getNavLinkClass}>
                                    Log
                                </NavLink>

                                <NavLink to="/ajuda" className={getNavLinkClass}>
                                    Ajuda
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={getNavLinkClass}>
                                    Entrar
                                </NavLink>

                                <NavLink
                                    to="/cadastro"
                                    className={getNavLinkClass}
                                >
                                    Criar conta
                                </NavLink>

                                <NavLink to="/ajuda" className={getNavLinkClass}>
                                    Ajuda
                                </NavLink>
                            </>
                        )}
                    </nav>

                    {user && (
                        <div
                            className="header-user"
                            title={`Usuário logado: ${user.name}`}
                        >
                            <button
                                type="button"
                                className="header-user-avatar-button"
                                onClick={() => navigate('/minha-conta')}
                                aria-label="Abrir minha conta"
                                title="Abrir minha conta"
                            >
                                <span className="header-user-avatar">
                                    {getInitials(user.name)}
                                </span>
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="header-user-avatar header-user-avatar-image"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                'none'
                                        }}
                                    />
                                ) : null}
                            </button>

                            <div className="header-user-info">
                                <strong>{user.name}</strong>
                            </div>

                            <button
                                type="button"
                                className="header-logout-button"
                                onClick={onLogout}
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>
    )
}
