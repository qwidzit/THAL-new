import { useState, Fragment } from 'react'
import { xpFor } from '../utils/xp'
import achievementsData from '../../data/achievements.json'
import pendingData from '../../data/pending.json'
import platformersData from '../../data/platformers.json'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function fmt(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

const SOURCE_LABEL = { classic: 'Classic', pending: 'Pending', platformer: 'Platformer' }

function buildBoard(entries) {
    const map = new Map()
    for (const e of entries) {
        if (!e.player) continue
        if (!map.has(e.player)) map.set(e.player, [])
        map.get(e.player).push(e)
    }
    return [...map.entries()].map(([name, ach]) => {
        const sorted = [...ach].sort((a, b) => a.rank - b.rank)
        const totalXP = sorted.reduce((s, e) => s + xpFor(e.rank), 0)
        return { name, achievements: sorted, totalXP, best: sorted[0] }
    }).sort((a, b) => b.totalXP - a.totalXP)
}

const BOARDS = {
    classic: buildBoard([
        ...achievementsData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'classic' })),
        ...pendingData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'pending' })),
    ]),
    platformer: buildBoard(
        platformersData.filter(e => e.rank != null).map(e => ({ ...e, _src: 'platformer' }))
    ),
}

const MEDALS = ['gold', 'silver', 'bronze']

function DetailContent({ player, pos }) {
    return (
        <>
            <div className="lb__detail-hd">
                <div className="lb__detail-left">
                    <span className="lb__detail-pos">#{pos + 1}</span>
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
        </>
    )
}

export default function LeaderboardPage() {
    const [mode, setMode] = useState('classic')
    const [sel, setSel] = useState(null)

    const leaderboard = BOARDS[mode]
    const player = sel != null ? leaderboard[sel] : null

    function switchMode(m) { setMode(m); setSel(null) }

    return (
        <div className="lb">
            <div className="lb__head">
                <h1 className="lb__title">Leaderboard</h1>
                <div className="lb__mode-toggle">
                    <button className={`lb__mode-btn${mode === 'classic' ? ' is-active' : ''}`} onClick={() => switchMode('classic')}>Classic</button>
                    <button className={`lb__mode-btn${mode === 'platformer' ? ' is-active' : ''}`} onClick={() => switchMode('platformer')}>Platformer</button>
                </div>
                <p className="lb__sub">{leaderboard.length} players · ranked by total XP</p>
            </div>

            <div className={`lb__layout${player ? ' has-detail' : ''}`}>
                <div className="lb__list">
                    {leaderboard.map((p, i) => (
                        <Fragment key={p.name}>
                            <div className={`lb__row${sel === i ? ' is-sel' : ''}`} onClick={() => setSel(sel === i ? null : i)}>
                                <span className={`lb__pos${i < 3 ? ' lb__pos--' + MEDALS[i] : ''}`}>{i + 1}</span>
                                <div className="lb__pinfo">
                                    <span className="lb__pname">{p.name}</span>
                                    <span className="lb__pbest">{p.best.name}</span>
                                </div>
                                <span className="lb__xp-total">{p.totalXP.toLocaleString()} <span>XP</span></span>
                            </div>
                            {sel === i && (
                                <div className="lb__detail lb__detail--inline">
                                    <DetailContent player={p} pos={i} />
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>

                {player && (
                    <div className="lb__detail lb__detail--sidebar">
                        <DetailContent player={player} pos={sel} />
                    </div>
                )}
            </div>
        </div>
    )
}