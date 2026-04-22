import RadarView from './RadarView';
import RankedBarChart from './RankedBarChart';
import CareerTimeline from './CareerTimeline';

export default function SportDive({
  sportKey, sport, athletes, attributeMeta, sportScores,
  selectedAthletes, setSelectedAthletes,
  weights, setWeights, goTo,
}) {
  const safeAthletes = athletes || [];
  const safeAttributeMeta = attributeMeta || [];
  const safeSportScores = sportScores || {};
  const safeSelectedAthletes = selectedAthletes || [];
  const safeSport = sport || { label: 'Sport', color: '#F59E0B', tagline: '' };

  const topAthlete = safeAthletes
    .map(a => ({ ...a, score: safeSportScores[a.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)[0];

  const top2Reasons = topAthlete
    ? Object.entries(safeSportScores[topAthlete.id]?.breakdown || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => ({ dominance: 'Dominance', longevity: 'Longevity', accolades: 'Accolades', eraDifficulty: 'Era Difficulty' }[k] || k))
    : [];

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      {/* Sport header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 900, margin: '0 0 8px',
          color: safeSport.color,
        }}>
          {safeSport.label}
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15, fontStyle: 'italic' }}>{safeSport.tagline}</p>
      </div>

      {/* Section: Radar */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="01" title="Athlete Comparison" subtitle="Select athletes to compare across all dimensions" />
        <RadarView
          athletes={safeAthletes}
          attributeMeta={safeAttributeMeta}
          selectedAthletes={safeSelectedAthletes}
          setSelectedAthletes={setSelectedAthletes}
          color={safeSport.color}
        />
      </section>

      {/* Section: Bar Chart */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="02" title="GOAT Rankings" subtitle="All athletes ranked by your current weights" />
        <RankedBarChart
          athletes={safeAthletes}
          attributeMeta={safeAttributeMeta}
          sportScores={safeSportScores}
          selectedAthletes={safeSelectedAthletes}
          weights={weights}
          setWeights={setWeights}
          color={safeSport.color}
        />
      </section>

      {/* Section: Timeline */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="03" title="Career Timeline" subtitle="Peak performance and longevity over the years" />
        <CareerTimeline
          athletes={safeAthletes}
          selectedAthletes={safeSelectedAthletes}
          color={safeSport.color}
          sportKey={sportKey}
        />
      </section>

      {/* GOAT Card */}
      {topAthlete && (
        <div style={{
          backgroundColor: '#1a1a1a', borderRadius: 20, padding: 32,
          border: `1px solid ${safeSport.color}33`,
          boxShadow: `0 0 40px ${safeSport.color}15`,
          textAlign: 'center',
        }}>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
            Based on your values, the {safeSport.label} GOAT is...
          </p>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${safeSport.color}, ${safeSport.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0f0f0f',
          }}>
            {initials(topAthlete.name)}
          </div>
          <h3 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900,
            color: safeSport.color, margin: '0 0 8px',
          }}>
            {topAthlete.name}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
            Score: <strong style={{ color: '#e5e5e5' }}>{(topAthlete.score * 100).toFixed(1)}</strong>
            {' '}· Top traits: <strong style={{ color: '#e5e5e5' }}>{top2Reasons.join(', ')}</strong>
          </p>
          <button
            onClick={() => goTo(3)}
            style={{
              padding: '12px 32px', background: 'none',
              border: `2px solid ${safeSport.color}`, borderRadius: 50,
              color: safeSport.color, fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${safeSport.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            See how the scores compare →
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
          {number}
        </span>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, margin: 0, color: '#e5e5e5' }}>
          {title}
        </h3>
      </div>
      <p style={{ color: '#6b7280', fontSize: 13, margin: 0, paddingLeft: 28 }}>{subtitle}</p>
    </div>
  );
}
