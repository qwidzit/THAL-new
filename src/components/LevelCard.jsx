const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

export default function LevelCard({ achievement: a, index, isTimeline, onClick }) {
    const podiumRank = isTimeline ? null : (a.rank ?? index + 1)
    const isPodium = !isTimeline && index < 3
    const isFirst = !isTimeline && index === 0

    return (
        <article
            className={`card${isPodium ? ' is-podium' : ''}${isFirst ? ' is-first' : ''}${isTimeline ? ' is-timeline' : ''}`}
            onClick={() => onClick(a)}
        >
            <div className="card__content">
                <div className="card__detail">
                    <div className="card__detail-top">
                        <div className="card__rank-row">
                            {isTimeline ? (
                                <span className="card__rank-badge">{formatDate(a.date)}</span>
                            ) : (
                                <>
                  <span className="card__rank-badge">
                    #{podiumRank}
                  </span>
                                    {isFirst && <span className="card__rank-pin">HARDEST</span>}
                                </>
                            )}
                        </div>
                        <h2 className="card__name">{a.name}</h2>
                        <div className="card__player">
                            <span className="card__player-by">by</span>
                            <span className="card__player-name">{a.player}</span>
                        </div>
                    </div>

                    <div className="card__detail-bottom">
                        <div className="card__stats">
                            {!!a.length && (
                                <div><span className="lbl">LEN</span><span className="val">{a.length}<i>s</i></span></div>
                            )}
                            {!isTimeline && (
                                <div><span className="lbl">DATE</span><span className="val">{formatDate(a.date)}</span></div>
                            )}
                            <div><span className="lbl">VER</span><span className="val">{a.version ?? '2.2'}</span></div>
                        </div>
                        <div className="card__tags">
                            {(a.tags ?? []).map(t => (
                                <span key={t} className="card__tag">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card__thumb">
                {a.thumbnail
                    ? <img src={a.thumbnail} alt="" loading="lazy" />
                    : <div className="card__thumb-placeholder" />
                }
                <div className="card__thumb-fade" />
                {a.levelID != null && (
                    <div className="card__thumb-corner">
                        <span>LVL.ID</span>
                        <strong>{a.levelID}</strong>
                    </div>
                )}
            </div>
        </article>
    )
}