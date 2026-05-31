import {
    useCallback,
    useEffect,
    useRef,
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
import { formatarDataVencimento, getStatusPrazo } from '../../utils/date'
import { TaskChecklist } from '../TaskChecklist/TaskChecklist'
import { TaskFiles } from '../TaskFiles/TaskFiles'
import { TagPicker } from '../TagPicker/TagPicker'
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
        priority: TaskPriority,
        dueDate?: string | null
    ) => void | Promise<void>
    onAddFiles: (taskId: string, files: File[]) => void | Promise<void>
    onDeleteFile: (taskId: string, fileId: string) => void
    onRequestRenameFile: (taskId: string, file: TaskFile) => void
    onChecklistProgressChange: (
        taskId: string,
        summary: ChecklistSummary | null
    ) => void
}

type CampoEdicaoTask = 'titulo' | 'descricao' | null

const priorityLabelMap: Record<TaskPriority, string> = {
    alta: 'Alta',
    media: 'Média',
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
    const [campoEmEdicao, setCampoEmEdicao] =
        useState<CampoEdicaoTask>(null)
    const [editedTitle, setEditedTitle] = useState(task.title)
    const [editedDescription, setEditedDescription] = useState(
        task.description || ''
    )
    const [editedPriority, setEditedPriority] =
        useState<TaskPriority>(task.priority)
    const [editedDueDate, setEditedDueDate] = useState<string>(
        task.dueDate || ''
    )
    const [fileMessage, setFileMessage] = useState<string | null>(null)
    const [isUploadingFiles, setIsUploadingFiles] = useState(false)
    const shouldSkipBlurSaveRef = useRef(false)
    const modalRef = useRef<HTMLDivElement>(null)

    const isTaskCompleted = task.completed
    const priorityLabel = priorityLabelMap[task.priority]

    const handleChecklistProgressChange = useCallback(
        (summary: ChecklistSummary | null) => {
            onChecklistProgressChange(task.id, summary)
        },
        [onChecklistProgressChange, task.id]
    )

    const handleRequestRenameFile = useCallback(
        (file: TaskFile) => {
            onRequestRenameFile(task.id, file)
        },
        [onRequestRenameFile, task.id]
    )

    const handleDeleteFile = useCallback(
        (fileId: string) => {
            onDeleteFile(task.id, fileId)
        },
        [onDeleteFile, task.id]
    )

    useEffect(() => {
        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape' && !campoEmEdicao) onClose()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [campoEmEdicao, onClose])

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

    useEffect(() => {
        const modal = modalRef.current
        if (!modal) return
        const focusaveis = modal.querySelectorAll<HTMLElement>(
            'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        const primeiro = focusaveis[0]
        const ultimo = focusaveis[focusaveis.length - 1]
        primeiro?.focus()
        const handler = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Tab') return
            if (e.shiftKey && document.activeElement === primeiro) {
                e.preventDefault()
                ultimo?.focus()
            } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault()
                primeiro?.focus()
            }
        }
        modal.addEventListener('keydown', handler)
        return () => modal.removeEventListener('keydown', handler)
    }, [])

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !campoEmEdicao) onClose()
    }

    const iniciarEdicaoTitulo = () => {
        if (isTaskCompleted) return

        setFileMessage(null)
        shouldSkipBlurSaveRef.current = false
        setEditedTitle(task.title)
        setCampoEmEdicao('titulo')
    }

    const iniciarEdicaoDescricao = () => {
        if (isTaskCompleted) return

        setFileMessage(null)
        shouldSkipBlurSaveRef.current = false
        setEditedDescription(task.description || '')
        setCampoEmEdicao('descricao')
    }

    const cancelarEdicaoInline = () => {
        shouldSkipBlurSaveRef.current = true
        setEditedTitle(task.title)
        setEditedDescription(task.description || '')
        setEditedPriority(task.priority)
        setCampoEmEdicao(null)
    }

    const salvarTaskAtualizada = async (
        title: string,
        description: string,
        priority: TaskPriority,
        dueDate?: string | null
    ) => {
        const tituloNormalizado = title.trim()
        const descricaoNormalizada = description.trim()

        if (!tituloNormalizado || isTaskCompleted) {
            return
        }

        await Promise.resolve(
            onUpdateTask(
                task.id,
                tituloNormalizado,
                descricaoNormalizada,
                priority,
                dueDate !== undefined ? dueDate : editedDueDate || null
            )
        )
    }

    const salvarTituloInline = async () => {
        if (shouldSkipBlurSaveRef.current) {
            shouldSkipBlurSaveRef.current = false
            return
        }

        const tituloNormalizado = editedTitle.trim()

        if (!tituloNormalizado) {
            setEditedTitle(task.title)
            setCampoEmEdicao(null)
            return
        }

        setEditedTitle(tituloNormalizado)

        await salvarTaskAtualizada(
            tituloNormalizado,
            editedDescription,
            editedPriority
        )

        setCampoEmEdicao(null)
    }

    const salvarDescricaoInline = async () => {
        if (shouldSkipBlurSaveRef.current) {
            shouldSkipBlurSaveRef.current = false
            return
        }

        const descricaoNormalizada = editedDescription.trim()

        setEditedDescription(descricaoNormalizada)

        await salvarTaskAtualizada(
            editedTitle,
            descricaoNormalizada,
            editedPriority
        )

        setCampoEmEdicao(null)
    }

    const handlePriorityChange = async (priority: TaskPriority) => {
        if (isTaskCompleted) return

        setEditedPriority(priority)

        await salvarTaskAtualizada(
            editedTitle || task.title,
            editedDescription,
            priority
        )
    }

    const handleDueDateChange = async (date: string) => {
        if (isTaskCompleted) return
        setEditedDueDate(date)
        await salvarTaskAtualizada(
            editedTitle || task.title,
            editedDescription,
            editedPriority,
            date || null
        )
    }

    const handleTitleKeyDown = (
        event: ReactKeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.blur()
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            cancelarEdicaoInline()
        }
    }

    const handleDescriptionKeyDown = (
        event: ReactKeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault()
            event.currentTarget.blur()
        }

        if (event.key === 'Escape') {
            event.preventDefault()
            cancelarEdicaoInline()
        }
    }

    const handleDeleteTask = async () => {
        await onDeleteTask(task.id)
        onClose()
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        setFileMessage(null)

        if (isTaskCompleted || isUploadingFiles || selectedFiles.length === 0) {
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
            setIsUploadingFiles(true)

            try {
                await onAddFiles(task.id, validFiles)
            } finally {
                setIsUploadingFiles(false)
            }
        }

        event.target.value = ''
    }

    const modal = (
        <div
            className="task-detail-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes da tarefa ${task.title}`}
            onClick={handleOverlayClick}
        >
            <article className="task-detail-modal" ref={modalRef}>
                <header className="task-detail-header">
                    <div className="task-detail-title-area">
                        <div className="task-detail-priority-row">
                            <span
                                className={`task-priority-badge task-priority-badge--${task.priority}`}
                            >
                                {priorityLabel}
                            </span>

                            {!isTaskCompleted && (
                                <select
                                    className="task-detail-priority-select"
                                    value={editedPriority}
                                    onChange={(event) =>
                                        handlePriorityChange(
                                            event.target.value as TaskPriority
                                        )
                                    }
                                    aria-label="Prioridade da tarefa"
                                >
                                    <option value="alta">Alta</option>
                                    <option value="media">Média</option>
                                    <option value="baixa">Baixa</option>
                                </select>
                            )}
                        </div>

                        {campoEmEdicao === 'titulo' ? (
                            <input
                                className="task-detail-title-input"
                                type="text"
                                value={editedTitle}
                                onChange={(event) =>
                                    setEditedTitle(event.target.value)
                                }
                                onKeyDown={handleTitleKeyDown}
                                onBlur={salvarTituloInline}
                                aria-label="Título da tarefa"
                                autoFocus
                            />
                        ) : (
                            <h2
                                className={
                                    isTaskCompleted
                                        ? undefined
                                        : 'task-detail-inline-field'
                                }
                                onClick={iniciarEdicaoTitulo}
                                title={
                                    isTaskCompleted
                                        ? undefined
                                        : 'Clique para editar'
                                }
                            >
                                {editedTitle}
                            </h2>
                        )}

                        <p className="task-detail-meta">
                            Criada em {task.createdAt}
                            {task.updatedAt ? ` | Editada em ${task.updatedAt}` : ''}
                            {task.completedAt
                                ? ` | Concluída em ${task.completedAt}`
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
                                <h3>Descrição</h3>
                            </div>

                            {campoEmEdicao === 'descricao' ? (
                                <textarea
                                    value={editedDescription}
                                    onChange={(event) =>
                                        setEditedDescription(event.target.value)
                                    }
                                    onKeyDown={handleDescriptionKeyDown}
                                    onBlur={salvarDescricaoInline}
                                    rows={5}
                                    placeholder="Detalhes da tarefa..."
                                    aria-label="Descrição da tarefa"
                                    autoFocus
                                />
                            ) : (
                                <p
                                    className={`${
                                        editedDescription
                                            ? 'task-detail-description'
                                            : 'task-detail-description task-detail-description--empty'
                                    } ${
                                        isTaskCompleted
                                            ? ''
                                            : 'task-detail-inline-field'
                                    }`}
                                    onClick={iniciarEdicaoDescricao}
                                    title={
                                        isTaskCompleted
                                            ? undefined
                                            : 'Clique para editar'
                                    }
                                >
                                    {editedDescription || 'Sem descrição.'}
                                </p>
                            )}
                        </section>

                        <section className="task-detail-section">
                            <div className="task-detail-section-header">
                                <h3>Tags</h3>
                            </div>
                            <TagPicker
                                taskId={task.id}
                                isTaskCompleted={isTaskCompleted}
                            />
                        </section>

                        <section className="task-detail-section">
                            <div className="task-detail-section-header">
                                <h3>Checklist</h3>
                            </div>

                            <TaskChecklist
                                taskId={task.id}
                                isTaskCompleted={isTaskCompleted}
                                expanded
                                onProgressChange={handleChecklistProgressChange}
                            />
                        </section>
                    </section>

                    <aside className="task-detail-side">
                        {!isTaskCompleted && (
                            <section className="task-detail-section task-detail-duedate-panel">
                                <div className="task-detail-section-header">
                                    <h3>Vencimento</h3>
                                </div>
                                <div className="task-detail-duedate-field">
                                    <input
                                        type="date"
                                        value={editedDueDate}
                                        onChange={(e) =>
                                            handleDueDateChange(e.target.value)
                                        }
                                        aria-label="Data de vencimento"
                                    />
                                    {editedDueDate && (
                                        <button
                                            type="button"
                                            className="task-detail-duedate-clear"
                                            onClick={() =>
                                                handleDueDateChange('')
                                            }
                                            aria-label="Remover data de vencimento"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {editedDueDate && (() => {
                                    const status = getStatusPrazo(editedDueDate)
                                    const label =
                                        status === 'vencida' ? 'Vencida' :
                                        status === 'vence-hoje' ? 'Vence hoje' :
                                        formatarDataVencimento(editedDueDate)
                                    return (
                                        <span className={`task-duedate-badge task-duedate-badge--${status}`}>
                                            {label}
                                        </span>
                                    )
                                })()}
                            </section>
                        )}

                        {isTaskCompleted && task.dueDate && (
                            <section className="task-detail-section task-detail-duedate-panel">
                                <div className="task-detail-section-header">
                                    <h3>Vencimento</h3>
                                </div>
                                <span className={`task-duedate-badge task-duedate-badge--${getStatusPrazo(task.dueDate)}`}>
                                    {formatarDataVencimento(task.dueDate)}
                                </span>
                            </section>
                        )}

                        <section className="task-detail-section task-detail-actions-panel">
                            <div className="task-detail-section-header">
                                <h3>Ações</h3>
                            </div>

                            <div
                                className={`task-detail-actions ${
                                    isTaskCompleted
                                        ? 'task-detail-actions--locked'
                                        : ''
                                }`}
                            >
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

                                        <label className="file-upload-button task-action task-action--attach">
                                            {isUploadingFiles
                                                ? 'Enviando...'
                                                : 'Anexar'}
                                            <input
                                                type="file"
                                                multiple
                                                disabled={isUploadingFiles}
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
                                    Tarefa concluída. Edição e novos anexos
                                    estão bloqueados.
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
                                onRequestRenameFile={handleRequestRenameFile}
                                onDeleteFile={handleDeleteFile}
                            />
                        </section>
                    </aside>
                </div>
            </article>
        </div>
    )

    return createPortal(modal, document.body)
}
