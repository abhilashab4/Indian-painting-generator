import { useState } from 'react';

export default function Gallery({ paintings, onView }) {
  const [modalImg, setModalImg] = useState(null);

  if (!paintings.length) return null;

  const openModal = (p) => setModalImg(p);
  const closeModal = () => setModalImg(null);

  return (
    <section className="gallery-section" id="gallery">
      <div className="ornamental-divider" style={{ maxWidth: 240, margin: '0 auto 32px' }}>
        <div className="line" />
        <div className="diamond" />
        <div className="line" />
      </div>
      <h2>Recent Paintings</h2>
      <div className="gallery-grid">
        {paintings.map((p, i) => (
          <div key={i} className="gallery-card" onClick={() => openModal(p)}>
            <img src={p.imageUrl} alt={p.prompt.slice(0, 60)} loading="lazy" />
            <div className="gallery-card-info">
              <div className="prompt-text">{p.prompt}</div>
              <div className="meta-row">
                <span className="style-badge">{p.style}</span>
                <span>{p.width}×{p.height}</span>
                <span>{new Date(p.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalImg && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <img src={modalImg.imageUrl} alt="Full preview" />
            <div className="modal-info">
              <div className="prompt-text">{modalImg.prompt}</div>
              <div className="meta-text">
                {modalImg.style} · {modalImg.width}×{modalImg.height} · {modalImg.steps} steps · LoRA {modalImg.loraScale.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
