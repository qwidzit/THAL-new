import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminList from './AdminList'
import AdminAddEntry from './AdminAddEntry'
import AdminChangelog from './AdminChangelog'
import './admin.css'

export default function AdminApp() {
    const [auth, setAuth] = useState(() => sessionStorage.getItem('thal-admin-auth'))
    const [view, setView] = useState('list')
    const [dataset, setDataset] = useState('classic-main')

    if (!auth) {
        return <AdminLogin onLogin={token => {
            sessionStorage.setItem('thal-admin-auth', token)
            setAuth(token)
        }} />
    }

    return (
        <div className="adm">
            <header className="adm__hd">
                <div className="adm__brand">
                    <img src="/THAL.png" alt="" className="adm__logo" />
                    <span>Admin Panel</span>
                </div>
                <nav className="adm__nav">
                    <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>Manage List</button>
                    <button className={view === 'add' ? 'is-active' : ''} onClick={() => setView('add')}>Add Entry</button>
                    <button
                        className={`adm-btn${view === 'changelog' ? ' adm-btn--active' : ''}`}
                        onClick={() => setView('changelog')}
                    >Changelog</button>
                </nav>
                <button className="adm__logout" onClick={() => {
                    sessionStorage.removeItem('thal-admin-auth')
                    setAuth(null)
                }}>Logout</button>
            </header>

            {view === 'list' && <AdminList auth={auth} dataset={dataset} setDataset={setDataset} />}
            {view === 'add' && <AdminAddEntry auth={auth} dataset={dataset} setDataset={setDataset} />}
            {view === 'changelog' && (<AdminChangelog token={token} />)}
        </div>
    )
}