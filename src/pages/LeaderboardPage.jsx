import { useState } from 'react'
import achievementsData from '../../data/achievements.json'
import pendingData from '../../data/pending.json'
import platformersData from '../../data/platformers.json'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function fmt(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

function xpFor(rank) {
    return Math.max(1, Math.round(1000 / rank))
}

const SOURCE_LABEL = {
    classic:    'Classic',
    pending:    'Pending',
    platformer: 'Platformer',
}

function buildLeaderboard() {
    const entries = [
        ...achievementsData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'classic' })),
        ...pendingData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'pending' })),
        ...platformersData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'platformer' })),
    ]
    const map = new Map()
    for (const e of entries) {
        if (!map.has(e.player)) map.set(e.player, [])
        map.get(e.player).push(e)
    }
    return [...map.entries()].map(([name, ach]) => {
        const sorted = [...ach].sort((a, b) => a.rank - b.rank)
        const totalXP = sorted.reduce((s, e) => s + xpFor(e.rank), 0)
        return { name, achievements: sorted, totalXP, best: sorted[0] }
    }).sort((a, b) => b.totalXP - a.totalXP)
}

const LEADERBOARD = buildLeaderboard()
const MEDALS = ['gold', 'silver', 'bronze']

export default function LeaderboardPage() {
    const [sel, setSel] = useState(null)
    const player = sel != null ? LEADERBOARD[sel] : null

    return (
        <div className="lb">
            <div className="lb__head">
                <h1 className="lb__title">Leaderboard</h1>
                <p className="lb__sub">{LEADERBOARD.length} players · ranked by total XP</p>
            </div>

            <div className={`lb__layout${player ? ' has-detail' : ''}`}>
                <div className="lb__list">
                    {LEADERBOARD.map((p, i) => (
                        <div
                            key={p.name}
                            className={`lb__row${sel === i ? ' is-sel' : ''}`}
                            onClick={() => setSel(sel === i ? null : i)}
                        >
                            <span className={`lb__pos${i < 3 ? ' lb__pos--' + MEDALS[i] : ''}`}>{i + 1}</span>
                            <div className="lb__pinfo">
                                <span className="lb__pname">{p.name}</span>
                                <span className="lb__pbest">{p.best.name}</span>
                            </div>
                            <span className="lb__xp-total">{p.totalXP.toLocaleString()} <span>XP</span></span>
                        </div>
                    ))}
                </div>

                {player && (
                    <div className="lb__detail">
                        <div className="lb__detail-hd">
                            <div className="lb__detail-left">
                                <span className="lb__detail-pos">#{sel + 1}</span>
                                <h2 className="lb__detail-name">{player.name}</h2>
                            </div>
                            <span className="lb__detail-xp">{player.totalXP.toLocaleString()} XP</span>
                        </div>
                        <div className="lb__achs">
                            {player.achievements.map((e, j) => (
                                <div key={j} className="lb__ach">
                                    <span className="lb__ach-rank">#{e.rank}</span>
                                    <div className="lb__ach-info">
                                        <span className="lb__ach-name">{e.name}</span>
                                        <span className="lb__ach-meta">{SOURCE_LABEL[e._src]} · {fmt(e.date)}</span>
                                    </div>
                                    <span className="lb__ach-xp">+{xpFor(e.rank)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}