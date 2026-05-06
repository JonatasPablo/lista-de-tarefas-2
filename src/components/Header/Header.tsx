import { NavLink } from 'react-router-dom'

export const Header = () => {
    return (
        <header className="header">
            <h1>Lista de Tarefas</h1>

            <nav className="main-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                    }
                >
                    Pendentes
                </NavLink>

                <NavLink
                    to="/historico"
                    className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                    }
                >
                    Histórico
                </NavLink>

                <NavLink
                    to="/ajuda"
                    className={({ isActive }) =>
                        isActive ? 'nav-link active' : 'nav-link'
                    }
                >
                    Ajuda
                </NavLink>
            </nav>
        </header>
    )
}