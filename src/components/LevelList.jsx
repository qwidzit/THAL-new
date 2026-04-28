import LevelCard from './LevelCard'

export default function LevelList({ data, totalCount, activeTags, toggleTag, isTimeline, onCardClick }) {
    return (
        <>
            <div className="resultmeta">
        <span className="resultmeta__count">
          <strong>{data.length}</strong> of <strong>{totalCount}</strong>
        </span>
                <span className="resultmeta__summary">
          {[...activeTags].map(t => (
              <span key={t} className="resultmeta__tag">
              {t}
                  <button onClick={() => toggleTag(t)}>✕</button>
            </span>
          ))}
        </span>
            </div>

            <main className="list">
                {data.length === 0 ? (
                    <div className="list__empty">No entries found.</div>
                ) : (
                    data.map((a, i) => (
                        <LevelCard
                            key={a.id ?? i}
                            achievement={a}
                            index={i}
                            isTimeline={isTimeline}
                            onClick={onCardClick}
                        />
                    ))
                )}
            </main>
        </>
    )
}