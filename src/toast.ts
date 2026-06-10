let timer: number | undefined;

export function showToast(html: string, duration = 2200): void {
  const el = document.getElementById("toast");
  if (!el) return;
  el.innerHTML = html;
  el.classList.add("show");
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove("show"), duration);
}
