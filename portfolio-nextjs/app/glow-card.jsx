"use client";

export default function GlowCard({ className = "", children }) {
  function trackPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  }

  return <div className={`glow-card ${className}`} onPointerMove={trackPointer}>{children}</div>;
}
