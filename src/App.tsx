import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

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

    const toggleTask = (taskId: string) => {
        const taskToToggle = tasks.find((task) => task.id === taskId)

        if (!taskToToggle) {
            alert('Tarefa não encontrada.')
            return
        }

        if (!taskToToggle.completed) {
            const confirmComplete = window.confirm(
                'Deseja concluir esta tarefa? Ela será enviada para o histórico de concluídas e ficará bloqueada para edição.'
            )

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
                    alert('Não é possível editar uma tarefa concluída.')
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

    const deleteTask = (taskId: string) => {
        const taskToDelete = tasks.find((task) => task.id === taskId)

        if (!taskToDelete) {
            alert('Tarefa não encontrada.')
            return
        }

        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir a tarefa "${taskToDelete.title}"?`
        )

        if (!confirmDelete) {
            return
        }

        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        )

        setSelectedTaskIds((currentSelectedIds) =>
            currentSelectedIds.filter((id) => id !== taskId)
        )
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
                    alert('Não é possível anexar arquivo em uma tarefa concluída.')
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
                    alert('Não é possível deletar arquivo de uma tarefa concluída.')
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

    const exportTasks = (tasksToExport: Task[]) => {
        if (tasksToExport.length === 0) {
            alert('Não existem tarefas pendentes para exportar.')
            return
        }

        const includeFiles = window.confirm(
            'Deseja incluir os arquivos anexados na exportação também?'
        )

        if (includeFiles) {
            alert(
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

    return (
    <HashRouter>
        <main className="container">
            <Header />

            <Routes>
                <Route
                    path="/"
                    element={
                        <TasksPage
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
                        />
                    }
                />

                <Route
                    path="/historico"
                    element={
                        <CompletedTasksPage
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
    </HashRouter>
)
}

export default App