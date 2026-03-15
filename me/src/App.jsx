import { useState, useEffect } from 'react'
import AccessPage from './pages/AccessPage'
import TransferPage from './pages/TransferPage'

export default function App() {
    const [authed, setAuthed] = useState(null)

    useEffect(() => {
        fetch('/api/auth/check', { credentials: 'include' })
            .then(res => setAuthed(res.ok))
            .catch(() => setAuthed(false))
    }, [])

    if (authed === null) return null

    if (!authed) return <AccessPage onLogin={() => setAuthed(true)} />

    return <TransferPage />
}
