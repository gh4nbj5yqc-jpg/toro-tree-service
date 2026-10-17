// ====== Toro Tree Service — interactions ======
(function () {
  const nav = document.getElementById('nav');
  const heroFrame = document.getElementById('heroFrame');
  const hero = document.querySelector('.hero');
  const mobileBar = document.querySelector('.mobile-bar');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const words = scrub.textContent.trim().split(/\s+/);
  scrub.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  const wordEls = scrub.querySelectorAll('.w');

  // ---- Parallax images ----
  const parallax = document.querySelectorAll('.parallax-img');

  // ---- Scroll loop ----
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;

    nav.classList.toggle('scrolled', y > vh * 0.6);
    if (mobileBar) mobileBar.classList.toggle('show', y > vh * 0.8);

    if (!reduce) {
      // hero: shrink into a rounded card as you scroll
      const heroH = hero.offsetHeight - vh;
      const p = Math.min(Math.max(y / heroH, 0), 1);
      heroFrame.style.setProperty('--p', p.toFixed(3));

      // parallax
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.speed || 0.1);
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.firstElementChild.style.transform = `translateY(${offset - r.height * 0.1}px)`;
      });
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
  onScroll();

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
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('formSuccess').hidden = false;
  });
})();
