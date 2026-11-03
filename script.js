// ---------- Theme (light / dark), applied before the page paints ----------
(function () {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
})();

function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
}

function toggleMenu() {
    document.querySelector('.nav').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav a').forEach(function (a) {
        a.addEventListener('click', function () { document.querySelector('.nav').classList.remove('open'); });
    });

    // Hide links you have not filled in yet (href="#"), so the live site never shows dead links.
    document.querySelectorAll('a[href="#"]').forEach(function (a) {
        const li = a.closest('.contact li');
        (li || a).style.display = 'none';
    });
    document.querySelectorAll('[data-needs-link]').forEach(function (el) {
        const a = el.querySelector('a');
        if (a && a.getAttribute('href') === '#') el.style.display = 'none';
    });

    // Portrait: show initials until assets/img/profile.jpg exists.
    const portrait = document.querySelector('.portrait');
    if (portrait) {
        const img = portrait.querySelector('img');
        const fail = function () { portrait.classList.add('no-image'); img.style.display = 'none'; };
        if (img.complete && img.naturalWidth === 0) fail();
        img.addEventListener('error', fail);
    }

    document.querySelectorAll('.year-now').forEach(function (el) { el.textContent = new Date().getFullYear(); });
});

// ---------- Publication filter (publications page) ----------
function filterPubs(tag, btn) {
    document.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.pub').forEach(function (p) {
        const tags = (p.getAttribute('data-tags') || '').split(',');
        p.style.display = (tag === 'all' || tags.indexOf(tag) !== -1) ? '' : 'none';
    });
    document.querySelectorAll('.pub-group').forEach(function (g) {
        const any = Array.prototype.some.call(g.querySelectorAll('.pub'), function (p) { return p.style.display !== 'none'; });
        g.style.display = any ? '' : 'none';
    });
}
