import { usePwaInstall } from '../../hooks/usePwaInstall'
import './PwaInstallPrompt.css'

const getDeviceLabel = () => (window.innerWidth >= 1025 ? 'programa' : 'app')

export const PwaInstallPrompt = () => {
    const { canInstall, showIosInstructions, install, dismiss } =
        usePwaInstall()

    if (!canInstall && !showIosInstructions) return null

    const label = getDeviceLabel()

    return (
        <div
            className="pwa-prompt"
            role="complementary"
            aria-label="Instalar aplicativo"
        >
            <div className="pwa-prompt-body">
                <p className="pwa-prompt-question">
                    Deseja instalar o {label} Lista de Tarefas?
                </p>
                {showIosInstructions ? (
                    <p className="pwa-prompt-description">
                        Toque em <strong>Compartilhar</strong> e depois em{' '}
                        <strong>Adicionar à Tela de Início</strong>.
                    </p>
                ) : (
                    <p className="pwa-prompt-description">
                        Acesse mais rápido direto da tela inicial.
                    </p>
                )}
            </div>

            <div className="pwa-prompt-actions">
                {!showIosInstructions && (
                    <button
                        type="button"
                        className="pwa-prompt-btn pwa-prompt-btn-install"
                        onClick={() => void install()}
                    >
                        Instalar
                    </button>
                )}
                <button
                    type="button"
                    className="pwa-prompt-btn pwa-prompt-btn-dismiss"
                    onClick={dismiss}
                >
                    Agora não
                </button>
            </div>
        </div>
    )
}
