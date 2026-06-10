import "@fontsource/zen-kaku-gothic-new/latin-400.css";
import "@fontsource/zen-kaku-gothic-new/latin-500.css";
import "@fontsource/zen-kaku-gothic-new/latin-700.css";
import "./style.css";

import { profile, links, tracks, slides, settings } from "./config";
import { icons } from "./icons";
import { startSlideshow } from "./slideshow";
import { startSnow } from "./snow";
import { initTilt } from "./tilt";
import { createPlayer } from "./player";
import { showToast } from "./toast";

const $ = <T extends HTMLElement>(sel: string): T =>
  document.querySelector(sel) as T;

$("#kanji").textContent = profile.kanji;
$("#name").textContent = profile.name;

const tagline = $("#tagline");
if (profile.tagline) {
  tagline.textContent = profile.tagline;
  tagline.hidden = false;
}

const nav = $("#links");
for (const link of links) {
  const el = document.createElement(link.href ? "a" : "button");
  el.className = "chip";
  el.style.setProperty("--c", link.color);
  el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[link.icon]}"/></svg>`;

  const label = document.createElement("span");
  label.textContent = link.label;
  el.append(label);

  if (el instanceof HTMLAnchorElement && link.href) {
    el.href = link.href;
    el.target = "_blank";
    el.rel = "noreferrer noopener";
  } else if (el instanceof HTMLButtonElement && link.copy) {
    el.type = "button";
    const text = link.copy;
    el.addEventListener("click", async () => {
      const copied = await copyText(text);
      showToast(
        copied
          ? (link.toast ?? `Copied — <b>${text}</b>`)
          : "Couldn't copy, sorry",
      );
    });
  }

  nav.append(el);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

startSlideshow($("#bg"), slides, settings);
startSnow($<HTMLCanvasElement>("#snow"));
initTilt($("#tilt"));

const player = createPlayer($("#player"), tracks, settings.startVolume);

if (settings.autoplayOnFirstInteraction) {
  const kick = (e: PointerEvent) => {
    if ((e.target as HTMLElement | null)?.closest("#player")) return;
    window.removeEventListener("pointerdown", kick, true);
    if (!player.startedOnce) player.play();
  };
  window.addEventListener("pointerdown", kick, true);
}
