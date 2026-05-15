import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
    APP_NAME,
    APP_VERSION,
    LGPD_CONTACT_EMAIL,
} from '../config/app'
import './PublicLayout.css'

const appLogoUrl = `${import.meta.env.BASE_URL}favicon.svg`

interface PublicLayoutProps {
    children: ReactNode
    isDark: boolean
    onToggleTheme: () => void
}

const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'public-header-link active' : 'public-header-link'

export const PublicLayout = ({
    children,
    isDark,
    onToggleTheme,
}: PublicLayoutProps) => {
    return (
        <div className="public-layout">
            <header className="public-header" role="banner">
                <div className="public-header-brand">
                    <img
                        src={appLogoUrl}
                        alt={APP_NAME}
                        className="public-header-logo"
                    />
                    <span className="public-header-appname">{APP_NAME}</span>
                </div>

                <nav
                    className="public-header-nav"
                    aria-label="Navegação principal"
                >
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
                        <span>Criar conta</span>
                    </NavLink>

                    <NavLink to="/ajuda" className={getLinkClass}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09,9a3,3 0 0,1 5.83,1c0,2-3,3-3,3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Ajuda</span>
                    </NavLink>
                </nav>

                <div className="public-header-actions">
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={onToggleTheme}
                        aria-label={
                            isDark ? 'Ativar modo claro' : 'Ativar modo escuro'
                        }
                        title={
                            isDark ? 'Ativar modo claro' : 'Ativar modo escuro'
                        }
                    >
                        {isDark ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="4" />
                                <line x1="12" y1="2" x2="12" y2="4" />
                                <line x1="12" y1="20" x2="12" y2="22" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="2" y1="12" x2="4" y2="12" />
                                <line x1="20" y1="12" x2="22" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <div className="public-main" id="public-content">
                {children}
            </div>

            <footer className="public-footer" role="contentinfo">
                <nav
                    className="public-footer-links"
                    aria-label="Links legais"
                >
                    <NavLink to="/privacidade">Privacidade</NavLink>
                    <span className="public-footer-sep" aria-hidden="true">·</span>
                    <NavLink to="/termos">Termos</NavLink>
                    <span className="public-footer-sep" aria-hidden="true">·</span>
                    <NavLink to="/cookies">Cookies</NavLink>
                    <span className="public-footer-sep" aria-hidden="true">·</span>
                    <NavLink to="/contato-lgpd">Contato LGPD</NavLink>
                    <span className="public-footer-sep" aria-hidden="true">·</span>
                    <a href={`mailto:${LGPD_CONTACT_EMAIL}`}>
                        {LGPD_CONTACT_EMAIL}
                    </a>
                </nav>
                <span aria-label={`Versão ${APP_VERSION}`}>
                    v{APP_VERSION}
                </span>
            </footer>
        </div>
    )
}
