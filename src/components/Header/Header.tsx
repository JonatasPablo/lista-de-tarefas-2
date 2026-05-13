import { NavLink } from 'react-router-dom'
import type { AuthUser } from '../../services/authApi'

interface HeaderProps {
    user: AuthUser | null
    onLogout: () => void
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

export const Header = ({ user, onLogout }: HeaderProps) => {
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
                    <nav className="main-nav">
                        {user ? (
                            <>
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
                            <div className="header-user-avatar">
                                {getInitials(user.name)}
                            </div>

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
