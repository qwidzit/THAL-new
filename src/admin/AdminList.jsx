import { useState, useEffect } from 'react'

const DATASETS = [
    { key: 'classic-main',        label: 'Classic — Main',             file: 'achievements'      },
    { key: 'classic-pending',     label: 'Classic — Pending',          file: 'pending'           },
    { key: 'classic-removed',     label: 'Classic — Removed',          file: 'legacy'            },
    { key: 'classic-timeline',    label: 'Classic — Timeline',         file: 'timeline'          },
    { key: 'platformer-main',     label: 'Platformer — Main',          file: 'platformers'       },
    { key: 'platformer-timeline', label: 'Platformer — Timeline',      file: 'platformertimeline'},
]

export default function AdminList({ auth, dataset, setDataset }) {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)
    const [dragIndex, setDragIndex] = useState(null)

    const ds = DATASETS.find(d => d.key === dataset) || DATASETS[0]

    useEffect(() => {
        setLoading(true)
        setStatus(null)
        fetch(`/api/data?file=${ds.file}`, {
            headers: { Authorization: `Basic ${auth}` },
        })
            .then(r => r.json())
            .then(data => { setEntries(data); setLoading(false) })
            .catch(() => { setStatus({ ok: false, msg: 'Failed to load data' }); setLoading(false) })
    }, [dataset, auth])

    const rerank = (list) => list.map((e, i) => ({ ...e, rank: i + 1 }))

    const handleDragStart = (i) => setDragIndex(i)
    const handleDragOver = (e, i) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === i) return
        const next = [...entries]
        const [item] = next.splice(dragIndex, 1)
        next.splice(i, 0, item)
        setEntries(rerank(next))
        setDragIndex(i)
    }
    const handleDragEnd = () => setDragIndex(null)

    const handleDelete = (idx) => {
        if (!confirm(`Delete "${entries[idx].name}"?`)) return
        setEntries(rerank(entries.filter((_, i) => i !== idx)))
    }

    const handleSave = async () => {
        setSaving(true)
        setStatus(null)
        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: ds.file, data: entries }),
            })
            if (res.ok) {
                setStatus({ ok: true, msg: 'Saved! Site will rebuild in ~30–60 seconds.' })
            } else {
                const err = await res.json().catch(() => ({}))
                setStatus({ ok: false, msg: err.error || 'Save failed' })
            }
        } catch {
            setStatus({ ok: false, msg: 'Network error' })
        }
        setSaving(false)
    }

    return (
        <div className="adm-list">
            <div className="adm-list__toolbar">
                <select value={dataset} onChange={e => setDataset(e.target.value)}>
                    {DATASETS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
                <span className="adm-list__count">{entries.length} entries</span>
                <button className="adm-list__save" onClick={handleSave} disabled={saving || loading}>
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {status && (
                <div className={`adm-status ${status.ok ? 'is-ok' : 'is-err'}`}>{status.msg}</div>
            )}

            {loading ? (
                <div className="adm-list__loading">Loading…</div>
            ) : (
                <div className="adm-list__entries">
                    {entries.map((entry, i) => (
                        <div
                            key={entry.id ?? i}
                            className={`adm-entry${dragIndex === i ? ' is-dragging' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={e => handleDragOver(e, i)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="adm-entry__drag">⠿</div>
                            <div className="adm-entry__rank">#{entry.rank ?? i + 1}</div>
                            {entry.thumbnail
                                ? <img className="adm-entry__thumb" src={entry.thumbnail} alt="" loading="lazy" />
                                : <div className="adm-entry__thumb adm-entry__thumb--empty" />
                            }
                            <div className="adm-entry__info">
                                <div className="adm-entry__name">{entry.name}</div>
                                <div className="adm-entry__player">by {entry.player}</div>
                            </div>
                            <div className="adm-entry__tags">
                                {(entry.tags ?? []).map(t => <span key={t} className="adm-entry__tag">{t}</span>)}
                            </div>
                            <button className="adm-entry__del" onClick={() => handleDelete(i)} title="Delete">✕</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}