import type { TaskFile } from '../../types/task'
import { formatFileSize } from '../../utils/file'
import { taskFilesApi } from '../../services/taskFilesApi'

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
    const handleDownloadFile = (fileId: string) => {
        const downloadUrl = taskFilesApi.getDownloadUrl(taskId, fileId)

        window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    }

    if (files.length === 0) {
        return <p className="task-files-empty">Nenhum arquivo anexado.</p>
    }

    return (
        <div className="task-files">
            <strong>Arquivos anexados:</strong>

            <ul>
                {files.map((file) => (
                    <li key={file.id} className="task-file-item">
                        <div>
                            <span>{file.displayName}</span>

                            <small>{formatFileSize(file.sizeBytes)}</small>
                        </div>

                        <div className="task-file-actions">
                            <button
                                type="button"
                                onClick={() => handleDownloadFile(file.id)}
                            >
                                Baixar
                            </button>

                            <button
                                type="button"
                                disabled={isTaskCompleted}
                                onClick={() => onRequestRenameFile(file)}
                            >
                                Renomear
                            </button>

                            <button
                                type="button"
                                disabled={isTaskCompleted}
                                onClick={() => onDeleteFile(file.id)}
                            >
                                Deletar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}