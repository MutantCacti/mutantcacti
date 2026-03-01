import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function Layout() {
    return (
        <div className='flex flex-col items-center'>
            <NavBar />
            <main className='w-1/2 flex flex-col items-center'>
                <Outlet />
            </main>
        </div>
    )
}