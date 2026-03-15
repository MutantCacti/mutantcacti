export default function LoadingSpinner({ label = 'Loading' }: { label?: string }) {
    return (
        <div
            className="flex-1 flex items-center justify-center"
            role="status"
            aria-live="polite"
        >
            <div className="h-12 w-12 border-3 border-surface border-t-accent rounded-full animate-spin" />
            <span className="sr-only">{label}</span>
        </div>
    )
}
