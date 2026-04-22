import { useState } from 'react';
import BubbleChart from './BubbleChart';
import ParallelCoords from './ParallelCoords';

export default function Stage3_CrossSport({
  athletes, overallScores, sportScores, weights, goTo,
}) {
  const [highlightedId, setHighlightedId] = useState(null);

  // Flatten all athletes with their sport and overall breakdown
  const allAthletes = [
    ...athletes.football.map(a => ({ ...a, sport: 'football' })),
    ...athletes.chess.map(a => ({ ...a, sport: 'chess' })),
    ...athletes.boxing.map(a => ({ ...a, sport: 'boxing' })),
  ].map(a => ({
    ...a,
    overallScore: overallScores[a.id]?.score || 0,
    breakdown: overallScores[a.id]?.breakdown || {},
  }));

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 60px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 900, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Cross-Sport Comparison
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          All athletes in a shared space — see who truly stands apart
        </p>
      </div>

      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="01" title="The Field" subtitle="Longevity vs. Dominance — bubble size represents Accolades" />
        <BubbleChart
          athletes={allAthletes}
          highlightedId={highlightedId}
          setHighlightedId={setHighlightedId}
        />
      </section>

      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="02" title="Parallel Profiles" subtitle="Hover lines for athlete names, filter by sport, and reorder axes" />
        <ParallelCoords
          athletes={allAthletes}
          highlightedId={highlightedId}
          setHighlightedId={setHighlightedId}
        />
      </section>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => goTo(4)}
          style={{
            padding: '16px 48px',
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            border: 'none', borderRadius: 50, color: '#0f0f0f',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', boxShadow: '0 0 30px rgba(245,158,11,0.3)',
          }}
        >
          See the Verdict →
        </button>
      </div>
    </div>
  );
}

function SectionHeading({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 600 }}>{number}</span>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, margin: 0, color: '#e5e5e5' }}>
          {title}
        </h3>
      </div>
      <p style={{ color: '#6b7280', fontSize: 13, margin: 0, paddingLeft: 28 }}>{subtitle}</p>
    </div>
  );
}
