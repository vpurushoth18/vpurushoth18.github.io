(() => {
  const canvas = document.querySelector('#pixel-rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scale = 3; // Draw at a low resolution to match the coarse wallpaper pixels.
  let drops = [];
  let frame = 0;
  let last = 0;
  let width = 0;
  let height = 0;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = canvas.width = Math.max(1, Math.ceil(bounds.width / scale));
    height = canvas.height = Math.max(1, Math.ceil(bounds.height / scale));
    const count = Math.min(310, Math.max(90, Math.floor(width * height / 420)));
    drops = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 26 + Math.random() * 46,
      length: i % 4 === 0 ? 5 : 2 + Math.floor(Math.random() * 3),
      alpha: 0.18 + Math.random() * 0.32
    }));
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    if (now - last < 30) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.06);
    last = now;
    ctx.clearRect(0, 0, width, height);
    for (const drop of drops) {
      drop.y += drop.speed * dt;
      drop.x -= drop.speed * dt * 0.035;
      if (drop.y > height + drop.length) {
        drop.y = -drop.length;
        drop.x = Math.random() * width;
      }
      if (drop.x < -2) drop.x = width + 2;
      ctx.fillStyle = 'rgba(205, 225, 240, ' + drop.alpha + ')';
      ctx.fillRect(Math.round(drop.x), Math.round(drop.y), 1, drop.length);
      if (drop.length >= 5) {
        ctx.fillStyle = 'rgba(239, 245, 250, ' + (drop.alpha * 0.45) + ')';
        ctx.fillRect(Math.round(drop.x) + 1, Math.round(drop.y), 1, 2);
      }
    }
  }

  function sync() {
    cancelAnimationFrame(frame);
    last = 0;
    ctx.clearRect(0, 0, width, height);
    if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }

  new ResizeObserver(() => { resize(); sync(); }).observe(canvas);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  resize();
  sync();
})();
