import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import App from './App.jsx'
import AdminApp from './admin/AdminApp.jsx'

const Root = window.location.pathname.startsWith('/admin') ? AdminApp : App

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
)