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
      <div className="preview-frame" style={{ justifyContent: 'flex-start' }}>
        <div className="result-container">
          <img src={imageUrl} alt="Generated miniature painting" />
          <div className="result-actions">
            <button className="btn-action primary" onClick={onDownload}>⬇ Download PNG</button>
            <button className="btn-action" onClick={onReset}>✦ Generate Again</button>
            <button className="btn-action" onClick={onFullscreen}>⛶ Open Fullscreen</button>
          </div>
          {meta && (
            <div className="generation-settings-bar">
              <div className="settings-chip">
                <span className="settings-chip-label">Style</span>
                <span className="settings-chip-value" style={{ textTransform: 'capitalize' }}>{meta.style}</span>
              </div>
              <div className="settings-chip-divider" />
              <div className="settings-chip">
                <span className="settings-chip-label">Size</span>
                <span className="settings-chip-value">{meta.width} × {meta.height}</span>
              </div>
              <div className="settings-chip-divider" />
              <div className="settings-chip">
                <span className="settings-chip-label">Steps</span>
                <span className="settings-chip-value">{meta.steps}</span>
              </div>
              <div className="settings-chip-divider" />
              <div className="settings-chip">
                <span className="settings-chip-label">Guidance</span>
                <span className="settings-chip-value">{meta.guidance}</span>
              </div>
              <div className="settings-chip-divider" />
              <div className="settings-chip">
                <span className="settings-chip-label">LoRA</span>
                <span className="settings-chip-value">{meta.loraScale?.toFixed(1)}</span>
              </div>
            </div>
          )}
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
