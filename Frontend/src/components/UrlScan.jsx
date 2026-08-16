import { useState } from 'react';

// Change this if your Flask backend runs somewhere else.
const BACKEND_URL = 'http://127.0.0.1:5000/analyze';

export function UrlScan() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);   // holds { score, risk, flags } once we get a response
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setError('');
    setResult(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Enter a url first.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl })
      });

      if (!res.ok) throw new Error('Backend returned an error');

      const data = await res.json();
      setResult(data); // data = { url, score, risk, flags: [{flag, severity, points}] }

    } catch (err) {
      setError('Could not reach the backend. Is app.py running on port 5000?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <p className="panel-label">01 · url scan</p>

      <div className="row">
        <input
          type="text"
          placeholder="http://paypa1-secure.xyz/login"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="magnetic" onClick={handleAnalyze}>
          {loading ? 'Scanning...' : 'Analyze'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <div className="badge-row">
            <span className={`badge ${result.risk}`}>{result.risk} risk</span>
            <span className="score-text">score {result.score}/100</span>
          </div>
          <ul className="flag-list">
            {result.flags.map((f, i) => (
              <li key={i}>{f.flag}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}