import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import NavBar from './components/NavBar'
import RouteAnnouncer from './components/RouteAnnouncer'

export default function Layout() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])

    return (
        <div className='flex flex-col items-center'>
            <RouteAnnouncer />
            <a href='#main' className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bg focus:text-accent-light focus:px-4 focus:py-2 focus:rounded focus:outline-2 focus:outline-highlight'>Skip to content</a>
            <NavBar />
            <main id='main' className='w-[92%] max-w-[720px] flex flex-col items-center'>
                <Outlet />
            </main>
            <footer className='text-text-muted text-sm py-6 flex flex-col items-center gap-1'>
                <a href='mailto:mutantcacti@gmail.com' aria-label='Send feedback via email' className='underline decoration-text-muted underline-offset-2 hover:text-accent-light hover:decoration-accent-light transition-colors'>Feedback</a>
                <span>© 2026 Maxence Morel Dierckx. All rights reserved.</span>
            </footer>
        </div>
    )
}