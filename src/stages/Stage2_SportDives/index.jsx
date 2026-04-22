import SportDive from './SportDive';

const SPORTS = [
  { key: 'football', label: 'Football',  tagline: 'The beautiful game — goals, glory, and legacy', color: '#F59E0B' },
  { key: 'chess',    label: 'Chess',     tagline: 'The ultimate mind sport — dominance over the board', color: '#14B8A6' },
  { key: 'boxing',   label: 'Boxing',    tagline: 'The sweet science — power, heart, and survival', color: '#EF4444' },
];

export default function Stage2_SportDives({
  currentSport, setCurrentSport, goTo,
  selectedAthletes, setSelectedAthletes,
  weights, setWeights, athletes, attributeMeta, sportScores,
}) {
  const sport = SPORTS.find(s => s.key === currentSport) || SPORTS[0];
  const activeSportKey = sport.key;
  const safeAthletesBySport = athletes || {};
  const safeAttributeMetaBySport = attributeMeta || {};
  const safeSportScoresBySport = sportScores || {};
  const safeSelectedAthletesBySport = selectedAthletes || {};

  const handleSportTabClick = (sportKey) => {
    if (SPORTS.some(s => s.key === sportKey)) setCurrentSport(sportKey);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Sport tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '20px 20px 0', borderBottom: '1px solid #2a2a2a', marginBottom: 0,
      }}>
        {SPORTS.map(s => (
          <button
            key={s.key}
            onClick={() => handleSportTabClick(s.key)}
            type="button"
            style={{
              padding: '10px 24px', borderRadius: '8px 8px 0 0',
              border: 'none',
              backgroundColor: activeSportKey === s.key ? '#1a1a1a' : 'transparent',
              borderTop: activeSportKey === s.key ? `2px solid ${s.color}` : '2px solid transparent',
              color: activeSportKey === s.key ? s.color : '#6b7280',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SportDive
        sportKey={activeSportKey}
        sport={sport}
        athletes={safeAthletesBySport[activeSportKey] || []}
        attributeMeta={safeAttributeMetaBySport[activeSportKey] || []}
        sportScores={safeSportScoresBySport[activeSportKey] || {}}
        selectedAthletes={safeSelectedAthletesBySport[activeSportKey] || []}
        setSelectedAthletes={(ids) => setSelectedAthletes(prev => ({ ...prev, [activeSportKey]: ids }))}
        weights={weights}
        setWeights={setWeights}
        goTo={goTo}
      />
    </div>
  );
}
