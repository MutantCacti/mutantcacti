import { NavLink } from 'react-router-dom'

export default function NavBar() {
    return (
        <nav className="w-1/2 bg-surface border border-border rounded-lg p-2 flex items-center gap-2 mt-6 mb-6">
            <img src="/favicon.svg" alt="Logo" className="w-8 h-8 mx-1" />
            <div className='bg-transparent flex-1'/>
            <NavLink to="/" end className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Profile</NavLink>
            <NavLink to="/projects" className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Projects</NavLink>
            <NavLink to="/blog" className={({ isActive }) =>
                `px-4 py-2 rounded ${isActive ? 'bg-border text-accent-light' : 'hover:bg-border text-text'}`
            }>Blog</NavLink>
        </nav>
    )
}
