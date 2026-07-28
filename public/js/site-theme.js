/**
 * Site-wide theme switcher — applied via data-site-theme on <html>
 */

export const SITE_THEMES = {
  default: {
    label: 'Precision Lab',
    desc: 'Dark blue production aesthetic',
    color: '#0c0f14',
    emoji: '🌙',
  },
  synthwave: {
    label: 'Synthwave',
    desc: 'Neon retro 80s sunset grid',
    color: '#1a0a2e',
    emoji: '🌆',
  },
  terminal: {
    label: 'Hacker Terminal',
    desc: 'Green phosphor CRT vibes',
    color: '#0a0f0a',
    emoji: '💻',
  },
  paper: {
    label: 'Editorial Paper',
    desc: 'Warm light editorial layout',
    color: '#f5f0e8',
    emoji: '📰',
  },
  brutalist: {
    label: 'Neo Brutalist',
    desc: 'Bold shapes, hard shadows, zero radius',
    color: '#fff9c4',
    emoji: '🔲',
  },
};

export function getSiteTheme() {
  return localStorage.getItem('site-theme') || 'default';
}

export function listThemes(current = getSiteTheme()) {
  return Object.entries(SITE_THEMES)
    .map(([key, t]) => {
      const active = key === current ? '  ← active' : '';
      return `  ${t.emoji} ${key.padEnd(12)} ${t.desc}${active}`;
    })
    .join('\n');
}

export function applySiteTheme(name, { animate = true } = {}) {
  const theme = !name || name === 'reset' || name === 'default' ? 'default' : name;

  if (theme !== 'default' && !SITE_THEMES[theme]) {
    return { ok: false, error: `Unknown theme: ${theme}. Type "theme" for options.` };
  }

  const html = document.documentElement;
  const body = document.body;

  if (animate) {
    body.classList.add('site-theme-switching');
    setTimeout(() => body.classList.remove('site-theme-switching'), 650);
  }

  if (theme === 'default') {
    html.removeAttribute('data-site-theme');
  } else {
    html.setAttribute('data-site-theme', theme);
  }

  const meta = SITE_THEMES[theme];
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta.color);
  localStorage.setItem('site-theme', theme);

  return { ok: true, theme, meta };
}

export function initSiteTheme() {
  const saved = getSiteTheme();
  if (saved !== 'default') applySiteTheme(saved, { animate: false });
}
