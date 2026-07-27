/**
 * Precision Lab Portfolio — loads data from JSON, renders, then inits UI
 */
import { renderSite, renderWriting } from './render.js';
import { initEasterEgg } from './easter-egg.js';
import { initTerminalWidget } from './terminal-widget.js';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let portfolioData = null;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;

async function loadPortfolio() {
  const res = await fetch('/data/portfolio.json');
  if (!res.ok) throw new Error('Failed to load portfolio data');
  return res.json();
}

async function loadWriting(data) {
  try {
    const res = await fetch(`/api/writing?user=${encodeURIComponent(data.writing.mediumUsername)}`);
    if (!res.ok) return data.writing.fallbackArticles;
    const articles = await res.json();
    return articles.length ? articles : data.writing.fallbackArticles;
  } catch {
    return data.writing.fallbackArticles;
  }
}

/* ── Scroll progress ── */
function initScrollProgress() {
  const fill = $('#scrollProgressFill');
  if (!fill) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Custom cursor ── */
function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || isTouch) return;
  document.body.classList.add('has-cursor');
  let mx = 0, my = 0, rx = 0, ry = 0;
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    const hover = document.elementFromPoint(mx, my)?.closest('a, button, .btn, summary, .project-card, .skill-card, .writing-card');
    cursor.classList.toggle('is-hover', !!hover);
  });
  const tick = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.15;
    cursor.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── Hero video + audio (synced) ── */
function initVideo() {
  const video = $('#heroVideo');
  const playBtn = $('#videoToggle');
  const muteBtn = $('#muteToggle');
  const controls = $('#videoControls');
  const progress = $('#videoProgress');
  if (!video) return;

  const getVolume = () => portfolioData?.person?.videoVolume ?? 1;
  let finishedFirstPlay = false;

  const isPlaying = () => !video.paused && !video.ended;

  const updateProgress = () => {
    if (!progress || !video.duration) return;
    progress.style.width = `${(video.currentTime / video.duration) * 100}%`;
  };

  const syncControls = () => {
    const playing = isPlaying();
    playBtn?.classList.toggle('is-playing', playing);
    playBtn?.classList.toggle('is-active', playing);
    playBtn?.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');

    muteBtn?.classList.toggle('is-muted', video.muted);
    muteBtn?.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');

    controls?.classList.toggle('is-ended', video.ended);
    updateProgress();
  };

  const unmute = () => {
    video.muted = false;
    video.volume = getVolume();
  };

  const showControls = () => controls?.classList.add('is-visible');

  const startMutedAutoplay = async () => {
    video.muted = true;
    video.volume = getVolume();
    showControls();
    try {
      await video.play();
    } catch {
      /* autoplay blocked */
    }
    syncControls();
  };

  video.addEventListener('ended', () => {
    finishedFirstPlay = true;
    syncControls();
  });

  video.addEventListener('play', syncControls);
  video.addEventListener('pause', syncControls);
  video.addEventListener('volumechange', syncControls);
  video.addEventListener('timeupdate', updateProgress);

  playBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();

    if (video.ended || (video.duration && video.currentTime >= video.duration - 0.05)) {
      video.currentTime = 0;
      finishedFirstPlay = true;
    }

    if (video.paused) {
      if (finishedFirstPlay) unmute();
      try {
        await video.play();
      } catch {
        video.muted = true;
        await video.play().catch(() => {});
      }
    } else {
      video.pause();
    }
    syncControls();
  });

  muteBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (video.muted) {
      unmute();
      if (video.paused) {
        try {
          await video.play();
        } catch {
          video.muted = true;
        }
      }
    } else {
      video.muted = true;
    }
    syncControls();
  });

  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    startMutedAutoplay();
  } else {
    video.addEventListener('canplay', startMutedAutoplay, { once: true });
  }
}

/* ── Live terminal counter ── */
function initLiveCounter() {
  const el = $('#liveCount');
  if (!el) return;
  let base = 28412;
  setInterval(() => {
    base += Math.floor(Math.random() * 3);
    el.textContent = base.toLocaleString();
  }, 4000);
}

/* ── Navigation ── */
function initNav() {
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  const closeMenu = () => {
    navLinks?.classList.remove('is-open');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const moveIndicator = (link) => {
    const indicator = $('#navIndicator');
    const pill = $('#navPill');
    if (!indicator || !link || !pill || innerWidth <= 768) {
      indicator?.style.setProperty('opacity', '0');
      return;
    }
    indicator.style.opacity = '1';
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });

  $$('.nav__link').forEach(l => l.addEventListener('click', closeMenu));
  addEventListener('click', e => { if (!e.target.closest('.nav')) closeMenu(); });
  addEventListener('resize', () => { const a = $('.nav__link.is-active'); if (a) moveIndicator(a); });

  const links = $$('.nav__link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => {
        const active = l.dataset.section === id;
        l.classList.toggle('is-active', active);
        if (active) moveIndicator(l);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  $$('section[id]').forEach(s => spy.observe(s));
  addEventListener('scroll', () => nav?.classList.toggle('is-scrolled', scrollY > 30), { passive: true });
}

function initSmoothScroll() {
  $$('[data-scroll], a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.dataset.scroll || link.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        scrollTo({ top: target.offsetTop - offset + 1, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });
}

function initReveal() {
  if (prefersReducedMotion) {
    $$('.reveal, .hero-enter').forEach(el => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  $$('.reveal').forEach(el => obs.observe(el));
  $$('[data-stagger]').forEach(parent => {
    parent.querySelectorAll('.reveal').forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.08}s`;
    });
  });
}

function initCounters() {
  const animate = (el, target) => {
    if (prefersReducedMotion) { el.textContent = target; return; }
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const t = parseInt(e.target.dataset.count, 10);
      if (!isNaN(t)) animate(e.target, t);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => obs.observe(el));
}

function initProjectsCarousel() {
  const track = $('#projectsTrack');
  const prev = $('#projectsPrev');
  const next = $('#projectsNext');
  const count = $('#projectsCount');
  if (!track) return;

  const cards = () => [...track.querySelectorAll('.project-card')];

  const scrollStep = () => {
    const card = track.querySelector('.project-card');
    const gap = parseFloat(getComputedStyle(track).gap) || 16;
    return card ? card.offsetWidth + gap : track.clientWidth * 0.85;
  };

  const update = () => {
    const total = cards().length;
    if (!total) return;
    const step = scrollStep();
    const index = Math.min(total - 1, Math.max(0, Math.round(track.scrollLeft / step)));
    if (count) count.textContent = `${index + 1} / ${total}`;
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  };

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -scrollStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  next?.addEventListener('click', () => {
    track.scrollBy({ left: scrollStep(), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

function initExpertiseTabs() {
  const tabs = $$('.expertise-tabs__btn');
  const panes = $$('.expertise-pane');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panes.forEach((pane) => {
        const active = pane.dataset.pane === id;
        pane.classList.toggle('is-active', active);
        pane.hidden = !active;
      });
    });
  });
}

function initProjectCards() {
  const modal = $('#projectModal');
  const content = $('#projectModalContent');
  const cards = $$('.project-card');
  if (!modal || !content || !cards.length) return;

  let lastFocus = null;

  const closeModal = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
    content.innerHTML = '';
    lastFocus?.focus();
    lastFocus = null;
  };

  const openModal = (card) => {
    const tpl = card.querySelector('.project-card__template');
    if (!tpl) return;

    lastFocus = card.querySelector('.project-card__summary');
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));

    content.querySelectorAll('.flow').forEach((flow) => {
      flow.querySelectorAll('.flow__node').forEach((node) => {
        node.addEventListener('mouseenter', () => node.classList.add('is-active'));
        node.addEventListener('mouseleave', () => node.classList.remove('is-active'));
      });
    });

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
    modal.querySelector('.project-modal__close')?.focus();
  };

  cards.forEach((card) => {
    card.querySelector('.project-card__summary')?.addEventListener('click', () => openModal(card));
  });

  modal.querySelectorAll('[data-modal-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

function initSkillsFilter() {
  const btns = $$('.filter-bar__btn');
  const chips = $$('.skills-cloud__chip');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      btns.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      chips.forEach(chip => {
        const cats = (chip.dataset.category || '').split(' ');
        chip.classList.toggle('is-filtered-out', filter !== 'all' && !cats.includes(filter));
      });
    });
  });
}

function initCopyEmail() {
  const btn = $('#copyEmail');
  const toast = $('#toast');
  if (!btn || !toast || !portfolioData) return;
  let timer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2400);
  };
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(portfolioData.person.email);
      showToast('Email copied to clipboard');
      btn.classList.add('is-copied');
      setTimeout(() => btn.classList.remove('is-copied'), 1500);
    } catch {
      showToast('Could not copy — try manually');
    }
  });
}

function initContactForm() {
  const form = $('#contactForm');
  const toast = $('#toast');
  if (!form || form.hidden) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        toast.textContent = 'Message sent — thank you!';
        toast.hidden = false;
        toast.classList.add('is-visible');
        form.reset();
      } else throw new Error();
    } catch {
      toast.textContent = 'Failed to send — try email instead';
      toast.hidden = false;
      toast.classList.add('is-visible');
    }
    btn.disabled = false;
    btn.textContent = 'Send Message';
    setTimeout(() => toast.classList.remove('is-visible'), 3000);
  });
}

function initBackToTop() {
  const btn = $('#backTop');
  if (!btn) return;
  addEventListener('scroll', () => {
    const show = scrollY > innerHeight * 0.6;
    btn.classList.toggle('is-visible', show);
    btn.setAttribute('aria-hidden', String(!show));
    btn.tabIndex = show ? 0 : -1;
  }, { passive: true });
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
}

function initMagneticButtons() {
  if (isTouch || prefersReducedMotion) return;
  $$('.btn--magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initFlowNodes() {
  $$('.flow').forEach(flow => {
    flow.querySelectorAll('.flow__node').forEach(node => {
      node.addEventListener('mouseenter', () => node.classList.add('is-active'));
      node.addEventListener('mouseleave', () => node.classList.remove('is-active'));
    });
  });
}

function initInteractions() {
  initScrollProgress();
  initCursor();
  initVideo();
  initLiveCounter();
  initNav();
  initSmoothScroll();
  initReveal();
  initCounters();
  initProjectCards();
  initProjectsCarousel();
  initExpertiseTabs();
  initSkillsFilter();
  initCopyEmail();
  initContactForm();
  initBackToTop();
  initMagneticButtons();
  initFlowNodes();
  initTerminalWidget();
  initEasterEgg(portfolioData);
  document.body.classList.add('is-loaded');
}

async function boot() {
  try {
    portfolioData = await loadPortfolio();
    renderSite(portfolioData);
    const articles = await loadWriting(portfolioData);
    renderWriting(articles, portfolioData);
    initInteractions();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = '<div style="padding:2rem;text-align:center;color:#8b95a5">Failed to load portfolio. Check that portfolio.json exists.</div>';
  }
}

boot();
