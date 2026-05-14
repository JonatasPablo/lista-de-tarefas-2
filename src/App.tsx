import { useEffect } from 'react'
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
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useTaskFiles } from './hooks/useTaskFiles'
import { useTheme } from './hooks/useTheme'
import { PwaInstallPrompt } from './components/PwaInstallPrompt/PwaInstallPrompt'
import { ConfirmEmailPage } from './pages/ConfirmEmailPage/ConfirmEmailPage'
import { EsqueciSenhaPage } from './pages/EsqueciSenhaPage/EsqueciSenhaPage'
import { Header } from './components/Header/Header'
import { BottomNav } from './components/BottomNav/BottomNav'
import { CompletedTasksPage } from './pages/CompletedTasksPage/CompletedTasksPage'
import { HelpPage } from './pages/HelpPage/HelpPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { RegisterPage } from './pages/RegisterPage/RegisterPage'
import { TasksPage } from './pages/TasksPage/TasksPage'
import { LogPage } from './pages/LogPage/LogPage'
import { MinhaContaPage } from './pages/MinhaContaPage/MinhaContaPage'
import './styles/global.css'
import './styles/dark-mode.css'

const APP_VERSION_STORAGE_KEY = 'lista_tarefas_app_version'

const clearPwaCacheForNewVersion = async () => {
    if ('caches' in window) {
        const cacheNames = await caches.keys()

        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
    }

    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()

        await Promise.all(
            registrations.map((registration) => registration.update())
        )
    }
}

interface AppContentProps {
    isGoogleLoginConfigured: boolean
}

interface AppProps {
    isGoogleLoginConfigured?: boolean
}

function AppContent({ isGoogleLoginConfigured }: AppContentProps) {
    const navigate = useNavigate()
    const { isDark, toggleTheme } = useTheme()
    const { toasts, showToast, removeToast } = useToast()
    const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm()
    const {
        prompt,
        promptState,
        handlePromptConfirm,
        handlePromptCancel,
    } = usePrompt()

    const {
        user,
        isCheckingAuth,
        isGoogleLoginAvailable,
        handleLogin,
        handleLoginGoogle,
        handleRegister,
        handleConfirmEmail,
        handleResendConfirmation,
        handleCheckEmailConfirmationStatus,
        handleSolicitarRedefinicaoSenha,
        handleValidarCodigoRedefinicaoSenha,
        handleRedefinirSenha,
        handleLogout,
        atualizarUsuarioLogado,
    } = useAuth({
        isGoogleLoginConfigured,
        navigate,
        showToast,
    })

    const {
        tasks,
        setTasks,
        pendingTasks,
        completedTasks,
        selectedTaskIds,
        isLoadingTasks,
        resetTasks,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        bulkCompleteTasks,
        bulkDeleteTasks,
        selectTaskForExport,
        selectAllVisibleTasks,
        clearSelectedTasks,
        exportTasks,
    } = useTasks({
        user,
        showToast,
        confirm,
    })

    const {
        addFilesToTask,
        renameTaskFile,
        deleteTaskFile,
        requestRenameTaskFile,
    } = useTaskFiles({
        tasks,
        setTasks,
        showToast,
        prompt,
    })

    useEffect(() => {
        document.title = `${APP_NAME} v${APP_VERSION}`
    }, [])

    useEffect(() => {
        const storedVersion = localStorage.getItem(APP_VERSION_STORAGE_KEY)

        if (!storedVersion) {
            localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION)
            return
        }

        if (storedVersion === APP_VERSION) {
            return
        }

        const refreshAppVersion = async () => {
            try {
                await clearPwaCacheForNewVersion()
            } catch (error) {
                console.error('Erro ao atualizar cache do PWA:', error)
            } finally {
                localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION)
                window.location.reload()
            }
        }

        refreshAppVersion()
    }, [])

    return (
        <>
            <main className="container">
                <Header
                    user={user}
                    onLogout={async () => {
                        await handleLogout()
                        resetTasks()
                    }}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                />

                {isCheckingAuth ? (
                    <p className="empty-message">Validando sessao...</p>
                ) : (
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                user ? (
                                    <Navigate to="/" replace />
                                ) : (
                                    <LoginPage
                                        onLogin={handleLogin}
                                        onLoginGoogle={
                                            isGoogleLoginAvailable
                                                ? handleLoginGoogle
                                                : undefined
                                        }
                                        isDark={isDark}
                                        onToggleTheme={toggleTheme}
                                    />
                                )
                            }
                        />

                        <Route
                            path="/cadastro"
                            element={
                                user ? (
                                    <Navigate to="/" replace />
                                ) : (
                                    <RegisterPage
                                        onRegister={handleRegister}
                                        onLoginGoogle={
                                            isGoogleLoginAvailable
                                                ? handleLoginGoogle
                                                : undefined
                                        }
                                        isDark={isDark}
                                        onToggleTheme={toggleTheme}
                                    />
                                )
                            }
                        />

                        <Route
                            path="/confirmar-email"
                            element={
                                user ? (
                                    <Navigate to="/" replace />
                                ) : (
                                    <ConfirmEmailPage
                                        onConfirmEmail={handleConfirmEmail}
                                        onResendConfirmation={
                                            handleResendConfirmation
                                        }
                                        onCheckEmailConfirmationStatus={
                                            handleCheckEmailConfirmationStatus
                                        }
                                        isDark={isDark}
                                        onToggleTheme={toggleTheme}
                                    />
                                )
                            }
                        />

                        <Route
                            path="/esqueci-senha"
                            element={
                                user ? (
                                    <Navigate to="/" replace />
                                ) : (
                                    <EsqueciSenhaPage
                                        onSolicitarRedefinicaoSenha={
                                            handleSolicitarRedefinicaoSenha
                                        }
                                        onValidarCodigoRedefinicaoSenha={
                                            handleValidarCodigoRedefinicaoSenha
                                        }
                                        onRedefinirSenha={handleRedefinirSenha}
                                        isDark={isDark}
                                        onToggleTheme={toggleTheme}
                                    />
                                )
                            }
                        />

                        <Route
                            path="/ajuda"
                            element={
                                <HelpPage
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                    isLoggedIn={!!user}
                                />
                            }
                        />

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
                                            onBulkCompleteTasks={
                                                bulkCompleteTasks
                                            }
                                            onBulkDeleteTasks={bulkDeleteTasks}
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

                        <Route
                            path="/minha-conta"
                            element={
                                user ? (
                                    <MinhaContaPage
                                        user={user}
                                        onUsuarioAtualizado={
                                            atualizarUsuarioLogado
                                        }
                                        showToast={showToast}
                                    />
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
                    isDanger={confirmState.isDanger}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />

                <PromptModal
                    key={
                        promptState.isOpen
                            ? promptState.initialValue
                            : 'closed'
                    }
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
            <BottomNav user={user} />
            <PwaInstallPrompt />
        </>
    )
}

function App({ isGoogleLoginConfigured = false }: AppProps) {
    return (
        <HashRouter>
            <AppContent isGoogleLoginConfigured={isGoogleLoginConfigured} />
        </HashRouter>
    )
}

export default App
