import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { MediaItem } from '../types/media'

export type { MediaItem }

type GalleryModalProps = {
    title: string
    media: MediaItem[]
    initialIndex: number
    onClose: () => void
}

export default function GalleryModal({ title, media, initialIndex, onClose }: GalleryModalProps) {
    const [index, setIndex] = useState(initialIndex)
    const modalRef = useRef<HTMLDivElement>(null)
    const mobileStripRef = useRef<HTMLDivElement>(null)
    const desktopStripRef = useRef<HTMLDivElement>(null)
    const slideDir = useRef<1 | -1>(1)
    const touchStart = useRef<{ x: number; y: number } | null>(null)
    const prevFocus = useRef<Element | null>(null)

    const currentItem = media[index]

    // Focus modal on mount, restore focus on unmount
    useEffect(() => {
        prevFocus.current = document.activeElement
        modalRef.current?.focus()
        return () => {
            if (prevFocus.current instanceof HTMLElement) prevFocus.current.focus()
        }
    }, [])

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // Scroll strip to center a given thumbnail
    const scrollStripToIndex = useCallback((i: number) => {
        const dStrip = desktopStripRef.current
        if (dStrip) {
            const inner = dStrip.children[0] as HTMLElement | undefined
            const btn = inner?.children[i] as HTMLElement | undefined
            if (btn && inner) {
                const center = dStrip.offsetHeight / 2
                dStrip.scrollTo({ top: btn.offsetTop - inner.offsetTop + btn.offsetHeight / 2 - center, behavior: 'smooth' })
            }
        }
        const mStrip = mobileStripRef.current
        if (mStrip) {
            const btn = mStrip.children[0]?.children[i] as HTMLElement | undefined
            if (btn) {
                const center = mStrip.offsetWidth / 2
                mStrip.scrollTo({ left: btn.offsetLeft + btn.offsetWidth / 2 - center, behavior: 'smooth' })
            }
        }
    }, [])

    useEffect(() => {
        scrollStripToIndex(index)
    }, [index, scrollStripToIndex])

    // Global wheel navigation
    useEffect(() => {
        function onWheel(e: WheelEvent) {
            if (e.deltaY === 0) return
            const dir = Math.sign(e.deltaY)
            slideDir.current = dir as 1 | -1
            setIndex(i => Math.max(0, Math.min(media.length - 1, i + dir)))
        }
        window.addEventListener('wheel', onWheel, { passive: true })
        return () => window.removeEventListener('wheel', onWheel)
    }, [media.length])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!media.length) return
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault()
            slideDir.current = 1
            setIndex(i => (i + 1) % media.length)
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault()
            slideDir.current = -1
            setIndex(i => (i - 1 + media.length) % media.length)
        } else if (e.key === 'Tab') {
            const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button')
            if (!focusable || focusable.length === 0) {
                e.preventDefault()
                return
            }
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const isOnChild = document.activeElement instanceof HTMLElement && Array.from(focusable).includes(document.activeElement)
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
        const t = e.target as Node
        if (mobileStripRef.current?.contains(t) || desktopStripRef.current?.contains(t)) {
            touchStart.current = null
            return
        }
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (!touchStart.current) return
        const dx = e.changedTouches[0].clientX - touchStart.current.x
        const dy = e.changedTouches[0].clientY - touchStart.current.y
        touchStart.current = null

        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        if (absDx < 50 && absDy < 50) return

        if (absDy > absDx) {
            // vertical swipe — close
            onClose()
        } else if (absDx > absDy && media.length) {
            // horizontal swipe — navigate
            if (dx < 0) {
                slideDir.current = 1
                setIndex(i => (i + 1) % media.length)
            } else {
                slideDir.current = -1
                setIndex(i => (i - 1 + media.length) % media.length)
            }
        }
    }

    function renderThumbnail(item: MediaItem) {
        if (item.type === 'video') {
            return (
                <div className='relative w-full h-full'>
                    <img src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`} alt={item.alt} loading='lazy' className='w-full h-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <svg className='w-5 h-5 text-white drop-shadow-lg' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M9.5 6.5l9 5.5-9 5.5z' />
                        </svg>
                    </div>
                </div>
            )
        }
        return <img src={item.src} alt={item.alt} loading='lazy' className='w-full h-full object-cover' />
    }

    return createPortal(
        <div
            ref={modalRef}
            role='dialog'
            aria-modal='true'
            aria-label={`${title} gallery`}
            tabIndex={-1}
            className='fixed inset-0 z-50 flex flex-col sm:flex-row items-center justify-center gap-4 bg-black/80 p-4 sm:p-8 outline-none'
            onClick={onClose}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button
                onClick={e => { e.stopPropagation(); onClose() }}
                aria-label='Close gallery'
                className='absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-bg/50 hover:bg-bg/70 text-white transition cursor-pointer'
            >
                <svg viewBox='0 0 24 24' className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
                    <path d='M18 6L6 18M6 6l12 12' />
                </svg>
            </button>
            <div className='flex flex-col items-center gap-2 w-full sm:flex-1 sm:min-w-0 sm:max-w-[70vw] sm:h-[80vh]'>
                <div
                    className='relative flex items-center justify-center min-h-0 flex-1'
                >
                    {currentItem.type === 'video' ? (
                        <>
                            <div key={index} className='relative aspect-video w-full h-full max-h-full' onClick={e => e.stopPropagation()}>
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${currentItem.youtubeId}?rel=0`}
                                    title={currentItem.title}
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                    allowFullScreen
                                    className='w-full h-full rounded-lg pointer-events-none'
                                />
                                <div
                                    className='absolute inset-0 rounded-lg cursor-pointer ring-1 ring-white/20 hover:ring-white/40 transition-all'
                                    onClickCapture={e => {
                                        e.stopPropagation()
                                        const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement
                                        iframe.classList.remove('pointer-events-none')
                                        e.currentTarget.classList.add('pointer-events-none', 'opacity-0')
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <img
                            key={index}
                            src={currentItem.src}
                            alt={currentItem.alt}
                            className={`max-w-full max-h-full rounded-lg bg-surface ${slideDir.current === 1 ? 'slide-next' : 'slide-prev'}`}
                            onClick={e => e.stopPropagation()}
                        />
                    )}
                </div>
                {currentItem.type === 'video' && currentItem.footnote && (
                    <p className='text-sm text-white/90 mt-2 italic text-center bg-surface rounded px-3 py-1' onClick={e => e.stopPropagation()}>
                        {currentItem.footnote}
                    </p>
                )}
                {currentItem.credit && (() => {
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
                                    onClick={e => { e.stopPropagation(); slideDir.current = i > index ? 1 : -1; setIndex(i) }}
                                    aria-label={item.alt}
                                    aria-current={i === index ? 'true' : undefined}
                                    className={`w-24 h-[60px] shrink-0 rounded overflow-hidden transition ${i === index ? 'ring-2 ring-highlight' : ''}`}
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
                                    onClick={e => { e.stopPropagation(); slideDir.current = i > index ? 1 : -1; setIndex(i) }}
                                    aria-label={item.alt}
                                    aria-current={i === index ? 'true' : undefined}
                                    className={`w-16 h-10 shrink-0 rounded overflow-hidden transition ${i === index ? 'ring-2 ring-highlight' : ''}`}
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
    )
}
