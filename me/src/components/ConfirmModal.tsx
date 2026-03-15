import { useEffect } from 'react'

interface ConfirmModalProps {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') { e.preventDefault(); onCancel() }
            else if (e.key === 'Tab' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault()
                const active = document.activeElement
                const confirm = document.getElementById('modal-confirm')
                const cancel = document.getElementById('modal-cancel')
                if (active === confirm) cancel?.focus()
                else confirm?.focus()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [onCancel, onConfirm])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={onCancel}
        >
            <div
                className="bg-surface border border-border rounded-xl p-6 mx-4"
                onClick={e => e.stopPropagation()}
            >
                <p className="text-text text-sm mb-5">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        id="modal-confirm"
                        onClick={onConfirm}
                        autoFocus
                        className="px-3 py-1.5 text-sm text-bg bg-accent rounded-lg
                                   hover:bg-accent-light transition-colors"
                    >
                        Delete
                    </button>
                    <button
                        id="modal-cancel"
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm text-text-muted rounded-lg
                                   border border-border hover:border-text-muted transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
