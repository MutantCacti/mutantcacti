import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function Layout() {
    return (
        <div className='flex flex-col items-center'>
            <NavBar />
            <main className='w-[92%] md:w-2/3 lg:w-1/2 flex flex-col items-center'>
                <Outlet />
            </main>
            <footer className='text-text-muted text-sm py-6 flex flex-col items-center gap-1'>
                <a href='mailto:feedback@mutantcacti.com' aria-label='Send feedback via email' className='underline decoration-text-muted underline-offset-2 hover:text-accent-light hover:decoration-accent-light transition-colors'>Feedback</a>
                <span>© 2026 Maxence Morel Dierckx. All rights reserved.</span>
            </footer>
        </div>
    )
}