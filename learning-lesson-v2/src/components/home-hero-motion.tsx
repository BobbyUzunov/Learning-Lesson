"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeHeroMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const canAnimate =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches === false &&
      window.matchMedia("(hover: hover)").matches;
    if (!canAnimate) {
      return;
    }

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".home-card"));
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const resetTilts = () => {
      cards.forEach((card) => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    };

    const applyMotion = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      root.style.setProperty("--spot-x", `${((nextX - rect.left) / rect.width) * 100}%`);
      root.style.setProperty("--spot-y", `${((nextY - rect.top) / rect.height) * 100}%`);

      cards.forEach((card) => {
        const bounds = card.getBoundingClientRect();
        const inside =
          nextX >= bounds.left && nextX <= bounds.right && nextY >= bounds.top && nextY <= bounds.bottom;

        if (!inside) {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
          return;
        }

        const px = (nextX - bounds.left) / bounds.width - 0.5;
        const py = (nextY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${(py * -8).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(px * 10).toFixed(2)}deg`);
      });
    };

    const onMove = (event: PointerEvent) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(applyMotion);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", resetTilts);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", resetTilts);
    };
  }, []);

  return (
    <div className="home-hero-motion relative" ref={rootRef}>
      {children}
    </div>
  );
}
