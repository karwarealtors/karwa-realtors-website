/* Karwa Realtors: shared behaviour (menu + swipe carousels) */
(function () {
  // Mobile menu
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    var setOpen = function (open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    btn.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    var menuW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === menuW) return;
      menuW = window.innerWidth;
      if (menuW > 1023) setOpen(false);
    });
  }

  // Swipe carousels: arrows, counter and progress line
  var pad = function (n) { return String(n).padStart(2, '0'); };

  function update(wrap) {
    var track = wrap.querySelector('.track');
    var n = track ? track.children.length : 0;
    if (!n) return;
    var first = track.firstElementChild;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    var step = first.getBoundingClientRect().width + gap;
    var i = Math.round(track.scrollLeft / step) + 1;
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) i = n;
    i = Math.max(1, Math.min(n, i));
    var pos = wrap.querySelector('.cpos');
    var tot = wrap.querySelector('.ctot');
    var fill = wrap.querySelector('.cfill');
    if (pos) pos.textContent = pad(i);
    if (tot) tot.textContent = pad(n);
    if (fill) fill.style.width = (i / n * 100) + '%';
  }

  function setup(wrap) {
    if (wrap.dataset.ready) { update(wrap); return; }
    wrap.dataset.ready = '1';
    var track = wrap.querySelector('.track');
    wrap.querySelectorAll('.cbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8, behavior: 'smooth' });
      });
    });
    track.addEventListener('scroll', function () { update(wrap); }, { passive: true });
    update(wrap);
  }

  window.KR = window.KR || {};
  window.KR.initCarousels = function () {
    document.querySelectorAll('.cwrap').forEach(setup);
  };
  window.KR.initCarousels();
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.KR.initCarousels();
  });
})();
