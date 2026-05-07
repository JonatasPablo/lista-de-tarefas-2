import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    errorMessage: string
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        errorMessage: '',
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            errorMessage: error.message,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Erro capturado pelo ErrorBoundary:', error)
        console.error('Detalhes do erro:', errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    handleClearLocalData = () => {
        const confirmClear = window.confirm(
            'Deseja limpar os dados locais e recarregar a aplicação?'
        )

        if (!confirmClear) {
            return
        }

        localStorage.removeItem('tasks')
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="error-page">
                    <section className="error-card">
                        <h1>Ops, algo deu errado.</h1>

                        <p>
                            O sistema encontrou um erro inesperado. Você pode
                            tentar recarregar a página.
                        </p>

                        {this.state.errorMessage && (
                            <details>
                                <summary>Ver detalhes técnicos</summary>
                                <code>{this.state.errorMessage}</code>
                            </details>
                        )}

                        <div className="error-actions">
                            <button type="button" onClick={this.handleReload}>
                                Recarregar página
                            </button>

                            <button
                                type="button"
                                onClick={this.handleClearLocalData}
                            >
                                Limpar dados locais
                            </button>
                        </div>
                    </section>
                </main>
            )
        }

        return this.props.children
    }
}