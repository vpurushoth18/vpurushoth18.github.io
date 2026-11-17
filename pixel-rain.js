(() => {
  const canvas = document.querySelector('#pixel-rain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pixel = 3;
  const sourceWidth = 1672;
  const sourceHeight = 941;
  let width = 0;
  let height = 0;
  let drops = [];
  let splashes = [];
  let frame = 0;
  let last = 0;

  // Top edge of the person in the wallpaper, measured on its 1000px preview.
  // Mapping through background-size: cover keeps impacts on the figure at any size.
  const outline = [
    [879, 326], [886, 301], [901, 276], [917, 264],
    [919, 229], [934, 216], [950, 209], [973, 208],
    [994, 219], [1000, 230]
  ];

  function figureTop(x) {
    const fitted = Math.max(width / sourceWidth, height / sourceHeight);
    const left = width - sourceWidth * fitted;
    const top = (height - sourceHeight * fitted) / 2;
    const imageX = ((x - left) / (sourceWidth * fitted)) * 1000;
    if (imageX < outline[0][0] || imageX > 1000) return null;
    for (let i = 1; i < outline.length; i++) {
      if (imageX <= outline[i][0]) {
        const [x0, y0] = outline[i - 1];
        const [x1, y1] = outline[i];
        const imageY = y0 + (y1 - y0) * (imageX - x0) / (x1 - x0);
        return top + imageY / 1000 * sourceWidth * fitted;
      }
    }
    return null;
  }

  function makeDrop(anywhere = false) {
    const x = Math.random() * width;
    const surface = figureTop(x);
    const personHit = surface !== null && Math.random() < .82;
    return {
      x,
      y: anywhere ? Math.random() * height : -4 - Math.random() * height * .5,
      speed: 90 + Math.random() * 95,
      length: 3 + Math.floor(Math.random() * 8),
      alpha: .25 + Math.random() * .55,
      hit: personHit ? surface + (Math.random() < .6 ? 0 : 8 + Math.random() * 40) : null
    };
  }

  function splash(x, y, onPerson) {
    if (splashes.length > 260) splashes.splice(0, 30);
    const count = onPerson ? 4 + Math.floor(Math.random() * 4) : 2;
    for (let i = 0; i < count; i++) {
      splashes.push({
        x, y,
        vx: (Math.random() - .5) * (onPerson ? 42 : 24),
        vy: -12 - Math.random() * (onPerson ? 34 : 17),
        life: .16 + Math.random() * .24,
        max: .4
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = Math.max(1, Math.ceil(rect.width / pixel));
    height = canvas.height = Math.max(1, Math.ceil(rect.height / pixel));
    const count = Math.min(1400, Math.max(450, Math.floor(width * height / 95)));
    drops = Array.from({ length: count }, () => makeDrop(true));
    splashes = [];
  }

  function draw(now) {
    frame = requestAnimationFrame(draw);
    if (now - last < 30) return;
    const dt = Math.min((now - (last || now)) / 1000, .06);
    last = now;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      const previous = drop.y;
      drop.y += drop.speed * dt;
      drop.x -= drop.speed * dt * .025;
      if (drop.hit !== null && previous < drop.hit && drop.y >= drop.hit) {
        splash(drop.x, drop.hit, true);
        drops[i] = makeDrop();
        continue;
      }
      if (drop.y > height + drop.length) {
        if (Math.random() < .5) splash(drop.x, height - 2, false);
        drops[i] = makeDrop();
        continue;
      }
      const x = Math.round(drop.x);
      const y = Math.round(drop.y);
      ctx.fillStyle = `rgba(218,235,249,${drop.alpha})`;
      ctx.fillRect(x, y, 1, drop.length);
      if (drop.length > 7) {
        ctx.fillStyle = `rgba(244,249,255,${drop.alpha * .4})`;
        ctx.fillRect(x + 1, y + 2, 1, 2);
      }
    }

    for (let i = splashes.length - 1; i >= 0; i--) {
      const bit = splashes[i];
      bit.life -= dt;
      if (bit.life <= 0) { splashes.splice(i, 1); continue; }
      bit.x += bit.vx * dt;
      bit.y += bit.vy * dt;
      bit.vy += 120 * dt;
      ctx.fillStyle = `rgba(237,247,255,${Math.min(1, bit.life / bit.max) * .9})`;
      ctx.fillRect(Math.round(bit.x), Math.round(bit.y), 1 + (bit.life > .25 ? 1 : 0), 1);
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
