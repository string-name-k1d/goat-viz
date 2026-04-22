import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { computeSportScoreList } from "../../utils/scoring";
import { inferWeights, tagWeights } from "../../data/attributeMap";
import { TAG_COLORS } from "../../components/KeywordSidePanel";

function MiniPreview({ athletes, attributeMeta, weights }) {
  const allAthletes = [
    ...athletes.football.slice(0, 3),
    ...athletes.chess.slice(0, 3),
    ...athletes.boxing.slice(0, 3),
  ];
  const sport = (id) => {
    if (athletes.football.find((a) => a.id === id)) return "football";
    if (athletes.chess.find((a) => a.id === id)) return "chess";
    return "boxing";
  };
  const sportColor = {
    football: "#F59E0B",
    chess: "#14B8A6",
    boxing: "#EF4444",
  };

  const scores = useMemo(() => {
    const result = {};
    ["football", "chess", "boxing"].forEach((s) => {
      const sc = computeSportScoreList(
        athletes[s].slice(0, 3),
        attributeMeta[s],
        weights,
      );
      Object.assign(result, sc);
    });
    return result;
  }, [athletes, attributeMeta, weights]);

  const ranked = allAthletes
    .map((a) => ({ ...a, score: scores[a.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 8 }}>
        Top 3 preview
      </p>
      {ranked.map((a, i) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 0",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: 12, width: 16 }}>
            {i + 1}
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: sportColor[sport(a.id)],
            }}
          />
          <span style={{ flex: 1, fontSize: 13, color: "#e5e5e5" }}>
            {a.name}
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {(a.score * 100).toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Step3_WeightReview({
  selectedTags,
  tagIntensities,
  athletes,
  attributeMeta,
  onConfirm,
  onBack,
}) {
  const inferredWeights = useMemo(
    () => inferWeights(selectedTags, [], tagIntensities),
    [selectedTags, tagIntensities],
  );

  const keywordPercentages = useMemo(() => {
    if (!selectedTags.length) return {};

    const contributions = Object.fromEntries(
      selectedTags.map((tag) => {
        const intensity = tagIntensities?.[tag] ?? 1;
        const tw = tagWeights[tag] || {};
        const contribution = Object.values(tw).reduce(
          (sum, w) => sum + w * intensity,
          0,
        );
        return [tag, contribution];
      }),
    );

    const totalContribution = Object.values(contributions).reduce(
      (a, b) => a + b,
      0,
    );
    if (totalContribution <= 0) {
      const fallback = 100 / selectedTags.length;
      return Object.fromEntries(selectedTags.map((tag) => [tag, fallback]));
    }

    return Object.fromEntries(
      selectedTags.map((tag) => {
        return [tag, (contributions[tag] / totalContribution) * 100];
      }),
    );
  }, [selectedTags, tagIntensities]);

  const keywordRadarData = useMemo(
    () =>
      selectedTags.map((t) => ({
        axis: t,
        value: Math.round((tagIntensities?.[t] ?? 1) * 100),
      })),
    [selectedTags, tagIntensities],
  );

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
          fontWeight: 700,
          marginBottom: 8,
          textAlign: "center",
          color: "#e5e5e5",
        }}
      >
        Here's what we heard
      </h2>
      <p
        style={{
          color: "#9ca3af",
          textAlign: "center",
          fontSize: 14,
          marginBottom: 36,
        }}
      >
        Adjust keywords in the left panel — your ranking updates instantly.
      </p>

      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #2a2a2a",
          marginBottom: 20,
        }}
      >
        <MiniPreview
          athletes={athletes}
          attributeMeta={attributeMeta}
          weights={inferredWeights}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Left: radar + quick keyword values */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #2a2a2a",
          }}
        >
          <p
            style={{
              color: "#6b7280",
              fontSize: 12,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Your value profile
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={keywordRadarData}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 150]}
                tick={{ fill: "#4b5563", fontSize: 10 }}
              />
              <Radar
                dataKey="value"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: keyword-only summary */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #2a2a2a",
          }}
        >
          <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 24 }}>
            Your chosen keywords (only)
          </p>
          {selectedTags.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              No keywords selected.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedTags.map((t) => {
                const col = TAG_COLORS[t] || "#F59E0B";
                const pct = keywordPercentages[t] ?? 0;
                return (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${col}55`,
                      backgroundColor: `${col}14`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: col,
                          }}
                        />
                        <span
                          style={{
                            color: "#e5e5e5",
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          {t}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "#d1d5db",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#262626",
                        overflow: "hidden",
                        border: `1px solid ${col}33`,
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, pct))}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${col}CC, ${col})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <p style={{ color: "#6b7280", fontSize: 12, margin: "6px 0 0" }}>
                Edit these in the left keyword panel.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 36,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => onConfirm(inferredWeights)}
          style={{
            padding: "14px 44px",
            background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
            border: "none",
            borderRadius: 50,
            color: "#0f0f0f",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(245,158,11,0.3)",
          }}
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}
