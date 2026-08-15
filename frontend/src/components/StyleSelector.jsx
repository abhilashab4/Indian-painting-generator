export default function StyleSelector({ style, setStyle }) {
  const styles = [
    { id: 'mughal', label: 'Mughal', icon: '🏛️', desc: 'Refined imperial Mughal miniature painting' },
    { id: 'kangra', label: 'Kangra', icon: '🏔️', desc: 'Romantic Pahari miniature painting' },
  ];

  return (
    <div>
      <label className="prompt-label">Painting Tradition</label>
      <div className="style-cards">
        {styles.map((s) => (
          <div
            key={s.id}
            className={`style-card ${style === s.id ? 'selected' : ''}`}
            onClick={() => setStyle(s.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setStyle(s.id)}
          >
            <div className="style-icon">{s.icon}</div>
            <h4>{s.label}</h4>
            <p>{s.desc}</p>
            <div className="check-mark">✓ Selected</div>
          </div>
        ))}
      </div>
    </div>
  );
}
