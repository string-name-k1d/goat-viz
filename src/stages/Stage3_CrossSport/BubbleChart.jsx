import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { TAG_COLORS } from "../../components/KeywordSidePanel";
import { keywordScoreFromBreakdown } from "../../utils/keywordScoring";

const SPORT_COLORS = {
  football: "#F59E0B",
  chess: "#14B8A6",
  boxing: "#EF4444",
};

const DEFAULT_BUBBLE_OPACITY = 0.45;
const FOCUSED_BUBBLE_OPACITY = 0.92;

export default function BubbleChart({
  athletes,
  selectedTags,
  bubbleAxes,
  highlightedId,
  setHighlightedId,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [width, setWidth] = useState(700);

  const height = 380;
  const margin = { top: 20, right: 20, bottom: 48, left: 52 };

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const tags = (selectedTags || []).filter(Boolean);
    const xTag = bubbleAxes?.x || tags[0];
    const yTag = bubbleAxes?.y || tags[1];

    if (!svgRef.current || !athletes.length || !xTag || !yTag) return;
    const W = width - margin.left - margin.right;
    const H = height - margin.top - margin.bottom;
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .selectAll("g.chart-root")
      .data([null])
      .join("g")
      .attr("class", "chart-root")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xVal = (a) => keywordScoreFromBreakdown(a.breakdown || {}, xTag);
    const yVal = (a) => keywordScoreFromBreakdown(a.breakdown || {}, yTag);
    const rVal = (a) => a.overallScore || 0;

    const x = d3.scaleLinear().domain([0, 1]).range([0, W]);
    const y = d3.scaleLinear().domain([0, 1]).range([H, 0]);
    const r = d3.scaleLinear().domain(d3.extent(athletes, rVal)).range([5, 22]);

    // Axes + grid (kept stable so only values animate on axis change)
    const xAxisG = g
      .selectAll("g.x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${H})`);
    xAxisG
      .transition()
      .duration(500)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")));
    xAxisG
      .selectAll("text")
      .style("fill", "#6b7280")
      .style("font-size", "10px");
    xAxisG.selectAll(".domain").remove();
    xAxisG.selectAll(".tick line").style("stroke", "#2a2a2a");

    const yAxisG = g
      .selectAll("g.y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis");
    yAxisG
      .transition()
      .duration(500)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));
    yAxisG
      .selectAll("text")
      .style("fill", "#6b7280")
      .style("font-size", "10px");
    yAxisG.selectAll(".domain").remove();
    yAxisG.selectAll(".tick line").style("stroke", "#2a2a2a");

    const gridG = g
      .selectAll("g.grid")
      .data([null])
      .join("g")
      .attr("class", "grid");
    gridG
      .transition()
      .duration(500)
      .call(d3.axisLeft(y).ticks(5).tickSize(-W).tickFormat(""));
    gridG
      .selectAll("line")
      .style("stroke", "#1f1f1f")
      .style("stroke-dasharray", "3,3");
    gridG.selectAll(".domain").remove();

    // Axis labels
    svg
      .selectAll("text.x-label")
      .data([xTag])
      .join("text")
      .attr("class", "x-label")
      .attr("x", margin.left + W / 2)
      .attr("y", height - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", 11)
      .text((d) => d);
    svg
      .selectAll("text.y-label")
      .data([yTag])
      .join("text")
      .attr("class", "y-label")
      .attr("x", -(margin.top + H / 2))
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("fill", "#6b7280")
      .attr("font-size", 11)
      .text((d) => d);

    // Bubbles
    const circles = g.selectAll("circle.bubble").data(athletes, (d) => d.id);

    circles.exit().transition().duration(250).attr("r", 0).remove();

    const circlesEnter = circles
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => x(xVal(d)))
      .attr("cy", (d) => y(yVal(d)))
      .attr("r", 0)
      .attr("fill", (d) => SPORT_COLORS[d.sport])
      .attr("fill-opacity", DEFAULT_BUBBLE_OPACITY)
      .attr("stroke", (d) => SPORT_COLORS[d.sport])
      .attr("stroke-width", 0.75)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          athlete: d,
        });
        setHoveredId(d.id);
      })
      .on("mouseleave", () => {
        setTooltip(null);
        setHoveredId(null);
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        setHighlightedId((prev) => (prev === d.id ? null : d.id));
      });

    const mergedCircles = circlesEnter
      .merge(circles)
      .attr("fill", (d) => SPORT_COLORS[d.sport]);

    mergedCircles
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attr("cx", (d) => x(xVal(d)))
      .attr("cy", (d) => y(yVal(d)))
      .attr("r", (d) => r(rVal(d)));
  }, [athletes, width, selectedTags, bubbleAxes]);

  useEffect(() => {
    if (!svgRef.current) return;
    const circles = d3.select(svgRef.current).selectAll("circle.bubble");
    const activeFocusedId = hoveredId ?? highlightedId;

    circles
      .attr("fill-opacity", (d) =>
        d.id === activeFocusedId
          ? FOCUSED_BUBBLE_OPACITY
          : DEFAULT_BUBBLE_OPACITY,
      )
      .attr("stroke", (d) =>
        d.id === activeFocusedId ? "#fff" : SPORT_COLORS[d.sport],
      )
      .attr("stroke-width", (d) => (d.id === activeFocusedId ? 2.5 : 0.75));

    if (activeFocusedId) {
      circles.filter((d) => d.id === activeFocusedId).raise();
    }
  }, [highlightedId, hoveredId]);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        border: "1px solid #2a2a2a",
        padding: 16,
        position: "relative",
      }}
    >
      {(selectedTags || []).filter(Boolean).length < 3 ? (
        <div style={{ padding: "26px 14px", textAlign: "center" }}>
          <p
            style={{
              color: "#9ca3af",
              fontSize: 13,
              margin: 0,
              fontWeight: 700,
            }}
          >
            Select at least 3 keywords to enable this chart
          </p>
          <p style={{ color: "#6b7280", fontSize: 12, margin: "8px 0 0" }}>
            Bubble chart uses the chosen x, y, and size keywords.
          </p>
        </div>
      ) : null}
      {/* Legend */}
      <div
        style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}
      >
        {Object.entries(SPORT_COLORS).map(([sport, col]) => (
          <div
            key={sport}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
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
                fontSize: 12,
                color: "#9ca3af",
                textTransform: "capitalize",
              }}
            >
              {sport}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "#555",
              opacity: 0.6,
            }}
          />
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            size = overall weighted score
          </span>
        </div>
        {[bubbleAxes?.x, bubbleAxes?.y].filter(Boolean).map((t) => (
          <div
            key={t}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 10,
                height: 3,
                borderRadius: 2,
                backgroundColor: TAG_COLORS[t] || "#9ca3af",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: TAG_COLORS[t] || "#9ca3af",
                fontWeight: 700,
              }}
            >
              {t}
            </span>
          </div>
        ))}
      </div>

      {(selectedTags || []).filter(Boolean).length >= 2 &&
        bubbleAxes?.x &&
        bubbleAxes?.y && <svg ref={svgRef} style={{ overflow: "visible" }} />}

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            backgroundColor: "#0f0f0f",
            border: `1px solid ${SPORT_COLORS[tooltip.athlete.sport]}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 160,
          }}
        >
          <p
            style={{
              color: SPORT_COLORS[tooltip.athlete.sport],
              fontWeight: 700,
              margin: "0 0 4px",
              fontSize: 14,
            }}
          >
            {tooltip.athlete.name}
          </p>
          <p
            style={{
              color: "#9ca3af",
              margin: "0 0 6px",
              textTransform: "capitalize",
            }}
          >
            {tooltip.athlete.sport}
          </p>
          {[bubbleAxes?.x, bubbleAxes?.y].filter(Boolean).map((t) => (
            <p
              key={t}
              style={{ color: TAG_COLORS[t] || "#9ca3af", margin: "2px 0" }}
            >
              {t}:{" "}
              {Math.round(
                keywordScoreFromBreakdown(tooltip.athlete.breakdown || {}, t) *
                  100,
              )}
            </p>
          ))}
          <p style={{ color: "#9ca3af", margin: "2px 0" }}>
            Total weighted score:{" "}
            {(tooltip.athlete.overallScore || 0).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
