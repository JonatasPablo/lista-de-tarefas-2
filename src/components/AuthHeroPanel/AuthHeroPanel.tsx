import './AuthHeroPanel.css'

interface AuthHeroPanelProps {
    titulo: string
    descricao: string
    itens?: string[]
}

export const AuthHeroPanel = ({
    titulo,
    descricao,
    itens = [],
}: AuthHeroPanelProps) => (
    <aside className="auth-hero" aria-hidden="true">
        <p className="auth-hero-descricao">{descricao}</p>

        {itens.length > 0 && (
            <ul className="auth-hero-lista">
                {itens.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        )}

        <strong className="auth-hero-titulo">{titulo}</strong>
    </aside>
)
