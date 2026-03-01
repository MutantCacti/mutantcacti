import { useState, useRef, useEffect } from 'react'
import { SiGithub } from 'react-icons/si'
import { GoLock } from 'react-icons/go'
import type { Project } from '../data/projects'

export default function ProjectCard({ title, description, tags, images, repoUrl }: Project) {
    const [previewIndex, setPreviewIndex] = useState<number | null>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const wasOpen = useRef(false)

    useEffect(() => {
        if (previewIndex !== null && !wasOpen.current) {
            modalRef.current?.focus()
        } else if (previewIndex === null && wasOpen.current) {
            triggerRef.current?.focus()
        }
        wasOpen.current = previewIndex !== null
    }, [previewIndex])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!images) return
        if (e.key === 'Escape') {
            setPreviewIndex(null)
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault()
            setPreviewIndex(i => i !== null ? (i + 1) % images.length : 0)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault()
            setPreviewIndex(i => i !== null ? (i - 1 + images.length) % images.length : 0)
        } else if (e.key === 'Tab') {
            const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button')
            if (!focusable || focusable.length === 0) {
                e.preventDefault()
                return
            }
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const isOnChild = Array.from(focusable).includes(document.activeElement as HTMLElement)
            if (!isOnChild) {
                e.preventDefault()
                ;(e.shiftKey ? last : first).focus()
            } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }
    }

    return (
        <div className="w-full flex flex-col sm:flex-row gap-4 bg-bg border border-border rounded-lg p-4">
            {images && images.length > 0 && (
                <>
                    <div className="sm:w-64 shrink-0 self-stretch">
                        <button
                            ref={triggerRef}
                            onClick={() => setPreviewIndex(0)}
                            aria-label={`View ${title} screenshots`}
                            className="w-full h-full rounded-md overflow-hidden hover:brightness-110 transition"
                        >
                            <img
                                src={images[0].src}
                                alt={images[0].alt}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    </div>
                    {previewIndex !== null && (
                        <div
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label={`${title} screenshot gallery`}
                            tabIndex={-1}
                            className="fixed inset-0 z-50 flex items-center justify-center gap-4 bg-black/80 p-8 outline-none"
                            onClick={() => setPreviewIndex(null)}
                            onKeyDown={handleKeyDown}
                        >
                            <div
                                className="w-[80vw] h-[80vh] flex items-center justify-center"
                                onClick={e => e.stopPropagation()}
                            >
                                <img
                                    src={images[previewIndex].src}
                                    alt={images[previewIndex].alt}
                                    className="max-w-full max-h-full rounded-lg"
                                />
                            </div>
                            {images.length > 1 && (
                                <div
                                    className="flex flex-col gap-2"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPreviewIndex(i)}
                                            aria-label={img.alt}
                                            aria-current={i === previewIndex ? 'true' : undefined}
                                            className={`w-24 rounded overflow-hidden transition ${i === previewIndex ? 'ring-2 ring-accent-light' : 'opacity-60 hover:opacity-100'}`}
                                        >
                                            <img
                                                src={img.src}
                                                alt=""
                                                className="w-full block"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-accent-light text-xl">{title}</h2>
                    {repoUrl ? (
                        <a href={repoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${title} on GitHub`}
                            className="text-text-muted hover:text-accent-light transition-colors">
                            <SiGithub size={18} />
                        </a>
                    ) : (
                        <span className="text-text-muted flex items-center gap-1 text-sm">
                            <GoLock size={14} /> Private
                        </span>
                    )}
                </div>
                <p className="text-text-muted">{description}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-border text-text">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
