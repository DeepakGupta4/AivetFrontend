"use client";

import { useEffect, useRef, useState } from "react";
import { getScoreBand } from "@/lib/colors";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasH = Math.round(size * 0.65);

  // Animated value that eases toward `score` (re-runs on every mount + change).
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = shownRef.current;
    const to = score;
    const dur = 1000;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const val = from + (to - from) * eased;
      shownRef.current = val;
      setShown(val);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const band = getScoreBand(score);

  // Redraw the arc for the current animated value.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = canvasH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset+scale (effect runs each frame)
    ctx.clearRect(0, 0, size, canvasH);

    const cx = size / 2;
    const cy = canvasH * 0.88;
    const r = size * 0.40;
    const startAngle = Math.PI * 1.0;
    const endAngle = Math.PI * 2.0;
    const value = Math.max(0, Math.min(100, shown));
    const scoreAngle = startAngle + (value / 100) * (endAngle - startAngle);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    // Colored fill arc
    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0, "#EF4444");
    grad.addColorStop(0.25, "#F8961E");
    grad.addColorStop(0.55, "#C9F31D");
    grad.addColorStop(1, "#22C55E");
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, scoreAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, scoreAngle);
    ctx.strokeStyle = band.color + "40";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.stroke();

    // Tip dot
    const dotX = cx + r * Math.cos(scoreAngle);
    const dotY = cy + r * Math.sin(scoreAngle);
    ctx.shadowColor = band.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = band.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [shown, size, canvasH, band.color]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: size }}>
      <div style={{ position: "relative", width: size, height: canvasH }}>
        <canvas ref={canvasRef} style={{ width: size, height: canvasH, display: "block" }} />
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1,
              color: band.color,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-1px",
            }}
          >
            {Math.round(shown)}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "3px 8px",
              borderRadius: 20,
              background: band.bg,
              color: band.color,
            }}
          >
            {band.label}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>0</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>100</span>
      </div>
    </div>
  );
}
