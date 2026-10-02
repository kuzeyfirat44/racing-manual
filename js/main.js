// Reveal on scroll animation
const revealElements = document.querySelectorAll('.reveal');
const timelineItems = document.querySelectorAll('.timeline-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1
});

revealElements.forEach(el => observer.observe(el));
timelineItems.forEach(el => observer.observe(el));

// ── Racing terms: search + category filter ──
(() => {
  const cards = [...document.querySelectorAll('.term-card')];
  const chips = document.getElementById('term-chips');
  const search = document.getElementById('term-search');
  const count = document.getElementById('term-count');
  if (!chips || !search) return;
  const catOf = c => c.querySelector('.term-category').textContent.trim();
  const cats = ['All', ...new Set(cards.map(catOf))];
  let active = 'All';
  cats.forEach(cat => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = cat;
    b.setAttribute('aria-pressed', cat === 'All');
    b.addEventListener('click', () => {
      active = cat;
      chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
      apply();
    });
    chips.appendChild(b);
  });
  function apply() {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach(c => {
      const ok = (active === 'All' || catOf(c) === active) && (!q || c.textContent.toLowerCase().includes(q));
      c.hidden = !ok;
      if (ok) { shown++; c.classList.add('visible'); }
    });
    count.textContent = shown === cards.length ? cards.length + ' terms' : shown + ' of ' + cards.length + ' terms';
  }
  search.addEventListener('input', apply);
  apply();
})();

// ── Car comparison table ──
(() => {
  const S = {
    'IMSA': 'var(--accent-imsa)', 'Formula 1': 'var(--accent-f1)', 'WEC / Le Mans': 'var(--accent-wec)',
    'GT3': '#16a34a', 'GT1': 'var(--accent-gt1)', 'NASCAR': 'var(--accent-nascar)',
    'Super GT': 'var(--accent-supergt)', 'DTM': 'var(--accent-dtm)'
  };
  // [name, series, year, engine, hp (number or null), hpLabel, kg (number or null)]
  const cars = [
    ['Mercedes W11', 'Formula 1', 2020, '1.6L V6 turbo hybrid', 1000, '1,000+ hp', null],
    ['Ferrari F2004', 'Formula 1', 2004, '3.0L V10', 900, '~900 hp', null],
    ['McLaren MP4/4', 'Formula 1', 1988, '1.5L V6 turbo', 685, '~685 hp', null],
    ['Renault R25', 'Formula 1', 2005, '3.0L V10', 900, '~900 hp', null],
    ['Porsche 962', 'IMSA', 1984, 'Turbo flat-6', 700, '~700 hp', null],
    ['Jaguar XJR-9', 'IMSA', 1988, '6.0L V12', 750, '750 hp', 880],
    ['Cadillac DPi-V.R', 'IMSA', 2017, '5.5L V8', 600, '~600 hp', 930],
    ['Porsche 917K', 'WEC / Le Mans', 1970, '5.0L flat-12', 630, '~630 hp', 820],
    ['Audi R10 TDI', 'WEC / Le Mans', 2006, '5.5L V12 diesel', 641, '~640 hp', 925],
    ['Porsche 919 Hybrid', 'WEC / Le Mans', 2015, '2.0L V4 turbo hybrid', 900, '~900 hp', 875],
    ['Porsche 911 GT3 R', 'GT3', 2019, '4.0L flat-6', 550, '550 hp', 1220],
    ['BMW Z4 GT3', 'GT3', 2010, '4.4L V8', 515, '~515 hp', 1190],
    ['Audi R8 LMS Evo II', 'GT3', 2022, '5.2L V10', 585, '585 hp', 1230],
    ['McLaren F1 GTR', 'GT1', 1995, '6.1L BMW V12', 600, '~600 hp', null],
    ['Mercedes CLK GTR', 'GT1', 1997, '6.0L V12', 592, '~590 hp', null],
    ['Porsche 911 GT1', 'GT1', 1996, '3.2L twin-turbo flat-6', 592, '~590 hp', null],
    ['Plymouth Superbird', 'NASCAR', 1970, '7.0L (426) Hemi V8', null, '—', null],
    ['Ford Thunderbird (Elliott)', 'NASCAR', 1987, '5.86L (358 ci) V8', null, '—', null],
    ['NASCAR Next Gen', 'NASCAR', 2022, '5.86L V8', 670, '670 hp', 1451],
    ['Nissan GT-R GT500', 'Super GT', 2014, '2.0L I4 turbo', 641, '~640 hp', null],
    ['Toyota GR Supra GT500', 'Super GT', 2020, '2.0L I4 turbo', null, '—', null],
    ['Honda NSX-GT', 'Super GT', 2014, '2.0L I4 turbo', null, '—', null],
    ['Mercedes 190E Evo II', 'DTM', 1992, '2.5L I4', 370, '~370 hp', null],
    ['Alfa Romeo 155 V6 TI', 'DTM', 1993, '2.5L V6', 420, '420 hp', null],
    ['Audi RS 5 DTM', 'DTM', 2013, '4.0L V8 / 2.0L I4 turbo', null, '—', null],
  ];
  const body = document.getElementById('compare-body');
  const filter = document.getElementById('compare-filter');
  if (!body || !filter) return;
  Object.keys(S).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; filter.appendChild(o); });
  const idx = { name: 0, series: 1, year: 2, engine: 3, hp: 4, kg: 6 };
  let sortKey = 'hp', dir = -1;
  function render() {
    const rows = cars.filter(c => filter.value === 'all' || c[1] === filter.value).slice();
    const i = idx[sortKey];
    rows.sort((a, b) => {
      const x = a[i], y = b[i];
      if (x === null && y === null) return 0;
      if (x === null) return 1;
      if (y === null) return -1;
      return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
    body.innerHTML = rows.map(c =>
      `<tr><td>${c[0]}</td><td><span class="series-dot" style="background:${S[c[1]]}"></span>${c[1]}</td>` +
      `<td class="num">${c[2]}</td><td>${c[3]}</td><td class="num">${c[5]}</td>` +
      `<td class="num">${c[6] ? c[6].toLocaleString('en-US') + ' kg' : '—'}</td></tr>`).join('');
    document.querySelectorAll('.compare-table th button').forEach(b => {
      const on = b.dataset.sort === sortKey;
      b.classList.toggle('sorted', on);
      b.parentElement.setAttribute('aria-sort', on ? (dir === 1 ? 'ascending' : 'descending') : 'none');
    });
  }
  document.querySelectorAll('.compare-table th button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.sort;
    if (k === sortKey) dir = -dir; else { sortKey = k; dir = (k === 'hp' || k === 'kg' || k === 'year') ? -1 : 1; }
    render();
  }));
  filter.addEventListener('change', render);
  render();
})();

// ── Quiz ──
(() => {
  const card = document.getElementById('quiz-card');
  if (!card) return;
  const Q = [
    ['How many times did Tom Kristensen win the 24 Hours of Le Mans?', ['6', '7', '9', '11'], 2, 'Nine wins earned him the nickname "Mr. Le Mans", including six in a row from 2000 to 2005.'],
    ['Which car was the first diesel to win Le Mans?', ['Peugeot 908 HDi FAP', 'Audi R10 TDI', 'Audi R8', 'Porsche 919 Hybrid'], 1, 'The Audi R10 TDI won in 2006, only 200 days after it was unveiled.'],
    ['What does the Indianapolis 500 winner drink in Victory Lane?', ['Champagne', 'Orange juice', 'Milk', 'Water'], 2, 'The tradition started when Louis Meyer drank buttermilk after winning in 1936.'],
    ['Who holds the record of 200 NASCAR Cup Series wins?', ['Dale Earnhardt', 'Jimmie Johnson', 'Jeff Gordon', 'Richard Petty'], 3, '"The King" Richard Petty won 200 races, almost twice as many as anyone else.'],
    ['Which race is NOT part of motorsport\'s Triple Crown?', ['Monaco Grand Prix', 'Daytona 500', 'Indianapolis 500', '24 Hours of Le Mans'], 1, 'The Triple Crown is Monaco, Indianapolis and Le Mans. Only Graham Hill has won all three.'],
    ['On a timing screen, what does a purple sector mean?', ['The driver was slower than their best', 'The lap was deleted', 'The fastest time of anyone in the session', 'The driver must pit'], 2, 'Purple is the overall fastest. Green is a personal best, yellow is slower, and red means invalidated.'],
    ['How fast was Bill Elliott\'s 1987 Talladega qualifying lap, still a NASCAR record?', ['199.5 mph', '205.3 mph', '212.809 mph', '221.4 mph'], 2, 'Restrictor plates arrived the next year, so the record will probably never be broken.'],
    ['In which year did the DTM switch to GT3 cars?', ['2012', '2019', '2021', '2024'], 2, 'GT3 cars replaced the Class One machines in 2021.'],
    ['Who is the only driver to win the Indy 500, the Daytona 500 and the F1 World Championship?', ['A.J. Foyt', 'Mario Andretti', 'Jimmie Johnson', 'Nigel Mansell'], 1, 'Mario Andretti won Daytona in 1967, Indianapolis in 1969 and the F1 title in 1978.'],
    ['Which GT car won Le Mans outright in 1995, beating the prototypes?', ['Ferrari F40', 'Porsche 911 GT1', 'McLaren F1 GTR', 'Mercedes CLK GTR'], 2, 'The McLaren F1 GTR won on its first attempt, in a race with around 17 hours of rain.'],
  ];
  let i = 0, score = 0;
  function show() {
    if (i >= Q.length) return finish();
    const [q, opts, ans, why] = Q[i];
    card.innerHTML = `<div class="quiz-progress">Question ${i + 1} of ${Q.length}</div>
      <div class="quiz-bar"><span style="width:${(i / Q.length) * 100}%"></span></div>
      <div class="quiz-question">${q}</div>
      <div class="quiz-options">${opts.map((o, k) => `<button type="button" class="quiz-option" data-k="${k}">${o}</button>`).join('')}</div>
      <div class="quiz-feedback"></div>
      <button type="button" class="quiz-next" hidden>${i === Q.length - 1 ? 'See my score' : 'Next question'}</button>`;
    const fb = card.querySelector('.quiz-feedback');
    const next = card.querySelector('.quiz-next');
    card.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k;
      card.querySelectorAll('.quiz-option').forEach(x => {
        x.disabled = true;
        if (+x.dataset.k === ans) x.classList.add('correct');
      });
      if (k === ans) { score++; fb.textContent = 'Correct! ' + why; }
      else { b.classList.add('wrong'); fb.textContent = 'Not quite. ' + why; }
      next.hidden = false;
      next.focus();
    }));
    next.addEventListener('click', () => { i++; show(); });
  }
  function finish() {
    const msg = score === Q.length ? 'Perfect score, you could run this website!' :
      score >= 7 ? 'Great result, you clearly know your racing.' :
      score >= 4 ? 'Not bad! Scroll back up and try again.' : 'Time for another lap of the page!';
    card.innerHTML = `<div class="quiz-progress">Your result</div>
      <div class="quiz-score">${score} / ${Q.length}</div>
      <p class="quiz-feedback">${msg}</p>
      <button type="button" class="quiz-next">Play again</button>`;
    card.querySelector('.quiz-next').addEventListener('click', () => { i = 0; score = 0; show(); });
  }
  show();
})();

// ── Light / dark toggle ──
(() => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => {
    const light = root.getAttribute('data-theme') === 'light';
    btn.querySelector('span').textContent = light ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  };
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('rm-theme', next); } catch (e) {}
    sync();
  });
  sync();
})();

// ── Counting stat numbers ──
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nums = [...document.querySelectorAll('.stat-num')];
  const parse = el => {
    const m = el.textContent.trim().match(/^(\d[\d,]*)(.*)$/);
    if (!m) return null;
    const end = parseInt(m[1].replace(/,/g, ''), 10);
    const isYear = !m[2] && end >= 1800 && end <= 2100;
    return { end, suffix: m[2], start: isYear ? end - 40 : 0, text: el.textContent };
  };
  const run = el => {
    const p = parse(el);
    if (!p || still) return;
    const t0 = performance.now(), dur = 1300;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(p.start + (p.end - p.start) * e) + p.suffix;
      if (k < 1) requestAnimationFrame(step); else el.textContent = p.text;
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
  }), { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

// ── Power bars on car cards (scale: 1,000 hp = full bar) ──
(() => {
  document.querySelectorAll('.car-card .spec').forEach(spec => {
    const key = spec.querySelector('.spec-key');
    const val = spec.querySelector('.spec-val');
    if (!key || !val || !/^Power/i.test(key.textContent.trim())) return;
    const m = val.textContent.replace(/,/g, '').match(/(\d+)\+?\s*(hp|PS)/i);
    if (!m) return;
    let hp = +m[1];
    if (/ps/i.test(m[2])) hp *= 0.986;
    const bar = document.createElement('div');
    bar.className = 'power-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<span></span>';
    bar.firstChild.style.setProperty('--w', Math.min(100, hp / 10).toFixed(1) + '%');
    spec.appendChild(bar);
  });
})();
// ── Floating back-to-top ──
(() => {
  const fab = document.getElementById('fab-top');
  if (!fab) return;
  const onScroll = () => fab.classList.toggle('show', window.scrollY > window.innerHeight * 1.2);
  window.addEventListener('scroll', onScroll, { passive: true });
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  onScroll();
})();

// ── Contents panel ──
(() => {
  const btn = document.getElementById('contents-btn');
  const panel = document.getElementById('contents-panel');
  if (!btn || !panel) return;
  const open = state => {
    panel.hidden = !state;
    btn.setAttribute('aria-expanded', state);
    if (state) panel.querySelector('a').focus({ preventScroll: true });
  };
  btn.addEventListener('click', e => { e.stopPropagation(); open(panel.hidden); });
  panel.addEventListener('click', e => { if (e.target.closest('a')) open(false); });
  document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) open(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
})();

// ── Term tooltips: explain racing terms where they appear in the text ──
(() => {
  const pop = document.getElementById('tip-pop');
  if (!pop) return;
  const defs = Object.assign({}, window.RM_TERMS || {});
  // alias found in the text -> term name in the Racing Terms section
  const A = [
    ['Balance of Performance', 'Balance of Performance (BoP)'], ['BoP', 'Balance of Performance (BoP)'],
    ['Hypercar', 'Hypercar Class'], ['LMP1', 'LMP1 / LMP2'], ['LMP2', 'LMP1 / LMP2'], ['GTP', 'GTP Class'],
    ['homologation', 'Homologation'], ['downforce', 'Downforce'], ['pole position', 'Pole Position'],
    ['DRS', 'DRS (Drag Reduction System)'], ['power unit', 'Power Unit'], ['multi-class', 'Multi-Class Racing'],
    ['gentleman drivers', 'Gentleman Driver'], ['gentleman driver', 'Gentleman Driver'], ['Pro-Am', 'Pro-Am / Silver Cup'],
    ['Push-to-Pass', 'Push-to-Pass'], ['Aeroscreen', 'Aeroscreen'], ['Triple Crown', 'Triple Crown of Motorsport'],
    ['superspeedways', 'Superspeedway'], ['superspeedway', 'Superspeedway'], ['drafting', 'Drafting'], ['slipstream', 'Drafting'],
    ['success ballast', 'Success Ballast'], ['GT500', 'GT500 / GT300'], ['GT300', 'GT500 / GT300'], ['Class One', 'Class One'],
    ['touring cars', 'Touring Car'], ['touring car', 'Touring Car'], ['hybrid', 'Hybrid Power'], ['endurance racing', 'Endurance Racing'],
    ['restrictor plates', 'Superspeedway'], ['ovals', 'Oval Racing'],
  ].filter(([, t]) => defs[t]);
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp('\\b(' + A.map(([a]) => esc(a)).sort((x, y) => y.length - x.length).join('|') + ')\\b', 'gi');
  const termFor = word => {
    for (const [a, t] of A) {
      const caseSensitive = /[A-Z]/.test(a);
      if (caseSensitive ? word === a : word.toLowerCase() === a.toLowerCase()) return t;
    }
    return null;
  };
  const usedIn = new Map();
  document.querySelectorAll('.section-desc, .timeline-detail, .driver-bio, .car-desc, .era-desc').forEach(el => {
    if (el.closest('#terms')) return;
    const sec = el.closest('section');
    if (!usedIn.has(sec)) usedIn.set(sec, new Set());
    const used = usedIn.get(sec);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.nodeValue;
      let m, last = 0, frag = null;
      rx.lastIndex = 0;
      while ((m = rx.exec(text))) {
        const term = termFor(m[0]);
        if (!term || used.has(term)) continue;
        used.add(term);
        frag = frag || document.createDocumentFragment();
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'term-tip';
        b.dataset.term = term;
        b.setAttribute('aria-describedby', 'tip-pop');
        b.textContent = m[0];
        frag.appendChild(b);
        last = m.index + m[0].length;
      }
      if (frag) {
        frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  });
  let current = null;
  const show = b => {
    current = b;
    const name = b.dataset.term.replace(/^[^\w]+\s*/, '');
    pop.innerHTML = '';
    const strong = document.createElement('strong'); strong.textContent = name;
    const span = document.createElement('span'); span.textContent = 'From Racing Terms';
    pop.append(strong, document.createTextNode(defs[b.dataset.term]), span);
    pop.hidden = false;
    const r = b.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, document.documentElement.clientWidth - w - 12));
    let top = r.bottom + 10;
    if (top + h > window.innerHeight - 10) top = r.top - h - 10;
    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top = (top + window.scrollY) + 'px';
  };
  const hide = () => { pop.hidden = true; current = null; };
  document.addEventListener('mouseover', e => { const b = e.target.closest('.term-tip'); if (b) show(b); });
  document.addEventListener('mouseout', e => { if (e.target.closest('.term-tip')) hide(); });
  document.addEventListener('focusin', e => { const b = e.target.closest('.term-tip'); if (b) show(b); });
  document.addEventListener('focusout', e => { if (e.target.closest('.term-tip')) hide(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('.term-tip');
    if (b) { current === b && !pop.hidden ? hide() : show(b); }
    else if (!pop.hidden) hide();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (!pop.hidden) hide(); }, { passive: true });
})();
