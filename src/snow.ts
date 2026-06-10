interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  alpha: number;
}

export function startSnow(canvas: HTMLCanvasElement): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let flakes: Flake[] = [];

  const spawn = (y?: number): Flake => {
    const depth = Math.random(); // 0 = far, 1 = near
    return {
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      r: 0.7 + depth * 2.4,
      vy: 13 + depth * 44,
      sway: 5 + depth * 15,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.22 + depth * 0.5,
    };
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(190, Math.round((w * h) / 14500));
    flakes = Array.from({ length: count }, () => spawn());
  };

  resize();
  window.addEventListener("resize", resize);

  let last = performance.now();
  let raf = 0;

  const frame = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#eef0f6";

    for (const f of flakes) {
      f.y += f.vy * dt;
      f.phase += dt * 0.9;
      f.x += Math.sin(f.phase) * f.sway * dt;

      if (f.y - f.r > h) Object.assign(f, spawn(-8));
      if (f.x < -10) f.x = w + 10;
      else if (f.x > w + 10) f.x = -10;

      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
}
