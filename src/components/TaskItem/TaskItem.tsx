import {
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from 'react'
import type { Task, TaskFile, TaskPriority } from '../../types/task'
import { MAX_FILE_SIZE_BYTES, formatFileSize } from '../../utils/file'
import { TaskFiles } from '../TaskFiles/TaskFiles'

interface TaskItemProps {
    task: Task
    expanded: boolean
    selectable?: boolean
    selected?: boolean
    onToggleExpanded: () => void
    onSelectTask?: (taskId: string) => void
    onToggleTask: (taskId: string) => void | Promise<void>
    onDeleteTask: (taskId: string) => void | Promise<void>
    onUpdateTask: (
        taskId: string,
        title: string,
        description: string,
        priority: TaskPriority
    ) => void
    onAddFiles: (taskId: string, files: File[]) => void
    onRenameFile: (
        taskId: string,
        fileId: string,
        displayName: string
    ) => void
    onDeleteFile: (taskId: string, fileId: string) => void
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
}

export const TaskItem = ({
    task,
    expanded,
    onRequestRenameFile,
    selectable = false,
    selected = false,
    onToggleExpanded,
    onSelectTask,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onDeleteFile,
}: TaskItemProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState(task.title)
    const [editedDescription, setEditedDescription] = useState(
        task.description || ''
    )
    const [editedPriority, setEditedPriority] = useState<TaskPriority>(
        task.priority
    )

    const isTaskCompleted = task.completed
    const hasAttachments = task.files.length > 0
    const shouldShowDetails = expanded || isEditing

    const handleSave = () => {
        if (isTaskCompleted) {
            alert('Não é possível editar uma tarefa concluída.')
            return
        }

        if (!editedTitle.trim()) {
            alert('O título da tarefa não pode ficar vazio.')
            return
        }

        onUpdateTask(task.id, editedTitle, editedDescription, editedPriority)
        setIsEditing(false)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSave()
        }
    }

    const handleSummaryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggleExpanded()
        }
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])

        if (isTaskCompleted) {
            alert('Não é possível anexar arquivo em uma tarefa concluída.')
            event.target.value = ''
            return
        }

        if (selectedFiles.length === 0) {
            return
        }

        const validFiles = selectedFiles.filter(
            (file) => file.size <= MAX_FILE_SIZE_BYTES
        )

        const invalidFiles = selectedFiles.filter(
            (file) => file.size > MAX_FILE_SIZE_BYTES
        )

        if (invalidFiles.length > 0) {
            const invalidFilesText = invalidFiles
                .map((file) => `${file.name} (${formatFileSize(file.size)})`)
                .join('\n')

            alert(
                `Os arquivos abaixo ultrapassam o limite de 100 MB e não serão anexados:\n\n${invalidFilesText}`
            )
        }

        if (validFiles.length === 0) {
            event.target.value = ''
            return
        }

        onAddFiles(task.id, validFiles)
        event.target.value = ''
    }

    return (
        <li
            className={`task-item ${task.completed ? 'completed' : ''} ${
                shouldShowDetails ? 'expanded' : 'compact'
            }`}
            data-priority={task.priority}
        >
            {isEditing ? (
                <div className="task-edit">
                    <input
                        type="text"
                        value={editedTitle}
                        disabled={isTaskCompleted}
                        onChange={(event) => setEditedTitle(event.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <textarea
                        value={editedDescription}
                        disabled={isTaskCompleted}
                        onChange={(event) =>
                            setEditedDescription(event.target.value)
                        }
                        rows={3}
                    />

                    <select
                        value={editedPriority}
                        disabled={isTaskCompleted}
                        onChange={(event) =>
                            setEditedPriority(event.target.value as TaskPriority)
                        }
                    >
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                    </select>

                    <button
                        type="button"
                        disabled={isTaskCompleted}
                        onClick={handleSave}
                    >
                        Salvar
                    </button>

                    <button type="button" onClick={() => setIsEditing(false)}>
                        Cancelar
                    </button>
                </div>
            ) : (
                <>
                    <div
                        className="task-summary-row"
                        role="button"
                        tabIndex={0}
                        aria-expanded={expanded}
                        onClick={onToggleExpanded}
                        onKeyDown={handleSummaryKeyDown}
                    >
                        <div className="task-summary-main">
                            {selectable && !task.completed && (
                                <label
                                    className="export-selection compact-export-selection"
                                    onClick={(event) => event.stopPropagation()}
                                    title="Selecionar para exportação"
                                >
                                    <span>Sel.</span>

                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => onSelectTask?.(task.id)}
                                    />
                                </label>
                            )}

                            <strong className="task-summary-title">
                                {task.title}
                            </strong>
                        </div>

                        <div className="task-summary-indicators">
                            {hasAttachments && (
                                <span
                                    className="task-attachment-indicator"
                                    title={`${task.files.length} anexo(s)`}
                                    aria-label={`${task.files.length} anexo(s)`}
                                >
                                    📎
                                </span>
                            )}

                            <span
                                className="task-expand-indicator"
                                aria-hidden="true"
                            >
                                {expanded ? '▲' : '▼'}
                            </span>
                        </div>
                    </div>

                    {shouldShowDetails && (
                        <div className="task-details">
                            <div className="task-header-row">
                                <div className="task-main-info">
                                    <span className="task-text">
                                        {task.description && (
                                            <small>{task.description}</small>
                                        )}

                                        <em>
                                            Criada em: {task.createdAt} |
                                            Prioridade: {task.priority}
                                            {task.updatedAt &&
                                                ` | Editada em: ${task.updatedAt}`}
                                            {task.completedAt &&
                                                ` | Concluída em: ${task.completedAt}`}
                                        </em>
                                    </span>
                                </div>
                            </div>

                            <div className="task-actions">
                                {isTaskCompleted ? (
                                    <button
                                        type="button"
                                        onClick={() => onToggleTask(task.id)}
                                    >
                                        Reabrir tarefa
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onToggleTask(task.id)}
                                        >
                                            Concluir
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Editar
                                        </button>

                                        <label className="file-upload-button">
                                            Anexar arquivo
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                hidden
                                            />
                                        </label>
                                    </>
                                )}

                                <button
                                    type="button"
                                    onClick={() => onDeleteTask(task.id)}
                                >
                                    Excluir
                                </button>
                            </div>

                            {isTaskCompleted && (
                                <p className="task-locked-message">
                                    Tarefa concluída. Edição e novos anexos
                                    estão bloqueados.
                                </p>
                            )}

                            <TaskFiles
                                files={task.files}
                                isTaskCompleted={isTaskCompleted}
                                onRequestRenameFile={(file) =>
                                    onRequestRenameFile(task.id, file)
                                }
                                onDeleteFile={(fileId) =>
                                    onDeleteFile(task.id, fileId)
                                }
                            />
                        </div>
                    )}
                </>
            )}
        </li>
    )
}