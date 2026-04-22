import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };
const SPORT_LABELS = { football: 'Football', chess: 'Chess', boxing: 'Boxing' };
const PALETTE_RADAR = ['#F59E0B', '#14B8A6', '#8B5CF6'];

const CATEGORIES = [
  { key: 'dominance',     label: 'Dominance' },
  { key: 'longevity',     label: 'Longevity' },
  { key: 'eraDifficulty', label: 'Era' },
];

const HEIGHTS = [200, 140, 100];
const RANKS = ['1st', '2nd', '3rd'];
const ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Podium({ top3 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const radarData = CATEGORIES.map(c => {
    const point = { axis: c.label };
    top3.forEach((a, i) => { point[`p${i}`] = Math.round((a.breakdown?.[c.key] || 0) * 100); });
    return point;
  });

  return (
    <div>
      {/* Podium blocks — display order: 2nd, 1st, 3rd */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8,
        marginBottom: 48,
      }}>
        {ORDER.map((athleteIdx, displayPos) => {
          const athlete = top3[athleteIdx];
          if (!athlete) return null;
          const color = SPORT_COLORS[athlete.sport];
          const blockH = HEIGHTS[athleteIdx];
          const delay = displayPos * 150;

          return (
            <div key={athlete.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 180 }}>
              {/* Athlete info above block */}
              <div style={{
                textAlign: 'center', marginBottom: 12,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 500ms ease ${delay + 200}ms, transform 500ms ease ${delay + 200}ms`,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 8px',
                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: '#0f0f0f',
                  boxShadow: `0 0 20px ${color}44`,
                }}>
                  {initials(athlete.name)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e5e5e5', marginBottom: 2 }}>
                  {athlete.name}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                  {SPORT_LABELS[athlete.sport]}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: color }}>
                  {(athlete.overallScore * 100).toFixed(1)}
                </div>
              </div>

              {/* Podium block */}
              <div style={{
                width: '100%',
                height: visible ? blockH : 0,
                backgroundColor: athleteIdx === 0 ? color : '#1a1a1a',
                border: `2px solid ${color}`,
                borderRadius: '8px 8px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: `height 700ms cubic-bezier(0.34,1.2,0.64,1) ${delay}ms`,
                overflow: 'hidden',
              }}>
                <span style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: athleteIdx === 0 ? 28 : 20,
                  fontWeight: 900,
                  color: athleteIdx === 0 ? '#0f0f0f' : color,
                  opacity: visible ? 1 : 0,
                  transition: `opacity 400ms ease ${delay + 400}ms`,
                }}>
                  {RANKS[athleteIdx]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar comparison for top 3 */}
      <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
        <p style={{ color: '#6b7280', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>Top 3 — radar breakdown</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
          {top3.map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PALETTE_RADAR[i] }} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{a.name}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            {top3.map((a, i) => (
              <Radar
                key={a.id}
                name={a.name}
                dataKey={`p${i}`}
                stroke={PALETTE_RADAR[i]}
                fill={PALETTE_RADAR[i]}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
