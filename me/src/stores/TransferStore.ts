import { create } from 'zustand'
import { Transfer } from '../types/types'

const API = '/api/transfers'

interface TransferStore {
    transfers: Transfer[]
    inflight: number
    activity: string
    ready: boolean
    error: string | null
    selected: number[]
    localThumbs: Record<number, string>
    statusText: string

    fetch: () => Promise<void>
    createText: (content: string) => Promise<number | undefined>
    uploadFile: (file: File) => Promise<void>
    remove: (id: number) => Promise<void>
    batchRemove: (ids: number[]) => Promise<void>
    download: (id: number) => void
    batchDownload: (ids: number[]) => void
    toggleSelect: (id: number) => void
    clearSelection: () => void
}

async function api(path: string, init?: RequestInit) {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        ...init,
    })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(body || res.statusText)
    }
    return res
}

let tempId = -1

function getStatusText(transfers: Transfer[]): string {
    const files = transfers.filter(t => t.type === 'file').length
    const texts = transfers.filter(t => t.type === 'text').length
    const parts: string[] = []
    if (files) parts.push(`${files} file${files !== 1 ? 's' : ''}`)
    if (texts) parts.push(`${texts} text${texts !== 1 ? 's' : ''}`)
    return parts.join(', ') || 'Empty'
}

// Sequential upload queue to avoid overwhelming browser connection limits
const uploadQueue: (() => Promise<void>)[] = []
let uploading = false

async function drainQueue() {
    if (uploading) return
    uploading = true
    while (uploadQueue.length > 0) {
        const task = uploadQueue.shift()!
        await task()
    }
    uploading = false
}

const useTransferStore = create<TransferStore>((set, get) => ({
    transfers: [],
    inflight: 0,
    activity: '',
    ready: false,
    error: null,
    statusText: 'try help',
    selected: [],
    localThumbs: {},

    async fetch() {
        set({ inflight: get().inflight + 1, activity: 'Loading', error: null, selected: [] })
        try {
            const res = await api('/')
            const transfers: Transfer[] = await res.json()
            set({ transfers })
        } catch (e: any) {
            set({ error: e.message })
        } finally {
            const n = get().inflight - 1
            set({ inflight: n, ...(n === 0 ? { activity: '', statusText: getStatusText(get().transfers) } : {}), ready: true })
        }
    },

    async createText(content: string) {
        const dup = get().transfers.find(t => t.type === 'text' && t.content === content)
        if (dup) return dup.id

        const id = tempId--
        const optimistic: Transfer = {
            id, type: 'text', content,
            created_at: new Date().toISOString(), size: null,
        }
        set({ error: null, inflight: get().inflight + 1, activity: 'Saving', transfers: [optimistic, ...get().transfers] })

        try {
            const res = await api('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'text', content }),
            })
            const transfer: Transfer = await res.json()
            const transfers = get().transfers.map(t => t.id === id ? transfer : t)
            set({ transfers })
        } catch (e: any) {
            set({
                error: e.message,
                transfers: get().transfers.filter(t => t.id !== id),
            })
        } finally {
            const n = get().inflight - 1
            set({ inflight: n, ...(n === 0 ? { activity: '', statusText: getStatusText(get().transfers) } : {}) })
        }
    },

    async uploadFile(file: File) {
        const id = tempId--
        const optimistic: Transfer = {
            id, type: 'file', content: file.name,
            created_at: new Date().toISOString(), size: file.size,
        }

        // Create local thumbnail for image files
        const isSvg = file.type === 'image/svg+xml'
        const isRasterImage = file.type.startsWith('image/') && !isSvg
        if (isSvg) {
            const url = URL.createObjectURL(file)
            set({ localThumbs: { ...get().localThumbs, [id]: url } })
        } else if (isRasterImage) {
            try {
                const bmp = await createImageBitmap(file)
                const scale = Math.min(1, 150 / Math.max(bmp.width, bmp.height))
                const w = Math.round(bmp.width * scale)
                const h = Math.round(bmp.height * scale)
                const canvas = new OffscreenCanvas(w, h)
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(bmp, 0, 0, w, h)
                bmp.close()
                const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.5 })
                const url = URL.createObjectURL(blob)
                set({ localThumbs: { ...get().localThumbs, [id]: url } })
            } catch { /* thumbnail generation failed, continue without */ }
        }

        set({ error: null, inflight: get().inflight + 1, activity: 'Uploading', transfers: [optimistic, ...get().transfers] })

        uploadQueue.push(async () => {
            try {
                const form = new FormData()
                form.append('data', file)
                const res = await api('/upload', {
                    method: 'POST',
                    body: form,
                })
                const transfer: Transfer = await res.json()
                const transfers = get().transfers.map(t => t.id === id ? transfer : t)
                set({ transfers })

                // Migrate local thumbnail from temp ID to real ID
                const thumb = get().localThumbs[id]
                if (thumb) {
                    const { [id]: _, ...rest } = get().localThumbs
                    set({ localThumbs: { ...rest, [transfer.id]: thumb } })
                }
            } catch (e: any) {
                const thumb = get().localThumbs[id]
                if (thumb) {
                    URL.revokeObjectURL(thumb)
                    const { [id]: _, ...rest } = get().localThumbs
                    set({ localThumbs: rest })
                }
                set({
                    error: e.message,
                    transfers: get().transfers.filter(t => t.id !== id),
                })
            } finally {
                const n = get().inflight - 1
                set({ inflight: n, ...(n === 0 ? { activity: '', statusText: getStatusText(get().transfers) } : {}) })
            }
        })
        drainQueue()
    },

    async remove(id: number) {
        const prev = get().transfers
        const thumb = get().localThumbs[id]
        if (thumb) {
            URL.revokeObjectURL(thumb)
            const { [id]: _, ...rest } = get().localThumbs
            set({ localThumbs: rest })
        }
        set({
            error: null,
            inflight: get().inflight + 1,
            activity: 'Deleting',
            transfers: prev.filter(t => t.id !== id),
            selected: get().selected.filter(s => s !== id),
        })

        try {
            await api(`/${id}`, { method: 'DELETE' })
        } catch (e: any) {
            set({ error: e.message, transfers: prev })
        } finally {
            const n = get().inflight - 1
            set({ inflight: n, ...(n === 0 ? { activity: '', statusText: getStatusText(get().transfers) } : {}) })
        }
    },

    async batchRemove(ids: number[]) {
        const prev = get().transfers
        const thumbs = { ...get().localThumbs }
        for (const id of ids) {
            if (thumbs[id]) {
                URL.revokeObjectURL(thumbs[id])
                delete thumbs[id]
            }
        }
        const idSet = new Set(ids)
        set({
            error: null,
            inflight: get().inflight + 1,
            activity: 'Deleting',
            localThumbs: thumbs,
            transfers: prev.filter(t => !idSet.has(t.id)),
            selected: get().selected.filter(s => !idSet.has(s)),
        })

        try {
            await api('/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            })
        } catch (e: any) {
            set({ error: e.message, transfers: prev })
        } finally {
            const n = get().inflight - 1
            set({ inflight: n, ...(n === 0 ? { activity: '', statusText: getStatusText(get().transfers) } : {}) })
        }
    },

    download(id: number) {
        const t = get().transfers.find(t => t.id === id)
        if (t && t.type !== 'text') {
            window.open(`${API}/${id}/download`, '_blank')
        }
    },

    batchDownload(ids: number[]) {
        const fileIds = ids.filter(id => {
            const t = get().transfers.find(t => t.id === id)
            return t && t.type !== 'text'
        })
        if (fileIds.length === 0) return
        if (fileIds.length === 1) {
            get().download(fileIds[0])
            return
        }
        // POST to batch-download and trigger download from blob
        fetch(`${API}/batch-download`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: fileIds }),
        })
            .then(res => {
                if (!res.ok) throw new Error(res.statusText)
                return res.blob()
            })
            .then(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'transfers.zip'
                a.click()
                URL.revokeObjectURL(url)
            })
            .catch(e => set({ error: e.message }))
    },

    toggleSelect(id: number) {
        const s = get().selected
        set({ selected: s.includes(id) ? s.filter(x => x !== id) : [...s, id] })
    },

    clearSelection() {
        set({ selected: [] })
    },
}))

// Revoke blob URLs on page unload
window.addEventListener('beforeunload', () => {
    for (const url of Object.values(useTransferStore.getState().localThumbs)) {
        URL.revokeObjectURL(url)
    }
})

export default useTransferStore
