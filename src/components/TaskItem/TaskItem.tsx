import { useState } from 'react'
import type { Task, TaskPriority } from '../../types/task'
import { MAX_FILE_SIZE_BYTES, formatFileSize } from '../../utils/file'
import { TaskFiles } from '../TaskFiles/TaskFiles'

interface TaskItemProps {
    task: Task
    selectable?: boolean
    selected?: boolean
    onSelectTask?: (taskId: string) => void
    onToggleTask: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onUpdateTask: (
        taskId: string,
        text: string,
        priority: TaskPriority
    ) => void
    onAddFiles: (taskId: string, files: File[]) => void
    onRenameFile: (
        taskId: string,
        fileId: string,
        displayName: string
    ) => void
    onDeleteFile: (taskId: string, fileId: string) => void
}

export const TaskItem = ({
    task,
    selectable = false,
    selected = false,
    onSelectTask,
    onToggleTask,
    onDeleteTask,
    onUpdateTask,
    onAddFiles,
    onRenameFile,
    onDeleteFile,
}: TaskItemProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(task.text)
    const [editedPriority, setEditedPriority] = useState<TaskPriority>(
        task.priority
    )

    const isTaskCompleted = task.completed

    const handleSave = () => {
        if (isTaskCompleted) {
            alert('Não é possível editar uma tarefa concluída.')
            return
        }

        if (!editedText.trim()) {
            alert('A descrição da tarefa não pode ficar vazia.')
            return
        }

        onUpdateTask(task.id, editedText, editedPriority)
        setIsEditing(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSave()
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                .map(
                    (file) =>
                        `${file.name} (${formatFileSize(file.size)})`
                )
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
            className={`task-item ${task.completed ? 'completed' : ''}`}
            data-priority={task.priority}
        >
            {isEditing ? (
                <div className="task-edit">
                    <input
                        type="text"
                        value={editedText}
                        disabled={isTaskCompleted}
                        onChange={(event) =>
                            setEditedText(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                    <select
                        value={editedPriority}
                        disabled={isTaskCompleted}
                        onChange={(event) =>
                            setEditedPriority(
                                event.target.value as TaskPriority
                            )
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

                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <>
                    <div className="task-header-row">
                        {selectable && !task.completed && (
                            <label className="export-selection">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => onSelectTask?.(task.id)}
                                />
                                Exportar
                            </label>
                        )}

                        <label>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggleTask(task.id)}
                            />

                            <span className="task-text">
                                {task.text} - Criada em: {task.createdAt} -
                                Prioridade:{' '}
                                {task.priority.charAt(0).toUpperCase() +
                                    task.priority.slice(1)}
                                {task.updatedAt &&
                                    ` - Editada em: ${task.updatedAt}`}
                            </span>
                        </label>
                    </div>

                    <div className="task-actions">
                        <button
                            type="button"
                            disabled={isTaskCompleted}
                            onClick={() => setIsEditing(true)}
                        >
                            Editar
                        </button>

                        <label
                            className={`file-upload-button ${
                                isTaskCompleted ? 'disabled' : ''
                            }`}
                        >
                            Anexar arquivo
                            <input
                                type="file"
                                multiple
                                disabled={isTaskCompleted}
                                onChange={handleFileChange}
                                hidden
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() => onDeleteTask(task.id)}
                        >
                            Excluir
                        </button>
                    </div>

                    {isTaskCompleted && (
                        <p className="task-locked-message">
                            Tarefa concluída. Edição e novos anexos estão
                            bloqueados.
                        </p>
                    )}

                    <TaskFiles
                        files={task.files}
                        isTaskCompleted={isTaskCompleted}
                        onRenameFile={(fileId, displayName) =>
                            onRenameFile(task.id, fileId, displayName)
                        }
                        onDeleteFile={(fileId) =>
                            onDeleteFile(task.id, fileId)
                        }
                    />
                </>
            )}
        </li>
    )
}