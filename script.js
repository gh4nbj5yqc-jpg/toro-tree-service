// ====== Tigre Tree Service — interactions ======
(function () {
  const nav = document.getElementById('nav');
  const heroFrame = document.getElementById('heroFrame');
  const hero = document.querySelector('.hero');
  const mobileBar = document.querySelector('.mobile-bar');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DICT = window.TORO_I18N || { en: {}, es: {} };

  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Mobile menu ----
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // ---- Statement: split into words ----
  const scrub = document.getElementById('scrub');
  let wordEls = [];
  function buildScrub(text) {
    scrub.innerHTML = text.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    wordEls = scrub.querySelectorAll('.w');
  }

  // ---- Language switch ----
  const i18nEls = document.querySelectorAll('[data-i18n]');
  const phEls = document.querySelectorAll('[data-i18n-ph]');
  const original = new Map();
  i18nEls.forEach(el => original.set(el, el.innerHTML));
  DICT.en._statement = DICT.en._statement || scrub.textContent;

  const langBox = document.querySelector('.lang');
  function setLang(lang) {
    const d = DICT[lang] || {};
    i18nEls.forEach(el => {
      const k = el.dataset.i18n;
      el.innerHTML = (lang !== 'en' && d[k]) ? d[k] : original.get(el);
    });
    phEls.forEach(el => { el.placeholder = (d._msgph || DICT.en._msgph); });
    buildScrub(d._statement || DICT.en._statement);
    document.documentElement.lang = lang;
    if (d._title) document.title = d._title;
    langBox.dataset.active = lang;
    langBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    try { localStorage.setItem('toro-lang', lang); } catch (e) {}
    onScroll();
  }
  langBox.querySelectorAll('button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ---- Forest background ----
  const pineMain = document.querySelector('.pine-main');
  const pineLeft = document.querySelector('.pine-left');
  const pineSmall = document.querySelector('.pine-small');
  const ridgeFar = document.querySelector('.ridge-far');
  const ridgeMid = document.querySelector('.ridge-mid');
  const forest = document.querySelector('.forest');

  // falling pine needles
  const needles = document.getElementById('needles');
  if (!reduce) {
    for (let i = 0; i < 18; i++) {
      const n = document.createElement('i');
      n.style.left = (Math.random() * 100) + '%';
      n.style.animationDuration = (9 + Math.random() * 10) + 's';
      n.style.animationDelay = (-Math.random() * 18) + 's';
      n.style.setProperty('--r', (Math.random() * 360) + 'deg');
      n.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      n.style.transform = `scale(${0.6 + Math.random() * 0.9})`;
      needles.appendChild(n);
    }
  }

  // ---- Parallax images ----
  const parallax = document.querySelectorAll('.parallax-img');

  // ---- Scroll loop ----
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;
    const page = Math.min(Math.max(y / docH, 0), 1);

    nav.classList.toggle('scrolled', y > vh * 0.6);
    if (mobileBar) mobileBar.classList.toggle('show', y > vh * 0.8);

    if (!reduce) {
      const heroH = hero.offsetHeight - vh;
      const p = Math.min(Math.max(y / heroH, 0), 1);
      heroFrame.style.setProperty('--p', p.toFixed(3));

      // forest fades in once the video starts shrinking
      forest.style.opacity = Math.min(p * 1.6, 1).toFixed(3);

      // big pine slides DOWN the screen as you scroll the page, swaying a little
      const mainH = pineMain.offsetHeight;
      const travel = vh - mainH * 0.55;
      pineMain.style.transform = `translateY(${(-mainH * 0.45 + page * travel).toFixed(1)}px) rotate(${(Math.sin(y / 260) * 2.2).toFixed(2)}deg)`;
      // left pine drifts slower, small pine moves up — gives depth
      pineLeft.style.transform = `translateY(${(vh * 0.15 + page * vh * 0.45).toFixed(1)}px) rotate(${(Math.sin(y / 320 + 1) * 1.6).toFixed(2)}deg)`;
      pineSmall.style.transform = `translateY(${(vh * 0.7 - page * vh * 0.6).toFixed(1)}px)`;
      ridgeFar.style.transform = `translateY(${(30 - page * 40).toFixed(1)}px)`;
      ridgeMid.style.transform = `translate(${(-page * 120).toFixed(1)}px, ${(60 - page * 90).toFixed(1)}px)`;

      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.speed || 0.1);
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.firstElementChild.style.transform = `translateY(${offset - r.height * 0.1}px)`;
      });
    } else {
      forest.style.opacity = 1;
    }

    // statement words light up
    const r = scrub.getBoundingClientRect();
    const start = vh * 0.85, end = vh * 0.3;
    const prog = Math.min(Math.max((start - r.top) / (start - end + r.height * 0.6), 0), 1);
    const lit = Math.round(prog * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('on', reduce || i < lit));

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  // initial language: saved choice, else browser language
  let startLang = 'en';
  try {
    const saved = localStorage.getItem('toro-lang');
    if (saved === 'en' || saved === 'es') startLang = saved;
    else if ((navigator.language || '').toLowerCase().startsWith('es')) startLang = 'es';
  } catch (e) {}
  setLang(startLang);

  // ---- Reveal on scroll (staggered) ----
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--rd', (siblings.indexOf(el) * 0.08) + 's');
    io.observe(el);
  });

  // ---- Counters ----
  const counters = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur = 1800, t0 = performance.now();
      const step = now => {
        const k = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      reduce ? (el.textContent = target.toLocaleString('en-US') + suffix) : requestAnimationFrame(step);
      counters.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));

  // ---- Contact form (demo) ----
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('formSuccess').hidden = false;
  });
})();
