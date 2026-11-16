(() => {
  const desktop = document.querySelector('.desktop');
  const windows = [...document.querySelectorAll('.window')];
  const taskItems = document.querySelector('#task-items');
  const mode = document.querySelector('#view-mode');
  let topZ = 10;
  let pointerDrag = null;
  const titles = {about:'About Me', news:'News.app', research:'Research.app', papers:'Papers', experience:'Experience', beyond:'Beyond Work', player:'Disc Player', contact:'Contact'};

  function focus(win) {
    windows.forEach(w => w.classList.remove('active'));
    win.classList.add('active');
    win.style.zIndex = ++topZ;
    updateTasks();
  }
  function open(name) {
    const win = document.querySelector(`[data-window="${name}"]`);
    if (!win) return;
    win.classList.remove('hidden');
    focus(win);
    if (document.body.classList.contains('scroll-mode') || matchMedia('(max-width: 760px)').matches) win.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function updateTasks() {
    taskItems.replaceChildren();
    for (const win of windows.filter(w => !w.classList.contains('hidden'))) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = titles[win.dataset.window];
      button.className = 'task-item' + (win.classList.contains('active') ? ' selected' : '');
      button.addEventListener('click', () => open(win.dataset.window));
      taskItems.append(button);
    }
  }
  document.querySelectorAll('[data-open]').forEach(control => control.addEventListener('click', () => open(control.dataset.open)));
  document.querySelectorAll('.desk-icon[data-open]').forEach(icon => {
    icon.title = `Open ${titles[icon.dataset.open]}`;
    icon.addEventListener('dblclick', () => open(icon.dataset.open));
  });
  windows.forEach(win => {
    win.addEventListener('pointerdown', () => { if (!win.classList.contains('hidden')) focus(win); });
    win.querySelector('.window-close').addEventListener('click', () => {
      win.classList.add('hidden');
      if (win.dataset.window === 'player') stopPlayer();
      win.classList.remove('active');
      const next = windows.filter(w => !w.classList.contains('hidden')).sort((a,b) => (parseInt(b.style.zIndex)||0) - (parseInt(a.style.zIndex)||0))[0];
      if (next) next.classList.add('active');
      updateTasks();
    });
    win.querySelector('.window-zoom').addEventListener('click', () => {
      win.classList.toggle('maximized');
      focus(win);
    });
    const bar = win.querySelector('.titlebar');
    bar.addEventListener('dblclick', e => {
      if (e.target.closest('button')) return;
      win.classList.toggle('maximized'); focus(win);
    });
    bar.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button') || document.body.classList.contains('scroll-mode') || matchMedia('(max-width: 760px)').matches || win.classList.contains('maximized')) return;
      const box = win.getBoundingClientRect();
      const desk = desktop.getBoundingClientRect();
      pointerDrag = {win, id:e.pointerId, dx:e.clientX-box.left, dy:e.clientY-box.top, desk};
      bar.setPointerCapture(e.pointerId);
      bar.classList.add('dragging');
      e.preventDefault();
    });
    bar.addEventListener('pointermove', e => {
      if (!pointerDrag || pointerDrag.id !== e.pointerId || pointerDrag.win !== win) return;
      const x = Math.max(0, Math.min(desktop.clientWidth - 160, e.clientX - pointerDrag.desk.left - pointerDrag.dx));
      const y = Math.max(0, Math.min(desktop.clientHeight - 90, e.clientY - pointerDrag.desk.top - pointerDrag.dy));
      win.style.left = `${x}px`;
      win.style.top = `${y}px`;
    });
    const stop = () => { if (pointerDrag?.win === win) pointerDrag = null; bar.classList.remove('dragging'); };
    bar.addEventListener('pointerup', stop);
    bar.addEventListener('pointercancel', stop);
  });
  // Each track is an original, short Web Audio melody. The audio context is
  // created only after a visitor presses play; nothing autoplays on page load.
  const trackData = [
    {title:'Reno Dusk', tempo:270, wave:'triangle', notes:[392,440,523.25,659.25,523.25,440,392,0,329.63,392,440,523.25,440,392,329.63,0]},
    {title:'Signal Drift', tempo:220, wave:'square', notes:[261.63,0,392,329.63,0,493.88,392,0,293.66,0,440,349.23,0,523.25,440,0]},
    {title:'Court Break', tempo:190, wave:'triangle', notes:[523.25,659.25,783.99,0,659.25,523.25,587.33,0,440,523.25,659.25,783.99,880,783.99,659.25,0]}
  ];
  const player = {
    title: document.querySelector('#player-title'),
    status: document.querySelector('#player-status'),
    progress: document.querySelector('#player-progress'),
    disc: document.querySelector('#player-disc'),
    play: document.querySelector('#player-play'),
    volume: document.querySelector('#player-volume')
  };
  let track = 0, step = 0, interval = null, audioContext = null;
  function renderPlayer() {
    player.title.textContent = trackData[track].title;
    player.status.textContent = interval ? 'PLAYING · ORIGINAL CHIP LOOP' : 'READY · SELECT A TRACK';
    player.play.textContent = interval ? 'Ⅱ PAUSE' : '▶ PLAY';
    player.play.setAttribute('aria-label', interval ? 'Pause' : 'Play');
    player.disc.classList.toggle('playing', Boolean(interval));
    player.progress.style.width = `${step / trackData[track].notes.length * 100}%`;
    document.querySelectorAll('[data-track]').forEach(button => button.classList.toggle('selected', Number(button.dataset.track) === track));
  }
  function beep() {
    const data = trackData[track];
    const frequency = data.notes[step];
    step = (step + 1) % data.notes.length;
    player.progress.style.width = `${step / data.notes.length * 100}%`;
    if (!frequency || !audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = data.wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    const level = Number(player.volume.value) / 100 * .055;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(level,.0002), now + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, now + data.tempo / 1000 * .75);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + data.tempo / 1000 * .8);
  }
  async function startPlayer() {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) { player.status.textContent = 'AUDIO IS NOT AVAILABLE HERE'; return; }
    try {
      audioContext ||= new AudioEngine();
      await audioContext.resume();
      if (interval) return;
      beep();
      interval = setInterval(beep, trackData[track].tempo);
      renderPlayer();
    } catch { player.status.textContent = 'AUDIO COULD NOT START'; }
  }
  function stopPlayer(reset = true) {
    if (interval) clearInterval(interval);
    interval = null;
    if (reset) step = 0;
    renderPlayer();
  }
  function selectTrack(index) {
    const wasPlaying = Boolean(interval);
    stopPlayer();
    track = (index + trackData.length) % trackData.length;
    renderPlayer();
    if (wasPlaying) startPlayer();
  }
  player.play.addEventListener('click', () => interval ? stopPlayer(false) : startPlayer());
  document.querySelector('#player-stop').addEventListener('click', () => stopPlayer());
  document.querySelector('#player-prev').addEventListener('click', () => selectTrack(track - 1));
  document.querySelector('#player-next').addEventListener('click', () => selectTrack(track + 1));
  document.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => selectTrack(Number(button.dataset.track))));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayer(false); });
  mode.addEventListener('change', () => {
    document.body.classList.toggle('scroll-mode', mode.checked);
    if (mode.checked) { windows.forEach(w => w.classList.remove('hidden','maximized')); updateTasks(); }
    else window.scrollTo({top:0,behavior:'smooth'});
  });
  if (matchMedia('(max-width: 760px)').matches) {
    document.body.classList.add('scroll-mode'); mode.checked = true;
    windows.forEach(w => w.classList.remove('hidden'));
  }
  const date = new Date();
  const clockText = date.toLocaleString('en-US',{weekday:'short',hour:'numeric',minute:'2-digit'});
  document.querySelector('#clock').textContent = clockText;
  document.querySelector('#task-clock').textContent = clockText;
  updateTasks();
})();
