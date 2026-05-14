import {
    useState,
    useEffect,
    useCallback,
    type MouseEvent,
} from 'react'
import type { TaskFile } from '../../types/task'
import { taskFilesApi } from '../../services/taskFilesApi'
import './ImagePreviewModal.css'

interface ImagePreviewModalProps {
    taskId: string
    file: TaskFile
    onClose: () => void
}

export const ImagePreviewModal = ({
    taskId,
    file,
    onClose,
}: ImagePreviewModalProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)
    const isSvg = file.mimeType === 'image/svg+xml'

    useEffect(() => {
        let objectUrl: string | null = null

        const carregarImagem = async () => {
            try {
                setCarregando(true)
                setErro(false)
                objectUrl = await taskFilesApi.getImagePreviewBlob(
                    taskId,
                    file.id
                )
                setImageUrl(objectUrl)
            } catch {
                setErro(true)
            } finally {
                setCarregando(false)
            }
        }

        carregarImagem()

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [taskId, file.id])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleDownload = useCallback(() => {
        taskFilesApi.downloadTaskFile(taskId, file)
    }, [taskId, file])

    const handleOpenNewTab = useCallback(() => {
        if (!imageUrl || isSvg) return

        window.open(imageUrl, '_blank', 'noopener,noreferrer')
    }, [imageUrl, isSvg])

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) onClose()
    }

    return (
        <div
            className="img-preview-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label={`Visualizar imagem: ${file.displayName}`}
        >
            <div className="img-preview-modal">
                <div className="img-preview-header">
                    <span className="img-preview-name" title={file.displayName}>
                        {file.displayName}
                    </span>

                    <div className="img-preview-actions">
                        <button
                            type="button"
                            onClick={handleOpenNewTab}
                            className="img-preview-btn img-preview-btn--open"
                            title={
                                isSvg
                                    ? 'Preview de SVG fica restrito ao modal'
                                    : 'Abrir imagem em nova aba'
                            }
                            disabled={!imageUrl || carregando || erro || isSvg}
                        >
                            Abrir
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="img-preview-btn img-preview-btn--download"
                            title="Baixar imagem"
                        >
                            Baixar
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="img-preview-btn img-preview-btn--close"
                            title="Fechar (Esc)"
                            aria-label="Fechar visualizador"
                        >
                            X
                        </button>
                    </div>
                </div>

                <div className="img-preview-body">
                    {carregando && (
                        <div className="img-preview-loading">
                            <span
                                className="img-preview-spinner"
                                aria-hidden="true"
                            />
                            Carregando imagem...
                        </div>
                    )}

                    {erro && !carregando && (
                        <div className="img-preview-error">
                            Nao foi possivel carregar a imagem.
                        </div>
                    )}

                    {imageUrl && !carregando && !erro && (
                        <img
                            src={imageUrl}
                            alt={file.displayName}
                            className="img-preview-img"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
