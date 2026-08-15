import { useState, useCallback, useRef, useEffect } from 'react';
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

export default function App() {
  const [section, setSection] = useState('create');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [style, setStyle] = useState('mughal');
  const [steps, setSteps] = useState(25);
  const [guidance, setGuidance] = useState(3.5);
  const [loraScale, setLoraScale] = useState(1.0);
  const [width, setWidth] = useState(768);
  const [height, setHeight] = useState(768);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [promptError, setPromptError] = useState('');
  const [paintings, setPaintings] = useState([]);
  const prevUrlRef = useRef(null);

  // Revoke old object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setPromptError('Please describe the painting you want to create.');
      return;
    }
    setPromptError('');
    setStatus('loading');
    setErrorMsg('');

    // Revoke previous image URL
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    try {
      const url = await generateImage({
        prompt: prompt.trim(),
        style,
        steps,
        guidance,
        width,
        height,
        lora_scale: loraScale,
      });
      prevUrlRef.current = url;
      setImageUrl(url);
      setStatus('done');

      // Add to gallery
      setPaintings((prev) => [
        { imageUrl: url, prompt: prompt.trim(), style, width, height, steps, guidance, loraScale, timestamp: Date.now() },
        ...prev,
      ]);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }, [prompt, style, steps, guidance, width, height, loraScale]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `chitra-${style}-${Date.now()}.png`;
    a.click();
  }, [imageUrl, style]);

  const handleFullscreen = useCallback(() => {
    if (!imageUrl) return;
    window.open(imageUrl, '_blank');
  }, [imageUrl]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setImageUrl(null);
    setErrorMsg('');
  }, []);

  const isLoading = status === 'loading';

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
                imageUrl={imageUrl}
                error={errorMsg}
                meta={{ style, width, height, steps, loraScale }}
                onDownload={handleDownload}
                onReset={handleReset}
                onFullscreen={handleFullscreen}
              />
            </div>
          </div>

          {/* Gallery */}
          <Gallery paintings={paintings} />
        </>
      )}

      {section === 'gallery' && (
        <div style={{ paddingTop: 40 }}>
          {paintings.length ? (
            <Gallery paintings={paintings} />
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
            <strong>Chitra</strong> (चित्र, meaning "painting" in Sanskrit) is a digital atelier that merges the rich heritage of Indian miniature painting traditions with modern generative AI.
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
