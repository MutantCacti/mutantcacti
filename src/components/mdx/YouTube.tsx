type YouTubeProps = {
    id: string
    title: string
    alt?: string
}

export default function YouTube({ id, title, alt }: YouTubeProps) {
    const descId = alt ? `yt-desc-${id}` : undefined

    return (
        <div className='aspect-video w-full my-6' role='group' aria-label={title}>
            {alt && <p id={descId} className='sr-only'>{alt}</p>}
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={title}
                aria-describedby={descId}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                className='w-full h-full rounded-lg border border-border'
            />
        </div>
    )
}
