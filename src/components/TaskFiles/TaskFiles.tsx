import type { TaskFile } from '../../types/task'
import {
    buildFileNameWithOriginalExtension,
    formatFileSize,
    getFileNameWithoutExtension,
} from '../../utils/file'

interface TaskFilesProps {
    files: TaskFile[]
    isTaskCompleted: boolean
    onRenameFile: (fileId: string, displayName: string) => void
    onDeleteFile: (fileId: string) => void
}

export const TaskFiles = ({
    files,
    isTaskCompleted,
    onRenameFile,
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
                                onClick={() => {
                                    const currentNameWithoutExtension = getFileNameWithoutExtension(
                                        file.displayName
                                    )

                                    const newName = window.prompt(
                                    'Digite o novo nome do arquivo:',
                                    currentNameWithoutExtension
                                    )

                                    if (!newName?.trim()) {
                                        return 
                                    }

                                    const displayNameWithOriginalExtension =
                                    buildFileNameWithOriginalExtension(
                                        newName,
                                        file.originalName
                                    )

                                    onRenameFile(file.id, displayNameWithOriginalExtension)
                                }}
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