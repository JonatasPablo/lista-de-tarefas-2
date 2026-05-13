import './ValidacaoSenha.css'

interface ValidacaoSenhaProps {
    senha: string
}

const requisitos = [
    {
        texto: 'Mínimo de 8 caracteres',
        teste: (s: string) => s.length >= 8,
    },
    {
        texto: 'Uma letra maiúscula',
        teste: (s: string) => /[A-ZÀ-Ö]/.test(s),
    },
    {
        texto: 'Uma letra minúscula',
        teste: (s: string) => /[a-zà-öø-ÿ]/.test(s),
    },
    {
        texto: 'Um número',
        teste: (s: string) => /\d/.test(s),
    },
    {
        texto: 'Um caractere especial',
        teste: (s: string) => /[^A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(s),
    },
]

export const ValidacaoSenha = ({ senha }: ValidacaoSenhaProps) => {
    if (!senha) {
        return null
    }

    return (
        <div className="validacao-senha">
            <span className="validacao-senha-titulo">A senha precisa conter:</span>
            <ul className="validacao-senha-lista">
                {requisitos.map((req) => {
                    const cumprido = req.teste(senha)
                    return (
                        <li
                            key={req.texto}
                            className={
                                cumprido
                                    ? 'validacao-senha-item-ok'
                                    : 'validacao-senha-item-erro'
                            }
                        >
                            <svg viewBox="0 0 12 12" aria-hidden="true">
                                {cumprido ? (
                                    <polyline points="1.5,6.5 4.5,9.5 10.5,2.5" />
                                ) : (
                                    <>
                                        <line x1="2" y1="2" x2="10" y2="10" />
                                        <line x1="10" y1="2" x2="2" y2="10" />
                                    </>
                                )}
                            </svg>
                            {req.texto}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
