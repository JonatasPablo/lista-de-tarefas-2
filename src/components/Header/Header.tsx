import { NavLink } from 'react-router-dom'

export const Header = () => {
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        return isActive ? 'nav-link active' : 'nav-link'
    }

    return (
        <header className="header">
            <h1>Lista de Tarefas</h1>

            <nav className="main-nav">
                <NavLink to="/" end className={getNavLinkClass}>
                    Pendentes
                </NavLink>

                <NavLink to="/historico" className={getNavLinkClass}>
                    Histórico
                </NavLink>

                <NavLink to="/ajuda" className={getNavLinkClass}>
                    Ajuda
                </NavLink>
            </nav>
        </header>
    )
}