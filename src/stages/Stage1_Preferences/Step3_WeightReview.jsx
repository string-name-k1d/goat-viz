import { useState, useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { computeSportScoreList } from '../../utils/scoring';

const CATEGORIES = [
  { key: 'dominance',     label: 'Dominance',     color: '#F59E0B' },
  { key: 'longevity',     label: 'Longevity',     color: '#14B8A6' },
  { key: 'accolades',     label: 'Accolades',     color: '#8B5CF6' },
  { key: 'eraDifficulty', label: 'Era Difficulty', color: '#EF4444' },
];

function summarize(weights, tags) {
  const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const top2 = sorted.slice(0, 2).map(([k]) => CATEGORIES.find(c => c.key === k)?.label || k);
  return `You value ${top2[0]} and ${top2[1]} most${tags.length > 0 ? ', shaped by your interest in ' + tags.slice(0, 2).join(' & ') : ''}.`;
}

function MiniPreview({ athletes, attributeMeta, weights }) {
  const allAthletes = [
    ...athletes.football.slice(0, 3),
    ...athletes.chess.slice(0, 3),
    ...athletes.boxing.slice(0, 3),
  ];
  const sport = (id) => {
    if (athletes.football.find(a => a.id === id)) return 'football';
    if (athletes.chess.find(a => a.id === id)) return 'chess';
    return 'boxing';
  };
  const sportColor = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };

  const scores = useMemo(() => {
    const result = {};
    ['football', 'chess', 'boxing'].forEach(s => {
      const sc = computeSportScoreList(athletes[s].slice(0, 3), attributeMeta[s], weights);
      Object.assign(result, sc);
    });
    return result;
  }, [athletes, attributeMeta, weights]);

  const ranked = allAthletes
    .map(a => ({ ...a, score: scores[a.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Top 3 preview</p>
      {ranked.map((a, i) => (
        <div key={a.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 0', borderBottom: '1px solid #2a2a2a',
        }}>
          <span style={{ color: '#6b7280', fontSize: 12, width: 16 }}>{i + 1}</span>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: sportColor[sport(a.id)],
          }} />
          <span style={{ flex: 1, fontSize: 13, color: '#e5e5e5' }}>{a.name}</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{(a.score * 100).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Step3_WeightReview({
  weights, setWeights, selectedTags,
  athletes, attributeMeta,
  onConfirm, onBack,
}) {
  const [localWeights, setLocalWeights] = useState({ ...weights });

  function handleSlider(changedKey, newValue) {
    const prev = localWeights[changedKey];
    const delta = newValue - prev;
    const otherKeys = Object.keys(localWeights).filter(k => k !== changedKey);
    const otherTotal = otherKeys.reduce((s, k) => s + localWeights[k], 0);

    const updated = { [changedKey]: newValue };
    if (otherTotal > 0) {
      otherKeys.forEach(k => {
        updated[k] = Math.max(0.02, localWeights[k] - delta * (localWeights[k] / otherTotal));
      });
    } else {
      const share = (1 - newValue) / otherKeys.length;
      otherKeys.forEach(k => { updated[k] = Math.max(0.02, share); });
    }

    // Re-normalize
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    const normalized = Object.fromEntries(Object.keys(updated).map(k => [k, updated[k] / total]));
    setLocalWeights(normalized);
    setWeights(normalized);
  }

  const radarData = CATEGORIES.map(c => ({
    axis: c.label,
    value: Math.round(localWeights[c.key] * 100),
  }));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
        fontWeight: 700, marginBottom: 8, textAlign: 'center', color: '#e5e5e5',
      }}>
        Here's what we heard
      </h2>
      <p style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14, marginBottom: 36 }}>
        {summarize(localWeights, selectedTags)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32, alignItems: 'start' }}>
        {/* Left: radar + preview */}
        <div style={{
          backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
            Your value profile
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
          <MiniPreview athletes={athletes} attributeMeta={attributeMeta} weights={localWeights} />
        </div>

        {/* Right: sliders */}
        <div style={{
          backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24,
          border: '1px solid #2a2a2a',
        }}>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>
            Adjust your values — the preview updates live.
          </p>
          {CATEGORIES.map(cat => (
            <div key={cat.key} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>{cat.label}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>
                  {Math.round(localWeights[cat.key] * 100)}%
                </span>
              </div>
              <input
                type="range" min="2" max="80" step="1"
                value={Math.round(localWeights[cat.key] * 100)}
                onChange={e => handleSlider(cat.key, parseInt(e.target.value) / 100)}
                style={{ width: '100%', accentColor: cat.color, cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => onConfirm(localWeights)}
          style={{
            padding: '14px 44px',
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            border: 'none', borderRadius: 50,
            color: '#0f0f0f', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700, fontSize: 16, cursor: 'pointer',
            boxShadow: '0 0 30px rgba(245,158,11,0.3)',
          }}
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}
