import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const isAdmin = window.location.pathname.startsWith('/admin')

const { default: Root } = isAdmin
    ? await import('./admin/AdminApp.jsx')
    : await import('./App.jsx')

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
)