import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceArea, ResponsiveContainer, ReferenceDot,
} from 'recharts';
import { useState } from 'react';

const PALETTE = ['#F59E0B', '#14B8A6', '#8B5CF6', '#EF4444', '#3B82F6', '#10B981'];

const Y_LABELS = {
  football: 'Goals / season',
  chess:    'Elo rating',
  boxing:   'Performance index',
};

function getPrimeRange(timeline) {
  if (!timeline?.length) return null;
  const avg = timeline.reduce((s, d) => s + d.value, 0) / timeline.length;
  const above = timeline.filter(d => d.value >= avg);
  if (!above.length) return null;
  return { x1: above[0].year, x2: above[above.length - 1].year, avg };
}

const CustomTooltip = ({ active, payload, label, athletes }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
      borderRadius: 8, padding: '12px 16px', fontSize: 14,
    }}>
      <p style={{ color: '#d1d5db', margin: '0 0 6px', fontWeight: 700 }}>{label}</p>
      {payload.map(p => {
        const a = (athletes || []).find(at => at.id === p.dataKey);
        return (
          <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
            {a?.name}: <strong>{p.value}</strong>
          </p>
        );
      })}
    </div>
  );
};

export default function CareerTimeline({ athletes, selectedAthletes, color, sportKey }) {
  const [selectedAward, setSelectedAward] = useState(null);
  const [hoveredAwardKey, setHoveredAwardKey] = useState(null);
  const safeAthletes = athletes || [];
  const safeSelectedAthletes = selectedAthletes || [];
  const selected = safeAthletes.filter(a => safeSelectedAthletes.includes(a.id));
  if (!selected.length) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a', borderRadius: 16, padding: 32,
        border: '1px solid #2a2a2a', textAlign: 'center', color: '#4b5563',
      }}>
        Select athletes in the Radar section to see their career timelines
      </div>
    );
  }

  // Build a continuous year axis so era gaps are visible.
  const allYears = selected.flatMap(a => (a.timeline || []).map(d => d.year));
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const sortedYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const chartData = sortedYears.map(year => {
    const point = { year };
    selected.forEach(a => {
      const match = a.timeline?.find(d => d.year === year);
      point[a.id] = match ? match.value : null;
    });
    return point;
  });

  // Award dots for each athlete
  const awardDots = [];
  selected.forEach((a, i) => {
    (a.awards || []).forEach(award => {
      const dp = chartData.find(d => d.year === award.year);
      if (dp && dp[a.id] != null) {
        const awardKey = `${a.id}-${award.year}-${award.label}`;
        awardDots.push({
          awardKey,
          athleteId: a.id,
          athleteName: a.name,
          year: award.year,
          value: dp[a.id],
          label: award.label,
          color: PALETTE[i % PALETTE.length],
        });
      }
    });
  });

  const prime = selected[0] ? getPrimeRange(selected[0].timeline) : null;

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {selected.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 4, backgroundColor: PALETTE[i % PALETTE.length], borderRadius: 2 }} />
            <span style={{ fontSize: 14, color: '#d1d5db', fontWeight: 600 }}>{a.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 8, backgroundColor: `${color}22`, border: `1px solid ${color}44`, borderRadius: 2 }} />
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Prime years (top athlete)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            type="number"
            domain={[minYear, maxYear]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(year) => `${year}`}
          />
          <YAxis
            label={{ value: Y_LABELS[sportKey] || 'Value', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip athletes={athletes} />} />

          {prime && (
            <ReferenceArea
              x1={prime.x1} x2={prime.x2}
              fill={color} fillOpacity={0.06}
              stroke={color} strokeOpacity={0.2}
              label={{ value: 'Prime', fill: color, fontSize: 10, position: 'insideTopLeft' }}
            />
          )}

          {selected.map((a, i) => (
            <Line
              key={a.id}
              type="monotone"
              dataKey={a.id}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}

          {awardDots.map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.year} y={d.value}
              r={0}
              shape={(props = {}) => {
                const { cx, cy } = props;
                if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
                const isHovered = hoveredAwardKey === d.awardKey;
                const isSelected = selectedAward?.awardKey === d.awardKey;
                const scale = isHovered || isSelected ? 1.2 : 1;
                return (
                  <g
                    transform={`translate(${cx}, ${cy}) scale(${scale})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedAward(d)}
                    onMouseEnter={() => setHoveredAwardKey(d.awardKey)}
                    onMouseLeave={() => setHoveredAwardKey(null)}
                  >
                    <circle r={12} fill="transparent" />
                    <text
                      x={0}
                      y={-8}
                      textAnchor="middle"
                      fill={d.color}
                      fontSize={isHovered || isSelected ? 16 : 14}
                      fontWeight={700}
                    >
                      ★
                    </text>
                  </g>
                );
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {selectedAward && (
        <p style={{ color: '#d1d5db', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
          <strong>{selectedAward.athleteName}</strong> ({selectedAward.year}): {selectedAward.label}
        </p>
      )}
      <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
        ★ marks major awards / titles (click a star to see details). Breaks in lines indicate missing year data.
      </p>
    </div>
  );
}
