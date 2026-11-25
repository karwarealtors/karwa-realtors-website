/* Karwa Realtors: Projects page (tabs, project index, swipe cards) */
(function () {
  var IMG = 'images/projects/';
  var P = {
    ongoing: [
      { name: 'Infinity One', place: 'Wagle Estate, Thane', area: '1,50,000 sq. ft.', type: 'Commercial · IT Park', img: 'infinity-one.jpg', desc: 'A Grade-A IT park with contemporary architecture and excellent connectivity.' },
      { name: 'Shailesh Galaxy', place: 'Thane', area: '75,000 sq. ft.', type: 'Residential', img: 'shailesh-galaxy.jpg', desc: 'A contemporary residential tower with thoughtfully planned homes for modern families.' },
      { name: 'Infinity Residency', place: 'Thane West', area: '30,000 sq. ft.', type: 'Mixed-use', img: 'infinity-residency.jpg', desc: 'Quality apartments above street-level retail, in a convenient, vibrant setting.' },
      { name: 'Infinity Square', place: 'Balewadi, Pune', area: '15,000 sq. ft.', type: 'Commercial', img: 'infinity-square.jpg', desc: 'Well-designed workspaces in one of Pune’s fastest growing business corridors.' }
    ],
    upcoming: [
      { name: 'Rambaug Colony', place: 'Kothrud, Pune', area: '1,30,000 sq. ft.', type: 'Residential & Retail', img: 'rambaug-colony.jpg', desc: 'A 20-floor landmark of modern residences and retail in one of Pune’s most established neighbourhoods.' },
      { name: 'Manas Lakefront, Bhugaon', place: 'Bhugaon, Pune', area: '1,25,000 sq. ft.', type: 'Residential & Retail', img: '', desc: 'Lakefront homes with contemporary architecture in a peaceful natural setting.' },
      { name: 'Manas Lakefront, Bhukum', place: 'Bhukum, Pune', area: '1,25,000 sq. ft.', type: 'Residential & Retail', img: '', desc: 'Modern residences with lake views, beside the Bhugaon development.' }
    ],
    completed: [
      { name: 'QBIX', place: 'Baner, Pune', area: '40,000 sq. ft.', type: 'Commercial', img: 'qbix.jpg', desc: 'Our cube-inspired, 10-floor commercial landmark near Jupiter Hospital, Baner.' },
      { name: 'Manas Heritage', place: 'Balewadi, Pune', area: '40,000 sq. ft.', type: 'Residential', img: 'manas-heritage.jpg', desc: 'Quality construction and functional layouts.' },
      { name: 'Manas Dreams', place: 'Baner, Pune', area: '25,000 sq. ft.', type: 'Residential', img: 'manas-dreams.jpg', desc: 'Modern homes with practical planning.' },
      { name: 'Lotus Apartments', place: 'Sus, Pune', area: '70,000 sq. ft.', type: 'Residential', img: 'lotus-apartments.jpg', desc: 'Generous homes on the main road in Sus.' },
      { name: 'Radhe Krishna Park', place: 'Kalyan', area: '1,00,000 sq. ft.', type: 'Mixed-use', img: 'radhe-krishna-park.jpg', desc: 'A large community of homes and commercial spaces.' },
      { name: 'Lake City Tower', place: 'Thane', area: '40,000 sq. ft.', type: 'Residential', img: 'lake-city-tower.jpg', desc: 'Spacious homes with excellent connectivity.' },
      { name: 'Yogeshwar Tower', place: 'Thane', area: '25,000 sq. ft.', type: 'Residential', img: 'yogeshwar-tower.jpg', desc: 'Quality homes in an established neighbourhood.' },
      { name: 'Shree Balaji Apartment', place: 'Thane', area: '20,000 sq. ft.', type: 'Residential', img: 'shree-balaji-apartment.jpg', desc: 'Comfortable homes with durable construction.' },
      { name: 'Dashmesh Apartment', place: 'Thane', area: '20,000 sq. ft.', type: 'Residential', img: 'dashmesh-apartment.jpg', desc: 'Well-designed homes for convenient urban living.' },
      { name: 'Saddicha Towers', place: 'Thane', area: '18,000 sq. ft.', type: 'Residential', img: 'saddicha-towers.jpg', desc: 'Efficient planning and long-term value.' },
      { name: 'Tirmuala Apartment', place: 'Thane', area: '15,000 sq. ft.', type: 'Residential', img: 'tirmuala-apartment.jpg', desc: 'Practical layouts and quality construction.' }
    ]
  };
  var LABEL = { ongoing: 'Ongoing', upcoming: 'Upcoming', completed: 'Completed' };
  var SERIF = "font-family: 'Playfair Display', Georgia, serif";
  var COMPLETED_PREVIEW = 4;

  var state = { tab: 'ongoing', active: 0, showAll: false };
  var el = {
    tabs: document.getElementById('proj-tabs'),
    media: document.getElementById('proj-media'),
    list: document.getElementById('proj-list'),
    cards: document.getElementById('proj-cards'),
    more: document.getElementById('proj-more'),
    moreBtn: document.getElementById('proj-more-btn')
  };
  if (!el.tabs) return;

  var pad = function (n) { return String(n).padStart(2, '0'); };

  function visible() {
    var all = P[state.tab];
    var limited = state.tab === 'completed' && !state.showAll;
    return { all: all, list: limited ? all.slice(0, COMPLETED_PREVIEW) : all, limited: limited };
  }

  function placeholder(name, size) {
    return '<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 32px">' +
      '<span style="width: 40px; height: 2px; background: #FAB600"></span>' +
      '<span style="' + SERIF + '; font-weight: 600; font-size: ' + size + 'px; color: #1D1C1A">Render coming soon</span>' +
      (name ? '<span style="font-size: 11px; font-weight: 500; letter-spacing: .22em; text-transform: uppercase; color: #6E685F">' + name + '</span>' : '') +
      '</div>';
  }

  function renderTabs() {
    el.tabs.innerHTML = ['ongoing', 'upcoming', 'completed'].map(function (k) {
      var on = k === state.tab;
      return '<button class="tab' + (on ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + on + '" data-tab="' + k + '">' +
        '<span class="tab-l">' + LABEL[k] + '</span><span class="tab-c">(' + P[k].length + ')</span></button>';
    }).join('');
  }

  function renderMedia(p) {
    var inner = p.img
      ? '<img src="' + IMG + p.img + '" alt="' + p.name + ', ' + p.place + '" style="width: 100%; height: 100%; object-fit: cover">'
      : placeholder(p.name, 28);
    el.media.innerHTML = inner +
      '<div style="position: absolute; left: 0; bottom: 0; display: flex; align-items: center; gap: 10px; padding: 12px 18px; background: #F5F2EC; font-size: 11px; font-weight: 500; letter-spacing: .22em; text-transform: uppercase; color: #1D1C1A">' +
      '<span style="width: 6px; height: 6px; border-radius: 50%; background: #FAB600"></span>' + LABEL[state.tab] + '</div>';
  }

  function renderList(list) {
    el.list.innerHTML = list.map(function (p, i) {
      var on = i === state.active;
      var details = on
        ? '<div style="padding: 4px 0 28px 60px; border-bottom: 1px solid rgba(29,28,26,.14); display: flex; flex-direction: column; gap: 20px">' +
            '<p style="margin: 0; font-size: 15px; line-height: 1.8; color: #4A4640; max-width: 420px">' + p.desc + '</p>' +
            '<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 24px">' +
              '<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 10px; font-weight: 500; letter-spacing: .24em; text-transform: uppercase; color: #6E685F">Type</span><span style="font-size: 14px; color: #1D1C1A">' + p.type + '</span></div>' +
              '<div style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 10px; font-weight: 500; letter-spacing: .24em; text-transform: uppercase; color: #6E685F">Built-up area</span><span style="font-size: 14px; color: #1D1C1A; font-variant-numeric: lining-nums">' + p.area + '</span></div>' +
            '</div></div>'
        : '';
      return '<div><button class="row" type="button" aria-expanded="' + on + '" data-i="' + i + '">' +
        '<span style="font-size: 12px; font-weight: 400; letter-spacing: .14em; color: #6E685F; font-variant-numeric: lining-nums">' + pad(i + 1) + '</span>' +
        '<span style="display: flex; flex-direction: column; gap: 6px; min-width: 0">' +
          '<span class="row-name" style="' + SERIF + '; font-weight: 600; font-size: clamp(21px, 2.02vw, 28px); line-height: 1.12">' + p.name + '</span>' +
          '<span style="font-size: 13px; letter-spacing: .04em; color: #6E685F; font-variant-numeric: lining-nums">' + p.place + ' · ' + p.area + '</span>' +
        '</span>' +
        '<span style="font-size: 20px; line-height: 1; color: #1D1C1A" aria-hidden="true">' + (on ? '−' : '+') + '</span>' +
        '</button>' + details + '</div>';
    }).join('');
  }

  function renderCards(list) {
    el.cards.innerHTML = list.map(function (p) {
      var img = p.img
        ? '<img src="' + IMG + p.img + '" alt="' + p.name + ', ' + p.place + '" loading="lazy" style="width: 100%; height: 100%; object-fit: cover">'
        : placeholder('', 23);
      return '<article class="pcard">' +
        '<div class="frame" style="aspect-ratio: 5 / 6"><div style="position: relative">' + img + '</div></div>' +
        '<div style="display: flex; flex-direction: column; gap: 6px">' +
          '<span style="font-size: 10px; font-weight: 500; letter-spacing: .24em; text-transform: uppercase; color: #6E685F">' + LABEL[state.tab] + ' · ' + p.type + '</span>' +
          '<h3 style="margin: 0; ' + SERIF + '; font-weight: 600; font-size: 25px; line-height: 1.12">' + p.name + '</h3>' +
          '<span style="font-size: 13px; color: #6E685F; font-variant-numeric: lining-nums">' + p.place + ' · ' + p.area + '</span>' +
        '</div></article>';
    }).join('');
  }

  function render(opts) {
    var v = visible();
    if (state.active >= v.list.length) state.active = 0;
    renderTabs();
    renderMedia(v.list[state.active]);
    renderList(v.list);
    if (!opts || !opts.keepCards) {
      renderCards(v.list);
      el.cards.scrollLeft = 0;
    }
    el.more.hidden = !v.limited;
    if (el.moreBtn) el.moreBtn.textContent = 'View all completed projects (' + v.all.length + ')';
    if (window.KR && window.KR.initCarousels) window.KR.initCarousels();
  }

  el.tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]');
    if (!b || b.dataset.tab === state.tab) return;
    state = { tab: b.dataset.tab, active: 0, showAll: false };
    render();
  });
  el.list.addEventListener('click', function (e) {
    var b = e.target.closest('.row');
    if (!b) return;
    state.active = Number(b.dataset.i);
    render({ keepCards: true });
  });
  if (el.moreBtn) {
    el.moreBtn.addEventListener('click', function () {
      state.showAll = true;
      render();
    });
  }

  // Open a tab straight from a link, e.g. projects.html#completed
  var h = (location.hash || '').slice(1);
  if (P[h]) state.tab = h;

  render();
})();
