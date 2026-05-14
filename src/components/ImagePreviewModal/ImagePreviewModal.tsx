import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type MouseEvent,
} from 'react'
import type { TaskFile } from '../../types/task'
import { taskFilesApi } from '../../services/taskFilesApi'
import './ImagePreviewModal.css'

interface ImagePreviewModalProps {
    taskId: string
    file: TaskFile
    files?: TaskFile[]
    onClose: () => void
}

export const ImagePreviewModal = ({
    taskId,
    file,
    files = [file],
    onClose,
}: ImagePreviewModalProps) => {
    const imageFiles = useMemo(
        () => files.filter((currentFile) => currentFile.mimeType.startsWith('image/')),
        [files]
    )
    const initialIndex = Math.max(
        0,
        imageFiles.findIndex((currentFile) => currentFile.id === file.id)
    )
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)

    const currentFile = imageFiles[currentIndex] || file
    const hasNavigation = imageFiles.length > 1
    const isSvg = currentFile.mimeType === 'image/svg+xml'

    const goToPrevious = useCallback(() => {
        if (!hasNavigation) return

        setCurrentIndex((current) =>
            current === 0 ? imageFiles.length - 1 : current - 1
        )
    }, [hasNavigation, imageFiles.length])

    const goToNext = useCallback(() => {
        if (!hasNavigation) return

        setCurrentIndex((current) =>
            current === imageFiles.length - 1 ? 0 : current + 1
        )
    }, [hasNavigation, imageFiles.length])

    useEffect(() => {
        let objectUrl: string | null = null
        let cancelled = false

        const carregarImagem = async () => {
            try {
                setCarregando(true)
                setErro(false)
                setImageUrl(null)
                objectUrl = await taskFilesApi.getImagePreviewBlob(
                    taskId,
                    currentFile.id
                )

                if (!cancelled) {
                    setImageUrl(objectUrl)
                }
            } catch {
                if (!cancelled) setErro(true)
            } finally {
                if (!cancelled) setCarregando(false)
            }
        }

        carregarImagem()

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [currentFile.id, taskId])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
            if (event.key === 'ArrowLeft') goToPrevious()
            if (event.key === 'ArrowRight') goToNext()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [goToNext, goToPrevious, onClose])

    const handleDownload = useCallback(() => {
        taskFilesApi.downloadTaskFile(taskId, currentFile)
    }, [taskId, currentFile])

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
            aria-label={`Visualizar imagem: ${currentFile.displayName}`}
        >
            <div className="img-preview-modal">
                <div className="img-preview-header">
                    <div className="img-preview-title">
                        <span
                            className="img-preview-name"
                            title={currentFile.displayName}
                        >
                            {currentFile.displayName}
                        </span>

                        {hasNavigation && (
                            <span className="img-preview-counter">
                                {currentIndex + 1} de {imageFiles.length}
                            </span>
                        )}
                    </div>

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
                    {hasNavigation && (
                        <button
                            type="button"
                            className="img-preview-nav img-preview-nav--prev"
                            onClick={goToPrevious}
                            aria-label="Imagem anterior"
                        >
                            &lt;
                        </button>
                    )}

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
                            alt={currentFile.displayName}
                            className="img-preview-img"
                        />
                    )}

                    {hasNavigation && (
                        <button
                            type="button"
                            className="img-preview-nav img-preview-nav--next"
                            onClick={goToNext}
                            aria-label="Proxima imagem"
                        >
                            &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
