import { useRef, type Dispatch, type SetStateAction } from 'react'
import type { ToastType } from '../components/Toast/Toast'
import { ApiError } from '../services/api'
import { taskFilesApi } from '../services/taskFilesApi'
import type { Task, TaskFile } from '../types/task'
import {
    buildFileNameWithOriginalExtension,
    getFileNameWithoutExtension,
} from '../utils/file'
import { sincronizacao } from './sincronizacao'

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
    const uploadEmAndamentoRef = useRef(false)

    const addFilesToTask = async (taskId: string, files: File[]) => {
        if (uploadEmAndamentoRef.current) {
            showToast('warning', 'Aguarde o envio atual terminar.')
            return
        }

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

        uploadEmAndamentoRef.current = true
        sincronizacao.pausar()

        try {
            const uploadedFiles: TaskFile[] = []
            const failedFiles: string[] = []

            for (const file of files) {
                try {
                    const uploadedFile = await taskFilesApi.uploadTaskFile(
                        taskId,
                        file
                    )

                    uploadedFiles.push(uploadedFile)
                } catch (error) {
                    console.error('Erro ao anexar arquivo:', error)

                    if (error instanceof ApiError && error.status === 429) {
                        sincronizacao.aplicarBackoff()
                    }

                    failedFiles.push(file.name)
                }
            }

            if (uploadedFiles.length === 0) {
                showToast(
                    'error',
                    failedFiles.length === 1
                        ? `Nao foi possivel anexar ${failedFiles[0]}.`
                        : 'Nao foi possivel anexar os arquivos selecionados.'
                )
                return
            }

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
                failedFiles.length > 0 ? 'warning' : 'success',
                uploadedFiles.length === 1 && failedFiles.length === 0
                    ? 'Arquivo anexado com sucesso.'
                    : failedFiles.length > 0
                      ? `${uploadedFiles.length} arquivo(s) anexado(s). ${failedFiles.length} falharam.`
                      : 'Arquivos anexados com sucesso.'
            )
        } finally {
            uploadEmAndamentoRef.current = false
            sincronizacao.liberarComCooldown(3000)
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

        sincronizacao.pausar()

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
        } finally {
            sincronizacao.liberar()
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

        sincronizacao.pausar()

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
        } finally {
            sincronizacao.liberar()
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
