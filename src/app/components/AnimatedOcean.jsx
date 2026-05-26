'use client';
import React, { useEffect, useState } from 'react';

export default function AnimatedOcean() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // Generate a set of static-randomized floating bubbles
    const bubbleArray = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 20 + 8, // size in px
      left: Math.random() * 100, // percentage left
      delay: Math.random() * 8, // seconds delay
      duration: Math.random() * 12 + 10, // seconds floating duration
      opacity: Math.random() * 0.15 + 0.05
    }));
    setBubbles(bubbleArray);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-gradient-to-b from-[#0A424A] via-[#04282F] to-[#001418]">
      {/* Wave Layers */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute w-full h-[150%] top-[-50%] left-0" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 200 C300 240, 600 160, 900 220 C1200 280, 1300 220, 1440 250 L1440 800 L0 800 Z"
            fill="url(#wave-gradient-1)"
            className="animate-[pulse_8s_infinite_ease-in-out]"
          />
          <path
            d="M0 350 C400 300, 700 400, 1000 330 C1300 260, 1400 350, 1440 370 L1440 800 L0 800 Z"
            fill="url(#wave-gradient-2)"
            className="animate-[pulse_12s_infinite_ease-in-out_2s]"
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="720" y1="200" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00B5AD" />
              <stop offset="1" stopColor="#002830" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="720" y1="300" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00A39E" />
              <stop offset="1" stopColor="#0A424A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="absolute rounded-full border border-[#00B5AD]/30 bg-gradient-to-tr from-[#00A39E]/10 to-[#FFFFFF]/5 animate-[floatUp_infinite_linear]"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: `-40px`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            opacity: bubble.opacity
          }}
        />
      ))}

      {/* Stylized CSS for custom bubble animation */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--tw-opacity, 0.15);
          }
          90% {
            opacity: var(--tw-opacity, 0.15);
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
