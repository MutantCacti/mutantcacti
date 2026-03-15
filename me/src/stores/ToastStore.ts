import { create } from 'zustand'

interface Toast {
    id: number
    message: string
}

interface ToastStore {
    toasts: Toast[]
    show: (message: string) => void
    dismiss: (id: number) => void
}

let nextId = 0

const useToastStore = create<ToastStore>((set, get) => ({
    toasts: [],

    show(message: string) {
        const id = nextId++
        set({ toasts: [...get().toasts, { id, message }] })
        setTimeout(() => get().dismiss(id), 2000)
    },

    dismiss(id: number) {
        set({ toasts: get().toasts.filter(t => t.id !== id) })
    },
}))

export default useToastStore
