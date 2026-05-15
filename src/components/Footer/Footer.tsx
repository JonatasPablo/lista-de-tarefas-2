import { Link } from 'react-router-dom'
import {
    APP_DEVELOPER,
    APP_VERSION,
    DEVELOPER_EMAIL,
    LGPD_CONTACT_EMAIL,
} from '../../config/app'

export const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="app-footer-brand">
                <p>
                    Desenvolvido por <strong>{APP_DEVELOPER}</strong>
                </p>

                <p>
                    Email{' '}
                    <a href={`mailto:${DEVELOPER_EMAIL}`}>
                        {DEVELOPER_EMAIL}
                    </a>
                </p>

                <span>Versão {APP_VERSION}</span>
            </div>

            <nav className="app-footer-links" aria-label="Links legais">
                <Link to="/privacidade">Política de Privacidade</Link>
                <Link to="/termos">Termos de Uso</Link>
                <Link to="/cookies">Política de Cookies</Link>
                <Link to="/contato-lgpd">Contato LGPD</Link>
                <a href={`mailto:${LGPD_CONTACT_EMAIL}`}>
                    {LGPD_CONTACT_EMAIL}
                </a>
            </nav>
        </footer>
    )
}
