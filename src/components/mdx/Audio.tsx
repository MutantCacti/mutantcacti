type AudioProps = {
    src: string
    title: string
}

export default function Audio({ src, title }: AudioProps) {
    return (
        <div className='w-full my-6' role='group' aria-label={title}>
            <audio
                controls
                preload='metadata'
                className='w-full audio-player rounded-lg'
                aria-label={title}
            >
                <source src={src} type='audio/mp4' />
            </audio>
        </div>
    )
}
