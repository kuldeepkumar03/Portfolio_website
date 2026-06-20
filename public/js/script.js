/* ── Premium Portfolio Script ── */

// ══════════════════════════════════════
// ELECTRIC LIGHTNING CURSOR
// ══════════════════════════════════════
const cursorDot = document.getElementById('cursorDot');
const canvas    = document.getElementById('lightningCanvas');
const ctx2d     = canvas ? canvas.getContext('2d') : null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const TRAIL_LENGTH = 30;
const trail = [];
for (let i = 0; i < TRAIL_LENGTH; i++) trail.push({ x: 0, y: 0 });
const clickBursts = [];

let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const el = document.elementFromPoint(mouseX, mouseY);
  const isHoverable = el && el.closest('a, button, .btn, .project-card, .exp-card, .metric-card, .nav-link, .t-card, .cc-btn, .ctrl-btn, .resume-btn');
  document.body.classList.toggle('cursor-hover', !!isHoverable);
});

function drawLightning(x1, y1, x2, y2, ctx, roughness, alpha, depth) {
  if (depth <= 0) return;
  const dx  = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1.5) return;

  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * len * roughness;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * len * roughness;

  // Purple bolt
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(midX, midY); ctx.lineTo(x2, y2);
  ctx.strokeStyle = `rgba(120,40,180,${alpha * 0.6})`;
  ctx.lineWidth   = Math.max(0.4, depth * 0.7);
  ctx.shadowColor = '#6b21a8';
  ctx.shadowBlur  = 4;
  ctx.stroke();

  // Cyan core
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(midX, midY); ctx.lineTo(x2, y2);
  ctx.strokeStyle = `rgba(0,120,150,${alpha * 0.25})`;
  ctx.lineWidth   = Math.max(0.2, depth * 0.25);
  ctx.shadowColor = '#007a99';
  ctx.shadowBlur  = 5;
  ctx.stroke();

  drawLightning(x1, y1, midX, midY, ctx, roughness * 0.82, alpha * 0.88, depth - 1);
  drawLightning(midX, midY, x2, y2, ctx, roughness * 0.82, alpha * 0.88, depth - 1);

  // Random branch
  if (depth > 2 && Math.random() > 0.62) {
    const bx = midX + (Math.random() - 0.5) * len * 0.55;
    const by = midY + (Math.random() - 0.5) * len * 0.55;
    drawLightning(midX, midY, bx, by, ctx, roughness, alpha * 0.38, depth - 2);
  }
}

function animateCursor() {
  curX += (mouseX - curX) * 0.18;
  curY += (mouseY - curY) * 0.18;

  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  }

  trail.unshift({ x: curX, y: curY });
  if (trail.length > TRAIL_LENGTH) trail.pop();

  if (ctx2d) {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    // Persistent electric click bursts
const now = Date.now();

for (let i = clickBursts.length - 1; i >= 0; i--) {

  const burst = clickBursts[i];

  const age = now - burst.start;
  const life = 500; // spark visibility

  if (age > life) {
    clickBursts.splice(i, 1);
    continue;
  }

  const alpha = 1 - (age / life);

  for (let j = 0; j < 8; j++) {

    const a = (j / 12) * Math.PI * 2;

    const radius = 30;

    const ex = burst.x + Math.cos(a) * radius;
    const ey = burst.y + Math.sin(a) * radius;

    drawLightning(
      burst.x,
      burst.y,
      ex,
      ey,
      ctx2d,
      0.55,
      alpha,
      3
    );
  }
}

    const step = 3;
    for (let i = 0; i < trail.length - step; i += step) {
      const t0 = trail[i], t1 = trail[i + step];
      const prog      = 1 - i / trail.length;
      const alpha     = prog * 0.8;
      const roughness = 0.22 + (1 - prog) * 0.18;
      const depth     = Math.max(2, Math.round(prog * 4));
      ctx2d.save();
      drawLightning(t0.x, t0.y, t1.x, t1.y, ctx2d, roughness, alpha, depth);
      ctx2d.restore();
    }

    // Glow at tip
    const g = ctx2d.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 20);
    g.addColorStop(0,   'rgba(178,76,255,0.6)');
    g.addColorStop(0.4, 'rgba(0,224,255,0.22)');
    g.addColorStop(1,   'rgba(0,224,255,0)');
    ctx2d.beginPath();
    ctx2d.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
    ctx2d.fillStyle = g;
    ctx2d.fill();
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Click burst
document.addEventListener('click', e => {
  const cx = e.clientX, cy = e.clientY;

  const spark = document.createElement('div');
  spark.className = 'cursor-spark';
  spark.style.left = cx + 'px';
  spark.style.top  = cy + 'px';
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 500);

  const RAYS = 12;
  for (let i = 0; i < RAYS; i++) {
    const angle = (i / RAYS) * 360;
    const dist  = 28 + Math.random() * 28;
    const len   = 12 + Math.random() * 18;
    const ray   = document.createElement('div');
    ray.className = 'cursor-spark-ray';
    ray.style.left      = cx + 'px';
    ray.style.top       = cy + 'px';
    ray.style.height    = len + 'px';
    ray.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    ray.style.setProperty('--ray-dist', `-${dist}px`);
    ray.style.animationDelay = (Math.random() * 0.05) + 's';
    document.body.appendChild(ray);
    setTimeout(() => ray.remove(), 500);
  }
  if (clickBursts.length > 3) return;
  clickBursts.push({
  x: cx,
  y: cy,
  start: Date.now()
});
});

// ── NAVBAR scroll style
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);

  // active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === current);
  });

  // scroll cue fade
  const cue = document.getElementById('scrollCue');
  if (cue) cue.style.opacity = window.scrollY > 120 ? '0' : '1';
}, { passive: true });

// ── MOBILE MENU
const mobileBtn = document.getElementById('mobileMenuBtn');
const navMenu   = document.getElementById('navMenu');
mobileBtn?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  mobileBtn.classList.toggle('open', open);
});
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navMenu?.classList.remove('open');
    mobileBtn?.classList.remove('open');
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.navbar')) {
    navMenu?.classList.remove('open');
    mobileBtn?.classList.remove('open');
  }
});

// ── SMOOTH SCROLL for nav links
document.querySelectorAll('.nav-link, .btn[href^="#"], a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 0.5, behavior: 'smooth' });
    }
  });
});

// ── VIDEO CONTROLS
const video         = document.getElementById('heroBgVideo');
const playPauseBtn  = document.getElementById('videoPlayPauseBtn');
const muteBtn       = document.getElementById('videoMuteBtn');
const visualizer    = document.getElementById('visualizer');
const playIcon      = document.getElementById('playIcon');
const pauseIcon     = document.getElementById('pauseIcon');
const muteIcon      = document.getElementById('muteIcon');
const unmuteIcon    = document.getElementById('unmuteIcon');

if (playPauseBtn && video) {
  playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      visualizer?.classList.remove('paused');
      playIcon.style.display  = 'none';
      pauseIcon.style.display = '';
    } else {
      video.pause();
      visualizer?.classList.add('paused');
      playIcon.style.display  = '';
      pauseIcon.style.display = 'none';
    }
  });
  // start paused = play icon shown, set pause on autoplay
  if (!video.paused) {
    playIcon.style.display  = 'none';
    pauseIcon.style.display = '';
  }
}

if (muteBtn && video) {
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteIcon.style.display   = video.muted ? 'none' : '';
    unmuteIcon.style.display = video.muted ? ''     : 'none';
  });
}

// ── EXPERIENCE CAROUSEL (desktop grid, dots for mobile)
const expCards    = document.querySelectorAll('.exp-card');
const carouselDots = document.querySelectorAll('#carouselDots .dot');
const prevBtn     = document.getElementById('carouselPrev');
const nextBtn     = document.getElementById('carouselNext');
let currentIdx = 0;

function setActiveDot(i) {
  carouselDots.forEach((d,j) => d.classList.toggle('active', j === i));
}

function goTo(i) {
  currentIdx = Math.max(0, Math.min(i, expCards.length - 1));
  setActiveDot(currentIdx);
  // On mobile, scroll the card into view
  if (window.innerWidth < 768) {
    expCards[currentIdx]?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
  }
}

prevBtn?.addEventListener('click', () => goTo(currentIdx - 1));
nextBtn?.addEventListener('click', () => goTo(currentIdx + 1));
carouselDots.forEach((d,i) => d.addEventListener('click', () => goTo(i)));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goTo(currentIdx + 1);
  if (e.key === 'ArrowLeft')  goTo(currentIdx - 1);
});

// ── INTERSECTION OBSERVER — reveal
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ── RADAR CHART
function drawRadarChart() {
  const radarCanvas = document.getElementById('radarChart');
  if (!radarCanvas) return;
  const ctx = radarCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 340;
  radarCanvas.width  = size * dpr;
  radarCanvas.height = size * dpr;
  radarCanvas.style.width  = size + 'px';
  radarCanvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;
  const r  = 110;
  const sides = 6;
  const slice = (Math.PI * 2) / sides;

  const skills = [
    { name: 'ML',           value: 0.92 },
    { name: 'Data Eng',     value: 0.85 },
    { name: 'Python',       value: 0.95 },
    { name: 'Analytics',    value: 0.80 },
    { name: 'Problem Solv', value: 0.88 },
    { name: 'Sys Design',   value: 0.82 },
  ];

  // Grid rings
  for (let j = 1; j <= 5; j++) {
    const gr = (r / 5) * j;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = slice * i - Math.PI / 2;
      const x = cx + gr * Math.cos(a);
      const y = cy + gr * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < sides; i++) {
    const a = slice * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Skill polygon — gradient fill
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,224,255,0.25)');
  grad.addColorStop(1, 'rgba(124,90,246,0.1)');
  ctx.beginPath();
  skills.forEach((s, i) => {
    const a = slice * i - Math.PI / 2;
    const x = cx + r * s.value * Math.cos(a);
    const y = cy + r * s.value * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke
  ctx.beginPath();
  skills.forEach((s, i) => {
    const a = slice * i - Math.PI / 2;
    const x = cx + r * s.value * Math.cos(a);
    const y = cy + r * s.value * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  const strokeGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  strokeGrad.addColorStop(0, '#00e0ff');
  strokeGrad.addColorStop(1, '#7c5af6');
  ctx.strokeStyle = strokeGrad;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  skills.forEach((s, i) => {
    const a = slice * i - Math.PI / 2;
    const x = cx + r * s.value * Math.cos(a);
    const y = cy + r * s.value * Math.sin(a);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00e0ff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,224,255,0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
  });

  // Labels
  ctx.font = `600 11px 'Space Grotesk', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  skills.forEach((s, i) => {
    const a = slice * i - Math.PI / 2;
    const lr = r + 28;
    const x = cx + lr * Math.cos(a);
    const y = cy + lr * Math.sin(a);
    ctx.fillStyle = 'rgba(136,153,184,0.9)';
    ctx.fillText(s.name, x, y);
  });
}

window.addEventListener('load', drawRadarChart);
window.addEventListener('resize', drawRadarChart);

// ── PERFORMANCE LOG
window.addEventListener('load', () => {
  if (window.performance?.timing) {
    const t = window.performance.timing;
    console.log(`[Portfolio] Page loaded in ${t.loadEventEnd - t.navigationStart}ms`);
  }
});

// ── ERROR HANDLING
window.addEventListener('error', e => console.error('[Portfolio] Error:', e.error));

console.log('[Portfolio] v2.0 — Premium Edition loaded');