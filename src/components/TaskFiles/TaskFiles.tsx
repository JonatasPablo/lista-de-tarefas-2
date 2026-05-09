import { useState } from 'react'

import type { TaskFile } from '../../types/task'
import { taskFilesApi } from '../../services/taskFilesApi'
import { formatFileSize } from '../../utils/file'

interface TaskFilesProps {
    taskId: string
    files: TaskFile[]
    isTaskCompleted: boolean
    onRequestRenameFile: (file: TaskFile) => void
    onDeleteFile: (fileId: string) => void
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

    const handleDownloadFile = async (file: TaskFile) => {
        try {
            setDownloadingFileId(file.id)

            await taskFilesApi.downloadTaskFile(taskId, file)
        } finally {
            setDownloadingFileId(null)
        }
    }

    if (files.length === 0) {
        return <p className="task-files-empty">Nenhum arquivo anexado.</p>
    }

    return (
        <div className="task-files">
            <strong>
                Arquivos anexados ({files.length}
                {files.length === 1 ? ' arquivo' : ' arquivos'}):
            </strong>

            <ul>
                {files.map((file) => {
                    const isDownloading = downloadingFileId === file.id

                    return (
                        <li key={file.id} className="task-file-item">
                            <div>
                                <span title={file.displayName}>
                                    {file.displayName}
                                </span>

                                <small>{formatFileSize(file.sizeBytes)}</small>
                            </div>

                            <div className="task-file-actions">
                                <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file)}
                                    disabled={isDownloading}
                                    aria-label={`Baixar arquivo ${file.displayName}`}
                                    title={`Baixar ${file.displayName}`}
                                >
                                    {isDownloading ? 'Baixando...' : 'Baixar'}
                                </button>

                                <button
                                    type="button"
                                    disabled={isTaskCompleted}
                                    onClick={() => onRequestRenameFile(file)}
                                    aria-label={`Renomear arquivo ${file.displayName}`}
                                    title={
                                        isTaskCompleted
                                            ? 'Não é possível renomear arquivos de uma tarefa concluída'
                                            : `Renomear ${file.displayName}`
                                    }
                                >
                                    Renomear
                                </button>

                                <button
                                    type="button"
                                    disabled={isTaskCompleted}
                                    onClick={() => onDeleteFile(file.id)}
                                    aria-label={`Excluir arquivo ${file.displayName}`}
                                    title={
                                        isTaskCompleted
                                            ? 'Não é possível excluir arquivos de uma tarefa concluída'
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
    )
}