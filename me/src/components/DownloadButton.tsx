import { LuDownload } from 'react-icons/lu'
import useTransferStore from '../stores/TransferStore'

export default function DownloadButton() {
    const { selected, transfers, download } = useTransferStore()
    const hasFiles = selected.some(id => transfers.find(t => t.id === id)?.type !== 'text')

    function handleClick() {
        selected.forEach(id => download(id))
    }

    return (
        <button
            onClick={handleClick}
            disabled={!hasFiles}
            className={`p-2 transition-all rounded-lg cursor-pointer ${
                hasFiles
                    ? 'text-accent hover:text-accent-light focus-visible:text-accent-light hover-glow hover:-translate-y-0.5 focus-visible:-translate-y-0.5'
                    : 'text-text-muted opacity-50'
            }`}
            title="Download selected"
        >
            <LuDownload size={20} />
        </button>
    )
}
