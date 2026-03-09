import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getPostBySlug, getCategoryBySlug } from '../data/posts'

const SITE = 'mutantcacti'

function getPageTitle(pathname: string): string {
    if (pathname === '/') return 'Profile'

    const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean)

    if (segments[0] === 'projects') return 'Projects'

    if (segments[0] === 'blog') {
        if (segments.length === 1) return 'Blog'
        if (segments.length === 2) {
            const cat = getCategoryBySlug(segments[1])
            return cat ? cat.label : 'Blog'
        }
        if (segments.length === 3) {
            const post = getPostBySlug(segments[2])
            return post ? post.title : 'Blog'
        }
    }

    return 'Not Found'
}

export default function RouteAnnouncer() {
    const { pathname } = useLocation()
    const [announcement, setAnnouncement] = useState('')

    useEffect(() => {
        const page = getPageTitle(pathname)
        document.title = pathname === '/' ? SITE : `${page} - ${SITE}`
        setAnnouncement(page)
    }, [pathname])

    return (
        <div aria-live='assertive' aria-atomic='true' className='sr-only'>
            {announcement}
        </div>
    )
}
