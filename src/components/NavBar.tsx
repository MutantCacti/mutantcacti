import { Link, NavLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <nav className='w-[92%] md:w-2/3 lg:w-1/2 bg-surface border border-border rounded-lg p-2 flex items-center gap-2 mt-6 mb-6'>
            <Link to='/' draggable={false} aria-label='Home'><img src='/favicon.svg' alt='' className='w-8 h-8 mx-1 hover:rotate-360 transition-transform duration-700 ease-in-out' /></Link>
            <div className='bg-transparent flex-1'/>
            <NavLink to='/' end className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Profile</NavLink>
            <NavLink to='/projects' className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Projects</NavLink>
            <NavLink to='/blog' className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Blog</NavLink>
        </nav>
    )
}
