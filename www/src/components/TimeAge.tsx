import { useState, useEffect } from 'react'

type TimeAgeProps = {
    date: string // YYYY-MM-DD
    className?: string
}

function formatAge(date: string): string {
    const then = new Date(date + 'T00:00:00')
    const now = new Date()
    const diffMs = now.getTime() - then.getTime()

    if (diffMs < 0) return 'in the future'

    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`

    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30.44)
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`

    const years = Math.floor(days / 365.25)
    return `${years} year${years !== 1 ? 's' : ''} ago`
}

export default function TimeAge({ date, className }: TimeAgeProps) {
    const [age, setAge] = useState(() => formatAge(date))

    useEffect(() => {
        const id = setInterval(() => setAge(formatAge(date)), 1000)
        return () => clearInterval(id)
    }, [date])

    return <time dateTime={date} className={className}>{age}</time>
}
