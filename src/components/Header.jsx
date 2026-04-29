import { useState } from 'react'

const TABS = ['MAIN', 'PENDING', 'REMOVED', 'TIMELINE']

export default function Header({
                                   mode, setMode,
                                   active, setActive,
                                   search, setSearch,
                                   sort, setSort,
                                   sortDir, setSortDir,
                                   activeTags, toggleTag,
                                   allTags,
                                   totalCount,
                               }) {
    const [showFilters, setShowFilters] = useState(false)

    return (
        <>
            <header className="hd">
                <div className="hd__row">
                    <div className="hd__brand">
                        <div className="hd__logo">
                            <img src="/THAL.png" alt="" className="hd__logo-square" />
                            <span className="hd__logo-text">THAL</span>
                        </div>
                        <div className="hd__brand-meta">
                            <div className="hd__brand-title">Hardest Achievements</div>
                            <div className="hd__brand-sub">{totalCount} entries · updated 3h ago</div>
                        </div>
                    </div>

                    <nav className="hd__nav">
                        {TABS.map(t => (
                            <button
                                key={t}
                                className={`hd__nav-btn${active === t ? ' is-active' : ''}`}
                                onClick={() => setActive(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="hd__controls">
                    <div className="hd__search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, player, level ID"
                        />
                        <kbd className="hd__kbd">⌘K</kbd>
                    </div>

                    <div className="hd__sort-group">
                        <span className="hd__sort-lbl">SORT</span>
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="rank">Rank</option>
                            <option value="name">Name</option>
                            <option value="length">Length</option>
                            <option value="date">Date</option>
                        </select>
                        <button className="hd__sort-dir" onClick={setSortDir}>
                            {sortDir === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>

                    <div className="hd__mode-toggle">
                        <button
                            className={mode === 'classic' ? 'is-active' : ''}
                            onClick={() => setMode('classic')}
                        >Classic</button>
                        <button
                            className={mode === 'platformer' ? 'is-active' : ''}
                            onClick={() => setMode('platformer')}
                        >Platformer</button>
                    </div>

                    <button className="hd__filter-btn" onClick={() => setShowFilters(true)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <line x1="4" y1="6" x2="20" y2="6"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                            <line x1="11" y1="18" x2="13" y2="18"/>
                        </svg>
                        Filters
                        {activeTags.size > 0 && <span className="hd__filter-badge">{activeTags.size}</span>}
                    </button>
                </div>

                <div className="hd__filters">
                    <span className="hd__fgroup-lbl">FILTER</span>
                    <div className="hd__chips">
                        {allTags.map(t => (
                            <button
                                key={t}
                                className={`hd__chip${activeTags.has(t) ? ' is-on' : ''}`}
                                onClick={() => toggleTag(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {showFilters && (
                <div className="flt-overlay" onClick={() => setShowFilters(false)}>
                    <div className="flt-drawer" onClick={e => e.stopPropagation()}>
                        <div className="flt-drawer__handle" />

                        <div className="flt-section">
                            <span className="flt-lbl">MODE</span>
                            <div className="hd__mode-toggle">
                                <button
                                    className={mode === 'classic' ? 'is-active' : ''}
                                    onClick={() => setMode('classic')}
                                >Classic</button>
                                <button
                                    className={mode === 'platformer' ? 'is-active' : ''}
                                    onClick={() => setMode('platformer')}
                                >Platformer</button>
                            </div>
                        </div>

                        <div className="flt-section">
                            <span className="flt-lbl">SORT</span>
                            <div className="flt-sort-row">
                                <select
                                    className="flt-select"
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                >
                                    <option value="rank">Rank</option>
                                    <option value="name">Name</option>
                                    <option value="length">Length</option>
                                    <option value="date">Date</option>
                                </select>
                                <button className="hd__sort-dir" onClick={setSortDir}>
                                    {sortDir === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>

                        <div className="flt-section">
                            <span className="flt-lbl">FILTER</span>
                            <div className="hd__chips">
                                {allTags.map(t => (
                                    <button
                                        key={t}
                                        className={`hd__chip${activeTags.has(t) ? ' is-on' : ''}`}
                                        onClick={() => toggleTag(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="flt-done" onClick={() => setShowFilters(false)}>Done</button>
                    </div>
                </div>
            )}
        </>
    )
}