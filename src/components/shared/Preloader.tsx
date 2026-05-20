"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fadeTimer  = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(fadeTimer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundColor: "#0E0F11",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.4s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{ position: "relative", marginLeft: 92 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 80,
              marginTop: -45,
              marginLeft: -i * 14,
              borderRadius: 0,
              backgroundColor: "#C9F31D",
              display: "block",
              animation: `dixor-loader-aim 0.8s ${i * 0.1}s infinite alternate-reverse`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dixor-loader-aim {
          0%   { height: 2px;  margin-top: 0px;   }
          100% { height: 80px; margin-top: -45px; }
        }
      `}</style>
    </div>
  );
}
