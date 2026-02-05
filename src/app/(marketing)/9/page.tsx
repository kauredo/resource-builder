"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * DESIGN 9: ORBITAL / RADIAL
 *
 * Concept: Everything arranged in circles. Emotion cards orbit a center point.
 * Radial menus, circular text, rotating elements. Feels like a solar system
 * of emotions. Unique, mesmerizing, unforgettable navigation.
 *
 * Memorable element: The orbital card arrangement and circular layout
 */

export default function OrbitalPage() {
  const [rotation, setRotation] = useState(0);
  const [activeOrbit, setActiveOrbit] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 0.1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const emotions = [
    { name: "Joy", color: "#E8B86D" },
    { name: "Calm", color: "#7BA897" },
    { name: "Sad", color: "#7B8FAF" },
    { name: "Brave", color: "#AF7B8F" },
    { name: "Worried", color: "#8FAF7B" },
    { name: "Proud", color: "#D4956A" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link href="/9" className="text-sm tracking-[0.2em] uppercase opacity-60 hover:opacity-100">
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm opacity-60 hover:opacity-100">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2 rounded-full border border-[#F5F0E8]/30 hover:bg-[#F5F0E8] hover:text-[#0A0A0A] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center relative">
        {/* Orbital rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[200, 320, 440].map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full border border-[#F5F0E8]/5"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${rotation * (i % 2 === 0 ? 1 : -1) * 0.5}deg)`,
              }}
            />
          ))}
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center">
          {/* Center orb */}
          <div
            className="w-40 h-40 rounded-full mx-auto mb-8 flex items-center justify-center relative"
            style={{
              background: "radial-gradient(circle at 30% 30%, #D4956A, #8B5A2B)",
              boxShadow: "0 0 60px rgba(212, 149, 106, 0.4), inset 0 0 30px rgba(0,0,0,0.3)",
            }}
          >
            <span
              className="text-2xl text-white font-light"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create
            </span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-light mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Emotion Cards
          </h1>
          <p className="text-lg opacity-50 mb-8">
            Materials that orbit around healing.
          </p>

          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-full bg-[#D4956A] text-[#0A0A0A] font-medium hover:scale-105 transition-transform"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Orbiting emotion cards */}
        {emotions.map((emotion, i) => {
          const angle = (i / emotions.length) * Math.PI * 2 + rotation * 0.02;
          const radius = 280;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.4; // Elliptical orbit
          const scale = (Math.sin(angle) + 2) / 3; // Depth effect
          const zIndex = Math.round(scale * 10);

          return (
            <div
              key={emotion.name}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${hoveredCard === emotion.name ? 1.2 : scale})`,
                zIndex: hoveredCard === emotion.name ? 100 : zIndex,
                opacity: scale * 0.7 + 0.3,
              }}
              onMouseEnter={() => setHoveredCard(emotion.name)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className="w-24 h-32 rounded-xl flex flex-col items-center justify-center text-white shadow-xl"
                style={{
                  backgroundColor: emotion.color,
                  boxShadow: hoveredCard === emotion.name
                    ? `0 0 40px ${emotion.color}80`
                    : `0 10px 30px rgba(0,0,0,0.3)`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 mb-2" />
                <span className="text-sm font-medium">{emotion.name}</span>
              </div>
            </div>
          );
        })}

        {/* Feature orbits - smaller items */}
        {["Style", "Generate", "Print", "Share"].map((feature, i) => {
          const angle = (i / 4) * Math.PI * 2 - rotation * 0.01 + Math.PI / 4;
          const radius = 420;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.3;

          return (
            <div
              key={feature}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity cursor-default"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              {feature}
            </div>
          );
        })}
      </main>

      {/* Bottom arc info */}
      <div className="fixed bottom-0 left-0 right-0 pb-8">
        <div className="max-w-4xl mx-auto px-8">
          {/* Curved text effect using SVG */}
          <svg viewBox="0 0 800 100" className="w-full h-24 opacity-30">
            <defs>
              <path id="curve" d="M 0,100 Q 400,0 800,100" fill="transparent" />
            </defs>
            <text className="text-xs tracking-[0.5em] uppercase fill-current">
              <textPath href="#curve" startOffset="50%" textAnchor="middle">
                500+ Therapists • 20+ Emotions • 5 Style Presets • 14 Days Free
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      {/* Circular navigation hint */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="w-16 h-16 rounded-full border border-[#F5F0E8]/20 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-[#D4956A] border-t-transparent"
            style={{ animation: "spin 2s linear infinite" }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-8 left-8 z-50 text-xs opacity-30">
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100">Terms</Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
