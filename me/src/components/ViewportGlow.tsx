import useTransferStore from '../stores/TransferStore'

export default function ViewportGlow() {
    const hasSelection = useTransferStore(s => s.selected.length > 0)

    if (!hasSelection) return null

    return (
        <div
            className="viewport-glow"
            aria-hidden="true"
        />
    )
}
