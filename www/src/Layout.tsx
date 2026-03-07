import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function Layout() {
    return (
        <div className='flex flex-col items-center'>
            <NavBar />
            <main className='w-[92%] md:w-2/3 lg:w-1/2 flex flex-col items-center'>
                <Outlet />
            </main>
            <div className='text-text-muted text-sm py-6 flex flex-col items-center gap-1'>
                <a href='mailto:feedback@mutantcacti.com' className='hover:text-accent-light transition-colors'>Feedback</a>
                <span>© 2026 Maxence Morel Dierckx. All rights reserved.</span>
            </div>
        </div>
    )
}