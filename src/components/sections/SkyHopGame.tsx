"use client";

import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

type Phase = "ready" | "playing" | "over";
type Pillar = { x: number; gapY: number; passed: boolean };

const BEST_KEY = "skyhop-best";
const FLAP_KEYS = new Set([" ", "ArrowUp", "w", "W"]);

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

// Storage can throw (private mode, blocked site data): the game just forgets the best score then
const loadBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};
const saveBest = (n: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {}
};

// The canvas can't use Tailwind classes, so it reads the same design tokens from CSS (and re-reads on a theme flip)
const readColors = () => {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    skyTop: v("--glow-1"),
    skyLow: v("--background"),
    sun: v("--glow-2"),
    cloud: v("--surface"),
    pillar: v("--sage"),
    edge: v("--accent"),
    ground: v("--border"),
    body: v("--butter"),
    belly: v("--peach"),
    wing: v("--rose"),
    ink: v("--foreground"),
    eye: v("--surface"),
    outline: v("--background"),
  };
};

/**
 * Tap-to-flap mini game on a <canvas>. All moving state lives in refs/locals inside one requestAnimationFrame loop, so
 * React only re-renders when the phase changes (ready → playing → over), never per frame.
 * Sizes and speeds are fractions of the canvas height, so it plays the same on a phone and a big screen.
 */
export function SkyHopGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>("ready");
  const [result, setResult] = useState({ score: 0, best: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    areaRef.current?.focus({ preventScroll: true });

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // sharp on retina, capped so big screens stay cheap
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let colors = readColors();
    const font = getComputedStyle(document.body).fontFamily;
    const mo = new MutationObserver(() => (colors = readColors()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let state: Phase = "ready";
    let best = loadBest();
    let score = 0;
    let pillars: Pillar[] = [];
    let t = 0;
    let groundX = 0;
    let overAt = 0;
    const bird = { y: h * 0.45, v: 0 };

    const radius = () => Math.max(10, h * 0.035);
    const birdX = () => Math.min(w * 0.28, h * 0.6);
    const groundH = () => Math.max(16, h * 0.07);

    const flap = () => {
      if (state === "over") {
        if (performance.now() - overAt < 450) return; // a frantic last tap shouldn't skip the score screen
        pillars = [];
        score = 0;
        bird.y = h * 0.45;
      }
      if (state !== "playing") {
        state = "playing";
        setPhase("playing");
      }
      bird.v = -0.78 * h;
    };
    flapRef.current = flap;

    const gameOver = () => {
      state = "over";
      overAt = performance.now();
      if (score > best) {
        best = score;
        saveBest(best);
      }
      setResult({ score, best });
      setPhase("over");
    };

    const update = (dt: number) => {
      t += dt;
      const r = radius();
      const floor = h - groundH();
      const speed = h * 0.36;
      const pw = Math.max(36, h * 0.11);
      const gap = Math.max(r * 7, h * 0.3);
      const spacing = Math.max(pw * 3.2, h * 0.62);

      if (state === "ready") {
        bird.y = h * 0.45 + Math.sin(t * 4) * h * 0.02;
      } else if (state === "over") {
        bird.v += h * 2.4 * dt;
        bird.y = Math.min(bird.y + bird.v * dt, floor - r);
        return;
      } else {
        bird.v += h * 2.4 * dt;
        bird.y += bird.v * dt;
        if (bird.y < r) {
          bird.y = r;
          bird.v = 0;
        }

        for (const p of pillars) p.x -= speed * dt;
        pillars = pillars.filter((p) => p.x > -pw);
        const last = pillars.at(-1);
        if (!last || last.x < w - spacing) {
          const margin = gap / 2 + h * 0.06;
          pillars.push({ x: w + pw, gapY: margin + Math.random() * (floor - 2 * margin), passed: false });
        }

        const bx = birdX();
        const hit = r * 0.8; // a slightly forgiving hitbox feels fairer than a pixel-exact one
        for (const p of pillars) {
          if (!p.passed && p.x + pw / 2 < bx) {
            p.passed = true;
            score++;
          }
          const overlapsX = bx + hit > p.x - pw / 2 && bx - hit < p.x + pw / 2;
          if (overlapsX && (bird.y - hit < p.gapY - gap / 2 || bird.y + hit > p.gapY + gap / 2)) return gameOver();
        }
        if (bird.y + r > floor) {
          bird.y = floor - r;
          return gameOver();
        }
      }
      groundX = (groundX - speed * dt) % 24;
    };

    const drawBird = (x: number, y: number) => {
      const r = radius();
      const tilt = state === "ready" ? 0 : Math.max(-0.5, Math.min(1.1, bird.v / (h * 1.2)));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);
      ctx.lineWidth = Math.max(1.5, r * 0.12);
      ctx.strokeStyle = colors.ink;
      // tuft
      ctx.fillStyle = colors.wing;
      ctx.beginPath();
      ctx.ellipse(-r * 0.1, -r * 1.02, r * 0.18, r * 0.32, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // body + belly
      ctx.fillStyle = colors.body;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.belly;
      ctx.beginPath();
      ctx.ellipse(r * 0.15, r * 0.4, r * 0.55, r * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      // wing: beats while playing, rests otherwise
      const beat = state === "playing" ? Math.sin(t * 22) * 0.6 : 0.2;
      ctx.fillStyle = colors.wing;
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, r * 0.05, r * 0.5, r * 0.28, beat, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // beak
      ctx.fillStyle = colors.belly;
      ctx.beginPath();
      ctx.moveTo(r * 0.85, -r * 0.2);
      ctx.lineTo(r * 1.45, r * 0.02);
      ctx.lineTo(r * 0.85, r * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // eye (closed when it bonks)
      if (state === "over") {
        ctx.beginPath();
        ctx.moveTo(r * 0.22, -r * 0.42);
        ctx.lineTo(r * 0.58, -r * 0.18);
        ctx.moveTo(r * 0.58, -r * 0.42);
        ctx.lineTo(r * 0.22, -r * 0.18);
        ctx.stroke();
      } else {
        ctx.fillStyle = colors.eye;
        ctx.beginPath();
        ctx.arc(r * 0.4, -r * 0.3, r * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(r * 0.48, -r * 0.3, r * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const draw = () => {
      const floor = h - groundH();
      const pw = Math.max(36, h * 0.11);
      const gap = Math.max(radius() * 7, h * 0.3);

      const sky = ctx.createLinearGradient(0, 0, 0, floor);
      sky.addColorStop(0, colors.skyTop);
      sky.addColorStop(1, colors.skyLow);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // sun (light) / moon (dark): the same glow token the rest of the site uses
      ctx.fillStyle = colors.sun;
      ctx.beginPath();
      ctx.arc(w - h * 0.16, h * 0.17, h * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = colors.cloud;
      ctx.globalAlpha = 0.85;
      for (const [fx, fy, s] of [[0.12, 0.2, 1], [0.5, 0.32, 0.7], [0.82, 0.12, 0.9]] as const) {
        const span = w + 200;
        const cx = ((((fx * span - t * h * 0.04 * s) % span) + span) % span) - 100;
        const cy = fy * h;
        const cr = h * 0.045 * s;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.arc(cx + cr * 1.1, cy - cr * 0.4, cr * 1.2, 0, Math.PI * 2);
        ctx.arc(cx + cr * 2.2, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // pillars: soft rounded columns
      ctx.fillStyle = colors.pillar;
      ctx.strokeStyle = colors.edge;
      ctx.lineWidth = 2;
      for (const p of pillars) {
        const left = p.x - pw / 2;
        const top = p.gapY - gap / 2;
        const bottom = p.gapY + gap / 2;
        ctx.beginPath();
        ctx.roundRect(left, -pw, pw, top + pw, pw / 2);
        ctx.roundRect(left, bottom, pw, floor - bottom + pw, pw / 2);
        ctx.fill();
        ctx.stroke();
      }

      // ground with drifting stripes
      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, floor, w, h - floor);
      ctx.strokeStyle = colors.edge;
      ctx.beginPath();
      ctx.moveTo(0, floor);
      ctx.lineTo(w, floor);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (let x = groundX; x < w; x += 24) {
        ctx.moveTo(x, h);
        ctx.lineTo(x + 12, floor + 2);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      drawBird(birdX(), bird.y);

      if (state === "playing") {
        ctx.font = `600 ${Math.round(h * 0.12)}px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(4, h * 0.012);
        ctx.strokeStyle = colors.outline;
        ctx.strokeText(String(score), w / 2, h * 0.06);
        ctx.fillStyle = colors.ink;
        ctx.fillText(String(score), w / 2, h * 0.06);
      }
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // Capped step: after a hidden tab (rAF pauses) the bird mustn't teleport through a pillar
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (!FLAP_KEYS.has(e.key) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target) || document.querySelector("dialog[open]")) return;
      e.preventDefault(); // Space would otherwise scroll the page or press the focused button
      if (!e.repeat) flap();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={areaRef}
      tabIndex={-1}
      role="region"
      aria-label="Sky Hop mini game"
      className="relative size-full touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      onPointerDown={(e) => {
        if (e.button === 0) flapRef.current();
      }}
    >
      <canvas ref={canvasRef} className="block size-full" aria-hidden />

      {phase === "ready" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[18%] flex justify-center px-4">
          <p className="glass-lite rounded-full px-4 py-1.5 text-center text-sm text-foreground">
            Tap, click or press Space to flap · Esc to close
          </p>
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
        {phase === "over" && (
          <div className="glass-lite rounded-2xl px-6 py-4 text-center text-foreground">
            <p className="text-2xl font-semibold">Bonk!</p>
            <p className="mt-1">
              Score {result.score} · Best {result.best}
            </p>
            <p className="mt-2 text-sm">Tap or press Space to fly again</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        onPointerDown={(e) => e.stopPropagation()} // closing shouldn't also flap
        aria-label="Close game"
        className="glass-lite absolute top-3 right-3 grid size-9 place-items-center rounded-full text-foreground transition-colors hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <FiX aria-hidden />
      </button>
    </div>
  );
}
