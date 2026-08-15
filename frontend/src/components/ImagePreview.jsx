function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ImagePreview({ status, imageUrl, error, meta, onDownload, onReset, onFullscreen }) {
  if (status === 'loading') {
    return (
      <div className="preview-frame">
        <div className="loading-state">
          <div className="paint-loader">
            <span /><span /><span /><span />
          </div>
          <h3>Painting in progress…</h3>
          <p>The atelier is preparing your artwork</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="preview-frame">
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <h3>Unable to generate the painting.</h3>
          <p>{error || 'Please check the connection and try again.'}</p>
          <button className="btn-action" onClick={onReset}>Try Again</button>
        </div>
      </div>
    );
  }

  if (status === 'done' && imageUrl) {
    return (
      <div className="preview-done-layout">
        {/* Left: image */}
        <div className="preview-frame preview-frame--image">
          <div className="result-container">
            <img src={imageUrl} alt="Generated miniature painting" />
          </div>
        </div>

        {/* Right: metadata panel */}
        <div className="image-details-panel">
          <div className="details-section">
            <p className="details-label">Style</p>
            <p className="details-value" style={{ textTransform: 'capitalize' }}>{meta?.style}</p>
          </div>

          <div className="details-section">
            <p className="details-label">Resolution</p>
            <p className="details-value">{meta?.width} × {meta?.height}</p>
          </div>

          <div className="details-section">
            <p className="details-label">Steps</p>
            <p className="details-value">{meta?.steps}</p>
          </div>

          <div className="details-section">
            <p className="details-label">Guidance</p>
            <p className="details-value">{meta?.guidance}</p>
          </div>

          <div className="details-section">
            <p className="details-label">LoRA Strength</p>
            <p className="details-value">{meta?.loraScale?.toFixed(1)}</p>
          </div>

          {meta?.createdAt && (
            <div className="details-section">
              <p className="details-label">Generated</p>
              <p className="details-value">{timeAgo(meta.createdAt)}</p>
            </div>
          )}

          {meta?.prompt && (
            <div className="details-section details-prompt">
              <p className="details-label">Prompt</p>
              <div className="prompt-divider" />
              <p className="details-prompt-text">{meta.prompt}</p>
            </div>
          )}

          <div className="details-actions">
            <button className="btn-action primary" onClick={onDownload}>⬇ Download PNG</button>
            <button className="btn-action" onClick={onReset}>✦ Generate Again</button>
            <button className="btn-action" onClick={onFullscreen}>⛶ Open Fullscreen</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-frame">
      <div className="empty-state">
        <div className="easel-icon">🎨</div>
        <h3>Your painting will appear here</h3>
        <p>Describe a scene and begin creating.</p>
      </div>
    </div>
  );
}
