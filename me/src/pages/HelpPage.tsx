import { LuArrowLeft } from 'react-icons/lu'

const KEYBINDS = [
    ['Ctrl+Enter', 'Upload / Download selected'],
    ['Ctrl+A', 'Select all'],
    ['Ctrl+V', 'Paste text or files'],
    ['Ctrl+Esc', 'Logout'],
    ['Enter', 'Submit text'],
    ['Delete', 'Delete selected'],
    ['Escape', 'Clear selection'],
    ['/', 'Focus text input'],
    ['Click', 'Copy text / Select file'],
    ['Double-click', 'Download file'],
    ['Click+drag', 'Lasso select'],
]

export default function HelpPage({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors mb-8 cursor-pointer"
                >
                    <LuArrowLeft size={16} />
                    Back
                </button>

                <h1 className="text-lg font-medium text-text mb-6">Keybinds</h1>

                <div className="flex flex-col gap-3">
                    {KEYBINDS.map(([key, desc]) => (
                        <div key={key} className="flex items-baseline justify-between gap-4">
                            <kbd className="text-xs text-accent font-mono bg-surface px-2 py-1 rounded border border-border/30 whitespace-nowrap">
                                {key}
                            </kbd>
                            <span className="text-sm text-text-muted">{desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
