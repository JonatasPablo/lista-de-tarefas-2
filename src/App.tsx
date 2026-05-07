import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer/Footer'
import { APP_NAME, APP_VERSION } from './config/app'
import { Toast } from './components/Toast/Toast'
import { useToast } from './hooks/useToast'
import { ConfirmModal } from './components/ConfirmModal/ConfirmModal'
import { useConfirm } from './hooks/useConfirm'
import { PromptModal } from './components/PromptModal/PromptModal'
import { usePrompt } from './hooks/usePrompt'
import {
    buildFileNameWithOriginalExtension,
    getFileNameWithoutExtension,
} from './utils/file'

import { Header } from './components/Header/Header'
import { CompletedTasksPage } from './pages/CompletedTasksPage/CompletedTasksPage'
import { HelpPage } from './pages/HelpPage/HelpPage'
import { TasksPage } from './pages/TasksPage/TasksPage'

import type { Task, TaskFile, TaskPriority } from './types/task'
import { getCurrentDateTime } from './utils/date'
import './styles/global.css'

const LOCAL_STORAGE_KEY = 'tasks'

function App() {
    const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY)

        if (!storedTasks) {
            return []
        }

        const parsedTasks = JSON.parse(storedTasks) as Task[]

        return parsedTasks.map((task) => ({
            ...task,
            title: task.title || task.text || 'Tarefa sem título',
            description: task.description || '',
            priority: task.priority || 'media',
            completed: Boolean(task.completed),
            completedAt: task.completedAt,
            files: task.files || [],
        }))
    } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        return []
    }
})

    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

    const { toasts, showToast, removeToast } = useToast()
    const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm()

    const {
        prompt,
        promptState,
        handlePromptConfirm,
        handlePromptCancel,
    } = usePrompt()

    const pendingTasks = tasks.filter((task) => !task.completed)
    const completedTasks = tasks.filter((task) => task.completed)

    const addTask = (
        title: string,
        description: string,
        priority: TaskPriority
    ) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            description,
            priority,
            completed: false,
            createdAt: getCurrentDateTime(),
            files: [],
        }

        setTasks((currentTasks) => [...currentTasks, newTask])
    }

    const toggleTask = async (taskId: string) => {
        const taskToToggle = tasks.find((task) => task.id === taskId)

        if (!taskToToggle) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        if (!taskToToggle.completed) {
            const confirmComplete = await confirm({
                title: 'Concluir tarefa',
                message:
                    'Deseja concluir esta tarefa? Ela será enviada para o histórico de concluídas e ficará bloqueada para edição.',
                confirmText: 'Concluir',
                cancelText: 'Cancelar',
            })

            if (!confirmComplete) {
                return
            }
        }

        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        completedAt: !task.completed
                            ? getCurrentDateTime()
                            : undefined,
                    }
                    : task
            )
        )

        setSelectedTaskIds((currentSelectedIds) =>
            currentSelectedIds.filter((id) => id !== taskId)
        )

        showToast(
            taskToToggle.completed ? 'info' : 'success',
            taskToToggle.completed
                ? 'Tarefa reaberta com sucesso.'
                : 'Tarefa concluída com sucesso.'
        )
    }

    const updateTask = (
        taskId: string,
        title: string,
        description: string,
        priority: TaskPriority
    ) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task
                }

                if (task.completed) {
                    showToast('warning', 'Não é possível editar uma tarefa concluída.')
                    return task
                }

                return {
                    ...task,
                    title,
                    description,
                    priority,
                    updatedAt: getCurrentDateTime(),
                }
            })
        )
    }

    const deleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find((task) => task.id === taskId)

        if (!taskToDelete) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        const confirmDelete = await confirm({
            title: 'Excluir tarefa',
            message: `Tem certeza que deseja excluir a tarefa "${taskToDelete.title}"? Essa ação não poderá ser desfeita.`,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
        })

        if (!confirmDelete) {
            return
        }

        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        )

        setSelectedTaskIds((currentSelectedIds) =>
            currentSelectedIds.filter((id) => id !== taskId)
        )

        showToast('success', 'Tarefa excluída com sucesso.')
    }

    const addFilesToTask = (taskId: string, files: File[]) => {
        const newFiles: TaskFile[] = files.map((file) => ({
            id: crypto.randomUUID(),
            originalName: file.name,
            displayName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            createdAt: getCurrentDateTime(),
        }))

        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task
                }

                if (task.completed) {
                    showToast('warning', 'Não é possível anexar arquivo em uma tarefa concluída.')
                    return task
                }

                return {
                    ...task,
                    files: [...task.files, ...newFiles],
                }
            })
        )
    }

    const renameTaskFile = (
        taskId: string,
        fileId: string,
        displayName: string
    ) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task
                }

                if (task.completed) {
                    alert(
                        'Não é possível renomear arquivo de uma tarefa concluída.'
                    )
                    return task
                }

                return {
                    ...task,
                    files: task.files.map((file) =>
                        file.id === fileId ? { ...file, displayName } : file
                    ),
                }
            })
        )
    }

    const deleteTaskFile = (taskId: string, fileId: string) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task
                }

                if (task.completed) {
                    showToast('warning', 'Não é possível deletar arquivo de uma tarefa concluída.')
                    return task
                }

                return {
                    ...task,
                    files: task.files.filter((file) => file.id !== fileId),
                }
            })
        )
    }

    const selectTaskForExport = (taskId: string) => {
        setSelectedTaskIds((currentSelectedIds) =>
            currentSelectedIds.includes(taskId)
                ? currentSelectedIds.filter((id) => id !== taskId)
                : [...currentSelectedIds, taskId]
        )
    }

    const selectAllVisibleTasks = (taskIds: string[]) => {
        setSelectedTaskIds(taskIds)
    }

    const clearSelectedTasks = () => {
        setSelectedTaskIds([])
    }

    const exportTasks = async (tasksToExport: Task[]) => {
        if (tasksToExport.length === 0) {
            showToast('warning', 'Não existem tarefas pendentes para exportar.')
            return
        }

        const includeFiles = await confirm({
            title: 'Incluir arquivos',
            message: 'Deseja incluir os arquivos anexados na exportação também?',
            confirmText: 'Incluir',
            cancelText: 'Somente lista',
        })

        if (includeFiles) {
        showToast(
            'info',
            'A exportação dos arquivos será implementada quando o backend estiver pronto. Futuramente, o sistema baixará um arquivo .zip com a lista e os anexos.'
        )
        }

        const taskText = tasksToExport
            .map((task, index) => {
                const filesText =
                    task.files.length > 0
                        ? task.files.map((file) => file.displayName).join(', ')
                        : 'Nenhum arquivo anexado'

                const descriptionText = task.description
                    ? task.description
                    : 'Sem descrição'

                const editedAtText = task.updatedAt
                    ? `- Editada em: ${task.updatedAt}`
                    : '- Editada em: Não editada'

                return [
                    `Tarefa ${index + 1}`,
                    `- Título: ${task.title}`,
                    `- Descrição: ${descriptionText}`,
                    '- Status: Pendente',
                    `- Criada em: ${task.createdAt}`,
                    `- Prioridade: ${task.priority}`,
                    `- Arquivos anexados: ${filesText}`,
                    editedAtText,
                ].join('\n')
            })
            .join('\n\n-----------------------------\n\n')

        const blob = new Blob([taskText], {
            type: 'text/plain;charset=utf-8',
        })

        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'lista_de_tarefas_pendentes.txt'
        link.click()

        URL.revokeObjectURL(url)
        clearSelectedTasks()
    }

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
    }, [tasks])

    useEffect(() => {
    document.title = `${APP_NAME} v${APP_VERSION}`
    }, [])

    const requestRenameTaskFile = async (taskId: string, file: TaskFile) => {
        const currentNameWithoutExtension = getFileNameWithoutExtension(
            file.displayName
        )

        const newName = await prompt({
            title: 'Renomear arquivo',
            message:
                'Digite o novo nome do arquivo. A extensão original será mantida automaticamente.',
            initialValue: currentNameWithoutExtension,
            confirmText: 'Renomear',
            cancelText: 'Cancelar',
        })

        if (!newName?.trim()) {
            return
        }

    const displayNameWithOriginalExtension =
        buildFileNameWithOriginalExtension(newName, file.originalName)

        renameTaskFile(taskId, file.id, displayNameWithOriginalExtension)
    }

    return (
    <HashRouter>
        <main className="container">
            <Header />

            <Routes>
                <Route
                    path="/"
                    element={
                        <TasksPage
                            onRequestRenameFile={requestRenameTaskFile}
                            pendingTasks={pendingTasks}
                            selectedTaskIds={selectedTaskIds}
                            onSelectTask={selectTaskForExport}
                            onSelectAllVisibleTasks={selectAllVisibleTasks}
                            onClearSelectedTasks={clearSelectedTasks}
                            onAddTask={addTask}
                            onToggleTask={toggleTask}
                            onDeleteTask={deleteTask}
                            onUpdateTask={updateTask}
                            onAddFiles={addFilesToTask}
                            onRenameFile={renameTaskFile}
                            onDeleteFile={deleteTaskFile}
                            onExportTasks={exportTasks}
                            onConfirm={confirm}
                        />
                    }
                />

                <Route
                    path="/historico"
                    element={
                        <CompletedTasksPage
                            onRequestRenameFile={requestRenameTaskFile}
                            completedTasks={completedTasks}
                            onToggleTask={toggleTask}
                            onDeleteTask={deleteTask}
                            onUpdateTask={updateTask}
                            onAddFiles={addFilesToTask}
                            onRenameFile={renameTaskFile}
                            onDeleteFile={deleteTaskFile}
                        />
                    }
                />

                <Route path="/ajuda" element={<HelpPage />} />
            </Routes>

            <Footer />

            <Toast messages={toasts} onRemoveToast={removeToast} />

            <ConfirmModal
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />

            <PromptModal
                key={promptState.isOpen ? promptState.initialValue : 'closed'}
                isOpen={promptState.isOpen}
                title={promptState.title}
                message={promptState.message}
                initialValue={promptState.initialValue}
                confirmText={promptState.confirmText}
                cancelText={promptState.cancelText}
                onConfirm={handlePromptConfirm}
                onCancel={handlePromptCancel}
            />
        </main>
    </HashRouter>
)
}

export default App