"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

/**
 * DESIGN 15: 3D CARD SHOWCASE
 *
 * Concept: A dramatic 3D space where emotion cards float and rotate.
 * Heavy use of CSS 3D transforms, perspective, and mouse-tracking parallax.
 * The cards ARE the interface—hovering reveals info, clicking navigates.
 * Feels like entering a creative workspace.
 *
 * Memorable element: The immersive 3D card environment with mouse parallax
 */

export default function ThreeDShowcasePage() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const cards = [
    { emotion: "Joy", color: "#E8B86D", x: -30, y: -15, z: 100, rotateY: -15 },
    { emotion: "Calm", color: "#7BA897", x: 25, y: -20, z: 50, rotateY: 10 },
    { emotion: "Sad", color: "#7B8FAF", x: -35, y: 20, z: 150, rotateY: -20 },
    { emotion: "Brave", color: "#AF7B8F", x: 30, y: 15, z: 80, rotateY: 15 },
    { emotion: "Worried", color: "#8FAF7B", x: 0, y: 25, z: 200, rotateY: 5 },
    { emotion: "Proud", color: "#D4956A", x: -15, y: -25, z: 250, rotateY: -8 },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F0] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link href="/15" className="text-sm tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity">
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2.5 bg-[#F5F5F0] text-[#0D0D0D] hover:bg-[#D4956A] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* 3D Scene */}
      <div
        className="h-screen relative"
        style={{ perspective: "1500px", perspectiveOrigin: "50% 50%" }}
      >
        {/* Ambient light effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212, 149, 106, 0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Grid lines for depth */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #F5F5F0 1px, transparent 1px),
                linear-gradient(to bottom, #F5F5F0 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px",
              transform: `rotateX(60deg) translateY(-50%) scale(3)`,
              transformOrigin: "center center",
            }}
          />
        </div>

        {/* Floating cards */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform: `
              rotateX(${(mousePos.y - 0.5) * -10}deg)
              rotateY(${(mousePos.x - 0.5) * 10}deg)
            `,
            transition: "transform 0.1s ease-out",
          }}
        >
          {cards.map((card, i) => (
            <div
              key={card.emotion}
              className={`absolute w-48 h-64 rounded-2xl cursor-pointer transition-all duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              } ${activeCard === i ? "z-50" : ""}`}
              style={{
                backgroundColor: card.color,
                transform: `
                  translate3d(${card.x + (mousePos.x - 0.5) * 20}vw, ${card.y + (mousePos.y - 0.5) * 10}vh, ${card.z}px)
                  rotateY(${activeCard === i ? 0 : card.rotateY}deg)
                  scale(${activeCard === i ? 1.2 : 1})
                `,
                transitionDelay: `${i * 100}ms`,
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset
                `,
              }}
              onMouseEnter={() => setActiveCard(i)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Card content */}
              <div className="h-full flex flex-col items-center justify-center p-6 text-white">
                <div
                  className="w-24 h-24 rounded-full mb-6 transition-transform duration-500"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: activeCard === i ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <span className="text-xl font-medium">{card.emotion}</span>
                {/* Hover content */}
                <div
                  className={`absolute inset-0 bg-[#0D0D0D]/90 rounded-2xl flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
                    activeCard === i ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <span className="text-xl font-medium mb-4">{card.emotion}</span>
                  <p className="text-sm text-center opacity-60 mb-6">
                    Create beautiful {card.emotion.toLowerCase()} emotion cards for your clients
                  </p>
                  <Link
                    href="/signup"
                    className="text-xs tracking-wider uppercase border border-current px-4 py-2 hover:bg-[#F5F5F0] hover:text-[#0D0D0D] transition-colors"
                  >
                    Start Creating
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center relative z-10">
            <h1
              className="text-5xl md:text-7xl font-light tracking-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Emotion Cards
              <br />
              <em className="text-[#D4956A]">Reimagined</em>
            </h1>
            <p className="text-lg opacity-50 max-w-md mx-auto mb-8">
              Move your mouse to explore. Click any card to begin.
            </p>
            <Link
              href="/signup"
              className="pointer-events-auto inline-block px-8 py-4 bg-[#D4956A] text-[#0D0D0D] font-medium hover:bg-[#E8B86D] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0D0D0D] to-transparent py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-light text-[#D4956A]">500+</p>
              <p className="text-xs tracking-wider uppercase opacity-40 mt-1">Therapists</p>
            </div>
            <div>
              <p className="text-3xl font-light text-[#D4956A]">20+</p>
              <p className="text-xs tracking-wider uppercase opacity-40 mt-1">Emotions</p>
            </div>
            <div>
              <p className="text-3xl font-light text-[#D4956A]">5</p>
              <p className="text-xs tracking-wider uppercase opacity-40 mt-1">Style Presets</p>
            </div>
            <div>
              <p className="text-3xl font-light text-[#D4956A]">14</p>
              <p className="text-xs tracking-wider uppercase opacity-40 mt-1">Days Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll prompt */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="flex items-center gap-3 text-xs tracking-wider uppercase opacity-40">
          <span>Hover cards to explore</span>
          <div className="w-6 h-6 border border-current rounded-full flex items-center justify-center animate-pulse">
            <span>↖</span>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="fixed bottom-8 left-8 z-50 text-xs opacity-40">
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100">Terms</Link>
        </nav>
      </div>
    </div>
  );
}
