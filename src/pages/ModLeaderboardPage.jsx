import { useState } from 'react'
import achievementsData from '../../data/achievements.json'
import pendingData from '../../data/pending.json'
import legacyData from '../../data/legacy.json'
import timelineData from '../../data/timeline.json'
import platformersData from '../../data/platformers.json'
import platformerTimelineData from '../../data/platformertimeline.json'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function fmt(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

const LIST_LABEL = {
    achievements:       'Classic Main',
    pending:            'Classic Pending',
    legacy:             'Classic Removed',
    timeline:           'Classic Timeline',
    platformers:        'Platformer Main',
    platformertimeline: 'Platformer Timeline',
}

function buildModBoard() {
    const all = [
        ...achievementsData.map(e => ({ ...e, _list: 'achievements' })),
        ...pendingData.map(e => ({ ...e, _list: 'pending' })),
        ...legacyData.map(e => ({ ...e, _list: 'legacy' })),
        ...timelineData.map(e => ({ ...e, _list: 'timeline' })),
        ...platformersData.map(e => ({ ...e, _list: 'platformers' })),
        ...platformerTimelineData.map(e => ({ ...e, _list: 'platformertimeline' })),
    ].filter(e => e.submitter)

    const map = new Map()
    for (const e of all) {
        if (!map.has(e.submitter)) map.set(e.submitter, [])
        map.get(e.submitter).push(e)
    }
    return [...map.entries()].map(([name, submissions]) => {
        const best = [...submissions].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))[0]
        return { name, submissions, pts: submissions.length, best }
    }).sort((a, b) => b.pts - a.pts)
}

const MOD_BOARD = buildModBoard()
const MEDALS = ['gold', 'silver', 'bronze']

export default function ModLeaderboardPage() {
    const [sel, setSel] = useState(null)
    const mod = sel != null ? MOD_BOARD[sel] : null

    return (
        <div className="lb">
            <div className="lb__head">
                <h1 className="lb__title">Mod Leaderboard</h1>
                <p className="lb__sub">{MOD_BOARD.length} moderators · ranked by submissions</p>
            </div>

            <div className={`lb__layout${mod ? ' has-detail' : ''}`}>
                <div className="lb__list">
                    {MOD_BOARD.map((m, i) => (
                        <div key={m.name} className={`lb__row${sel === i ? ' is-sel' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
                            <span className={`lb__pos${i < 3 ? ' lb__pos--' + MEDALS[i] : ''}`}>{i + 1}</span>
                            <div className="lb__pinfo">
                                <span className="lb__pname">{m.name}</span>
                                <span className="lb__pbest">{m.best?.name ?? '—'}</span>
                            </div>
                            <span className="lb__xp-total">{m.pts} <span>pts</span></span>
                        </div>
                    ))}
                </div>

                {mod && (
                    <div className="lb__detail">
                        <div className="lb__detail-hd">
                            <div className="lb__detail-left">
                                <span className="lb__detail-pos">#{sel + 1}</span>
                                <h2 className="lb__detail-name">{mod.name}</h2>
                            </div>
                            <span className="lb__detail-xp">{mod.pts} pts</span>
                        </div>
                        <div className="lb__achs">
                            {mod.submissions.map((e, j) => (
                                <div key={j} className="lb__ach">
                                    <span className="lb__ach-rank">{e.rank != null ? '#' + e.rank : '—'}</span>
                                    <div className="lb__ach-info">
                                        <span className="lb__ach-name">{e.name}</span>
                                        <span className="lb__ach-meta">{LIST_LABEL[e._list]} · {fmt(e.date)}</span>
                                    </div>
                                    <span className="lb__ach-xp">+1</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}