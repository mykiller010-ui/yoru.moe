interface SlideshowOpts {
  slideInterval: number;
  slideFade: number;
  shuffleSlides: boolean;
}

export function startSlideshow(
  root: HTMLElement,
  sources: string[],
  opts: SlideshowOpts,
): void {
  const layers = Array.from(root.querySelectorAll<HTMLElement>(".bg-layer"));
  if (sources.length === 0 || layers.length < 2) return;

  root.style.setProperty("--fade", `${opts.slideFade}ms`);
  root.style.setProperty("--kb", `${opts.slideInterval + opts.slideFade}ms`);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const order = opts.shuffleSlides ? shuffle([...sources]) : [...sources];
  let index = 0;
  let front = 0;

  const preload = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`failed to load ${src}`));
      img.src = src;
    });

  const centerLuminance = (img: HTMLImageElement): number => {
    const s = 32;
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d");
    if (!ctx) return 0;
    ctx.drawImage(img, 0, 0, s, s);
    const d = ctx.getImageData(s * 0.25, s * 0.2, s * 0.5, s * 0.55).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    }
    return sum / (d.length / 4) / 255;
  };

  const show = (img: HTMLImageElement) => {
    const scrim = Math.min(
      1,
      Math.max(0, (centerLuminance(img) - 0.32) / 0.28),
    );
    root.style.setProperty("--scrim", scrim.toFixed(2));

    const next = layers[front ^ 1];
    next.style.backgroundImage = `url("${img.src}")`;
    if (!reduced) {
      next.classList.remove("kb");
      void next.offsetWidth;
      next.classList.add("kb");
    }
    next.classList.add("active");
    layers[front].classList.remove("active");
    front ^= 1;
  };

  const tick = async () => {
    if (document.hidden) {
      setTimeout(tick, 1500);
      return;
    }
    const src = order[index++ % order.length];
    try {
      show(await preload(src));
    } catch {
    }
    setTimeout(tick, opts.slideInterval);
  };

  preload(order[0])
    .then((img) => {
      show(img);
      index = 1;
    })
    .catch(() => {
      index = 1;
    })
    .finally(() => {
      root.classList.add("ready");
      setTimeout(tick, opts.slideInterval);
    });
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
