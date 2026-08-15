export default function PromptEditor({ prompt, setPrompt, error }) {
  return (
    <div>
      <label className="prompt-label" htmlFor="prompt-input">Describe your scene</label>
      <textarea
        id="prompt-input"
        className="prompt-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A Mughal noblewoman waiting beneath an ornate pavilion during a monsoon shower, with a peacock standing nearby..."
      />
      <div className="prompt-footer">
        <span className="char-count">{prompt.length} characters</span>
        <button className="btn-enhance" title="Coming soon">✦ Enhance Prompt</button>
      </div>
      {error && <div className="prompt-error">⚠ {error}</div>}
    </div>
  );
}
