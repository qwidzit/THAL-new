import { useState, useMemo, useEffect } from 'react'
import Header from './components/Header'
import LevelList from './components/LevelList'
import LevelModal from './components/LevelModal'
import HomePage from './pages/HomePage'

import achievementsData from '../data/achievements.json'
import pendingData from '../data/pending.json'
import legacyData from '../data/legacy.json'
import timelineData from '../data/timeline.json'
import platformersData from '../data/platformers.json'
import platformerTimelineData from '../data/platformertimeline.json'

const CLASSIC_TAGS = [
    'Level', 'Challenge', '2P', 'Low Hertz', 'Progress', 'Consistency',
    'Verified', 'Rated', 'Formerly Rated', 'CBF', 'Tentative',
    'Outdated Version', 'Coin Route', 'Noclip', 'Speedhack', 'Mobile', 'Miscellaneous',
]

const PLATFORMER_TAGS = [
    'Platformer', 'Deathless', 'Coin Route', 'Rated', 'Verified',
    'Consistency', 'Progress', 'Speedrun', 'Low Hertz', 'Mobile', 'Outdated Version',
]

const DATA_MAP = {
    classic: {
        MAIN: achievementsData,
        PENDING: pendingData,
        REMOVED: legacyData,
        TIMELINE: timelineData,
    },
    platformer: {
        MAIN: platformersData,
        PENDING: [],
        REMOVED: [],
        TIMELINE: platformerTimelineData,
    },
}

const ALL_LISTS_COUNT =
    achievementsData.length + pendingData.length + legacyData.length + platformersData.length

function parseRoute() {
    const parts = window.location.pathname.split('/').filter(Boolean)
    if (parts.length === 0 || parts[0] === 'home') return { mode: 'classic', active: 'HOME' }
    const modeMap = { classic: 'classic', plat: 'platformer' }
    const tabMap = { pending: 'PENDING', removed: 'REMOVED', timeline: 'TIMELINE' }
    const mode = modeMap[parts[0]] || 'classic'
    const active = tabMap[parts[1]] || 'MAIN'
    return { mode, active }
}

export default function App() {
    const [route, setRoute] = useState(parseRoute)
    const { mode, active } = route

    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('rank')
    const [sortDir, setSortDir] = useState('asc')
    const [activeTags, setActiveTags] = useState(new Set())
    const [selectedLevel, setSelectedLevel] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)

    function navigate(newMode, newActive) {
        if (newActive === 'HOME') {
            history.pushState({}, '', '/')
            setRoute({ mode: newMode, active: 'HOME' })
            return
        }
        const modeSlug = newMode === 'platformer' ? 'plat' : 'classic'
        const tabSlug = newActive === 'MAIN' ? '' : newActive.toLowerCase()
        const path = tabSlug ? `/${modeSlug}/${tabSlug}` : `/${modeSlug}`
        history.pushState({}, '', path)
        setRoute({ mode: newMode, active: newActive })
    }

    useEffect(() => {
        const handler = () => setRoute(parseRoute())
        window.addEventListener('popstate', handler)
        return () => window.removeEventListener('popstate', handler)
    }, [])

    const allTags = mode === 'classic' ? CLASSIC_TAGS : PLATFORMER_TAGS
    const rawData = active === 'HOME' ? [] : (DATA_MAP[mode][active] || [])

    const toggleTag = (t) => {
        const next = new Set(activeTags)
        next.has(t) ? next.delete(t) : next.add(t)
        setActiveTags(next)
    }

    useEffect(() => {
        setActiveTags(new Set())
        setSort('rank')
        setSortDir('asc')
    }, [mode])

    useEffect(() => {
        setSearch('')
    }, [active, mode])

    const filteredData = useMemo(() => {
        let data = [...rawData]

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(a =>
                a.name?.toLowerCase().includes(q) ||
                a.player?.toLowerCase().includes(q) ||
                String(a.levelID ?? '').includes(q) ||
                String(a.rank ?? '').includes(q)
            )
        }

        if (activeTags.size > 0) {
            data = data.filter(a =>
                a.tags && [...activeTags].some(t => a.tags.includes(t))
            )
        }

        data.sort((a, b) => {
            let va, vb
            if (sort === 'rank') { va = a.rank ?? 999999; vb = b.rank ?? 999999 }
            else if (sort === 'name') { va = (a.name ?? '').toLowerCase(); vb = (b.name ?? '').toLowerCase() }
            else if (sort === 'length') { va = a.length ?? 0; vb = b.length ?? 0 }
            else { va = new Date(a.date ?? 0).getTime(); vb = new Date(b.date ?? 0).getTime() }
            if (va < vb) return sortDir === 'asc' ? -1 : 1
            if (va > vb) return sortDir === 'asc' ? 1 : -1
            return 0
        })

        return data
    }, [rawData, search, activeTags, sort, sortDir])

    useEffect(() => {
        const update = () => {
            const cards = document.querySelectorAll('.card')
            setShowScrollTop(cards.length >= 10 && cards[9].getBoundingClientRect().bottom < 0)
        }
        window.addEventListener('scroll', update, { passive: true })
        update()
        return () => window.removeEventListener('scroll', update)
    }, [filteredData])

    const bgImage = active !== 'HOME' ? (rawData[0]?.thumbnail ?? null) : null

    return (
        <div className="app">
            <div className="app-bg">
                {bgImage && <div className="app-bg__img" style={{ backgroundImage: `url(${bgImage})` }} />}
                <div className="app-bg__tint" />
                <div className="app-bg__grid" />
            </div>

            <Header
                mode={mode} setMode={m => navigate(m, active)}
                active={active} setActive={a => navigate(mode, a)}
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                sortDir={sortDir} setSortDir={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                activeTags={activeTags} toggleTag={toggleTag}
                allTags={allTags}
                totalCount={ALL_LISTS_COUNT}
            />

            {active === 'HOME'
                ? <HomePage totalCount={achievementsData.length + pendingData.length + legacyData.length + platformersData.length} />
                : <LevelList
                    data={filteredData}
                    totalCount={rawData.length}
                    activeTags={activeTags}
                    toggleTag={toggleTag}
                    isTimeline={active === 'TIMELINE'}
                    onCardClick={setSelectedLevel}
                />
            }

            {selectedLevel && (
                <LevelModal level={selectedLevel} onClose={() => setSelectedLevel(null)} />
            )}

            {showScrollTop && (
                <button
                    className="scroll-top-btn"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Go to top"
                >↑ TOP</button>
            )}
        </div>
    )
}