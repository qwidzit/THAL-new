import { useState } from 'react'

export default function AdminLogin({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const token = btoa(`${username}:${password}`)
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { Authorization: `Basic ${token}` },
            })
            if (res.ok) {
                onLogin(token)
            } else {
                setError('Invalid credentials')
            }
        } catch {
            setError('Connection error — are you on the deployed site?')
        }
        setLoading(false)
    }

    return (
        <div className="adm-login">
            <form className="adm-login__form" onSubmit={handleSubmit}>
                <div className="adm-login__brand">
                    <img src="/THAL.png" alt="" />
                    <span>THAL Admin</span>
                </div>
                <input type="text" placeholder="Username" value={username}
                       onChange={e => setUsername(e.target.value)} autoComplete="username" />
                <input type="password" placeholder="Password" value={password}
                       onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                {error && <div className="adm-login__error">{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    )
}