import {
    useEffect,
    useState,
    type ChangeEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import type {
    ChecklistSummary,
    Task,
    TaskFile,
    TaskPriority,
} from '../../types/task'
import { MAX_FILE_SIZE_BYTES, formatFileSize } from '../../utils/file'
import { TaskChecklist } from '../TaskChecklist/TaskChecklist'
import { TaskFiles } from '../TaskFiles/TaskFiles'
import './TaskDetailModal.css'

interface TaskDetailModalProps {
    task: Task
    onClose: () => void
    onToggleTask: (taskId: string) => void | Promise<void>
    onDeleteTask: (taskId: string) => void | Promise<void>
    onUpdateTask: (
        taskId: string,
        title: string,
        description: string,
        priority: TaskPriority
    ) => void
    onAddFiles: (taskId: string, files: File[]) => void
    onDeleteFile: (taskId: string, fileId: string) => void
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
    onChecklistProgressChange: (
        taskId: string,
        summary: ChecklistSummary | null
    ) => void
}

const priorityLabelMap: Record<TaskPriority, string> = {
    alta: 'Alta',
    media: 'Media',
    baixa: 'Baixa',
}

export const TaskDetailModal = ({
    task,
    onClose,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onDeleteFile,
    onRequestRenameFile,
    onChecklistProgressChange,
}: TaskDetailModalProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedTitle, setEditedTitle] = useState(task.title)
    const [editedDescription, setEditedDescription] = useState(
        task.description || ''
    )
    const [editedPriority, setEditedPriority] =
        useState<TaskPriority>(task.priority)
    const [fileMessage, setFileMessage] = useState<string | null>(null)

    const isTaskCompleted = task.completed
    const priorityLabel = priorityLabelMap[task.priority]

    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape' && !isEditing) onClose()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isEditing, onClose])

    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow
        const originalBodyPaddingRight = document.body.style.paddingRight
        const originalHtmlOverflow = document.documentElement.style.overflow
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth

        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`
        }

        return () => {
            document.body.style.overflow = originalBodyOverflow
            document.body.style.paddingRight = originalBodyPaddingRight
            document.documentElement.style.overflow = originalHtmlOverflow
        }
    }, [])

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !isEditing) onClose()
    }

    const handleStartEdit = () => {
        setFileMessage(null)
        setEditedTitle(task.title)
        setEditedDescription(task.description || '')
        setEditedPriority(task.priority)
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setEditedTitle(task.title)
        setEditedDescription(task.description || '')
        setEditedPriority(task.priority)
        setIsEditing(false)
    }

    const handleSave = () => {
        const normalizedTitle = editedTitle.trim()

        if (!normalizedTitle || isTaskCompleted) {
            return
        }

        onUpdateTask(
            task.id,
            normalizedTitle,
            editedDescription.trim(),
            editedPriority
        )

        setIsEditing(false)
    }

    const handleEditKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') handleSave()
        if (event.key === 'Escape') handleCancelEdit()
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        setFileMessage(null)

        if (isTaskCompleted || selectedFiles.length === 0) {
            event.target.value = ''
            return
        }

        const validFiles = selectedFiles.filter(
            (file) => file.size <= MAX_FILE_SIZE_BYTES
        )
        const invalidCount = selectedFiles.length - validFiles.length

        if (invalidCount > 0) {
            setFileMessage(
                `${invalidCount} arquivo(s) acima de ${formatFileSize(
                    MAX_FILE_SIZE_BYTES
                )} foram ignorados.`
            )
        }

        if (validFiles.length > 0) {
            onAddFiles(task.id, validFiles)
        }

        event.target.value = ''
    }

    const handleDeleteTask = async () => {
        await onDeleteTask(task.id)
        onClose()
    }

    const modal = (
        <div
            className="task-detail-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes da tarefa ${task.title}`}
            onClick={handleOverlayClick}
        >
            <article className="task-detail-modal">
                <header className="task-detail-header">
                    <div className="task-detail-title-area">
                        <span
                            className={`task-priority-badge task-priority-badge--${task.priority}`}
                        >
                            {priorityLabel}
                        </span>

                        {isEditing ? (
                            <div className="task-detail-edit-title">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(event) =>
                                        setEditedTitle(event.target.value)
                                    }
                                    onKeyDown={handleEditKeyDown}
                                    disabled={isTaskCompleted}
                                    aria-label="Titulo da tarefa"
                                    autoFocus
                                />

                                <select
                                    value={editedPriority}
                                    disabled={isTaskCompleted}
                                    onChange={(event) =>
                                        setEditedPriority(
                                            event.target.value as TaskPriority
                                        )
                                    }
                                    aria-label="Prioridade da tarefa"
                                >
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baixa">Baixa</option>
                                </select>
                            </div>
                        ) : (
                            <h2>{task.title}</h2>
                        )}

                        <p className="task-detail-meta">
                            Criada em {task.createdAt}
                            {task.updatedAt ? ` | Editada em ${task.updatedAt}` : ''}
                            {task.completedAt
                                ? ` | Concluida em ${task.completedAt}`
                                : ''}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="task-detail-close"
                        onClick={onClose}
                        aria-label="Fechar detalhes"
                    >
                        X
                    </button>
                </header>

                <div className="task-detail-body">
                    <section className="task-detail-main">
                        <section className="task-detail-section">
                            <div className="task-detail-section-header">
                                <h3>Descricao</h3>
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={editedDescription}
                                    onChange={(event) =>
                                        setEditedDescription(event.target.value)
                                    }
                                    rows={5}
                                    disabled={isTaskCompleted}
                                    placeholder="Detalhes da tarefa..."
                                    aria-label="Descricao da tarefa"
                                />
                            ) : (
                                <p
                                    className={
                                        task.description
                                            ? 'task-detail-description'
                                            : 'task-detail-description task-detail-description--empty'
                                    }
                                >
                                    {task.description || 'Sem descricao.'}
                                </p>
                            )}
                        </section>

                        <section className="task-detail-section">
                            <div className="task-detail-section-header">
                                <h3>Checklist</h3>
                            </div>

                            <TaskChecklist
                                taskId={task.id}
                                isTaskCompleted={isTaskCompleted}
                                expanded
                                onProgressChange={(summary) =>
                                    onChecklistProgressChange(task.id, summary)
                                }
                            />
                        </section>
                    </section>

                    <aside className="task-detail-side">
                        <section className="task-detail-section task-detail-actions-panel">
                            <div className="task-detail-section-header">
                                <h3>Acoes</h3>
                            </div>

                            <div className="task-detail-actions">
                                {isTaskCompleted ? (
                                    <button
                                        type="button"
                                        className="task-action task-action--reopen"
                                        onClick={() => onToggleTask(task.id)}
                                    >
                                        Reabrir
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="task-action task-action--complete"
                                            onClick={() =>
                                                onToggleTask(task.id)
                                            }
                                        >
                                            Concluir
                                        </button>

                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="task-action task-action--complete"
                                                    disabled={
                                                        !editedTitle.trim()
                                                    }
                                                    onClick={handleSave}
                                                >
                                                    Salvar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="task-action task-action--edit"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className="task-action task-action--edit"
                                                onClick={handleStartEdit}
                                            >
                                                Editar
                                            </button>
                                        )}

                                        <label className="file-upload-button task-action task-action--attach">
                                            Anexar
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
                                    className="task-action task-action--delete"
                                    onClick={handleDeleteTask}
                                >
                                    Excluir
                                </button>
                            </div>

                            {isTaskCompleted && (
                                <p className="task-locked-message">
                                    Tarefa concluida. Edicao e novos anexos
                                    estao bloqueados.
                                </p>
                            )}

                            {fileMessage && (
                                <p className="task-detail-file-message">
                                    {fileMessage}
                                </p>
                            )}
                        </section>

                        <section className="task-detail-section">
                            <TaskFiles
                                taskId={task.id}
                                files={task.files}
                                isTaskCompleted={isTaskCompleted}
                                onRequestRenameFile={(file) =>
                                    onRequestRenameFile(task.id, file)
                                }
                                onDeleteFile={(fileId) =>
                                    onDeleteFile(task.id, fileId)
                                }
                            />
                        </section>
                    </aside>
                </div>
            </article>
        </div>
    )

    return createPortal(modal, document.body)
}
