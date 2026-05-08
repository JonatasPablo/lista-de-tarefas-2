import { useEffect, useState } from 'react'
import {
    HashRouter,
    Navigate,
    Route,
    Routes,
    useNavigate,
} from 'react-router-dom'
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
import { LoginPage } from './pages/LoginPage/LoginPage'
import { RegisterPage } from './pages/RegisterPage/RegisterPage'
import { TasksPage } from './pages/TasksPage/TasksPage'
import { LogPage } from './pages/LogPage/LogPage'

import type { Task, TaskFile, TaskPriority } from './types/task'
import { tasksApi } from './services/tasksApi'
import { taskFilesApi } from './services/taskFilesApi'
import { authApi, type AuthUser } from './services/authApi'
import './styles/global.css'

function AppContent() {
    const navigate = useNavigate()

    const [user, setUser] = useState<AuthUser | null>(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [isLoadingTasks, setIsLoadingTasks] = useState(false)

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

    const handleLogin = async (email: string, password: string) => {
        try {
            const response = await authApi.login({
                email,
                password,
            })

            setIsLoadingTasks(true)
            setUser(response.user)

            showToast('success', 'Login realizado com sucesso.')
            navigate('/')
        } catch (error) {
            console.error('Erro ao fazer login:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível fazer login.'

            showToast('error', message)
        }
    }

    const handleRegister = async (
        name: string,
        email: string,
        password: string
    ) => {
        try {
            const response = await authApi.register({
                name,
                email,
                password,
            })

            setIsLoadingTasks(true)
            setUser(response.user)

            showToast('success', 'Cadastro criado com sucesso.')
            navigate('/')
        } catch (error) {
            console.error('Erro ao criar cadastro:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível criar o cadastro.'

            showToast('error', message)
        }
    }

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Erro ao encerrar sessão:', error)
        } finally {
            setUser(null)
            setTasks([])
            setSelectedTaskIds([])
            setIsLoadingTasks(false)
            showToast('info', 'Você saiu do sistema.')
            navigate('/login')
        }
    }

    const addTask = async (
        title: string,
        description: string,
        priority: TaskPriority
    ) => {
        try {
            const newTask = await tasksApi.createTask({
                title,
                description,
                priority,
            })

            setTasks((currentTasks) => [newTask, ...currentTasks])

            showToast('success', 'Tarefa criada com sucesso.')
        } catch (error) {
            console.error('Erro ao criar tarefa:', error)
            showToast('error', 'Não foi possível criar a tarefa.')
        }
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

        try {
            const updatedTask = await tasksApi.toggleTask(taskId)

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? {
                                ...updatedTask,
                                files: task.files,
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
        } catch (error) {
            console.error('Erro ao alterar status da tarefa:', error)
            showToast(
                'error',
                'Não foi possível alterar o status da tarefa.'
            )
        }
    }

    const updateTask = async (
        taskId: string,
        title: string,
        description: string,
        priority: TaskPriority
    ) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Não é possível editar uma tarefa concluída.'
            )
            return
        }

        try {
            const updatedTask = await tasksApi.updateTask(taskId, {
                title,
                description,
                priority,
            })

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId
                        ? {
                                ...updatedTask,
                                files: task.files,
                            }
                        : task
                )
            )

            showToast('success', 'Tarefa editada com sucesso.')
        } catch (error) {
            console.error('Erro ao editar tarefa:', error)
            showToast('error', 'Não foi possível editar a tarefa.')
        }
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

        try {
            await tasksApi.deleteTask(taskId)

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== taskId)
            )

            setSelectedTaskIds((currentSelectedIds) =>
                currentSelectedIds.filter((id) => id !== taskId)
            )

            showToast('success', 'Tarefa excluída com sucesso.')
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error)
            showToast('error', 'Não foi possível excluir a tarefa.')
        }
    }

    const addFilesToTask = async (taskId: string, files: File[]) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Não é possível anexar arquivo em uma tarefa concluída.'
            )
            return
        }

        try {
            const uploadedFiles = await Promise.all(
                files.map((file) => taskFilesApi.uploadTaskFile(taskId, file))
            )

            setTasks((currentTasks) =>
                currentTasks.map((task) => {
                    if (task.id !== taskId) {
                        return task
                    }

                    return {
                        ...task,
                        files: [...task.files, ...uploadedFiles],
                    }
                })
            )

            showToast(
                'success',
                uploadedFiles.length === 1
                    ? 'Arquivo anexado com sucesso.'
                    : 'Arquivos anexados com sucesso.'
            )
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível anexar o arquivo.'

            showToast('error', message)
        }
    }

    const renameTaskFile = async (
        taskId: string,
        fileId: string,
        displayName: string
    ) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Não é possível renomear arquivo de uma tarefa concluída.'
            )
            return
        }

        try {
            const renamedFile = await taskFilesApi.renameTaskFile(
                taskId,
                fileId,
                displayName
            )

            setTasks((currentTasks) =>
                currentTasks.map((task) => {
                    if (task.id !== taskId) {
                        return task
                    }

                    return {
                        ...task,
                        files: task.files.map((file) =>
                            file.id === fileId ? renamedFile : file
                        ),
                    }
                })
            )

            showToast('success', 'Arquivo renomeado com sucesso.')
        } catch (error) {
            console.error('Erro ao renomear arquivo:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível renomear o arquivo.'

            showToast('error', message)
        }
    }

    const deleteTaskFile = async (taskId: string, fileId: string) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa não encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Não é possível deletar arquivo de uma tarefa concluída.'
            )
            return
        }

        try {
            await taskFilesApi.deleteTaskFile(taskId, fileId)

            setTasks((currentTasks) =>
                currentTasks.map((task) => {
                    if (task.id !== taskId) {
                        return task
                    }

                    return {
                        ...task,
                        files: task.files.filter((file) => file.id !== fileId),
                    }
                })
            )

            showToast('success', 'Arquivo excluído com sucesso.')
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Não foi possível excluir o arquivo.'

            showToast('error', message)
        }
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
                'A exportação dos arquivos em .zip será implementada em uma próxima etapa.'
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

    useEffect(() => {
        document.title = `${APP_NAME} v${APP_VERSION}`
    }, [])

    useEffect(() => {
        let isMounted = true

        const checkAuth = async () => {
            try {
                const authenticatedUser = await authApi.me()

                if (isMounted) {
                setIsLoadingTasks(true)
                setUser(authenticatedUser)
                }
            } catch {
                if (isMounted) {
                    setUser(null)
                    setTasks([])
                    setSelectedTaskIds([])
                }
            } finally {
                if (isMounted) {
                    setIsCheckingAuth(false)
                }
            }
        }

        checkAuth()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        if (!user) {
            return () => {
                isMounted = false
            }
        }

        const loadUserTasks = async () => {
            try {
                const apiTasks = await tasksApi.listTasks()

                if (isMounted) {
                    setTasks(apiTasks)
                }
            } catch (error) {
                console.error('Erro ao carregar tarefas:', error)

                if (isMounted) {
                    showToast(
                        'error',
                        'Não foi possível carregar as tarefas do backend.'
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingTasks(false)
                }
            }
        }

        loadUserTasks()

        return () => {
            isMounted = false
        }
    }, [showToast, user])

    return (
        <main className="container">
            <Header user={user} onLogout={handleLogout} />

            {isCheckingAuth ? (
                <p className="empty-message">Validando sessão...</p>
            ) : (
                <Routes>
                    <Route
                        path="/login"
                        element={
                            user ? (
                                <Navigate to="/" replace />
                            ) : (
                                <LoginPage onLogin={handleLogin} />
                            )
                        }
                    />

                    <Route
                        path="/cadastro"
                        element={
                            user ? (
                                <Navigate to="/" replace />
                            ) : (
                                <RegisterPage onRegister={handleRegister} />
                            )
                        }
                    />

                    <Route path="/ajuda" element={<HelpPage />} />

                    <Route
                        path="/"
                        element={
                            user ? (
                                isLoadingTasks ? (
                                    <p className="empty-message">
                                        Carregando tarefas...
                                    </p>
                                ) : (
                                    <TasksPage
                                        onRequestRenameFile={
                                            requestRenameTaskFile
                                        }
                                        pendingTasks={pendingTasks}
                                        selectedTaskIds={selectedTaskIds}
                                        onSelectTask={selectTaskForExport}
                                        onSelectAllVisibleTasks={
                                            selectAllVisibleTasks
                                        }
                                        onClearSelectedTasks={
                                            clearSelectedTasks
                                        }
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
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/historico"
                        element={
                            user ? (
                                isLoadingTasks ? (
                                    <p className="empty-message">
                                        Carregando tarefas...
                                    </p>
                                ) : (
                                    <CompletedTasksPage
                                        onRequestRenameFile={
                                            requestRenameTaskFile
                                        }
                                        completedTasks={completedTasks}
                                        onToggleTask={toggleTask}
                                        onDeleteTask={deleteTask}
                                        onUpdateTask={updateTask}
                                        onAddFiles={addFilesToTask}
                                        onRenameFile={renameTaskFile}
                                        onDeleteFile={deleteTaskFile}
                                    />
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route
                        path="/log"
                        element={
                            user ? (
                                <LogPage />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            )}

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
    )
}

function App() {
    return (
        <HashRouter>
            <AppContent />
        </HashRouter>
    )
}

export default App