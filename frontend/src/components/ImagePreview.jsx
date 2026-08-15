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
          {meta && (
            <div className="generation-meta">
              <span style={{ textTransform: 'capitalize' }}>{meta.style}</span>
              <span className="dot" />
              <span>{meta.width} × {meta.height}</span>
              <span className="dot" />
              <span>{meta.steps} steps</span>
              <span className="dot" />
              <span>LoRA {meta.loraScale.toFixed(1)}</span>
            </div>
          )}
          <div className="result-actions">
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
