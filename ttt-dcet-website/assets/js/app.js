/* T.T.T Academy — core interactions (no build step; GSAP + ScrollTrigger loaded from CDN) */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const hasGsap = () => typeof window.gsap !== 'undefined';
  if (reduced) document.documentElement.classList.add('reduced-motion');

  /* ---------- Header: glass on scroll, hide on scroll down ---------- */
  const header = $('#siteHeader');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menu = $('#mobileMenu');
  const toggle = $('.menu-toggle');
  const openMenu = (open) => {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle && toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      $('.menu-close', menu).focus();
      if (hasGsap() && !reduced) gsap.from($$('.mm-body > *', menu), { y: 20, opacity: 0, stagger: 0.03, duration: 0.5, ease: 'power3.out' });
    } else toggle && toggle.focus();
  };
  toggle && toggle.addEventListener('click', () => openMenu(true));
  $('.menu-close', menu)?.addEventListener('click', () => openMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) openMenu(false); });

  /* ---------- Animated counters ---------- */
  const fmt = (n, el) => {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const v = dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-IN');
    return (el.dataset.prefix || '') + v + (el.dataset.suffix || '');
  };
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    if (reduced || !hasGsap()) { el.textContent = fmt(target, el); return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v, el)) });
  };
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { runCounter(en.target); counterIO.unobserve(en.target); } });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach((el) => counterIO.observe(el));

  /* ---------- Lite YouTube embeds ---------- */
  $$('[data-yt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.yt;
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      f.title = btn.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      btn.replaceChildren(f);
      btn.removeAttribute('role');
    }, { once: true });
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  let group = [], idx = 0;
  const show = (i) => {
    idx = (i + group.length) % group.length;
    const a = group[idx];
    // 4K file only for large / high-density screens; 1920px version otherwise (saves mobile data)
    const href = a.getAttribute('href');
    const wantsHuge = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1) > 2600;
    $('img', lb).src = wantsHuge ? href : href.replace('-3840.webp', '.webp');
    $('img', lb).alt = a.dataset.caption || '';
    $('figcaption', lb).textContent = a.dataset.caption || '';
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lightbox]');
    if (!a) return;
    e.preventDefault();
    group = $$(`[data-lightbox="${a.dataset.lightbox}"]`).filter((x) => x.offsetParent !== null);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(group.indexOf(a));
    $('.lb-close', lb).focus();
  });
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; $('img', lb).src = ''; };
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- 3D tilt on hover ---------- */
  if (!reduced && !isTouch) {
    $$('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Enquiry / demo forms (AJAX) ---------- */
  $$('form[data-ajax]').forEach((form) => {
    const status = $('.form-status', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      const phone = form.elements.phone;
      if (phone && !/^[6-9]\d{9}$/.test(phone.value.replace(/\D/g, '').slice(-10))) {
        status.textContent = 'Please enter a valid 10-digit Indian mobile number.';
        status.classList.add('err');
        phone.focus();
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = $('button[type="submit"]', form);
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.message || 'Something went wrong. Please call or WhatsApp us.');
        status.textContent = data.message;
        status.classList.add('ok');
        form.reset();
        if (form.dataset.whatsapp === '1' && data.whatsapp) window.open(data.whatsapp, '_blank', 'noopener');
      } catch (err) {
        status.textContent = err.message;
        status.classList.add('err');
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });
    // "Send on WhatsApp instead" buttons
    $$('[data-wa-send]', form).forEach((b) => b.addEventListener('click', () => {
      const f = form.elements;
      const lines = ['Hi T.T.T Academy, DCET enquiry:', f.name && `Name: ${f.name.value}`, f.phone && `Phone: ${f.phone.value}`, f.course && `Course: ${f.course.value}`, f.mode && f.mode.value && `Mode: ${f.mode.value}`, f.message && f.message.value && `Message: ${f.message.value}`].filter(Boolean);
      window.open(`${b.dataset.waSend}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    }));
  });

  /* ---------- Generic filter (pill buttons + search) ---------- */
  $$('[data-filter-scope]').forEach((scope) => {
    const items = $$('[data-filter-item]', scope);
    const pills = $$('[data-filter]', scope);
    const search = $('[data-filter-search]', scope);
    const count = $('[data-filter-count]', scope);
    let active = (pills.find((p) => p.getAttribute('aria-pressed') === 'true') || {}).dataset?.filter || 'all';
    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      let n = 0;
      items.forEach((it) => {
        const okCat = active === 'all' || (it.dataset.filterItem || '').split(' ').includes(active);
        const okQ = !q || (it.dataset.search || it.textContent).toLowerCase().includes(q);
        it.hidden = !(okCat && okQ);
        if (!it.hidden) n++;
      });
      if (count) count.textContent = n.toLocaleString('en-IN');
    };
    pills.forEach((p) => p.addEventListener('click', () => {
      pills.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      p.setAttribute('aria-pressed', 'true');
      active = p.dataset.filter;
      apply();
      if (hasGsap() && !reduced) gsap.fromTo(items.filter((i) => !i.hidden).slice(0, 24), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.02, duration: 0.4 });
    }));
    search && search.addEventListener('input', apply);
    apply();
  });

  /* ---------- Tabs (syllabus explorer etc.) ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const select = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(x.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && panel && hasGsap() && !reduced) gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (dir) { e.preventDefault(); const n = tabs[(i + dir + tabs.length) % tabs.length]; n.focus(); select(n); }
      });
    });
  });

  /* ---------- Hero background slideshow (real classroom photos) ---------- */
  const slides = $$('.hero-media img');
  if (slides.length) {
    let s = 0;
    slides[0].classList.add('is-on');
    if (!reduced && slides.length > 1) setInterval(() => { slides[s].classList.remove('is-on'); s = (s + 1) % slides.length; slides[s].classList.add('is-on'); }, 7000);
  }

  /* ---------- GSAP-powered motion ---------- */
  const initMotion = () => {
    if (!hasGsap()) { $$('[data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
    if (reduced) { gsap.set('[data-reveal]', { opacity: 1, y: 0 }); return; }
    gsap.registerPlugin(ScrollTrigger);

    // Reveal on scroll (supports data-reveal="stagger" on a parent)
    $$('[data-reveal]').forEach((el) => {
      const kids = el.dataset.reveal === 'stagger' ? Array.from(el.children) : null;
      if (kids) {
        gsap.set(el, { opacity: 1, y: 0 });
        gsap.from(kids, { opacity: 0, y: 36, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
      } else {
        gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      }
    });

    // Parallax
    $$('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 60;
      gsap.fromTo(el, { y: -amt / 2 }, { y: amt / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Scroll-triggered image zoom-in (cinematic)
    $$('[data-zoom]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8% round 28px)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 30%', scrub: true } });
    });

    // Horizontal marquee strips driven by scroll
    $$('[data-scroll-x]').forEach((el) => {
      const dir = parseFloat(el.dataset.scrollX) || -1;
      gsap.fromTo(el, { xPercent: dir < 0 ? 0 : -20 }, { xPercent: dir < 0 ? -20 : 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Pinned horizontal achievers gallery (desktop only)
    const ach = $('[data-h-scroll]');
    if (ach && window.matchMedia('(min-width: 992px)').matches) {
      const track = $('.ach-track', ach);
      const dist = () => track.scrollWidth - window.innerWidth;
      const hTween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: ach, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.ach-card', track).forEach((card) => {
        gsap.fromTo(card, { rotateY: -18, opacity: 0.4 }, { rotateY: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left 95%', end: 'left 55%', scrub: true } });
      });
    }

    // Home hero entrance
    const hero = $('.hero');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.8 })
        .from('.hero-title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.12 }, '-=0.5')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.9 }, '-=0.7')
        .from('.hero-actions > *', { y: 20, opacity: 0, stagger: 0.08, duration: 0.8 }, '-=0.6')
        .from('.hero-stats', { y: 30, opacity: 0, duration: 0.9 }, '-=0.6')
        .from('.hero-card', { y: 80, opacity: 0, rotateX: 25, stagger: 0.12, duration: 1.2 }, 0.3);
      // floating cards
      $$('.hero-card').forEach((c, i) => gsap.to(c, { y: i % 2 ? 14 : -14, duration: 3 + i * 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5 }));
      // mouse parallax for cards
      if (!isTouch) hero.addEventListener('pointermove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        gsap.to('.hero-stack', { rotateY: x * 10, rotateX: -y * 8, duration: 1.2, ease: 'power2.out' });
      });
      // hero content drifts on scroll
      gsap.to('.hero .container-xl', { yPercent: 12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    // Page hero entrance
    if ($('.page-hero')) {
      gsap.from('.page-hero .crumbs, .page-hero .eyebrow, .page-hero h1, .page-hero .lead-x, .page-hero .ph-actions', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' });
    }
  };

  /* ---------- Floating mathematics formulas ---------- */
  const formulaLayer = $('.formula-layer');
  if (formulaLayer) {
    const formulas = ['∫ f(x) dx', 'dy/dx', 'a² + b² = c²', 'Σ xᵢ / n', 'V = I · R', 'sin²θ + cos²θ = 1', 'det(A)', 'σ = √(Σ(x−μ)²/n)', 'P = V · I', 'lim x→0', 'e^{iπ} + 1 = 0', 'r = cov(x,y)/σₓσᵧ', 'Δ = b² − 4ac', 'f′(x)'];
    const count = window.innerWidth < 768 ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'formula';
      s.textContent = formulas[i % formulas.length];
      s.style.left = `${5 + Math.random() * 88}%`;
      s.style.top = `${8 + Math.random() * 80}%`;
      s.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
      formulaLayer.appendChild(s);
      if (!reduced) {
        const drift = () => window.gsap && gsap.to(s, { x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 90, rotation: (Math.random() - 0.5) * 12, duration: 8 + Math.random() * 6, ease: 'sine.inOut', onComplete: drift });
        setTimeout(drift, 300);
      }
    }
  }

  if (document.readyState === 'complete') initMotion();
  else window.addEventListener('load', initMotion);
})();
