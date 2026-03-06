type YouTubeProps = {
    id: string
    title?: string
}

export default function YouTube({ id, title = 'YouTube video' }: YouTubeProps) {
    return (
        <div className="aspect-video w-full my-6">
            <iframe
                src={`https://www.youtube-nocookie.com/embed/${id}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg border border-border"
            />
        </div>
    )
}
