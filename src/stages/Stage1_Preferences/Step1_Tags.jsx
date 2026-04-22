const ALL_TAGS = [
  'Consistency', 'Peak Dominance', 'Titles & Trophies', 'Longevity',
  'Rivalry', 'Beating the Odds', 'Records', 'Era Difficulty',
  'Mental Strength', 'Innovation', 'Impact on the Sport', 'Clutch Performance',
];

export default function Step1_Tags({ selectedTags, setSelectedTags, onNext }) {
  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{
        fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        fontWeight: 700, marginBottom: 12, color: '#e5e5e5',
      }}>
        What makes a sporting legend?
      </h2>
      <p style={{ color: '#9ca3af', marginBottom: 8, fontSize: 15 }}>
        Select all keywords that matter most to you
      </p>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 13 }}>
        {selectedTags.length} selected
      </p>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, marginBottom: 40,
      }}>
        {ALL_TAGS.map(tag => {
          const selected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: '10px 14px',
                borderRadius: 50,
                border: selected ? '2px solid #F59E0B' : '2px solid #2a2a2a',
                backgroundColor: selected ? 'rgba(245,158,11,0.15)' : '#1a1a1a',
                color: selected ? '#F59E0B' : '#9ca3af',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: selected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                transform: selected ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={selectedTags.length === 0}
        style={{
          padding: '14px 44px',
          background: selectedTags.length > 0
            ? 'linear-gradient(135deg, #F59E0B, #FBBF24)'
            : '#2a2a2a',
          border: 'none', borderRadius: 50,
          color: selectedTags.length > 0 ? '#0f0f0f' : '#4b5563',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16,
          cursor: selectedTags.length > 0 ? 'pointer' : 'not-allowed',
          transition: 'all 300ms ease',
        }}
      >
        Next →
      </button>
    </div>
  );
}
