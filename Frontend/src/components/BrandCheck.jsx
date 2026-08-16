import { useState } from 'react';
import { levenshtein } from '../utils/levenshtein';

// A small table of well-known brand domains to check impersonation against.
// A real project would load a bigger list; this is enough to prove the idea.
const KNOWN_BRANDS = [
  'paypal.com', 'google.com', 'facebook.com', 'apple.com',
  'amazon.com', 'microsoft.com', 'netflix.com', 'instagram.com',
  'bankofamerica.com', 'chase.com'
];

export function BrandCheck() {
  const [domain, setDomain] = useState('');
  const [risk, setRisk] = useState(null);     // 'low' | 'high' | null
  const [message, setMessage] = useState('');

  function handleCheck() {
    const typed = domain.trim().toLowerCase();
    if (!typed) return;

    // exact match -> it IS the real brand, nothing to flag
    if (KNOWN_BRANDS.includes(typed)) {
      setRisk('low');
      setMessage(`${typed} is an exact match for a known brand.`);
      return;
    }

    // find the closest known brand by edit distance
    let closest = null;
    let closestDist = Infinity;

    KNOWN_BRANDS.forEach((brand) => {
      const dist = levenshtein(typed, brand);
      if (dist < closestDist) {
        closestDist = dist;
        closest = brand;
      }
    });

    // small distance (1-2 edits) on a similar-length domain = likely impersonation
    if (closestDist > 0 && closestDist <= 2) {
      setRisk('high');
      setMessage(`Suspiciously close to ${closest} (${closestDist} character${closestDist > 1 ? 's' : ''} different).`);
    } else {
      setRisk('low');
      setMessage('No close match to a known brand found.');
    }
  }

  return (
    <section className="panel">
      <p className="panel-label">03 · brand check</p>

      <div className="row">
        <input
          type="text"
          placeholder="paypa1.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button className="magnetic" onClick={handleCheck}>Check</button>
      </div>

      {risk && (
        <div className="result">
          <div className="badge-row">
            <span className={`badge ${risk}`}>{risk} risk</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
            {message}
          </p>
        </div>
      )}
    </section>
  );
}
