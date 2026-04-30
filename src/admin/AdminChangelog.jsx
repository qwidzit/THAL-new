import { useState, useEffect } from 'react'

const FILE_LABELS = {
    achievements:       'Classic Main',
    pending:            'Classic Pending',
    legacy:             'Classic Removed',
    timeline:           'Classic Timeline',
    platformers:        'Platformer Main',
    platformertimeline: 'Platformer Timeline',
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function fmt(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

export default function AdminChangelog({ token }) {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState('')
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetch('/api/data?file=changelog', {
            headers: { Authorization: 'Basic ' + token },
        })
            .then(r => r.json())
            .then(d => { setEntries(d); setLoading(false) })
            .catch(() => { setStatus('Failed to load changelog'); setLoading(false) })
    }, [token])

    function handleDelete(id) {
        setEntries(prev => prev.filter(e => e.id !== id))
        setDirty(true)
    }

    async function handleSave() {
        setSaving(true)
        setStatus('')
        try {
            const res = await fetch('/api/save?file=changelog', {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entries),
            })
            const data = await res.json()
            if (res.ok) {
                setStatus('Saved! Rebuild triggered (~30s)')
                setDirty(false)
            } else {
                setStatus('Error: ' + (data.error || res.status))
            }
        } catch {
            setStatus('Network error')
        }
        setSaving(false)
    }

    if (loading) return <div className="adm-status">Loading…</div>

    const reversed = [...entries].reverse()

    return (
        <div className="adm-list-wrap">
            <div className="adm-list-toolbar">
                <span className="adm-list-count">{entries.length} changelog {entries.length === 1 ? 'entry' : 'entries'}</span>
                {status && <span className="adm-list-status">{status}</span>}
                <button
                    className="adm-btn adm-btn--primary"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>

            {entries.length === 0
                ? <div className="adm-status">No changelog entries yet.</div>
                : (
                    <div className="adm-list">
                        {reversed.map(entry => {
                            const list = FILE_LABELS[entry.fileKey] || entry.fileKey
                            let desc = ''
                            if (entry.type === 'added')   desc = `Added at #${entry.rank} on ${list}`
                            if (entry.type === 'removed') desc = `Removed from #${entry.rank} on ${list}`
                            if (entry.type === 'moved')   desc = `Moved #${entry.fromRank}→#${entry.toRank} on ${list}`
                            return (
                                <div key={entry.id} className="adm-row" style={{ cursor: 'default' }}>
                                    <span className={`adm-row__tag adm-cl--${entry.type}`}>{entry.type}</span>
                                    <div className="adm-row__info">
                                        <span className="adm-row__name">{entry.levelName}</span>
                                        <span className="adm-row__sub">{desc} · {fmt(entry.timestamp)}</span>
                                    </div>
                                    <button className="adm-btn adm-btn--danger" onClick={() => handleDelete(entry.id)}>✕</button>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div>
    )
}