import { useState, useEffect, useRef } from 'react'

import { useState, useEffect, useRef, useCallback } from 'react'

let _idSeq = 0
function genId() {
    return `${Date.now()}-${++_idSeq}-${Math.random().toString(36).slice(2, 6)}`
}

function entryKey(e) {
    return e.id ?? `${e.name}|${e.player}`
}

function detectChanges(original, current, fileKey) {
    const origMap = new Map(original.map(e => [entryKey(e), e]))
    const currMap = new Map(current.map(e => [entryKey(e), e]))
    const ts = new Date().toISOString()
    const changes = []

    for (const [k, e] of currMap) {
        if (!origMap.has(k)) {
            changes.push({ id: genId(), timestamp: ts, type: 'added', levelName: e.name, player: e.player, fileKey, rank: e.rank })
        }
    }
    for (const [k, e] of origMap) {
        if (!currMap.has(k)) {
            changes.push({ id: genId(), timestamp: ts, type: 'removed', levelName: e.name, player: e.player, fileKey, rank: e.rank })
        }
    }

    const moves = []
    for (const [k, curr] of currMap) {
        const orig = origMap.get(k)
        if (!orig) continue
        const delta = Math.abs((curr.rank ?? 0) - (orig.rank ?? 0))
        if (delta >= 3) moves.push({ curr, orig, delta })
    }
    moves.sort((a, b) => b.delta - a.delta)
    for (const { curr, orig } of moves.slice(0, 5)) {
        changes.push({ id: genId(), timestamp: ts, type: 'moved', levelName: curr.name, player: curr.player, fileKey, fromRank: orig.rank, toRank: curr.rank })
    }

    return changes
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
function fmt(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

const ALL_TAGS = [
    'Level','Challenge','2P','Low Hertz','Progress','Consistency',
    'Verified','Rated','Formerly Rated','CBF','Tentative',
    'Outdated Version','Coin Route','Noclip','Speedhack','Mobile','Miscellaneous',
    'Platformer','Deathless','Speedrun',
]

function youtubeEmbed(url) {
    if (!url) return null
    const m =
        url.match(/youtu\.be\/([^?&\s]+)/) ||
        url.match(/youtube\.com\/(?:watch\?v=|live\/)([^?&\s]+)/)
    if (!m) return null
    const t = url.match(/[?&]t=(\d+)/)
    return `https://www.youtube.com/embed/${m[1]}${t ? `?start=${t[1]}` : ''}`
}

function EditPanel({ entry, onSave, onCancel }) {
    const [form, setForm] = useState({
        name:         entry.name         ?? '',
        player:       entry.player       ?? '',
        date:         entry.date         ?? '',
        length:       entry.length       ?? '',
        version:      entry.version      ?? '2.2',
        levelID:      entry.levelID      ?? '',
        video:        entry.video        ?? '',
        showcaseVideo:entry.showcaseVideo?? '',
        thumbnail:    entry.thumbnail    ?? '',
        submitter:    entry.submitter    ?? '',
        tags:         entry.tags         ?? [],
    })

    function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

    function toggleTag(t) {
        setForm(f => {
            const tags = f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
            return { ...f, tags }
        })
    }

    function handleSave() {
        const updated = {
            ...entry,
            name:          form.name.trim(),
            player:        form.player.trim(),
            date:          form.date       || undefined,
            length:        form.length     ? Number(form.length)  : undefined,
            version:       form.version    || '2.2',
            levelID:       form.levelID    ? Number(form.levelID) : undefined,
            video:         form.video.trim()         || undefined,
            showcaseVideo: form.showcaseVideo.trim() || undefined,
            thumbnail:     form.thumbnail.trim()     || undefined,
            submitter:     form.submitter.trim()     || undefined,
            tags:          form.tags,
        }
        Object.keys(updated).forEach(k => updated[k] === undefined && delete updated[k])
        onSave(updated)
    }

    const embedV = youtubeEmbed(form.video)
    const embedS = youtubeEmbed(form.showcaseVideo)

    return (
        <div className="adm-edit-panel">
            <div className="adm-add__grid">
                <label className="adm-field">
                    <span>Level Name</span>
                    <input value={form.name} onChange={e => set('name', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Player</span>
                    <input value={form.player} onChange={e => set('player', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Date (YYYY-MM-DD)</span>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Length (seconds)</span>
                    <input type="number" value={form.length} onChange={e => set('length', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Version</span>
                    <input value={form.version} onChange={e => set('version', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Level ID</span>
                    <input type="number" value={form.levelID} onChange={e => set('levelID', e.target.value)} />
                </label>
                <label className="adm-field">
                    <span>Submitter</span>
                    <input value={form.submitter} onChange={e => set('submitter', e.target.value)} />
                </label>
            </div>

            <div className="adm-field">
                <span>Achievement Video URL</span>
                <input value={form.video} onChange={e => set('video', e.target.value)} placeholder="https://youtu.be/..." />
            </div>
            {embedV && <div className="adm-embed"><iframe src={embedV} title="Achievement" allowFullScreen /></div>}

            <div className="adm-field">
                <span>Showcase Video URL</span>
                <input value={form.showcaseVideo} onChange={e => set('showcaseVideo', e.target.value)} placeholder="https://youtu.be/..." />
            </div>
            {embedS && <div className="adm-embed"><iframe src={embedS} title="Showcase" allowFullScreen /></div>}

            <div className="adm-field">
                <span>Thumbnail URL</span>
                <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg" />
            </div>
            {form.thumbnail && (
                <div className="adm-thumb-preview"><img src={form.thumbnail} alt="thumbnail preview" /></div>
            )}

            <div className="adm-field">
                <span>Tags</span>
                <div className="adm-tag-grid">
                    {ALL_TAGS.map(t => (
                        <button
                            key={t}
                            type="button"
                            className={`adm-tag-btn${form.tags.includes(t) ? ' is-on' : ''}`}
                            onClick={() => toggleTag(t)}
                        >{t}</button>
                    ))}
                </div>
            </div>

            <div className="adm-edit-panel__actions">
                <button className="adm-btn adm-btn--primary" onClick={handleSave}>Apply changes</button>
                <button className="adm-btn adm-btn--ghost" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    )
}

export default function AdminList({ token, fileKey }) {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState('')
    const [dirty, setDirty] = useState(false)
    const [editingIdx, setEditingIdx] = useState(null)
    const dragIdx = useRef(null)
    const originalRef = useRef([])

    useEffect(() => {
        setLoading(true)
        setDirty(false)
        setStatus('')
        setEditingIdx(null)
        fetch(`/api/data?file=${fileKey}`, {
            headers: { Authorization: 'Basic ' + token },
        })
            .then(r => r.json())
            .then(d => { setEntries(d); originalRef.current = d; setLoading(false) })
            .catch(() => { setStatus('Failed to load data'); setLoading(false) })
    }, [fileKey, token])

    function handleDragStart(i) { dragIdx.current = i }

    function handleDrop(i) {
        const from = dragIdx.current
        if (from === null || from === i) return
        const next = [...entries]
        const [moved] = next.splice(from, 1)
        next.splice(i, 0, moved)
        const reranked = next.map((e, idx) => ({ ...e, rank: idx + 1 }))
        setEntries(reranked)
        setDirty(true)
        dragIdx.current = null
    }

    function handleDelete(i) {
        if (!confirm(`Delete "${entries[i].name}"?`)) return
        const next = entries.filter((_, idx) => idx !== i)
        const reranked = next.map((e, idx) => ({ ...e, rank: idx + 1 }))
        setEntries(reranked)
        setDirty(true)
        if (editingIdx === i) setEditingIdx(null)
    }

    function handleEditSave(i, updated) {
        setEntries(entries.map((e, idx) => idx === i ? updated : e))
        setDirty(true)
        setEditingIdx(null)
    }

    async function handleSave() {
        setSaving(true)
        setStatus('')
        try {
            const res = await fetch(`/api/save?file=${fileKey}`, {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entries),
            })
            const data = await res.json()
            if (res.ok) {
                const newChanges = detectChanges(originalRef.current, entries, fileKey)
                if (newChanges.length > 0) {
                    try {
                        const clRes = await fetch('/api/data?file=changelog', {
                            headers: { Authorization: 'Basic ' + token },
                        })
                        const currentLog = await clRes.json()
                        await fetch('/api/save?file=changelog', {
                            method: 'POST',
                            headers: { Authorization: 'Basic ' + token, 'Content-Type': 'application/json' },
                            body: JSON.stringify([...currentLog, ...newChanges]),
                        })
                    } catch {
                        // changelog update failure is non-fatal
                    }
                }
                originalRef.current = entries
                setStatus('Saved! Rebuild triggered (~30s)')
                setDirty(false)
            } else {
                setStatus('Error: ' + (data.error || res.status))
            }
        } catch (e) {
            setStatus('Network error')
        }
        setSaving(false)
    }
    
    if (loading) return <div className="adm-status">Loading…</div>

    return (
        <div className="adm-list-wrap">
            <div className="adm-list-toolbar">
                <span className="adm-list-count">{entries.length} entries</span>
                {status && <span className="adm-list-status">{status}</span>}
                <button
                    className="adm-btn adm-btn--primary"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </div>

            <div className="adm-list">
                {entries.map((e, i) => (
                    <div key={e.id ?? i} className="adm-row-wrap">
                        <div
                            className={`adm-row${editingIdx === i ? ' is-editing' : ''}`}
                            draggable={editingIdx !== i}
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={ev => ev.preventDefault()}
                            onDrop={() => handleDrop(i)}
                        >
                            <span className="adm-row__drag">⠿</span>
                            <span className="adm-row__rank">#{e.rank ?? i + 1}</span>
                            <div className="adm-row__thumb">
                                {e.thumbnail
                                    ? <img src={e.thumbnail} alt="" />
                                    : <div className="adm-row__thumb-ph" />
                                }
                            </div>
                            <div className="adm-row__info">
                                <span className="adm-row__name">{e.name}</span>
                                <span className="adm-row__sub">by {e.player} · {fmt(e.date)}</span>
                            </div>
                            <div className="adm-row__tags">
                                {(e.tags ?? []).map(t => <span key={t} className="adm-row__tag">{t}</span>)}
                            </div>
                            <button
                                className="adm-btn"
                                onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                            >
                                {editingIdx === i ? 'Close' : 'Edit'}
                            </button>
                            <button className="adm-btn adm-btn--danger" onClick={() => handleDelete(i)}>✕</button>
                        </div>

                        {editingIdx === i && (
                            <EditPanel
                                entry={e}
                                onSave={updated => handleEditSave(i, updated)}
                                onCancel={() => setEditingIdx(null)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}