export function initTilt(el: HTMLElement, maxX = 5.5, maxY = 8.5): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  for (const child of el.querySelectorAll<HTMLElement>("[data-depth]")) {
    const depth = parseFloat(child.dataset.depth ?? "0");
    child.style.transform = `translateZ(${depth * 14}px)`;
  }

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let raf = 0;

  const apply = () => {
    raf = 0;
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    el.style.transform = `rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;
    if (Math.abs(targetX - curX) > 0.04 || Math.abs(targetY - curY) > 0.04) {
      raf = requestAnimationFrame(apply);
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  window.addEventListener("pointermove", (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetX = ny * -maxX;
    targetY = nx * maxY;
    schedule();
  });

  const reset = () => {
    targetX = 0;
    targetY = 0;
    schedule();
  };

  document.documentElement.addEventListener("mouseleave", reset);
  window.addEventListener("blur", reset);
}
