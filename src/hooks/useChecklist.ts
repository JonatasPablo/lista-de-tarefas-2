import { useState, useEffect } from 'react'
import { checklistApi, type ChecklistItem } from '../services/checklistApi'

export const useChecklist = (
    taskId: string,
    isTaskCompleted: boolean,
    expanded: boolean
) => {
    const [items, setItems] = useState<ChecklistItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newItemTitle, setNewItemTitle] = useState('')
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editingTitle, setEditingTitle] = useState('')

    useEffect(() => {
        if (!expanded) {
            return
        }

        let cancelled = false

        const load = async () => {
            setIsLoading(true)

            try {
                const data = await checklistApi.listItems(taskId)

                if (!cancelled) {
                    setItems(data)
                }
            } catch {
                // silente
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [expanded, taskId])

    const addItem = async () => {
        const title = newItemTitle.trim()

        if (!title || isTaskCompleted) {
            return
        }

        try {
            const item = await checklistApi.createItem(taskId, title)
            setItems((prev) => [...prev, item])
            setNewItemTitle('')
        } catch {
            // silente
        }
    }

    const toggleItem = async (itemId: string) => {
        if (isTaskCompleted) {
            return
        }

        const item = items.find((i) => i.id === itemId)

        if (!item) {
            return
        }

        try {
            const updated = await checklistApi.updateItem(taskId, itemId, {
                is_completed: !item.isCompleted,
            })
            setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
        } catch {
            // silente
        }
    }

    const startEditing = (item: ChecklistItem) => {
        setEditingItemId(item.id)
        setEditingTitle(item.title)
    }

    const cancelEditing = () => {
        setEditingItemId(null)
        setEditingTitle('')
    }

    const saveEditing = async () => {
        if (!editingItemId || isTaskCompleted) {
            return
        }

        const title = editingTitle.trim()

        if (!title || title.length < 2) {
            return
        }

        try {
            const updated = await checklistApi.updateItem(
                taskId,
                editingItemId,
                { title }
            )
            setItems((prev) =>
                prev.map((i) => (i.id === editingItemId ? updated : i))
            )
            setEditingItemId(null)
            setEditingTitle('')
        } catch {
            // silente
        }
    }

    const deleteItem = async (itemId: string) => {
        if (isTaskCompleted) {
            return
        }

        try {
            await checklistApi.deleteItem(taskId, itemId)
            setItems((prev) => prev.filter((i) => i.id !== itemId))
        } catch {
            // silente
        }
    }

    const completedCount = items.filter((i) => i.isCompleted).length
    const totalCount = items.length

    return {
        items,
        isLoading,
        newItemTitle,
        setNewItemTitle,
        editingItemId,
        editingTitle,
        setEditingTitle,
        addItem,
        toggleItem,
        startEditing,
        cancelEditing,
        saveEditing,
        deleteItem,
        completedCount,
        totalCount,
    }
}
