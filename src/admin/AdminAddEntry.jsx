import { useState } from 'react'

const CLASSIC_TAGS = [
    'Level','Challenge','2P','Low Hertz','Progress','Consistency',
    'Verified','Rated','Formerly Rated','CBF','Tentative',
    'Outdated Version','Coin Route','Noclip','Speedhack','Mobile','Miscellaneous',
]
const PLATFORMER_TAGS = [
    'Platformer','Deathless','Coin Route','Rated','Verified',
    'Consistency','Progress','Speedrun','Low Hertz','Mobile','Outdated Version',
]

const DATASETS = [
    { key: 'classic-main',        label: 'Classic — Main',        file: 'achievements',       tags: CLASSIC_TAGS    },
    { key: 'classic-pending',     label: 'Classic — Pending',     file: 'pending',            tags: CLASSIC_TAGS    },
    { key: 'classic-removed',     label: 'Classic — Removed',     file: 'legacy',             tags: CLASSIC_TAGS    },
    { key: 'classic-timeline',    label: 'Classic — Timeline',    file: 'timeline',           tags: CLASSIC_TAGS    },
    { key: 'platformer-main',     label: 'Platformer — Main',     file: 'platformers',        tags: PLATFORMER_TAGS },
    { key: 'platformer-timeline', label: 'Platformer — Timeline', file: 'platformertimeline', tags: PLATFORMER_TAGS },
]

function getYouTubeEmbed(url) {
    if (!url) return null
    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    ]
    for (const p of patterns) {
        const m = url.match(p)
        if (m) return `https://www.youtube.com/embed/${m[1]}`
    }
    return null
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const EMPTY = {
    name: '', player: '', date: '', length: '', version: '2.2',
    levelID: '', video: '', showcaseVideo: '', thumbnail: '', tags: [],
}

export default function AdminAddEntry({ auth, dataset, setDataset }) {
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState(null)

    const ds = DATASETS.find(d => d.key === dataset) || DATASETS[0]
    const set = (field, val) => setForm(f => ({ ...f, [field]: val }))
    const toggleTag = t => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setStatus(null)
        try {
            const fetchRes = await fetch(`/api/data?file=${ds.file}`, {
                headers: { Authorization: `Basic ${auth}` },
            })
            const current = await fetchRes.json()

            const entry = {
                name: form.name,
                id: slugify(form.name),
                player: form.player,
                date: form.date || new Date().toISOString().split('T')[0],
                version: parseFloat(form.version) || 2.2,
                rank: current.length + 1,
                tags: form.tags,
                ...(form.length    && { length: Number(form.length) }),
                ...(form.levelID   && { levelID: form.levelID }),
                ...(form.video     && { video: form.video }),
                ...(form.showcaseVideo && { showcaseVideo: form.showcaseVideo }),
                ...(form.thumbnail && { thumbnail: form.thumbnail }),
            }

            const saveRes = await fetch('/api/save', {
                method: 'POST',
                headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: ds.file, data: [...current, entry] }),
            })

            if (saveRes.ok) {
                setStatus({ ok: true, msg: `"${entry.name}" added at rank #${entry.rank}. Site rebuilds in ~30s.` })
                setForm(EMPTY)
            } else {
                setStatus({ ok: false, msg: 'Save failed' })
            }
        } catch {
            setStatus({ ok: false, msg: 'Network error' })
        }
        setSaving(false)
    }

    const videoEmbed    = getYouTubeEmbed(form.video)
    const showcaseEmbed = getYouTubeEmbed(form.showcaseVideo)

    return (
        <div className="adm-add">
            <div className="adm-add__toolbar">
                <select value={dataset} onChange={e => setDataset(e.target.value)}>
                    {DATASETS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
            </div>

            <form className="adm-add__form" onSubmit={handleSubmit}>

                <div className="adm-add__row">
                    <label><span>Name *</span>
                        <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Level name" />
                    </label>
                    <label><span>Player *</span>
                        <input required value={form.player} onChange={e => set('player', e.target.value)} placeholder="Player name" />
                    </label>
                </div>

                <div className="adm-add__row">
                    <label><span>Date</span>
                        <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                    </label>
                    <label><span>Length (s)</span>
                        <input type="number" value={form.length} onChange={e => set('length', e.target.value)} placeholder="e.g. 124" />
                    </label>
                    <label><span>Version</span>
                        <input value={form.version} onChange={e => set('version', e.target.value)} placeholder="2.2" />
                    </label>
                    <label><span>Level ID</span>
                        <input value={form.levelID} onChange={e => set('levelID', e.target.value)} placeholder="e.g. 87665224" />
                    </label>
                </div>

                <div className="adm-add__section">
                    <span className="adm-add__lbl">Tags</span>
                    <div className="adm-add__tags">
                        {ds.tags.map(t => (
                            <button type="button" key={t}
                                    className={`adm-tag${form.tags.includes(t) ? ' is-on' : ''}`}
                                    onClick={() => toggleTag(t)}>{t}</button>
                        ))}
                    </div>
                </div>

                <div className="adm-add__section">
                    <span className="adm-add__lbl">Achievement Video</span>
                    <input value={form.video} onChange={e => set('video', e.target.value)} placeholder="Paste YouTube URL…" />
                    {videoEmbed && (
                        <div className="adm-add__embed">
                            <iframe src={videoEmbed} allowFullScreen title="Video preview" />
                        </div>
                    )}
                </div>

                <div className="adm-add__section">
                    <span className="adm-add__lbl">Showcase Video</span>
                    <input value={form.showcaseVideo} onChange={e => set('showcaseVideo', e.target.value)} placeholder="Paste YouTube URL…" />
                    {showcaseEmbed && (
                        <div className="adm-add__embed">
                            <iframe src={showcaseEmbed} allowFullScreen title="Showcase preview" />
                        </div>
                    )}
                </div>

                <div className="adm-add__section">
                    <span className="adm-add__lbl">Thumbnail</span>
                    <input value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="Paste image URL…" />
                    {form.thumbnail && (
                        <div className="adm-add__thumb-preview">
                            <img src={form.thumbnail} alt="Preview" />
                        </div>
                    )}
                </div>

                {status && <div className={`adm-status ${status.ok ? 'is-ok' : 'is-err'}`}>{status.msg}</div>}

                <button type="submit" className="adm-add__submit" disabled={saving}>
                    {saving ? 'Adding…' : 'Add Entry'}
                </button>
            </form>
        </div>
    )
}