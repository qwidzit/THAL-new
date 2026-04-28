import { useEffect } from 'react'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

function getYouTubeEmbed(url) {
    if (!url) return null
    const timeMatch = url.match(/[?&]t=(\d+)/)
    const start = timeMatch ? timeMatch[1] : null

    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ]
    let videoId = null
    for (const p of patterns) {
        const m = url.match(p)
        if (m) { videoId = m[1]; break }
    }
    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ''}`
}

function VideoEmbed({ url, label }) {
    const embedUrl = getYouTubeEmbed(url)
    if (!embedUrl) return null
    return (
        <div className="modal__embed-section">
            <span className="modal__embed-label">{label}</span>
            <div className="modal__embed">
                <iframe
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={label}
                />
            </div>
        </div>
    )
}

export default function LevelModal({ level: a, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [onClose])

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

                {a.thumbnail && (
                    <div className="modal__thumb">
                        <img src={a.thumbnail} alt={a.name} />
                        <div className="modal__thumb-fade" />
                    </div>
                )}

                <div className="modal__body">
                    <div className="modal__top-row">
                        {a.rank != null && (
                            <span className="modal__rank">#{a.rank}</span>
                        )}
                        <div className="modal__tags">
                            {(a.tags ?? []).map(t => (
                                <span key={t} className="modal__tag">{t}</span>
                            ))}
                        </div>
                    </div>

                    <h2 className="modal__name">{a.name}</h2>
                    <div className="modal__player">
                        <span className="modal__player-by">by</span>
                        <span className="modal__player-name">{a.player}</span>
                    </div>

                    <div className="modal__stats">
                        {!!a.length && (
                            <div className="modal__stat">
                                <span className="lbl">LENGTH</span>
                                <span className="val">{a.length}s</span>
                            </div>
                        )}
                        <div className="modal__stat">
                            <span className="lbl">DATE</span>
                            <span className="val">{formatDate(a.date)}</span>
                        </div>
                        <div className="modal__stat">
                            <span className="lbl">VERSION</span>
                            <span className="val">{a.version ?? '2.2'}</span>
                        </div>
                        {a.levelID != null && (
                            <div className="modal__stat">
                                <span className="lbl">LEVEL ID</span>
                                <span className="val">{a.levelID}</span>
                            </div>
                        )}
                        {a.submitter && (
                            <div className="modal__stat">
                                <span className="lbl">SUBMITTED BY</span>
                                <span className="val">{a.submitter}</span>
                            </div>
                        )}
                    </div>

                    <VideoEmbed url={a.video} label="ACHIEVEMENT" />
                    <VideoEmbed url={a.showcaseVideo} label="SHOWCASE" />

                    <div className="modal__links">
                        {a.video && (
                            <a href={a.video} target="_blank" rel="noopener noreferrer" className="modal__link modal__link--primary">
                                Open Achievement ↗
                            </a>
                        )}
                        {a.showcaseVideo && (
                            <a href={a.showcaseVideo} target="_blank" rel="noopener noreferrer" className="modal__link">
                                Open Showcase ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}