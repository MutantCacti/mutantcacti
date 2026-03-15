import { useState } from 'react'

export default function AccessPage({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            })

            if (!res.ok) {
                setError('Invalid password')
                return
            }

            onLogin()
        } catch {
            setError('Connection failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    autoFocus
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-text
                               placeholder:text-text-muted
                               focus-visible:outline-none focus-visible:border-accent"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading || !password}
                    className="bg-accent text-bg rounded-lg px-3 py-2 font-medium
                               hover:bg-accent-light disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </main>
    )
}
