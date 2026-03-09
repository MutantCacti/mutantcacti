export default function CreditPills({ credit, className }: { credit: string; className?: string }) {
    const names = credit.split(',').map(s => s.trim()).filter(s => !s.startsWith('@'))
    if (names.length === 0) return null

    return (
        <ul className={`flex flex-wrap gap-2${className ? ` ${className}` : ''}`}>
            {names.map(name => (
                <li key={name} className='bg-accent-dark/10 hover:bg-accent-light/10 transition delay-75 duration-100 ease-in backdrop-blur-sm text-xs px-2 py-1 rounded-full text-accent-light whitespace-nowrap'>
                    {name}
                </li>
            ))}
        </ul>
    )
}
