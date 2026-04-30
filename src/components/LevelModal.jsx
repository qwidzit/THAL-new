import { useEffect } from 'react'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
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

                <div className="modal__thumb">
                    {a.thumbnail && <img src={a.thumbnail} alt={a.name} />}
                    <div className="modal__thumb-fade" />
                    <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
                </div>

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

                    <div className="modal__links">
                        {a.video && (
                            <a href={a.video} target="_blank" rel="noopener noreferrer" className="modal__link modal__link--primary">
                                Watch Achievement ↗
                            </a>
                        )}
                        {a.showcaseVideo && (
                            <a href={a.showcaseVideo} target="_blank" rel="noopener noreferrer" className="modal__link">
                                Level Showcase ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}