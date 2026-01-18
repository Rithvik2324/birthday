"use client";

import React, { useEffect, useState } from "react";

type Star = { id: number; left: string; top: string; label?: string };

// Four main clickable stars mapped to images 42-45
const stars: Star[] = [
  { id: 0, left: "18%", top: "18%", label: "Alzirr" },
  { id: 1, left: "30%", top: "32%", label: "Castor" },
  { id: 2, left: "46%", top: "28%", label: "Pollux" },
  { id: 3, left: "62%", top: "16%", label: "Mebsuta" },
];

export default function GeminiConstellation({ visible, onClose }: { visible?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (typeof visible === "boolean") setOpen(visible);
  }, [visible]);

  const images = ["42.jpg", "43.jpg", "44.jpg", "45.jpg"];

  return (
    <div className="constellation-root" aria-hidden={false}>
      <div className="constellation-canvas" aria-hidden>
        <div className="constellation-badge">Gemini ♊</div>
        {/* Gemini-style twin chain lines */}
        <svg className="constellation-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
          <polyline points="18,18 30,32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
          <polyline points="46,28 62,16" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
          <polyline points="30,32 46,28" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.45} strokeDasharray="0.8 0.8" />
        </svg>

        {stars.map((s) => (
          <button
            key={s.id}
            className="constellation-star"
            style={{ left: s.left, top: s.top }}
            onClick={() => {
              setIndex(s.id);
              setOpen(true);
            }}
            title={s.label ?? `Star ${s.id + 1}`}
          >
            <span className="constellation-dot" />
            <span className="constellation-label">{s.label}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="constellation-modal" role="dialog" aria-modal="true">
          <div className="constellation-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="constellation-modal-header">
              <button
                className="constellation-close"
                onClick={() => {
                  setOpen(false);
                  onClose?.();
                }}
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <div className="constellation-modal-body">
              <div className="constellation-img-wrap">
                <img
                  src={`/images/${images[index]}`}
                  alt={`Constellation photo ${index + 1}`}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.src = "/images/placeholder.png";
                  }}
                />
                <div className="constellation-caption">Photo {index + 1} / {images.length}</div>
              </div>
            </div>
          </div>
          <div
            className="constellation-modal-backdrop"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
