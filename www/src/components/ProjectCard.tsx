import { useState } from 'react'
import { SiGithub } from 'react-icons/si'
import { GoLock } from 'react-icons/go'
import type { Project } from '../data/projects'
import type { MediaItem } from './GalleryModal'
import GalleryModal from './GalleryModal'
import Tiltable from './Tiltable'
import Card from './Card'
import CreditPills from './CreditPills'

export default function ProjectCard({ title, year, description, tags, images, videos, repoUrl, credit: projectCredit }: Project) {
    const media: MediaItem[] = [
        ...(videos ?? []).map(vid => ({ type: 'video' as const, ...vid, credit: vid.credit, footnote: vid.footnote })),
        ...(images ?? []).map(img => ({ type: 'image' as const, ...img, credit: img.credit })),
    ]
    const thumbnail = images?.[0]
        ? { src: images[0].src, alt: images[0].alt }
        : videos?.[0]
            ? { src: `https://img.youtube.com/vi/${videos[0].youtubeId}/mqdefault.jpg`, alt: videos[0].alt }
            : null

    const [open, setOpen] = useState(false)

    return (
        <Card className='w-full flex flex-col sm:flex-row gap-4'>
            {thumbnail && media.length > 0 && (
                <>
                    <Tiltable className='sm:w-64 shrink-0 self-stretch'>
                        <button
                            onClick={() => setOpen(true)}
                            aria-label={`View ${title} gallery (${media.length} items)`}
                            className='relative w-full h-full rounded-md overflow-hidden group cursor-pointer'
                        >
                            <img
                                src={thumbnail.src}
                                alt={thumbnail.alt}
                                decoding='async'
                                className='w-full h-full object-cover transition group-hover:brightness-110'
                            />
                            <span className='absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1'>
                                <svg className='w-3 h-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
                                    <rect x='3' y='3' width='7' height='7' rx='1' />
                                    <rect x='14' y='3' width='7' height='7' rx='1' />
                                    <rect x='3' y='14' width='7' height='7' rx='1' />
                                    <rect x='14' y='14' width='7' height='7' rx='1' />
                                </svg>
                                {media.length}
                            </span>
                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition flex items-center justify-center'>
                                <svg className='w-8 h-8 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' aria-hidden='true'>
                                    <path d='M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7' />
                                </svg>
                            </div>
                        </button>
                    </Tiltable>
                    {open && (
                        <GalleryModal
                            title={title}
                            media={media}
                            initialIndex={0}
                            onClose={() => setOpen(false)}
                        />
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
                {projectCredit && <CreditPills credit={projectCredit} />}
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
