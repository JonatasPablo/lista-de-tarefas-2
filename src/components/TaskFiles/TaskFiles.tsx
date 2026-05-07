import type { TaskFile } from '../../types/task'
import { formatFileSize } from '../../utils/file'

interface TaskFilesProps {
    files: TaskFile[]
    isTaskCompleted: boolean
    onRequestRenameFile: (file: TaskFile) => void
    onDeleteFile: (fileId: string) => void
}

export const TaskFiles = ({
    files,
    isTaskCompleted,
    onRequestRenameFile,
    onDeleteFile,
}: TaskFilesProps) => {
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
                                disabled={isTaskCompleted}
                                onClick={() => onRequestRenameFile(file)}
                            >
                                Renomear
                            </button>

                            <button
                                type="button"
                                disabled
                                title={
                                    isTaskCompleted
                                        ? 'O download será liberado quando o backend estiver pronto'
                                        : 'O download real será implementado no backend'
                                }
                            >
                                Baixar
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