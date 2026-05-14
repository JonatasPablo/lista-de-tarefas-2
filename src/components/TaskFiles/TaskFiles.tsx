import { useState } from 'react'

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

const isImageFile = (file: TaskFile): boolean =>
    file.mimeType.startsWith('image/')

const getFileIcon = (file: TaskFile): string => {
    if (isImageFile(file)) return '🖼'
    if (file.mimeType.includes('pdf')) return '📄'
    if (
        file.mimeType.includes('zip') ||
        file.mimeType.includes('rar') ||
        file.mimeType.includes('7z')
    )
        return '🗜'
    if (
        file.mimeType.includes('word') ||
        file.mimeType.includes('document')
    )
        return '📝'
    if (
        file.mimeType.includes('sheet') ||
        file.mimeType.includes('excel')
    )
        return '📊'
    return '📎'
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

    const handleDownloadFile = async (file: TaskFile) => {
        try {
            setDownloadingFileId(file.id)
            await taskFilesApi.downloadTaskFile(taskId, file)
        } finally {
            setDownloadingFileId(null)
        }
    }

    const handlePreviewImage = (file: TaskFile) => {
        setPreviewFile(file)
    }

    if (files.length === 0) {
        return <p className="task-files-empty">Nenhum arquivo anexado.</p>
    }

    return (
        <>
            <div className="task-files">
                <div className="task-files-header">
                    <span className="task-files-icon" aria-hidden="true">
                        📎
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
                        const ehImagem = isImageFile(file)
                        const icone = getFileIcon(file)

                        return (
                            <li
                                key={file.id}
                                className={`task-file-item ${ehImagem ? 'task-file-item--image' : ''}`}
                            >
                                <div className="task-file-info">
                                    <span
                                        className="task-file-icon"
                                        aria-hidden="true"
                                    >
                                        {icone}
                                    </span>

                                    <div className="task-file-meta">
                                        <span
                                            className="task-file-name"
                                            title={file.displayName}
                                        >
                                            {file.displayName}
                                        </span>
                                        <small className="task-file-size">
                                            {formatFileSize(file.sizeBytes)}
                                        </small>
                                    </div>
                                </div>

                                <div className="task-file-actions">
                                    {ehImagem ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePreviewImage(file)
                                            }
                                            className="task-file-btn task-file-btn--preview"
                                            aria-label={`Visualizar imagem ${file.displayName}`}
                                            title={`Visualizar ${file.displayName}`}
                                        >
                                            Visualizar
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDownloadFile(file)
                                        }
                                        disabled={isDownloading}
                                        className="task-file-btn"
                                        aria-label={`Baixar arquivo ${file.displayName}`}
                                        title={`Baixar ${file.displayName}`}
                                    >
                                        {isDownloading
                                            ? 'Baixando…'
                                            : 'Baixar'}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isTaskCompleted}
                                        onClick={() =>
                                            onRequestRenameFile(file)
                                        }
                                        className="task-file-btn"
                                        aria-label={`Renomear arquivo ${file.displayName}`}
                                        title={
                                            isTaskCompleted
                                                ? 'Tarefa concluída'
                                                : `Renomear ${file.displayName}`
                                        }
                                    >
                                        Renomear
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isTaskCompleted}
                                        onClick={() =>
                                            onDeleteFile(file.id)
                                        }
                                        className="task-file-btn task-file-btn--danger"
                                        aria-label={`Excluir arquivo ${file.displayName}`}
                                        title={
                                            isTaskCompleted
                                                ? 'Tarefa concluída'
                                                : `Excluir ${file.displayName}`
                                        }
                                    >
                                        Excluir
                                    </button>
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
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </>
    )
}
