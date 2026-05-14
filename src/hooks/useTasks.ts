import { useCallback, useEffect, useState } from 'react'
import type { ToastType } from '../components/Toast/Toast'
import { tasksApi } from '../services/tasksApi'
import type { AuthUser } from '../services/authApi'
import type { Task, TaskPriority } from '../types/task'

type ShowToast = (type: ToastType, message: string) => void
type Confirm = (options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
}) => Promise<boolean>

interface UseTasksOptions {
    user: AuthUser | null
    showToast: ShowToast
    confirm: Confirm
}

export const useTasks = ({ user, showToast, confirm }: UseTasksOptions) => {
    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [isLoadingTasks, setIsLoadingTasks] = useState(false)

    const pendingTasks = tasks.filter((task) => !task.completed)
    const completedTasks = tasks.filter((task) => task.completed)

    const resetTasks = useCallback(() => {
        setTasks([])
        setSelectedTaskIds([])
        setIsLoadingTasks(false)
    }, [])

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
            showToast('error', 'Nao foi possivel criar a tarefa.')
        }
    }

    const toggleTask = async (taskId: string) => {
        const taskToToggle = tasks.find((task) => task.id === taskId)

        if (!taskToToggle) {
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        if (!taskToToggle.completed) {
            const confirmComplete = await confirm({
                title: 'Concluir tarefa',
                message:
                    'Deseja concluir esta tarefa? Ela sera enviada para o historico de concluidas e ficara bloqueada para edicao.',
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
                    : 'Tarefa concluida com sucesso.'
            )
        } catch (error) {
            console.error('Erro ao alterar status da tarefa:', error)
            showToast(
                'error',
                'Nao foi possivel alterar o status da tarefa.'
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
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast('warning', 'Nao e possivel editar uma tarefa concluida.')
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
            showToast('error', 'Nao foi possivel editar a tarefa.')
        }
    }

    const deleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find((task) => task.id === taskId)

        if (!taskToDelete) {
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        const confirmDelete = await confirm({
            title: 'Excluir tarefa',
            message: `Tem certeza que deseja excluir a tarefa "${taskToDelete.title}"? Essa acao nao podera ser desfeita.`,
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

            showToast('success', 'Tarefa excluida com sucesso.')
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error)
            showToast('error', 'Nao foi possivel excluir a tarefa.')
        }
    }

    const bulkCompleteTasks = async (visibleSelectedIds: string[]) => {
        if (visibleSelectedIds.length === 0) return

        const confirmed = await confirm({
            title: 'Concluir tarefas selecionadas?',
            message:
                'Essa ação moverá as tarefas selecionadas para o histórico.',
            confirmText: 'Concluir',
            cancelText: 'Cancelar',
        })

        if (!confirmed) return

        try {
            await tasksApi.bulkComplete(visibleSelectedIds)

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    visibleSelectedIds.includes(task.id)
                        ? {
                              ...task,
                              completed: true,
                              completedAt: new Date().toLocaleString('pt-BR'),
                          }
                        : task
                )
            )

            setSelectedTaskIds([])
            showToast('success', 'Tarefas concluídas com sucesso.')
        } catch (error) {
            console.error('Erro ao concluir tarefas em massa:', error)
            showToast(
                'error',
                'Não foi possível concluir as tarefas selecionadas.'
            )
        }
    }

    const bulkDeleteTasks = async (visibleSelectedIds: string[]) => {
        if (visibleSelectedIds.length === 0) return

        const confirmed = await confirm({
            title: 'Excluir tarefas selecionadas?',
            message:
                'Essa ação excluirá as tarefas selecionadas e não poderá ser desfeita.',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            isDanger: true,
        })

        if (!confirmed) return

        try {
            await tasksApi.bulkDelete(visibleSelectedIds)

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (task) => !visibleSelectedIds.includes(task.id)
                )
            )

            setSelectedTaskIds([])
            showToast('success', 'Tarefas excluídas com sucesso.')
        } catch (error) {
            console.error('Erro ao excluir tarefas em massa:', error)
            showToast(
                'error',
                'Não foi possível excluir as tarefas selecionadas.'
            )
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

    useEffect(() => {
        let isMounted = true

        if (!user) {
            return () => {
                isMounted = false
            }
        }

        const loadUserTasks = async () => {
            setIsLoadingTasks(true)

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
                        'Nao foi possivel carregar as tarefas do backend.'
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

    return {
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
    }
}
