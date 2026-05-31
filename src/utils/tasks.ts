import type {
    PriorityFilter,
    TaskSortOption,
} from '../components/TaskFilters/TaskFilters'
import type { Task, TaskPriority } from '../types/task'

const priorityOrder: Record<TaskPriority, number> = {
    alta: 1,
    media: 2,
    baixa: 3,
}

const parseBrazilianDateTime = (dateTime?: string) => {
    if (!dateTime) {
        return 0
    }

    const [datePart, timePart = '00:00:00'] = dateTime.split(', ')
    const [day, month, year] = datePart.split('/').map(Number)
    const [hour, minute, second] = timePart.split(':').map(Number)

    return new Date(year, month - 1, day, hour, minute, second).getTime()
}

const getTaskTitle = (task: Task) => {
    return task.title || task.text || 'Tarefa sem título'
}

const getTaskDescription = (task: Task) => {
    return task.description || ''
}

export const filterTasks = (
    tasks: Task[],
    searchTerm: string,
    priorityFilter: PriorityFilter
) => {
    return tasks.filter((task) => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        const taskTitle = getTaskTitle(task).toLowerCase()
        const taskDescription = getTaskDescription(task).toLowerCase()

        const matchesSearch =
            normalizedSearch === '' ||
            taskTitle.includes(normalizedSearch) ||
            taskDescription.includes(normalizedSearch) ||
            task.tags.some((tag) =>
                tag.nome.toLowerCase().includes(normalizedSearch)
            ) ||
            task.files.some((file) =>
                file.displayName.toLowerCase().includes(normalizedSearch)
            )

        const matchesPriority =
            priorityFilter === 'todas' || task.priority === priorityFilter

        return matchesSearch && matchesPriority
    })
}

export const sortTasks = (tasks: Task[], sortOption: TaskSortOption) => {
    const sortedTasks = [...tasks]

    switch (sortOption) {
        case 'mais-recentes':
            return sortedTasks.sort(
                (taskA, taskB) =>
                    parseBrazilianDateTime(taskB.createdAt) -
                    parseBrazilianDateTime(taskA.createdAt)
            )

        case 'mais-antigas':
            return sortedTasks.sort(
                (taskA, taskB) =>
                    parseBrazilianDateTime(taskA.createdAt) -
                    parseBrazilianDateTime(taskB.createdAt)
            )

        case 'ultimas-editadas':
            return sortedTasks.sort(
                (taskA, taskB) =>
                    parseBrazilianDateTime(taskB.updatedAt) -
                    parseBrazilianDateTime(taskA.updatedAt)
            )

        case 'nome-az':
            return sortedTasks.sort((taskA, taskB) =>
                getTaskTitle(taskA).localeCompare(getTaskTitle(taskB))
            )

        case 'nome-za':
            return sortedTasks.sort((taskA, taskB) =>
                getTaskTitle(taskB).localeCompare(getTaskTitle(taskA))
            )

        case 'vencimento':
            return sortedTasks.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0
                if (!a.dueDate) return 1
                if (!b.dueDate) return -1
                return a.dueDate.localeCompare(b.dueDate)
            })

        case 'Filtros':
        default:
            return sortedTasks.sort(
                (taskA, taskB) =>
                    priorityOrder[taskA.priority] -
                    priorityOrder[taskB.priority]
            )
    }
}
