/**
 * Portfolio renderer — builds DOM from portfolio.json
 */

const BADGE_MAP = {
  production: { class: 'badge--prod', label: 'Production' },
  genai: { class: 'badge--ai', label: 'GenAI' },
};

const esc = (str) => {
  const el = document.createElement('span');
  el.textContent = str ?? '';
  return el.innerHTML;
};

const chips = (items) =>
  `<div class="chips">${items.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;

const projectLinks = (links) => {
  if (!links) return '';
  const parts = [];
  if (links.github) parts.push(`<a href="${esc(links.github)}" class="case__link" target="_blank" rel="noopener noreferrer">GitHub →</a>`);
  if (links.demo) parts.push(`<a href="${esc(links.demo)}" class="case__link" target="_blank" rel="noopener noreferrer">Live Demo →</a>`);
  return parts.length ? `<div class="case__links">${parts.join('')}</div>` : '';
};

const flowHtml = (nodes) => {
  const items = nodes.map((n, i) => {
    const arrow = i < nodes.length - 1 ? '<span class="flow__arrow">→</span>' : '';
    const cls = n.highlight ? ' flow__node--highlight' : '';
    const sub = n.sub ? `<small>${esc(n.sub)}</small>` : '';
    return `<div class="flow__node${cls}"><strong>${esc(n.label)}</strong>${sub}</div>${arrow}`;
  });
  return `<div class="flow">${items.join('')}</div>`;
};

export function updateMeta(data) {
  const { meta, person } = data;
  document.title = meta.title;
  $('meta[name="description"]')?.setAttribute('content', meta.description);
  $('meta[property="og:title"]')?.setAttribute('content', meta.title);
  $('meta[property="og:description"]')?.setAttribute('content', meta.ogDescription);
  $('meta[name="theme-color"]')?.setAttribute('content', meta.themeColor);
  $('#navLogo')?.setAttribute('src', person.logo || person.favicon || 'images/logo.svg');
  const icon = person.favicon || 'favicon.svg';
  document.querySelector('link[rel="icon"]')?.setAttribute('href', icon);
  document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', icon);
}

export function renderNav(data) {
  const pill = $('#navPill');
  if (!pill) return;
  pill.innerHTML = data.nav.map((n, i) =>
    `<a href="#${n.id}" class="nav__link" data-section="${n.id}">
      <span class="nav__link-index">${String(i + 1).padStart(2, '0')}</span>
      <span class="nav__link-label">${esc(n.label)}</span>
    </a>`
  ).join('') + '<span class="nav__indicator" id="navIndicator" aria-hidden="true"></span>';
  $('#navLogo')?.setAttribute('src', data.person.logo || data.person.favicon || 'images/logo.svg');
  $('#navBrandName').textContent = data.person.name;
  $('#navBrandRole').textContent = data.person.title;
  $('#resumeBtn')?.setAttribute('href', data.person.resume);
}

export function renderHero(data) {
  const h = data.hero;
  const terminal = data.terminal;

  $('#heroVideo source')?.setAttribute('src', data.person.video);
  const video = $('#heroVideo');
  if (video) {
    video.volume = data.person.videoVolume ?? 1;
    video.removeAttribute('muted');
  }
  video?.load();

  const tickerItems = [...h.ticker, ...h.ticker].map(t => `<span>${esc(t)}</span>`).join('');
  $('#heroTickerTrack').innerHTML = tickerItems;

  const metrics = h.metrics.map(m => `
    <div class="metrics__item">
      <span class="metrics__value"><span data-count="${m.value}">0</span>${esc(m.suffix)}</span>
      <span class="metrics__label">${esc(m.label)}</span>
    </div>
  `).join('');

  const ctas = h.cta.map(c => {
    const cls = c.style === 'primary' ? 'btn btn--primary btn--magnetic' : 'btn btn--ghost btn--magnetic';
    return `<a href="${esc(c.href)}" class="${cls}" data-scroll="${c.href.replace('#', '')}">${esc(c.label)}</a>`;
  }).join('');

  $('#heroContent').innerHTML = `
    <p class="eyebrow hero-enter" style="--i:0">${esc(h.eyebrow)}</p>
    <h1 class="hero__title hero-enter" style="--i:1">
      ${esc(h.headline)}<br>
      <span class="text-accent">${esc(h.headlineAccent)}</span>
    </h1>
    <p class="hero__desc hero-enter" style="--i:2">${h.description}</p>
    <div class="hero__cta hero-enter" style="--i:3">${ctas}</div>
    <div class="metrics hero-enter" style="--i:4" aria-label="Key metrics">${metrics}</div>
  `;

  const termLines = terminal.lines.map(line => {
    if (line.type === 'cmd') return `<div class="terminal__line terminal__line--cmd"><span class="t-prompt">$</span> ${esc(line.text)}</div>`;
    if (line.type === 'accent') {
      const [label, ...rest] = line.text.split(':');
      return `<div class="terminal__line"><span class="t-dim">${esc(label)}:</span> <span class="t-accent">${esc(rest.join(':').trim())}</span></div>`;
    }
    if (line.type === 'live') {
      const words = line.text.split(' ');
      const tail = words.slice(-2).join(' ');
      const head = words.slice(0, -2).join(' ');
      return `<div class="terminal__line"><span class="t-dim">${esc(head)}</span> <span class="t-accent" id="liveCount">28,412</span> <span class="t-dim">${esc(tail)}</span></div>`;
    }
    return `<div class="terminal__line terminal__line--dim">${esc(line.text)}</div>`;
  }).join('');

  $('#heroTerminal').innerHTML = `
    <div class="terminal" id="heroTerminalPanel">
      <div class="terminal__bar">
        <button type="button" class="terminal__handle" id="terminalDragHandle" aria-label="Drag terminal" title="Drag">
          <span class="terminal__grip" aria-hidden="true"></span>
        </button>
        <button type="button" class="terminal__dot terminal__dot--red" id="terminalDotRed" aria-label="Minimize terminal" title="Minimize"></button>
        <button type="button" class="terminal__dot terminal__dot--yellow" id="terminalDotYellow" aria-label="Change terminal theme" title="Theme"></button>
        <button type="button" class="terminal__dot terminal__dot--green" id="terminalDotGreen" aria-label="Restart pipeline" title="Restart"></button>
        <button type="button" class="terminal__filename" title="View file info">${esc(terminal.filename)}</button>
        <button type="button" class="terminal__expand" id="terminalExpandBtn" aria-label="Expand terminal" aria-pressed="false" title="Expand">
          <svg class="terminal__expand-icon terminal__expand-icon--open" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1.5 4.5V1.5H4.5M7.5 1.5H10.5V4.5M10.5 7.5V10.5H7.5M4.5 10.5H1.5V7.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="terminal__expand-icon terminal__expand-icon--close" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 1.5H1.5V4M8 1.5H10.5V4M10.5 8V10.5H8M4 10.5H1.5V8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button type="button" class="terminal__minimize" id="terminalMinimizeBtn" aria-label="Minimize terminal" title="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 6H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="terminal__badge">RUNNING</span>
      </div>
      <div class="terminal__body" id="terminalOutput">${termLines}
      </div>
      <form class="terminal__input-row" id="terminalForm" autocomplete="off">
        <span class="t-prompt">$</span>
        <input class="terminal__input" id="terminalInput" type="text" spellcheck="false" placeholder='type "debug" to unlock' aria-label="Terminal command" />
      </form>
    </div>
  `;
}

export function renderAbout(data) {
  const a = data.about;
  const timeline = a.timeline.map(t => `
    <article class="timeline__item">
      <div class="timeline__marker${t.active ? ' timeline__marker--active' : ''}"></div>
      <div class="timeline__body">
        <time class="timeline__date">${esc(t.date)}</time>
        <h3>${esc(t.role)}</h3>
        <p>${esc(t.org)}</p>
      </div>
    </article>
  `).join('');

  $('#about').innerHTML = `
    <div class="container">
      <div class="section__grid">
        <div class="reveal">
          <span class="section__tag">${esc(a.tag)}</span>
          <h2 class="section__title">${esc(a.title)}<br>${esc(a.titleBreak)}</h2>
          ${a.paragraphs.map(p => `<p class="section__text">${esc(p)}</p>`).join('')}
        </div>
        <div class="timeline reveal reveal--delay">${timeline}</div>
      </div>
    </div>
  `;
}

export function renderExperience(data) {
  const e = data.experience;
  const s = data.skills;

  const items = e.items.map((item, i) => `
    <article class="exp-row reveal${i === 0 ? '' : i === 1 ? ' reveal--delay' : ' reveal--delay-2'}">
      <div class="exp-row__meta">
        <time>${esc(item.dates)}</time>
        <span class="exp-row__org">${esc(item.org)}</span>
      </div>
      <h4 class="exp-row__role">${esc(item.role)}</h4>
      <p class="exp-row__desc">${esc(item.description)}</p>
      ${chips(item.tech)}
    </article>
  `).join('');

  const filters = s.filters.map((f, i) =>
    `<button class="filter-bar__btn${i === 0 ? ' is-active' : ''}" data-filter="${f.id}" type="button" role="tab" aria-selected="${i === 0}">${esc(f.label)}</button>`
  ).join('');

  const techMap = new Map();
  s.categories.forEach((cat) => {
    cat.tech.forEach((t) => {
      if (!techMap.has(t)) techMap.set(t, new Set());
      techMap.get(t).add(cat.id);
    });
  });

  const skillChips = [...techMap.entries()].map(([name, cats]) =>
    `<span class="chip skills-cloud__chip" data-category="${[...cats].join(' ')}">${esc(name)}</span>`
  ).join('');

  $('#experience').innerHTML = `
    <div class="container">
      <span class="section__tag">${esc(e.tag)}</span>
      <h2 class="section__title">${esc(e.title)}</h2>
      <p class="section__subtitle">${esc(e.subtitle)}</p>
      <div class="expertise-compact reveal">
        <div class="expertise-tabs" role="tablist" aria-label="Experience and skills">
          <button class="expertise-tabs__btn is-active" type="button" role="tab" aria-selected="true" data-tab="work">${esc(e.workTitle)}</button>
          <button class="expertise-tabs__btn" type="button" role="tab" aria-selected="false" data-tab="tech">${esc(e.techTitle)}</button>
        </div>
        <div class="expertise-pane is-active" data-pane="work" role="tabpanel">
          <div class="exp-timeline">${items}</div>
        </div>
        <div class="expertise-pane" data-pane="tech" role="tabpanel" hidden>
          <div class="filter-bar filter-bar--compact" role="tablist" aria-label="Filter skills">${filters}</div>
          <div class="skills-cloud" id="skillsGrid">${skillChips}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderProjects(data) {
  const p = data.projects;

  const allProjects = [
    ...p.featured.map((proj) => ({ ...proj, featured: true })),
    ...p.more.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        category: group.category,
        featured: false,
        badge: item.badge || null,
        flow: item.flow || null,
        metrics: item.metrics || [],
        image: item.image || null,
      })),
    ),
  ];

  const projectCard = (proj, i) => {
    const badge = proj.badge ? BADGE_MAP[proj.badge] : null;
    const delay = i === 0 ? '' : i === 1 ? ' reveal--delay' : i === 2 ? ' reveal--delay-2' : ' reveal--delay-3';
    const teaser = proj.description.length > 88
      ? `${proj.description.slice(0, 88).trim()}…`
      : proj.description;

    const metrics = proj.metrics?.length ? `
      <div class="case__metrics">
        ${proj.metrics.map(m => `<div><span class="case__metric-val">${esc(m.value)}</span><span class="case__metric-lbl">${esc(m.label)}</span></div>`).join('')}
      </div>` : '';

    const thumb = proj.image
      ? `<div class="project-card__thumb"><img src="${esc(proj.image)}" alt="" loading="lazy" width="320" height="120"></div>`
      : `<div class="project-card__thumb project-card__thumb--placeholder" aria-hidden="true"><span>${esc((proj.name || 'P').charAt(0))}</span></div>`;

    return `
      <article class="project-card reveal${delay}">
        <button class="project-card__summary" type="button" aria-haspopup="dialog">
          ${thumb}
          <div class="project-card__body">
            <div class="project-card__head">
              ${badge ? `<span class="badge ${badge.class}">${badge.label}</span>` : ''}
              ${proj.category ? `<span class="project-card__category">${esc(proj.category)}</span>` : ''}
            </div>
            <h3 class="project-card__title">${esc(proj.name)}</h3>
            <p class="project-card__teaser">${esc(teaser)}</p>
            <div class="project-card__footer">
              <span class="project-card__meta">${proj.tech.length} technologies</span>
              <span class="project-card__action">
                <span class="project-card__action-text">View details</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </div>
          </div>
        </button>
        <div class="project-card__detail">
          <header class="project-modal__header">
            <div class="project-modal__head">
              ${badge ? `<span class="badge ${badge.class}">${badge.label}</span>` : ''}
              ${proj.category ? `<span class="project-card__category">${esc(proj.category)}</span>` : ''}
            </div>
            <h2 class="project-modal__title" id="projectModalTitle">${esc(proj.name)}</h2>
          </header>
          ${proj.image ? `<div class="case__visual"><img src="${esc(proj.image)}" alt="${esc(proj.imageAlt || proj.name)}" width="640" height="260"></div>` : ''}
          <p class="case__desc">${esc(proj.description)}</p>
          ${proj.flow ? flowHtml(proj.flow) : ''}
          ${metrics}
          ${chips(proj.tech)}
          ${projectLinks(proj.links)}
        </div>
        <template class="project-card__template">
          <header class="project-modal__header">
            <div class="project-modal__head">
              ${badge ? `<span class="badge ${badge.class}">${badge.label}</span>` : ''}
              ${proj.category ? `<span class="project-card__category">${esc(proj.category)}</span>` : ''}
            </div>
            <h2 class="project-modal__title" id="projectModalTitle">${esc(proj.name)}</h2>
          </header>
          ${proj.image ? `<div class="case__visual"><img src="${esc(proj.image)}" alt="${esc(proj.imageAlt || proj.name)}" width="640" height="260"></div>` : ''}
          <p class="case__desc">${esc(proj.description)}</p>
          ${proj.flow ? flowHtml(proj.flow) : ''}
          ${metrics}
          ${chips(proj.tech)}
          ${projectLinks(proj.links)}
        </template>
      </article>
    `;
  };

  $('#projects').innerHTML = `
    <div class="container">
      <span class="section__tag">${esc(p.tag)}</span>
      <h2 class="section__title">${esc(p.title)}</h2>
      <p class="section__subtitle">${esc(p.subtitle)}</p>
      <div class="projects-carousel reveal" id="projectsCarousel">
        <div class="projects-carousel__header">
          <span class="projects-carousel__count" id="projectsCount" aria-live="polite"></span>
        </div>
        <div class="projects-carousel__viewport">
          <button class="carousel-btn carousel-btn--side carousel-btn--prev" id="projectsPrev" type="button" aria-label="Previous projects">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="projects-carousel__fade projects-carousel__fade--left" aria-hidden="true"></div>
          <div class="projects-carousel__track" id="projectsTrack">${allProjects.map(projectCard).join('')}</div>
          <div class="projects-carousel__fade projects-carousel__fade--right" aria-hidden="true"></div>
          <button class="carousel-btn carousel-btn--side carousel-btn--next" id="projectsNext" type="button" aria-label="Next projects">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderWriting(articles, data) {
  const w = data.writing;
  const cards = articles.map(a => `
    <a href="${esc(a.url)}" class="writing-card reveal" target="_blank" rel="noopener noreferrer">
      <time class="writing-card__date">${esc(a.date)}</time>
      <h3 class="writing-card__title">${esc(a.title)}</h3>
      <span class="writing-card__meta">${esc(a.readTime || '')}</span>
      <span class="writing-card__arrow">→</span>
    </a>
  `).join('');

  $('#writing').innerHTML = `
    <div class="container">
      <span class="section__tag">${esc(w.tag)}</span>
      <h2 class="section__title">${esc(w.title)}</h2>
      <p class="section__subtitle">${esc(w.subtitle)}</p>
      <div class="writing-grid">${cards}</div>
    </div>
  `;
}

export function renderContact(data) {
  const c = data.contact;
  const ctas = c.cta.map(btn => {
    const cls = btn.style === 'primary' ? 'btn btn--primary btn--magnetic' : 'btn btn--ghost';
    const isMail = btn.url.startsWith('mailto:');
    return `<a href="${esc(btn.url)}" class="${cls}"${isMail ? '' : ' target="_blank" rel="noopener noreferrer"'}>${esc(btn.label)}</a>`;
  }).join('');

  const formEnabled = c.formAction && !c.formAction.includes('placeholder');

  $('#contact').innerHTML = `
    <div class="container">
      <div class="contact reveal">
        <span class="section__tag">${esc(c.tag)}</span>
        <h2 class="contact__title">${esc(c.title)}<br><span class="text-accent">${esc(c.titleAccent)}</span></h2>
        <p>${esc(c.description)}</p>
        <div class="contact__email">
          <a href="mailto:${esc(data.person.email)}" class="contact__email-link">${esc(data.person.email)}</a>
          <button class="contact__copy" id="copyEmail" type="button" aria-label="Copy email address">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 11V3.5A1.5 1.5 0 014.5 2H11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
        </div>
        <form class="contact__form" id="contactForm" action="${esc(c.formAction)}" method="POST"${formEnabled ? '' : ' hidden'}>
          <div class="form-row">
            <input type="text" name="name" placeholder="Your name" required autocomplete="name">
            <input type="email" name="email" placeholder="Your email" required autocomplete="email">
          </div>
          <textarea name="message" placeholder="Your message" rows="4" required></textarea>
          <button type="submit" class="btn btn--primary btn--magnetic">Send Message</button>
        </form>
        ${!formEnabled ? `<p class="contact__form-note">${esc(c.formNote)}</p>` : ''}
        <div class="contact__actions">${ctas}</div>
      </div>
    </div>
  `;
}

export function renderFooter(data) {
  const { person, meta, social } = data;
  const links = [
    { label: person.email, url: `mailto:${person.email}` },
    ...social,
  ];

  $('#footerInner').innerHTML = `
    <div class="footer__brand">
      <span class="logo__mark">${esc(person.initials)}</span>
      <span>${esc(person.title)}</span>
    </div>
    <nav class="footer__links" aria-label="Footer">
      ${links.map(l => `<a href="${esc(l.url)}"${l.url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)}</a>`).join('')}
    </nav>
    <p class="footer__copy">&copy; ${meta.year} ${esc(person.name)}</p>
  `;
}

export function renderSite(data) {
  updateMeta(data);
  renderNav(data);
  renderHero(data);
  renderAbout(data);
  renderExperience(data);
  renderProjects(data);
  renderContact(data);
  renderFooter(data);
}

function $(sel) { return document.querySelector(sel); }
