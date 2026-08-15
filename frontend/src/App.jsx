import { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import PromptEditor from './components/PromptEditor';
import StyleSelector from './components/StyleSelector';
import AdvancedSettings from './components/AdvancedSettings';
import ResolutionSelector from './components/ResolutionSelector';
import GenerateButton from './components/GenerateButton';
import ImagePreview from './components/ImagePreview';
import Gallery from './components/Gallery';
import { generateImage } from './services/imageGeneration';

const DEFAULT_PROMPT = `Mughal miniature painting depicting a graceful Mughal noblewoman in richly embroidered traditional Mughal attire, standing beneath an ornate pavilion during a monsoon downpour, patiently waiting for someone. A majestic peacock stands nearby on a lush garden path, its feathers glistening with raindrops and tail partially fanned. Rain falls across a lush Mughal garden filled with flowering plants, cypress trees, marble architecture, and delicate puddles reflecting the scene. Intricate gold detailing, fine brushwork, jewel-toned garments, traditional Mughal miniature style, opaque watercolor and gold on paper, highly detailed, elegant courtly atmosphere.`;

let nextId = 1;

export default function App() {
  const [section, setSection] = useState('create');

  // --- Prompt / generation controls (for the NEXT generation) ---
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [style, setStyle] = useState('mughal');
  const [steps, setSteps] = useState(25);
  const [guidance, setGuidance] = useState(3.5);
  const [loraScale, setLoraScale] = useState(1.0);
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(768);

  // --- Generation status ---
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [promptError, setPromptError] = useState('');

  // --- History (never cleared, only appended) ---
  const [generationHistory, setGenerationHistory] = useState([]);

  // --- The generation currently being viewed in the main preview ---
  // null → no generation yet; otherwise a history item object
  const [selectedGeneration, setSelectedGeneration] = useState(null);

  // Track all URLs we own so we can revoke them only when removing from history
  const ownedUrlsRef = useRef(new Set());

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setPromptError('Please describe the painting you want to create.');
      return;
    }
    setPromptError('');
    setStatus('loading');
    setErrorMsg('');

    // Capture parameters at time of generation
    const genPrompt = prompt.trim();
    const genStyle = style;
    const genSteps = steps;
    const genGuidance = guidance;
    const genWidth = width;
    const genHeight = height;
    const genLoraScale = loraScale;

    try {
      const imageUrl = await generateImage({
        prompt: genPrompt,
        style: genStyle,
        steps: genSteps,
        guidance: genGuidance,
        width: genWidth,
        height: genHeight,
        lora_scale: genLoraScale,
      });

      // Track the URL so we know it belongs to us
      ownedUrlsRef.current.add(imageUrl);

      const newItem = {
        id: nextId++,
        imageUrl,
        prompt: genPrompt,
        style: genStyle,
        steps: genSteps,
        guidance: genGuidance,
        width: genWidth,
        height: genHeight,
        loraScale: genLoraScale,
        createdAt: Date.now(),
      };

      // Prepend new item — never overwrite existing history
      setGenerationHistory((prev) => [newItem, ...prev]);

      // Make the new image the selected (currently viewed) one
      setSelectedGeneration(newItem);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }, [prompt, style, steps, guidance, width, height, loraScale]);

  // Called when user clicks a card in the gallery — just switch view, no API call
  const handleSelectFromHistory = useCallback((item) => {
    setSelectedGeneration(item);
    // If we were in error/idle state, show done so the preview shows the image
    setStatus('done');
  }, []);

  // Remove an item from history and revoke its URL to free memory
  const handleRemoveFromHistory = useCallback((id) => {
    setGenerationHistory((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item && ownedUrlsRef.current.has(item.imageUrl)) {
        URL.revokeObjectURL(item.imageUrl);
        ownedUrlsRef.current.delete(item.imageUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
    // If the removed item was selected, clear selection
    setSelectedGeneration((sel) => (sel?.id === id ? null : sel));
  }, []);

  const handleDownload = useCallback(() => {
    if (!selectedGeneration?.imageUrl) return;
    const a = document.createElement('a');
    a.href = selectedGeneration.imageUrl;
    a.download = `chitra-${selectedGeneration.style}-${selectedGeneration.id}.png`;
    a.click();
  }, [selectedGeneration]);

  const handleFullscreen = useCallback(() => {
    if (!selectedGeneration?.imageUrl) return;
    window.open(selectedGeneration.imageUrl, '_blank');
  }, [selectedGeneration]);

  const handleReset = useCallback(() => {
    // "Generate Again" — just go back to idle so user can adjust + generate
    setStatus('idle');
  }, []);

  const isLoading = status === 'loading';

  // Derive the current image URL and meta for ImagePreview from selectedGeneration
  const currentImageUrl = selectedGeneration?.imageUrl ?? null;
  const currentMeta = selectedGeneration
    ? {
        style: selectedGeneration.style,
        width: selectedGeneration.width,
        height: selectedGeneration.height,
        steps: selectedGeneration.steps,
        guidance: selectedGeneration.guidance,
        loraScale: selectedGeneration.loraScale,
        prompt: selectedGeneration.prompt,
        createdAt: selectedGeneration.createdAt,
      }
    : null;

  return (
    <>
      <Header activeSection={section} onNavigate={setSection} />

      {section === 'create' && (
        <>
          {/* Hero */}
          <section className="hero">
            <h1>Create Indian Miniature Art</h1>
            <p>Transform your imagination into richly detailed Kangra and Mughal miniature paintings.</p>
            <div className="ornamental-divider">
              <div className="line" />
              <div className="diamond" />
              <div className="line" />
            </div>
          </section>

          {/* Workspace */}
          <div className="workspace">
            <div className="controls-panel">
              <div className="panel-card">
                <h2 className="panel-title">Create your painting</h2>
                <PromptEditor prompt={prompt} setPrompt={setPrompt} error={promptError} />
              </div>

              <div className="panel-card">
                <StyleSelector style={style} setStyle={setStyle} />
              </div>

              <div className="panel-card">
                <AdvancedSettings
                  steps={steps} setSteps={setSteps}
                  guidance={guidance} setGuidance={setGuidance}
                  loraScale={loraScale} setLoraScale={setLoraScale}
                />
              </div>

              <div className="panel-card">
                <ResolutionSelector width={width} height={height} setWidth={setWidth} setHeight={setHeight} />
              </div>

              <GenerateButton loading={isLoading} onClick={handleGenerate} />
            </div>

            <div className="preview-panel">
              <ImagePreview
                status={status}
                imageUrl={currentImageUrl}
                error={errorMsg}
                meta={currentMeta}
                onDownload={handleDownload}
                onReset={handleReset}
                onFullscreen={handleFullscreen}
              />
            </div>
          </div>

          {/* Recent Paintings — always rendered below workspace, persists across generates */}
          <Gallery
            paintings={generationHistory}
            selectedId={selectedGeneration?.id ?? null}
            onSelect={handleSelectFromHistory}
            onRemove={handleRemoveFromHistory}
          />
        </>
      )}

      {section === 'gallery' && (
        <div style={{ paddingTop: 40 }}>
          {generationHistory.length ? (
            <Gallery
              paintings={generationHistory}
              selectedId={selectedGeneration?.id ?? null}
              onSelect={(item) => {
                handleSelectFromHistory(item);
                setSection('create');
              }}
              onRemove={handleRemoveFromHistory}
            />
          ) : (
            <div className="hero">
              <h1>Gallery</h1>
              <p>Your generated paintings will appear here. Create your first painting to get started.</p>
            </div>
          )}
        </div>
      )}

      {section === 'about' && (
        <section className="about-section" id="about">
          <h2>About Chitra</h2>
          <p>
            <strong>Chitra</strong> (चित्र, meaning &ldquo;painting&rdquo; in Sanskrit) is a digital atelier that merges the rich heritage of Indian miniature painting traditions with modern generative AI.
          </p>
          <p>
            Our studio supports two iconic painting traditions: <strong>Mughal</strong> miniatures, known for their refined imperial elegance and intricate court scenes, and <strong>Kangra</strong> miniatures, celebrated for their lyrical romanticism and naturalistic beauty rooted in the Pahari hills.
          </p>
          <p>
            Describe a scene, select a tradition, and let the atelier transform your imagination into a richly detailed work of art — complete with the fine brushwork, jewel-toned pigments, and gold leaf detailing characteristic of these centuries-old art forms.
          </p>
        </section>
      )}

      <footer className="footer">
        © {new Date().getFullYear()} Chitra · Indian Miniature Painting Studio
      </footer>
    </>
  );
}
