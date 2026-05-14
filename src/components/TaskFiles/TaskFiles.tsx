import { useEffect, useMemo, useState } from 'react'

import type { TaskFile } from '../../types/task'
import { taskFilesApi } from '../../services/taskFilesApi'
import { formatFileSize } from '../../utils/file'
import { ImagePreviewModal } from '../ImagePreviewModal/ImagePreviewModal'

interface TaskFilesProps {
    taskId: string
    files: TaskFile[]
    isTaskCompleted: boolean
    onRequestRenameFile: (file: TaskFile) => void
    onDeleteFile: (fileId: string) => void
}

interface TaskFileThumbnailProps {
    taskId: string
    file: TaskFile
    onPreview: () => void
}

const isImageFile = (file: TaskFile): boolean =>
    file.mimeType.startsWith('image/')

const getFileTypeLabel = (file: TaskFile): string => {
    if (isImageFile(file)) return 'Imagem'
    if (file.mimeType.includes('pdf')) return 'PDF'
    if (
        file.mimeType.includes('zip') ||
        file.mimeType.includes('rar') ||
        file.mimeType.includes('7z')
    ) {
        return 'Arquivo compactado'
    }
    if (file.mimeType.includes('word') || file.mimeType.includes('document')) {
        return 'Documento'
    }
    if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) {
        return 'Planilha'
    }
    return 'Arquivo'
}

const TaskFileThumbnail = ({
    taskId,
    file,
    onPreview,
}: TaskFileThumbnailProps) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const isImage = isImageFile(file)

    useEffect(() => {
        if (!isImage) return

        let objectUrl: string | null = null
        let cancelled = false

        const loadThumbnail = async () => {
            try {
                objectUrl = await taskFilesApi.getImagePreviewBlob(
                    taskId,
                    file.id
                )

                if (!cancelled) {
                    setThumbnailUrl(objectUrl)
                }
            } catch {
                if (!cancelled) {
                    setThumbnailUrl(null)
                }
            }
        }

        loadThumbnail()

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [file.id, isImage, taskId])

    if (!isImage) {
        return (
            <div className="task-file-thumb task-file-thumb--file">
                <span aria-hidden="true">FILE</span>
            </div>
        )
    }

    return (
        <button
            type="button"
            className="task-file-thumb task-file-thumb--image"
            onClick={onPreview}
            aria-label={`Visualizar imagem ${file.displayName}`}
            title={`Visualizar ${file.displayName}`}
        >
            {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" loading="lazy" />
            ) : (
                <span aria-hidden="true">IMG</span>
            )}
        </button>
    )
}

export const TaskFiles = ({
    taskId,
    files,
    isTaskCompleted,
    onRequestRenameFile,
    onDeleteFile,
}: TaskFilesProps) => {
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
        null
    )
    const [previewFile, setPreviewFile] = useState<TaskFile | null>(null)
    const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null)

    const imageFiles = useMemo(() => files.filter(isImageFile), [files])

    useEffect(() => {
        if (!openMenuFileId) return

        const closeMenu = () => setOpenMenuFileId(null)

        document.addEventListener('click', closeMenu)

        return () => document.removeEventListener('click', closeMenu)
    }, [openMenuFileId])

    const handleDownloadFile = async (file: TaskFile) => {
        try {
            setDownloadingFileId(file.id)
            await taskFilesApi.downloadTaskFile(taskId, file)
        } finally {
            setDownloadingFileId(null)
            setOpenMenuFileId(null)
        }
    }

    const handlePreviewImage = (file: TaskFile) => {
        setPreviewFile(file)
        setOpenMenuFileId(null)
    }

    const handleRenameFile = (file: TaskFile) => {
        onRequestRenameFile(file)
        setOpenMenuFileId(null)
    }

    const handleDeleteFile = (file: TaskFile) => {
        onDeleteFile(file.id)
        setOpenMenuFileId(null)
    }

    if (files.length === 0) {
        return <p className="task-files-empty">Nenhum arquivo anexado.</p>
    }

    return (
        <>
            <div className="task-files">
                <div className="task-files-header">
                    <span className="task-files-icon" aria-hidden="true">
                        ANX
                    </span>
                    <strong>
                        {files.length === 1
                            ? '1 arquivo anexado'
                            : `${files.length} arquivos anexados`}
                    </strong>
                </div>

                <ul>
                    {files.map((file) => {
                        const isDownloading = downloadingFileId === file.id
                        const isImage = isImageFile(file)
                        const isMenuOpen = openMenuFileId === file.id

                        return (
                            <li
                                key={file.id}
                                className={`task-file-item ${isImage ? 'task-file-item--image' : ''}`}
                            >
                                <div className="task-file-info">
                                    <TaskFileThumbnail
                                        taskId={taskId}
                                        file={file}
                                        onPreview={() =>
                                            handlePreviewImage(file)
                                        }
                                    />

                                    <div className="task-file-meta">
                                        <span
                                            className="task-file-name"
                                            title={file.displayName}
                                        >
                                            {file.displayName}
                                        </span>
                                        <small className="task-file-size">
                                            {getFileTypeLabel(file)} |{' '}
                                            {formatFileSize(file.sizeBytes)}
                                        </small>
                                    </div>
                                </div>

                                <div
                                    className="task-file-menu"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        className="task-file-menu-trigger"
                                        aria-label={`Abrir menu do arquivo ${file.displayName}`}
                                        aria-expanded={isMenuOpen}
                                        onClick={() =>
                                            setOpenMenuFileId((current) =>
                                                current === file.id
                                                    ? null
                                                    : file.id
                                            )
                                        }
                                    >
                                        ...
                                    </button>

                                    {isMenuOpen && (
                                        <div
                                            className="task-file-menu-popover"
                                            role="menu"
                                        >
                                            {isImage && (
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() =>
                                                        handlePreviewImage(file)
                                                    }
                                                >
                                                    Visualizar
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                role="menuitem"
                                                disabled={isDownloading}
                                                onClick={() =>
                                                    handleDownloadFile(file)
                                                }
                                            >
                                                {isDownloading
                                                    ? 'Baixando...'
                                                    : 'Baixar'}
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                disabled={isTaskCompleted}
                                                onClick={() =>
                                                    handleRenameFile(file)
                                                }
                                            >
                                                Renomear
                                            </button>

                                            <button
                                                type="button"
                                                role="menuitem"
                                                disabled={isTaskCompleted}
                                                className="task-file-menu-danger"
                                                onClick={() =>
                                                    handleDeleteFile(file)
                                                }
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {previewFile && (
                <ImagePreviewModal
                    taskId={taskId}
                    file={previewFile}
                    files={imageFiles}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </>
    )
}
