import { useState, useRef, useEffect } from 'react'

const TABS = ['MAIN', 'PENDING', 'REMOVED', 'TIMELINE']

const SORT_OPTIONS = [
    { value: 'rank',   label: 'Rank'   },
    { value: 'name',   label: 'Name'   },
    { value: 'length', label: 'Length' },
    { value: 'date',   label: 'Date'   },
]

function SortSelect({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const selected = SORT_OPTIONS.find(o => o.value === value)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="hd__sel" ref={ref}>
            <button className="hd__sel-btn" onClick={() => setOpen(o => !o)}>
                {selected?.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="hd__sel-menu">
                    {SORT_OPTIONS.map(o => (
                        <button
                            key={o.value}
                            className={`hd__sel-item${o.value === value ? ' is-active' : ''}`}
                            onClick={() => { onChange(o.value); setOpen(false) }}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

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
    return (
        <header className="hd">
            <div className="hd__row">
                <div className="hd__brand">
                    <div className="hd__logo">
                        <div className="hd__logo-square" />
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
                    <kbd>⌘K</kbd>
                </div>

                <div className="hd__sort-group">
                    <span className="hd__sort-lbl">SORT</span>
                    <SortSelect value={sort} onChange={setSort} />
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
    )
}