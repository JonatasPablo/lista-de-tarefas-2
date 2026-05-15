import { useEffect } from 'react'
import {
    HashRouter,
    Navigate,
    Route,
    Routes,
    useNavigate,
} from 'react-router-dom'
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
import { CompletedTasksPage } from './pages/CompletedTasksPage/CompletedTasksPage'
import { HelpPage } from './pages/HelpPage/HelpPage'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { RegisterPage } from './pages/RegisterPage/RegisterPage'
import { TasksPage } from './pages/TasksPage/TasksPage'
import { LogPage } from './pages/LogPage/LogPage'
import { MinhaContaPage } from './pages/MinhaContaPage/MinhaContaPage'
import { LegalPage } from './pages/LegalPage/LegalPage'
import { PublicLayout } from './layouts/PublicLayout'
import { PrivateLayout } from './layouts/PrivateLayout'
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

    const handleLogoutAndReset = async () => {
        await handleLogout()
        resetTasks()
    }

    if (isCheckingAuth) {
        return (
            <div className="app-checking-auth">
                <p className="empty-message">Validando sessão...</p>
            </div>
        )
    }

    return (
        <>
            <Routes>
                {/* ===== Rotas públicas ===== */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <PublicLayout
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
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
                            </PublicLayout>
                        )
                    }
                />

                <Route
                    path="/cadastro"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <PublicLayout
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
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
                            </PublicLayout>
                        )
                    }
                />

                <Route
                    path="/confirmar-email"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <PublicLayout
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
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
                            </PublicLayout>
                        )
                    }
                />

                <Route
                    path="/esqueci-senha"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <PublicLayout
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
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
                            </PublicLayout>
                        )
                    }
                />

                <Route
                    path="/ajuda"
                    element={
                        user ? (
                            <PrivateLayout
                                user={user}
                                onLogout={handleLogoutAndReset}
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
                                <HelpPage
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                    isLoggedIn
                                />
                            </PrivateLayout>
                        ) : (
                            <PublicLayout
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
                                <HelpPage
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                    isLoggedIn={false}
                                />
                            </PublicLayout>
                        )
                    }
                />

                <Route
                    path="/privacidade"
                    element={
                        <PublicLayout
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                        >
                            <LegalPage type="privacidade" />
                        </PublicLayout>
                    }
                />

                <Route
                    path="/termos"
                    element={
                        <PublicLayout
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                        >
                            <LegalPage type="termos" />
                        </PublicLayout>
                    }
                />

                <Route
                    path="/cookies"
                    element={
                        <PublicLayout
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                        >
                            <LegalPage type="cookies" />
                        </PublicLayout>
                    }
                />

                <Route
                    path="/contato-lgpd"
                    element={
                        <PublicLayout
                            isDark={isDark}
                            onToggleTheme={toggleTheme}
                        >
                            <LegalPage type="contato-lgpd" />
                        </PublicLayout>
                    }
                />

                {/* ===== Rotas privadas ===== */}
                <Route
                    path="/"
                    element={
                        user ? (
                            isLoadingTasks ? (
                                <div className="app-checking-auth">
                                    <p className="empty-message">
                                        Carregando tarefas...
                                    </p>
                                </div>
                            ) : (
                                <PrivateLayout
                                    user={user}
                                    onLogout={handleLogoutAndReset}
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                >
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
                                        onBulkCompleteTasks={bulkCompleteTasks}
                                        onBulkDeleteTasks={bulkDeleteTasks}
                                    />
                                </PrivateLayout>
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
                                <div className="app-checking-auth">
                                    <p className="empty-message">
                                        Carregando tarefas...
                                    </p>
                                </div>
                            ) : (
                                <PrivateLayout
                                    user={user}
                                    onLogout={handleLogoutAndReset}
                                    isDark={isDark}
                                    onToggleTheme={toggleTheme}
                                >
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
                                </PrivateLayout>
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
                            <PrivateLayout
                                user={user}
                                onLogout={handleLogoutAndReset}
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
                                <LogPage />
                            </PrivateLayout>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route
                    path="/minha-conta"
                    element={
                        user ? (
                            <PrivateLayout
                                user={user}
                                onLogout={handleLogoutAndReset}
                                isDark={isDark}
                                onToggleTheme={toggleTheme}
                            >
                                <MinhaContaPage
                                    user={user}
                                    onUsuarioAtualizado={atualizarUsuarioLogado}
                                    showToast={showToast}
                                />
                            </PrivateLayout>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

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
