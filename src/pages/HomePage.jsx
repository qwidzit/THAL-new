import changelogData from '../../data/changelog.json'

const EDITORS = ['TemplateNames']

const FILE_LABELS = {
    achievements:       'Classic Main',
    pending:            'Classic Pending',
    legacy:             'Classic Removed',
    timeline:           'Classic Timeline',
    platformers:        'Platformer Main',
    platformertimeline: 'Platformer Timeline',
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

function ChangeEntry({ entry }) {
    const { type, levelName, player, fileKey, rank, fromRank, toRank, timestamp } = entry
    const list = FILE_LABELS[fileKey] || fileKey
    let text = ''
    if (type === 'added')   text = `${levelName} by ${player} added at #${rank} on ${list}`
    if (type === 'removed') text = `${levelName} by ${player} removed from #${rank} on ${list}`
    if (type === 'moved') {
        const dir = toRank < fromRank ? 'up' : 'down'
        text = `${levelName} by ${player} moved ${dir} — #${fromRank} → #${toRank} on ${list}`
    }
    return (
        <div className={`home-change home-change--${type}`}>
            <span className="home-change__badge">{type}</span>
            <span className="home-change__text">{text}</span>
            <span className="home-change__date">{formatDate(timestamp)}</span>
        </div>
    )
}

export default function HomePage({ totalCount }) {
    const changes = [...changelogData].reverse()
    return (
        <div className="home">
            <section className="home__hero">
                <h1 className="home__title">The Hardest Achievements List</h1>
                <p className="home__desc">
                    A community-maintained ranking of the most difficult achievements in Geometry Dash.
                </p>
                {totalCount != null && (
                    <span className="home__count">{totalCount} total entries</span>
                )}
            </section>

            <div className="home__cols">
                <section className="home__panel">
                    <h2 className="home__panel-title">Editors</h2>
                    <div className="home__editors">
                        {EDITORS.map(e => (
                            <span key={e} className="home__editor">{e}</span>
                        ))}
                    </div>
                </section>

                <section className="home__panel home__panel--wide">
                    <h2 className="home__panel-title">Recent Changes</h2>
                    {changes.length === 0
                        ? <p className="home__empty">No changes recorded yet.</p>
                        : <div className="home__changes">
                            {changes.map(entry => <ChangeEntry key={entry.id} entry={entry} />)}
                        </div>
                    }
                </section>
            </div>
        </div>
    )
}