import React, { type KeyboardEvent } from 'react'
import type {
    ChecklistSummary,
    Task,
    TaskPriority,
} from '../../types/task'
import {
    formatarDataVencimento,
    formatarDataHoraVencimento,
    getDiffDias,
    getStatusPrazo,
} from '../../utils/date'
import { TagBadge } from '../TagBadge/TagBadge'

interface TaskItemProps {
    task: Task
    selectable?: boolean
    selected?: boolean
    onOpen: () => void
    onSelectTask?: (taskId: string) => void
}

const priorityLabelMap: Record<TaskPriority, string> = {
    alta: 'Alta',
    media: 'Media',
    baixa: 'Baixa',
}

const isChecklistDone = (summary: ChecklistSummary | null | undefined) =>
    !!summary && summary.total > 0 && summary.concluidos === summary.total

const DueDateBadge = ({
    dueDate,
    dueTime,
}: {
    dueDate: string
    dueTime?: string | null
}) => {
    const status = getStatusPrazo(dueDate)
    if (!status) return null

    let label: string
    if (dueTime) {
        label = formatarDataHoraVencimento(dueDate, dueTime)
    } else if (status === 'vencida') {
        label = 'Vencida'
    } else if (status === 'vence-hoje') {
        label = 'Vence hoje'
    } else if (status === 'vence-em-breve') {
        const diff = getDiffDias(dueDate)
        label = diff === 1 ? 'Vence amanhã' : `Vence em ${diff} dias`
    } else {
        label = formatarDataVencimento(dueDate)
    }

    return (
        <span
            className={`task-duedate-badge task-duedate-badge--${status}`}
            title={`Vencimento: ${dueDate}`}
        >
            {label}
        </span>
    )
}

export const TaskItem = React.memo(({
    task,
    selectable = false,
    selected = false,
    onOpen,
    onSelectTask,
}: TaskItemProps) => {
    const hasAttachments = task.files.length > 0
    const priorityLabel = priorityLabelMap[task.priority]
    const checklistBadge = task.checklistSummary?.total
        ? task.checklistSummary
        : null
    const checklistDone = isChecklistDone(checklistBadge)

    const handleSummaryKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen()
        }
    }

    return (
        <li
            className={`task-item compact ${task.completed ? 'completed' : ''}`}
            data-priority={task.priority}
        >
            <div
                className="task-summary-row"
                role="button"
                tabIndex={0}
                aria-label={`Abrir tarefa ${task.title}`}
                onClick={onOpen}
                onKeyDown={handleSummaryKeyDown}
            >
                <div className="task-summary-main">
                    {selectable && !task.completed && (
                        <label
                            className="export-selection compact-export-selection"
                            onClick={(event) => event.stopPropagation()}
                            title="Selecionar tarefa"
                        >
                            <span>Sel.</span>

                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => onSelectTask?.(task.id)}
                            />
                        </label>
                    )}

                    <div className="task-summary-copy">
                        <strong className="task-summary-title">
                            {task.title}
                        </strong>

                        {task.description ? (
                            <small className="task-summary-description">
                                {task.description}
                            </small>
                        ) : null}

                        {task.dueDate && (
                            <DueDateBadge
                                dueDate={task.dueDate}
                                dueTime={task.dueTime}
                            />
                        )}

                        {task.tags.length > 0 && (
                            <div className="task-summary-tags">
                                {task.tags.map((tag) => (
                                    <TagBadge key={tag.id} tag={tag} />
                                ))}
                            </div>
                        )}
                    </div>

                    {checklistBadge && checklistBadge.total > 0 && (
                        <span
                            className={`task-checklist-badge ${checklistDone ? 'task-checklist-badge--done' : ''}`}
                            title={`Checklist: ${checklistBadge.concluidos} de ${checklistBadge.total} itens concluidos`}
                            aria-label={`Checklist ${checklistBadge.concluidos}/${checklistBadge.total}`}
                        >
                            <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            {checklistBadge.concluidos}/{checklistBadge.total}
                        </span>
                    )}
                </div>

                <div className="task-summary-indicators">
                    <span
                        className={`task-priority-badge task-priority-badge--${task.priority}`}
                        title={`Prioridade ${priorityLabel}`}
                    >
                        {priorityLabel}
                    </span>

                    {hasAttachments && (
                        <span
                            className="task-attachment-indicator"
                            title={`${task.files.length} anexo(s)`}
                            aria-label={`${task.files.length} anexo(s)`}
                        >
                            {task.files.length}
                        </span>
                    )}

                    <span className="task-expand-indicator" aria-hidden="true">
                        Abrir
                    </span>
                </div>
            </div>
        </li>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.task === nextProps.task &&
        prevProps.selected === nextProps.selected
    )
})
