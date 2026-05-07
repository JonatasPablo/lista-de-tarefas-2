import {
    APP_DEVELOPER,
    APP_VERSION,
    DEVELOPER_EMAIL,
} from '../../config/app'

export const Footer = () => {
    return (
        <footer className="app-footer">
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
        </footer>
    )
}