import { useEffect, useState } from 'react'
import { Header } from './components/Header/Header'
import { TaskForm } from './components/TaskForm/TaskForm'
import { TaskList } from './components/TaskList/TaskList'
import type { Task, TaskPriority } from './types/task'
import { getCurrentDateTime } from './utils/date'
import './styles/global.css'

const LOCAL_STORAGE_KEY = 'tasks'

const priorityOrder: Record<TaskPriority, number> = {
    alta: 1,
    media: 2,
    baixa: 3,
}

function App() {
    const [tasks, setTasks] = useState<Task[]>(() => {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY)

        if (!storedTasks) {
            return []
        }

        return JSON.parse(storedTasks) as Task[]
    })

    const sortedTasks = [...tasks].sort((taskA, taskB) => {
        if (taskA.completed !== taskB.completed) {
            return Number(taskA.completed) - Number(taskB.completed)
        }

        return priorityOrder[taskA.priority] - priorityOrder[taskB.priority]
    })

    const addTask = (text: string, priority: TaskPriority) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text,
            priority,
            completed: false,
            createdAt: getCurrentDateTime(),
        }

        setTasks((currentTasks) => [...currentTasks, newTask])
    }

    const toggleTask = (taskId: string) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        )
    }

    const updateTask = (
        taskId: string,
        text: string,
        priority: TaskPriority
    ) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          text,
                          priority,
                          updatedAt: getCurrentDateTime(),
                      }
                    : task
            )
        )
    }

    const deleteTask = (taskId: string) => {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        )
    }

    const deleteCompletedTasks = () => {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => !task.completed)
        )
    }

    const exportTasks = () => {
        const taskText = sortedTasks
            .map((task) => {
                const status = task.completed ? 'Concluída' : 'Pendente'

                return `${task.text} - ${status} - Criada em: ${task.createdAt} - Prioridade: ${task.priority}`
            })
            .join('\n')

        const blob = new Blob([taskText], {
            type: 'text/plain;charset=utf-8',
        })

        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'lista_de_tarefas.txt'
        link.click()

        URL.revokeObjectURL(url)
    }

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
    }, [tasks])

    return (
        <main className="container">
            <Header />

            <TaskForm onAddTask={addTask} />

            <div className="buttons-wrapper">
                <button type="button" onClick={exportTasks}>
                    Exportar Lista
                </button>

                <button type="button" onClick={deleteCompletedTasks}>
                    Deletar Tarefas Completas
                </button>
            </div>

            <TaskList
                tasks={sortedTasks}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
            />
        </main>
    )
}

export default App