import { useState } from 'react';

const PRESETS = [
  { label: '512 × 512', w: 512, h: 512 },
  { label: '768 × 768', w: 768, h: 768 },
  { label: '1024 × 1024', w: 1024, h: 1024 },
];

export default function ResolutionSelector({ width, height, setWidth, setHeight }) {
  const [isCustom, setIsCustom] = useState(false);

  const matchedPreset = PRESETS.find((p) => p.w === width && p.h === height);
  const activeLabel = isCustom ? 'Custom' : (matchedPreset ? matchedPreset.label : 'Custom');

  const clamp = (v) => Math.max(256, Math.min(1536, Number(v) || 256));

  return (
    <div>
      <label className="prompt-label">Resolution</label>
      <div className="resolution-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`resolution-btn ${!isCustom && matchedPreset?.label === p.label ? 'selected' : ''}`}
            onClick={() => {
              setIsCustom(false);
              setWidth(p.w);
              setHeight(p.h);
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className={`resolution-btn ${isCustom || (!matchedPreset && !isCustom) ? 'selected' : ''}`}
          onClick={() => setIsCustom(true)}
        >
          Custom
        </button>
      </div>
      {(isCustom || !matchedPreset) && (
        <div className="custom-resolution">
          <input
            type="number"
            min={256}
            max={1536}
            value={width}
            onChange={(e) => setWidth(clamp(e.target.value))}
            placeholder="Width"
          />
          <span style={{ alignSelf: 'center', color: '#8B6F5E' }}>×</span>
          <input
            type="number"
            min={256}
            max={1536}
            value={height}
            onChange={(e) => setHeight(clamp(e.target.value))}
            placeholder="Height"
          />
        </div>
      )}
    </div>
  );
}
