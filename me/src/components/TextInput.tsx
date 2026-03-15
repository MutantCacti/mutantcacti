import { useState, useRef } from 'react'
import useTransferStore from '../stores/TransferStore'

const CARET_COLORS = [
    'var(--color-accent)',
    'var(--color-accent-light)',
    'var(--color-accent-dark)',
    'var(--color-highlight)',
    'var(--color-accent-light)',
    'var(--color-accent)',
]

export default function TextInput() {
    const { createText, activity } = useTransferStore()
    const [value, setValue] = useState('')
    const caretIdx = useRef(0)
    const [caretColor, setCaretColor] = useState(CARET_COLORS[0])

    const { selected, download } = useTransferStore()

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            if (selected.length > 0) {
                selected.forEach(id => download(id))
            } else {
                document.getElementById('upload-input')?.click()
            }
            return
        }
        if (e.key === 'Enter' && value.trim() === '/help') {
            createText([
                'Keybinds',
                'Ctrl+Enter — Upload / Download selected',
                'Ctrl+A — Select all',
                'Ctrl+V — Paste text or files',
                'Ctrl+Esc — Logout',
                'Enter — Submit text',
                'Delete — Delete selected',
                'Escape — Clear selection',
                '/ — Focus text input',
                'Click — Copy text / Select file',
                'Double-click — Download file',
                'Click+drag — Lasso select',
            ].join('\n'))
            setValue('')
            return
        }
        if (e.key === 'Enter' && value.trim()) {
            createText(value.trim()).then(dupId => {
                if (dupId) {
                    const el = document.querySelector(`[data-transfer-id="${dupId}"]`)
                    if (el) {
                        el.classList.remove('animate-nudge')
                        void (el as HTMLElement).offsetWidth
                        el.classList.add('animate-nudge')
                        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
                    }
                }
            })
            setValue('')
        }
    }

    return (
        <>
        <label htmlFor="text-input" className="sr-only">Transfer text</label>
        <input
            type="text"
            value={value}
            onChange={e => {
                setValue(e.target.value)
                caretIdx.current = (caretIdx.current + 1) % CARET_COLORS.length
                setCaretColor(CARET_COLORS[caretIdx.current])
            }}
            onKeyDown={handleKeyDown}
            disabled={!!activity}
            placeholder="Send text"
            id="text-input"
            className="w-full bg-bg/70 rounded-lg
                       px-3 py-2 text-sm text-text placeholder:text-text-muted
                       hover:placeholder:text-accent focus:placeholder:text-accent
                       placeholder:transition-colors disabled:opacity-50"
            style={{ caretColor }}
        />
        </>
    )
}
