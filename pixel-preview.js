(() => {
  const desktop = document.querySelector('.desktop');
  const windows = [...document.querySelectorAll('.window')];
  const taskItems = document.querySelector('#task-items');
  const mode = document.querySelector('#view-mode');
  let topZ = 10;
  let pointerDrag = null;
  const titles = {about:'About Me', news:'News.app', research:'Research.app', papers:'Papers', experience:'Experience', beyond:'Beyond Work', contact:'Contact'};

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
