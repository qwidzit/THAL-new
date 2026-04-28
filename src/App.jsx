import { useState, useMemo, useEffect } from 'react'
import Header from './components/Header'
import LevelList from './components/LevelList'
import LevelModal from './components/LevelModal'

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

export default function App() {
    const [mode, setMode] = useState('classic')
    const [active, setActive] = useState('MAIN')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('rank')
    const [sortDir, setSortDir] = useState('asc')
    const [activeTags, setActiveTags] = useState(new Set())   // ← no default tags
    const [selectedLevel, setSelectedLevel] = useState(null)

    const allTags = mode === 'classic' ? CLASSIC_TAGS : PLATFORMER_TAGS
    const rawData = DATA_MAP[mode][active] || []

    const toggleTag = (t) => {
        const next = new Set(activeTags)
        next.has(t) ? next.delete(t) : next.add(t)
        setActiveTags(next)
    }

    useEffect(() => {
        setActiveTags(new Set())   // ← no default tags on mode switch
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

    const bgImage = rawData[0]?.thumbnail ?? null

    return (
        <div className="app">
            <div className="app-bg">
                {bgImage && <div className="app-bg__img" style={{ backgroundImage: `url(${bgImage})` }} />}
                <div className="app-bg__tint" />
                <div className="app-bg__grid" />
            </div>

            <Header
                mode={mode} setMode={setMode}
                active={active} setActive={setActive}
                search={search} setSearch={setSearch}
                sort={sort} setSort={setSort}
                sortDir={sortDir} setSortDir={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                activeTags={activeTags} toggleTag={toggleTag}
                allTags={allTags}
                totalCount={rawData.length}
            />

            <LevelList
                data={filteredData}
                totalCount={rawData.length}
                activeTags={activeTags}
                toggleTag={toggleTag}
                isTimeline={active === 'TIMELINE'}
                onCardClick={setSelectedLevel}
            />

            {selectedLevel && (
                <LevelModal level={selectedLevel} onClose={() => setSelectedLevel(null)} />
            )}
        </div>
    )
}