export default function Credit({ name, handle }: { name: string; handle?: string }) {
    return (
        <span className='inline-flex flex-col text-sm not-prose'>
            {handle && <span className='text-xs text-text-muted'>{handle}</span>}
            <span className='text-accent-light'>{name}</span>
        </span>
    )
}
