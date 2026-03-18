"use client";

import { useState } from "react";
import { CheckIn } from "@/lib/types";

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeightChart({ checkins }: { checkins: CheckIn[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter to only entries with weight, sort ascending by date
  const data = checkins
    .filter((c) => c.weight !== null && c.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length < 2) {
    return (
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Log at least 2 weights to see trends.
        </p>
      </div>
    );
  }

  const weights = data.map((d) => d.weight!);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);
  const range = maxW - minW || 1;

  const W = 600;
  const H = 180;
  const padLeft = 44;
  const padRight = 16;
  const padTop = 12;
  const padBottom = 28;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  function toX(i: number): number {
    return padLeft + (i / (data.length - 1)) * innerW;
  }
  function toY(weight: number): number {
    return padTop + innerH - ((weight - minW) / range) * innerH;
  }

  const yTicks: number[] = [];
  const step = range > 20 ? 10 : range > 10 ? 5 : 2;
  for (let v = Math.ceil(minW / step) * step; v <= maxW; v += step) {
    yTicks.push(v);
  }

  const points = data.map((d, i) => `${toX(i)},${toY(d.weight!)}`).join(" ");
  const hoveredData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-[14px] font-semibold text-foreground">Weight</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {data.length} entries · {formatDate(data[0].date)} to{" "}
          {formatDate(data[data.length - 1].date)}
        </p>
      </div>
      <div className="px-3 pb-2 relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ maxHeight: 200 }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={padLeft}
                y1={toY(v)}
                x2={W - padRight}
                y2={toY(v)}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={toY(v) + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="9"
              >
                {v}
              </text>
            </g>
          ))}

          {/* X-axis labels (show ~6 evenly spaced) */}
          {data.map((d, i) => {
            const labelInterval = Math.max(1, Math.floor(data.length / 6));
            if (i % labelInterval !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={toX(i)}
                y={H - 4}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="8"
              >
                {formatDate(d.date)}
              </text>
            );
          })}

          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover columns */}
          {data.map((_, i) => {
            const colW = innerW / data.length;
            return (
              <rect
                key={i}
                x={toX(i) - colW / 2}
                y={padTop}
                width={colW}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                onTouchStart={() => setHoveredIdx(i)}
              />
            );
          })}

          {hoveredIdx !== null && (
            <>
              <line
                x1={toX(hoveredIdx)}
                y1={padTop}
                x2={toX(hoveredIdx)}
                y2={padTop + innerH}
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <circle
                cx={toX(hoveredIdx)}
                cy={toY(data[hoveredIdx].weight!)}
                r={3.5}
                fill="var(--primary)"
                stroke="white"
                strokeWidth="1.5"
              />
            </>
          )}
        </svg>

        {hoveredData && hoveredIdx !== null && (
          <div
            className="absolute bg-popover border rounded-lg shadow-lg px-3 py-2 pointer-events-none z-10"
            style={{
              left: `${(toX(hoveredIdx) / W) * 100}%`,
              top: 8,
              transform:
                hoveredIdx > data.length / 2
                  ? "translateX(-100%)"
                  : "translateX(0)",
            }}
          >
            <p className="text-[11px] font-medium text-foreground">
              {formatDate(hoveredData.date)}
            </p>
            <p className="text-[12px] font-semibold tabular-nums">
              {hoveredData.weight} lbs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
