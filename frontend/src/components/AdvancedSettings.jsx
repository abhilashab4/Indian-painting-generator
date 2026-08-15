import { useState } from 'react';

export default function AdvancedSettings({ steps, setSteps, guidance, setGuidance, loraScale, setLoraScale }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button className="advanced-toggle" onClick={() => setOpen(!open)} type="button">
        Advanced Settings
        <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="advanced-body">
          <div className="slider-group">
            <label>Steps <span>{steps}</span></label>
            <input type="range" min={1} max={50} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
          </div>
          <div className="slider-group">
            <label>Guidance <span>{guidance.toFixed(1)}</span></label>
            <input type="range" min={1} max={10} step={0.1} value={guidance} onChange={(e) => setGuidance(Number(e.target.value))} />
          </div>
          <div className="slider-group">
            <label>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                LoRA Strength
                <span className="tooltip-icon">
                  ?
                  <span className="tooltip-text">Controls how strongly the selected painting style influences the generated image.</span>
                </span>
              </span>
              <span>{loraScale.toFixed(1)}</span>
            </label>
            <input type="range" min={0} max={2} step={0.1} value={loraScale} onChange={(e) => setLoraScale(Number(e.target.value))} />
          </div>
        </div>
      )}
    </div>
  );
}
