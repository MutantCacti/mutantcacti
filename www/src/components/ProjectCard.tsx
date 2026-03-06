import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { SiGithub } from 'react-icons/si'
import { GoLock } from 'react-icons/go'
import type { Project } from '../data/projects'
import Tiltable from './Tiltable'
import Card from './Card'

type MediaItem =
    | { type: 'image'; src: string; alt: string; credit?: string }
    | { type: 'video'; youtubeId: string; title: string; alt: string; credit?: string }

export default function ProjectCard({ title, year, description, tags, images, videos, repoUrl, credit: projectCredit }: Project) {
    const media: MediaItem[] = [
        ...(videos ?? []).map(vid => ({ type: 'video' as const, ...vid, credit: vid.credit })),
        ...(images ?? []).map(img => ({ type: 'image' as const, ...img, credit: img.credit })),
    ]
    const thumbnail = images?.[0]
        ? { src: images[0].src, alt: images[0].alt }
        : videos?.[0]
            ? { src: `https://img.youtube.com/vi/${videos[0].youtubeId}/mqdefault.jpg`, alt: videos[0].alt }
            : null

    const [previewIndex, setPreviewIndex] = useState<number | null>(null)
    const [videoInteractive, setVideoInteractive] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const mobileStripRef = useRef<HTMLDivElement>(null)
    const wasOpen = useRef(false)
    const touchStart = useRef<number | null>(null)
    const slideDir = useRef<1 | -1>(1)
    const desktopStripRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (previewIndex !== null && !wasOpen.current) {
            modalRef.current?.focus()
        } else if (previewIndex === null && wasOpen.current) {
            triggerRef.current?.focus()
        }
        wasOpen.current = previewIndex !== null
        setVideoInteractive(false)
    }, [previewIndex])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (previewIndex !== null) {
            document.body.style.overflow = 'hidden'
            return () => { document.body.style.overflow = '' }
        }
    }, [previewIndex])

    // Scroll strip to center a given thumbnail on click/keyboard selection
    const scrollStripToIndex = useCallback((index: number) => {
        const dStrip = desktopStripRef.current
        if (dStrip) {
            const inner = dStrip.children[0] as HTMLElement | undefined
            const btn = inner?.children[index] as HTMLElement | undefined
            if (btn && inner) {
                const center = dStrip.offsetHeight / 2
                dStrip.scrollTo({ top: btn.offsetTop - inner.offsetTop + btn.offsetHeight / 2 - center, behavior: 'smooth' })
            }
        }
        const mStrip = mobileStripRef.current
        if (mStrip) {
            const btn = mStrip.children[0]?.children[index] as HTMLElement | undefined
            if (btn) {
                const center = mStrip.offsetWidth / 2
                mStrip.scrollTo({ left: btn.offsetLeft + btn.offsetWidth / 2 - center, behavior: 'smooth' })
            }
        }
    }, [])

    // Center strip on selection change
    useEffect(() => {
        if (previewIndex !== null) scrollStripToIndex(previewIndex)
    }, [previewIndex, scrollStripToIndex])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!media.length) return
        if (e.key === 'Escape') {
            setPreviewIndex(null)
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault()
            slideDir.current = 1
            setPreviewIndex(i => i !== null ? (i + 1) % media.length : 0)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault()
            slideDir.current = -1
            setPreviewIndex(i => i !== null ? (i - 1 + media.length) % media.length : 0)
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

    function handleTouchStart(e: React.TouchEvent) {
        touchStart.current = e.touches[0].clientX
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (touchStart.current === null || !media.length) return
        const diff = e.changedTouches[0].clientX - touchStart.current
        touchStart.current = null
        if (Math.abs(diff) < 50) return
        if (diff < 0) {
            slideDir.current = 1
            setPreviewIndex(i => i !== null ? (i + 1) % media.length : 0)
        } else {
            slideDir.current = -1
            setPreviewIndex(i => i !== null ? (i - 1 + media.length) % media.length : 0)
        }
    }

    function renderThumbnail(item: MediaItem) {
        if (item.type === 'video') {
            return (
                <div className='relative w-full h-full'>
                    <img src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} alt='' className='w-full h-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <svg className='w-5 h-5 text-white drop-shadow-lg' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M8 5v14l11-7z' />
                        </svg>
                    </div>
                </div>
            )
        }
        return <img src={item.src} alt='' className='w-full h-full object-cover' />
    }

    // Global wheel → step one item per tick while modal is open
    useEffect(() => {
        if (previewIndex === null) return
        function onWheel(e: WheelEvent) {
            if (e.deltaY === 0) return
            const dir = Math.sign(e.deltaY)
            slideDir.current = dir as 1 | -1
            setPreviewIndex(i => {
                if (i === null) return 0
                return Math.max(0, Math.min(media.length - 1, i + dir))
            })
        }
        window.addEventListener('wheel', onWheel, { passive: true })
        return () => window.removeEventListener('wheel', onWheel)
    }, [previewIndex !== null, media.length])

    const currentItem = previewIndex !== null ? media[previewIndex] : null

    return (
        <Card className='w-full flex flex-col sm:flex-row gap-4'>
            {thumbnail && media.length > 0 && (
                <>
                    <Tiltable className='sm:w-64 shrink-0 self-stretch'>
                        <button
                            ref={triggerRef}
                            onClick={() => setPreviewIndex(0)}
                            aria-label={`View ${title} gallery (${media.length} items)`}
                            className='relative w-full h-full rounded-md overflow-hidden group cursor-pointer'
                        >
                            <img
                                src={thumbnail.src}
                                alt={thumbnail.alt}
                                className='w-full h-full object-cover transition group-hover:brightness-110'
                            />
                            <span className='absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1'>
                                <svg className='w-3 h-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                    <rect x='3' y='3' width='7' height='7' rx='1' />
                                    <rect x='14' y='3' width='7' height='7' rx='1' />
                                    <rect x='3' y='14' width='7' height='7' rx='1' />
                                    <rect x='14' y='14' width='7' height='7' rx='1' />
                                </svg>
                                {media.length}
                            </span>
                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition flex items-center justify-center'>
                                <svg className='w-8 h-8 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
                                    <path d='M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7' />
                                </svg>
                            </div>
                        </button>
                    </Tiltable>
                    {previewIndex !== null && currentItem && createPortal(
                        <div
                            ref={modalRef}
                            role='dialog'
                            aria-modal='true'
                            aria-label={`${title} gallery`}
                            tabIndex={-1}
                            className='fixed inset-0 z-50 flex flex-col sm:flex-row items-center justify-center gap-4 bg-black/80 p-4 sm:p-8 outline-none'
                            onClick={() => setPreviewIndex(null)}
                            onKeyDown={handleKeyDown}

                        >
                            <div className='flex flex-col items-center gap-2 w-full sm:flex-1 sm:min-w-0 sm:max-w-[70vw] sm:h-[80vh]'>
                            <div
                                className='relative flex items-center justify-center min-h-0 flex-1'
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                {currentItem.type === 'video' ? (
                                    <div key={previewIndex} className='relative aspect-video w-full h-full max-h-full' onClick={e => e.stopPropagation()}>
                                        {videoInteractive ? (
                                            <iframe
                                                src={`https://www.youtube-nocookie.com/embed/${currentItem.youtubeId}?rel=0&autoplay=1`}
                                                title={currentItem.title}
                                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                                allowFullScreen
                                                className='w-full h-full rounded-lg'
                                            />
                                        ) : (
                                            <button
                                                className='w-full h-full rounded-lg overflow-hidden cursor-pointer group/play'
                                                onClick={() => setVideoInteractive(true)}
                                                aria-label={`Play ${currentItem.title}`}
                                            >
                                                <img
                                                    src={`https://img.youtube.com/vi/${currentItem.youtubeId}/hqdefault.jpg`}
                                                    alt={currentItem.alt}
                                                    className='w-full h-full object-cover'
                                                />
                                                <div className='absolute inset-0 flex items-center justify-center bg-black/20 group-hover/play:bg-black/30 transition'>
                                                    <svg className='w-16 h-16 text-white drop-shadow-lg' viewBox='0 0 24 24' fill='currentColor'>
                                                        <path d='M8 5v14l11-7z' />
                                                    </svg>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <img
                                        key={previewIndex}
                                        src={currentItem.src}
                                        alt={currentItem.alt}
                                        className={`max-w-full max-h-full rounded-lg bg-surface ${slideDir.current === 1 ? 'slide-next' : 'slide-prev'}`}
                                        onClick={e => e.stopPropagation()}
                                    />
                                )}
                            </div>
                            {currentItem.credit && (() => {
                                // Credit string convention: comma-separated entries.
                                // If an entry starts with a lowercase character, it's treated as a
                                // handle/id (rendered small & muted) and paired with the next entry
                                // as its display name. Otherwise it stands alone.
                                // e.g. "@teym1, Thomas Yonaha-McCoy, Claude Opus 4.5:4.6"
                                //   → [{ handle: "teym1", name: "Thomas Yonaha-McCoy" }, { name: "Claude Opus 4.5:4.6" }]
                                const parts = currentItem.credit.split(',').map(s => s.trim())
                                const groups: { handle?: string; name: string }[] = []
                                for (let i = 0; i < parts.length; i++) {
                                    if (i + 1 < parts.length && parts[i].startsWith('@')) {
                                        groups.push({ handle: parts[i].slice(1), name: parts[i + 1] })
                                        i++
                                    } else {
                                        groups.push({ name: parts[i] })
                                    }
                                }
                                return (
                                    <div className='shrink-0 flex flex-col items-start gap-1 text-md text-white bg-bg rounded-lg px-6 py-4 whitespace-nowrap'>
                                        {groups.map((g, i) => (
                                            <span key={i} className='flex flex-col sm:flex-col'>
                                                {g.handle && <span className='text-xs text-white/60'>{g.handle}</span>}
                                                <span>{g.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                )
                            })()}
                            </div>
                            {media.length > 1 && (
                                <>
                                    {/* Desktop: vertical sidebar */}
                                    <div
                                        ref={desktopStripRef}
                                        className='hidden sm:block h-[80vh] overflow-y-auto no-scrollbar relative'
                                        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}
                                    >
                                        <div className='flex flex-col gap-2 px-1' style={{ paddingTop: 'calc(40vh - 30px)', paddingBottom: 'calc(40vh - 30px)' }}>
                                            {media.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={e => { e.stopPropagation(); slideDir.current = i > (previewIndex ?? 0) ? 1 : -1; setPreviewIndex(i) }}
                                                    aria-label={item.type === 'video' ? item.alt : item.alt}
                                                    aria-current={i === previewIndex ? 'true' : undefined}
                                                    className={`w-24 h-[60px] shrink-0 rounded overflow-hidden transition ${i === previewIndex ? 'ring-2 ring-accent-light' : ''}`}
                                                >
                                                    {renderThumbnail(item)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Mobile: horizontal strip */}
                                    <div
                                        ref={mobileStripRef}
                                        className='sm:hidden w-full overflow-x-auto no-scrollbar'
                                        style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
                                    >
                                        <div className='flex gap-2 px-[calc(50%-2rem)] py-1 w-max'>
                                            {media.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={e => { e.stopPropagation(); slideDir.current = i > (previewIndex ?? 0) ? 1 : -1; setPreviewIndex(i) }}
                                                    aria-label={item.type === 'video' ? item.alt : item.alt}
                                                    aria-current={i === previewIndex ? 'true' : undefined}
                                                    className={`w-16 h-10 shrink-0 rounded overflow-hidden transition ${i === previewIndex ? 'ring-2 ring-accent-light' : ''}`}
                                                >
                                                    {renderThumbnail(item)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>,
                        document.body,
                    )}
                </>
            )}
            <div className='flex-1 flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                    {repoUrl ? (
                        <a href={repoUrl} target='_blank' rel='noopener noreferrer' className='text-accent-light text-xl hover:underline'>{title}</a>
                    ) : (
                        <h2 className='text-accent-light text-xl'>{title}</h2>
                    )}
                    <span className='text-text-muted text-sm'>{year}</span>
                    {repoUrl ? (
                        <a href={repoUrl} target='_blank' rel='noopener noreferrer' tabIndex={-1} aria-hidden='true'
                            className='text-text-muted hover:text-accent-light transition-colors'>
                            <SiGithub size={18} />
                        </a>
                    ) : (
                        <span className='text-text-muted flex items-center gap-1 text-sm'>
                            <GoLock size={14} /> Private
                        </span>
                    )}
                </div>
                {projectCredit && (
                    <div className='flex flex-wrap gap-2'>
                        {projectCredit.split(',').map(s => s.trim()).filter(s => !s.startsWith('@')).map(name => (
                            <span key={name} className='bg-accent-dark/10 hover:bg-accent-light/10 transition delay-75 duration:100 ease-in backdrop-blur-sm text-xs px-2 py-1 rounded-full text-accent-light whitespace-nowrap'>
                                {name}
                            </span>
                        ))}
                    </div>
                )}
                <p className='text-text'>{description}</p>
                <div className='flex flex-wrap gap-2 mt-1'>
                    {tags.map(tag => (
                        <span key={tag} className='text-xs px-2 py-1 rounded bg-border text-text'>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    )
}
