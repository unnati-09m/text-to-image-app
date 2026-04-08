import React, { useState } from 'react';
import { Sparkles, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = import.meta.env.VITE_HF_API_KEY;
const MODEL_ID = "black-forest-labs/FLUX.1-schnell";

function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            options: { wait_for_model: true }
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image. Please try again.");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      <header className="header">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="logo"
        >
          <Sparkles className="icon-sparkles" />
          <h1>LuminaAI</h1>
        </motion.div>
        <p className="subtitle">Transform your imagination into stunning visuals</p>
      </header>

      <main className="main-content">
        <section className="input-section">
          <form onSubmit={generateImage} className="prompt-form">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Describe the image you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="generate-btn" 
                disabled={loading || !prompt}
              >
                {loading ? (
                  <RefreshCw className="icon-loading spinning" />
                ) : (
                  <>
                    <Sparkles className="icon-btn" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="display-section">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="error-message"
              >
                <AlertCircle className="icon-error" />
                <span>{error}</span>
              </motion.div>
            )}

            {!image && !loading && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="placeholder-card"
              >
                <div className="visual-hint">
                  <div className="hint-circle"></div>
                  <Sparkles className="hint-icon" />
                </div>
                <p>Your masterpiece will appear here</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="loading-card"
              >
                <div className="loader"></div>
                <p>Dreaming up your image...</p>
              </motion.div>
            )}

            {image && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="image-card"
              >
                <div className="image-wrapper">
                  <img src={image} alt={prompt} />
                  <div className="image-overlay">
                    <button onClick={downloadImage} className="download-btn">
                      <Download className="icon-btn" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="prompt-meta">
                  <p className="meta-label">Prompt</p>
                  <p className="meta-text">{prompt}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 LuminaAI • Powered by FLUX.1-schnell</p>
      </footer>
    </div>
  );
}

export default App;
