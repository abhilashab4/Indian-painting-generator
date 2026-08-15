function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Gallery({ paintings, selectedId, onSelect, onRemove }) {
  if (!paintings.length) return null;

  return (
    <section className="gallery-section" id="gallery">
      <div className="ornamental-divider" style={{ maxWidth: 240, margin: '0 auto 32px' }}>
        <div className="line" />
        <div className="diamond" />
        <div className="line" />
      </div>
      <h2>Recent Paintings</h2>
      <p className="gallery-subtitle">{paintings.length} {paintings.length === 1 ? 'painting' : 'paintings'} generated this session</p>

      {/* Scrollable container with max-height */}
      <div className="gallery-scroll-container">
        <div className="gallery-grid">
          {paintings.map((p) => {
            const isSelected = p.id === selectedId;
            return (
              <div
                key={p.id}
                className={`gallery-card${isSelected ? ' gallery-card--selected' : ''}`}
                onClick={() => onSelect(p)}
                role="button"
                tabIndex={0}
                aria-label={`View: ${p.prompt.slice(0, 60)}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(p); }}
              >
                {isSelected && (
                  <div className="gallery-card-selected-badge">✓ Selected</div>
                )}
                <div className="gallery-card-img-wrap">
                  <img src={p.imageUrl} alt={p.prompt.slice(0, 60)} loading="lazy" />
                </div>
                <div className="gallery-card-info">
                  <div className="prompt-text">{p.prompt}</div>
                  <div className="meta-row">
                    <span className="style-badge" style={{ textTransform: 'capitalize' }}>{p.style}</span>
                    <span>{p.width}×{p.height}</span>
                    <span>{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
                {onRemove && (
                  <button
                    className="gallery-card-remove"
                    title="Remove from history"
                    onClick={(e) => { e.stopPropagation(); onRemove(p.id); }}
                    aria-label="Remove painting from history"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
