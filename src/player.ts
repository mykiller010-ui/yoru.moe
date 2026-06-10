import type { Track } from "./config";

const ICONS = {
  prev: "M6 6h2v12H6zm3.5 6l8.5 6V6l-8.5 6z",
  play: "M8 5v14l11-7z",
  pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  next: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
  volume:
    "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z",
} as const;

const VOLUME_KEY = "yoru:volume";
const IDLE_TITLE = "nothing playing... yet";

export interface Player {
  play(): void;
  readonly startedOnce: boolean;
}

const icon = (d: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

export function createPlayer(
  root: HTMLElement,
  tracks: Track[],
  startVolume: number,
): Player {
  root.innerHTML = `
    <div class="player-controls">
      <button class="pbtn" data-act="prev" aria-label="Previous track">${icon(ICONS.prev)}</button>
      <button class="pbtn pbtn--play" data-act="toggle" aria-label="Play">${icon(ICONS.play)}</button>
      <button class="pbtn" data-act="next" aria-label="Next track">${icon(ICONS.next)}</button>
    </div>
    <div class="player-info">
      <div class="player-title idle">${IDLE_TITLE}</div>
      <input class="seek" type="range" min="0" max="1000" value="0" aria-label="Seek" />
    </div>
    <div class="player-side">
      <span class="time">0:00 / 0:00</span>
      ${icon(ICONS.volume).replace("<svg ", '<svg class="vol-ic" ')}
      <input class="vol" type="range" min="0" max="100" aria-label="Volume" />
    </div>
  `;

  const titleEl = root.querySelector<HTMLElement>(".player-title")!;
  const seekEl = root.querySelector<HTMLInputElement>(".seek")!;
  const timeEl = root.querySelector<HTMLElement>(".time")!;
  const volEl = root.querySelector<HTMLInputElement>(".vol")!;
  const toggleBtn = root.querySelector<HTMLButtonElement>(
    '[data-act="toggle"]',
  )!;

  const audio = new Audio();
  audio.preload = "none";

  let index = 0;
  let startedOnce = false;
  let seeking = false;

  const savedVolume = Number(localStorage.getItem(VOLUME_KEY));
  audio.volume =
    Number.isFinite(savedVolume) && localStorage.getItem(VOLUME_KEY) !== null
      ? Math.min(1, Math.max(0, savedVolume))
      : startVolume;

  const paintRange = (el: HTMLInputElement, pct: number) =>
    el.style.setProperty("--p", `${pct}%`);

  volEl.value = String(Math.round(audio.volume * 100));
  paintRange(volEl, audio.volume * 100);

  volEl.addEventListener("input", () => {
    audio.volume = Number(volEl.value) / 100;
    paintRange(volEl, Number(volEl.value));
    localStorage.setItem(VOLUME_KEY, String(audio.volume));
  });

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const updateMediaSession = () => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: tracks[index].title,
      artist: "yoru.moe",
      artwork: [{ src: "/cover.png", sizes: "512x512", type: "image/png" }],
    });
  };

  const loadTrack = (i: number) => {
    index = ((i % tracks.length) + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    titleEl.textContent = tracks[index].title;
    titleEl.classList.remove("idle");
    updateMediaSession();
  };

  const play = () => {
    if (tracks.length === 0) return;
    if (!startedOnce) {
      startedOnce = true;
      loadTrack(0);
    }
    void audio.play().catch(() => {
    });
  };

  const step = (delta: number) => {
    if (!startedOnce) {
      play();
      return;
    }
    loadTrack(index + delta);
    void audio.play().catch(() => {});
  };

  root
    .querySelector('[data-act="prev"]')!
    .addEventListener("click", () => step(-1));
  root
    .querySelector('[data-act="next"]')!
    .addEventListener("click", () => step(1));
  toggleBtn.addEventListener("click", () => {
    if (!startedOnce || audio.paused) play();
    else audio.pause();
  });

  audio.addEventListener("timeupdate", () => {
    if (seeking || !Number.isFinite(audio.duration) || audio.duration === 0)
      return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seekEl.value = String(Math.round(pct * 10));
    paintRange(seekEl, pct);
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });

  audio.addEventListener("loadedmetadata", () => {
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });

  seekEl.addEventListener("pointerdown", () => (seeking = true));
  seekEl.addEventListener("input", () =>
    paintRange(seekEl, Number(seekEl.value) / 10),
  );
  seekEl.addEventListener("change", () => {
    seeking = false;
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (Number(seekEl.value) / 1000) * audio.duration;
    }
  });

  const setToggleIcon = (playing: boolean) => {
    toggleBtn.innerHTML = icon(playing ? ICONS.pause : ICONS.play);
    toggleBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  };

  audio.addEventListener("play", () => {
    setToggleIcon(true);
    if ("mediaSession" in navigator)
      navigator.mediaSession.playbackState = "playing";
  });
  audio.addEventListener("pause", () => {
    setToggleIcon(false);
    if ("mediaSession" in navigator)
      navigator.mediaSession.playbackState = "paused";
  });
  audio.addEventListener("ended", () => step(1));

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
    try {
      navigator.mediaSession.setActionHandler("seekto", (d) => {
        if (d.seekTime != null && Number.isFinite(audio.duration)) {
          audio.currentTime = d.seekTime;
        }
      });
    } catch {
    }
  }

  return {
    play,
    get startedOnce() {
      return startedOnce;
    },
  };
}
