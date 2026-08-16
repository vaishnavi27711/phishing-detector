import { useState } from 'react';
import Tesseract from 'tesseract.js';

// Phrases we treat as phishing-style language when found in extracted text.
// Mirrors the kind of language the backend's keyword list looks for.
const OCR_KEYWORDS = [
  'verify your account', 'confirm your password', 'update payment',
  'suspended', 'click here immediately', 'login', 'password',
  'urgent', 'act now', 'security alert', 'unusual activity'
];

export function ScreenshotScan() {
  const [fileName, setFileName] = useState('');
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [foundPhrases, setFoundPhrases] = useState([]);
  const [risk, setRisk] = useState(null); // 'low' | 'medium' | 'high' | null

  async function handleFile(file) {
    if (!file) return;

    setFileName(file.name);
    setStatusText('reading text from image...');
    setExtractedText('');
    setFoundPhrases([]);
    setRisk(null);

    try {
      // Tesseract.recognize(image, language) runs OCR and resolves with the result.
      const { data } = await Tesseract.recognize(file, 'eng');
      const text = data.text || '';

      setExtractedText(text.trim() || '(no text found)');
      scanText(text);
      setStatusText('');

    } catch (err) {
      setStatusText('Could not read this image.');
    }
  }

  function scanText(text) {
    const lowerText = text.toLowerCase();
    const found = OCR_KEYWORDS.filter((kw) => lowerText.includes(kw));
    setFoundPhrases(found);

    if (found.length >= 2) setRisk('high');
    else if (found.length === 1) setRisk('medium');
    else setRisk('low');
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <section className="panel">
      <p className="panel-label">02 · screenshot ocr</p>

      <label
        className="dropzone magnetic"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <span>{fileName || 'drop or choose a screenshot to extract and scan text'}</span>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </label>

      {statusText && <div className="status">{statusText}</div>}

      {risk && (
        <div className="result">
          <div className="badge-row">
            <span className={`badge ${risk}`}>{risk} risk</span>
          </div>
          <ul className="flag-list">
            {foundPhrases.length === 0 && <li>no phishing-style phrases found</li>}
            {foundPhrases.map((kw, i) => (
              <li key={i}>found phrase: "{kw}"</li>
            ))}
          </ul>
          <details>
            <summary>extracted text</summary>
            <p className="mono-block">{extractedText}</p>
          </details>
        </div>
      )}
    </section>
  );
}