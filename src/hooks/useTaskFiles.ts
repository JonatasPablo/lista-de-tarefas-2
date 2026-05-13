import type { Dispatch, SetStateAction } from 'react'
import type { ToastType } from '../components/Toast/Toast'
import { taskFilesApi } from '../services/taskFilesApi'
import type { Task, TaskFile } from '../types/task'
import {
    buildFileNameWithOriginalExtension,
    getFileNameWithoutExtension,
} from '../utils/file'

type ShowToast = (type: ToastType, message: string) => void
type Prompt = (options: {
    title: string
    message: string
    initialValue?: string
    confirmText?: string
    cancelText?: string
}) => Promise<string | null>

interface UseTaskFilesOptions {
    tasks: Task[]
    setTasks: Dispatch<SetStateAction<Task[]>>
    showToast: ShowToast
    prompt: Prompt
}

export const useTaskFiles = ({
    tasks,
    setTasks,
    showToast,
    prompt,
}: UseTaskFilesOptions) => {
    const addFilesToTask = async (taskId: string, files: File[]) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Nao e possivel anexar arquivo em uma tarefa concluida.'
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
                    : 'Nao foi possivel anexar o arquivo.'

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
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Nao e possivel renomear arquivo de uma tarefa concluida.'
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
                    : 'Nao foi possivel renomear o arquivo.'

            showToast('error', message)
        }
    }

    const deleteTaskFile = async (taskId: string, fileId: string) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            showToast('error', 'Tarefa nao encontrada.')
            return
        }

        if (taskToUpdate.completed) {
            showToast(
                'warning',
                'Nao e possivel deletar arquivo de uma tarefa concluida.'
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

            showToast('success', 'Arquivo excluido com sucesso.')
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error)

            const message =
                error instanceof Error
                    ? error.message
                    : 'Nao foi possivel excluir o arquivo.'

            showToast('error', message)
        }
    }

    const requestRenameTaskFile = async (taskId: string, file: TaskFile) => {
        const currentNameWithoutExtension = getFileNameWithoutExtension(
            file.displayName
        )

        const newName = await prompt({
            title: 'Renomear arquivo',
            message:
                'Digite o novo nome do arquivo. A extensao original sera mantida automaticamente.',
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

    return {
        addFilesToTask,
        renameTaskFile,
        deleteTaskFile,
        requestRenameTaskFile,
    }
}
