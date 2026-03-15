import { useState, useEffect } from 'react'
import AccessPage from './pages/AccessPage'
import TransferPage from './pages/TransferPage'
import HelpPage from './pages/HelpPage'

export default function App() {
    const [authed, setAuthed] = useState(null)
    const [page, setPage] = useState('transfer')

    useEffect(() => {
        fetch('/api/auth/check', { credentials: 'include' })
            .then(res => setAuthed(res.ok))
            .catch(() => setAuthed(false))
    }, [])

    if (authed === null) return null

    if (!authed) return <AccessPage onLogin={() => setAuthed(true)} />

    if (page === 'help') return <HelpPage onBack={() => setPage('transfer')} />

    return <TransferPage onHelp={() => setPage('help')} />
}
