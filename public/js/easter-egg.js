/**
 * Easter egg — Konami code + interactive terminal CLI
 */

import {
  SITE_THEMES,
  applySiteTheme,
  getSiteTheme,
  listThemes,
} from './site-theme.js';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const DEFAULT_FORTUNES = [
  'The best model is the one that ships.',
  'Your validation set is watching. Always.',
  'Feature engineering is 80% of the job. The other 80% is debugging.',
  'If it works in Jupyter, it might work in prod. Might.',
  'Gradient descent: slowly getting less wrong since 1950.',
  'Overfitting is just confidence before the test set humbles you.',
];

const LOCKED_DENIALS = [
  'Access denied. Nice try though.',
  'Restricted. Type "help" for unlock hints.',
  'Production firewall says no.',
  'Unauthorized. The model predicted you would do this.',
  'Nope. Debug mode required.',
];

const UNLOCK_COMMANDS = new Set(['debug', 'konami', 'sudo debug', 'open sesame', 'hack the planet']);

const COMMAND_ALIASES = {
  h: 'help',
  '?': 'help',
  cls: 'clear',
  ll: 'ls',
};

const HISTORY_KEY = 'portfolio-terminal-history';
const MAX_OUTPUT_LINES = 120;

const NEOFETCH = [
  '       ███████╗██╗  ██╗██████╗ ',
  '       ██╔════╝╚██╗██╔╝██╔══██╗',
  '       █████╗   ╚███╔╝ ██████╔╝',
  '       ██╔══╝   ██╔██╗ ██╔═══╝ ',
  '       ███████╗██╔╝ ██╗██║     ',
  '       ╚══════╝╚═╝  ╚═╝╚═╝     ',
];

function buildCommands(ctx) {
  return {
    help() {
      return [
        'Available commands:',
        '  help          — show this message',
        '  whoami        — who runs this pipeline',
        '  predict <pin> [kg] — EDD inference demo',
        '  explain       — SHAP-style feature breakdown',
        '  status        — production model health',
        '  train         — watch a fake training run',
        '  ls            — list pipeline files',
        '  cat <file>    — read a file (try resume)',
        '  fortune       — wisdom from the ML gods',
        '  cowsay <msg>  — the cow has opinions',
        '  neofetch      — system info, dev edition',
        '  matrix        — full-page matrix rain',
        '  theme <name>  — full site redesign',
        '  reset         — restore default theme & effects',
        '  coffee        — deploy fuel',
        '  ping          — latency check',
        '  roll          — d20 hire probability',
        '  hire_kuldeep  — you know what to do',
        '  contact       — email & social links',
        '  about         — jump to about + summary',
        '  skills        — tech stack overview',
        '  projects      — jump to projects',
        '  history       — command history',
        '  clear / cls   — clear terminal output',
        '',
        'Aliases: h → help, ll → ls',
      ].join('\n');
    },

    whoami() {
      const { person } = ctx.data;
      return [
        person?.name || 'Kuldeep Kumar',
        person?.title || 'Junior Data Scientist',
        'uid=1337(kuldeep) gid=42(ml-engineers)',
        'groups=docker, aws, xgboost-enthusiasts',
      ].join('\n');
    },

    async predict(args) {
      const pincode = args[0] || '400001';
      const weightArg = args[1];

      if (!/^\d{6}$/.test(pincode)) {
        return 'Invalid pincode. Usage: predict <6-digit-pin> [weight_kg]\nExample: predict 400001 1.2';
      }

      const weight = weightArg
        ? Number.parseFloat(weightArg).toFixed(1)
        : (0.4 + Math.random() * 4.5).toFixed(1);

      if (weightArg && Number.isNaN(Number.parseFloat(weightArg))) {
        return 'Weight must be a number in kg. Example: predict 400001 1.2';
      }

      const zoneMap = {
        '11': 'North · Delhi NCR',
        '40': 'West · Mumbai Metro',
        '56': 'South · Bangalore',
        '60': 'South · Chennai',
        '70': 'East · Kolkata',
        '41': 'West · Pune',
        '12': 'North · Chandigarh',
      };
      const zone = zoneMap[pincode.slice(0, 2)] || `Zone ${pincode.slice(0, 2)} · Tier-2`;

      const couriers = ['Delhivery', 'BlueDart', 'Ekart', 'Xpressbees', 'DTDC'];
      const courier = couriers[Math.floor(Math.random() * couriers.length)];

      const baseDays = 2.0 + Math.random() * 2.6;
      const buffer = 0.25 + Math.random() * 0.55;
      const days = baseDays.toFixed(1);
      const conf = 0.86 + Math.random() * 0.11;
      const riskRoll = Math.random();
      const risk = riskRoll > 0.82 ? 'HIGH' : riskRoll > 0.55 ? 'MEDIUM' : 'LOW';

      const eta = new Date();
      eta.setDate(eta.getDate() + Math.ceil(baseDays + buffer));
      const etaStr = eta.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const shapBar = (value) => {
        const width = Math.min(14, Math.max(1, Math.round(Math.abs(value) * 28)));
        return (value >= 0 ? '█' : '▓').repeat(width);
      };

      const features = [
        { name: 'courier_tat', value: 0.24 + Math.random() * 0.12 },
        { name: 'zone_density', value: 0.14 + Math.random() * 0.14 },
        { name: 'pincode_rto_rate', value: -(0.06 + Math.random() * 0.14) },
        { name: 'shipment_weight', value: 0.03 + (Number(weight) / 12) },
        { name: 'pickup_hour', value: 0.02 + Math.random() * 0.06 },
      ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

      ctx.appendLine(`POST /v1/edd/infer  pincode=${pincode}  weight=${weight}kg`, 'dim');
      ctx.appendLine('Fetching feature vector from store...', 'dim');
      await ctx.sleep(160);
      ctx.appendLine('Running xgboost_ensemble_v3 (n_estimators=12)...', 'dim');
      await ctx.sleep(240);
      ctx.appendLine('Applying LightGBM buffer layer...', 'dim');
      await ctx.sleep(140);

      ctx.appendLine('─'.repeat(44), 'dim');
      ctx.appendLine(`  Zone         ${zone}`, 'dim');
      ctx.appendLine(`  Courier      ${courier}`, 'dim');
      ctx.appendLine(`  EDD          ${days} days  (±${buffer.toFixed(1)}d buffer)`, 'accent');
      ctx.appendLine(`  ETA          ${etaStr}`, 'accent');
      ctx.appendLine(`  Confidence   ${(conf * 100).toFixed(0)}%`, 'dim');
      ctx.appendLine(`  Risk tier    ${risk}`, risk === 'HIGH' ? 'warn' : risk === 'MEDIUM' ? 'accent' : 'success');
      ctx.appendLine('─'.repeat(44), 'dim');
      ctx.appendLine('SHAP top drivers:', 'dim');

      features.slice(0, 3).forEach((feature) => {
        const sign = feature.value >= 0 ? '+' : '';
        ctx.appendLine(
          `  ${feature.name.padEnd(18)} ${sign}${feature.value.toFixed(2)}  ${shapBar(feature.value)}`,
          'dim',
        );
      });

      ctx.appendLine(
        `latency ${(7 + Math.random() * 8).toFixed(1)}ms  |  model xgboost_ensemble_v3  |  status OK`,
        'success',
      );
    },

    explain() {
      return [
        'Top features (SHAP):',
        '  courier_tat        +0.31  ████████████',
        '  zone_density       +0.22  █████████',
        '  historical_rto     -0.18  ███████',
        '  shipment_weight    +0.09  ████',
        '  pickup_hour        +0.06  ██',
        '',
        'Base value: 3.2 days → output: 2.8 days',
      ].join('\n');
    },

    status() {
      const count = document.getElementById('liveCount')?.textContent || '28,470';
      return [
        'Model health check:',
        '  uptime             99.97%',
        '  latency p99        12ms',
        '  drift score        0.04  ✓',
        `  daily predictions  ${count}`,
        '  last retrain       3 days ago',
        '  GPU envy           moderate',
      ].join('\n');
    },

    async train() {
      const epochs = 8;
      for (let i = 1; i <= epochs; i++) {
        const pct = Math.round((i / epochs) * 100);
        const filled = Math.round(pct / 5);
        const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
        const loss = (0.9 / i + Math.random() * 0.05).toFixed(4);
        ctx.appendLine(`epoch ${i}/${epochs}  [${bar}] ${pct}%  loss=${loss}`, 'dim');
        await ctx.sleep(280);
      }
      return '__DONE__';
    },

    ls() {
      return [
        'total 48',
        'drwxr-xr-x  deploy_model.py',
        'drwxr-xr-x  feature_store/',
        'drwxr-xr-x  models/xgboost_ensemble_v3/',
        '-rw-r--r--  resume.pdf',
        '-rw-r--r--  secrets.env   ← nice try',
        '-rw-r--r--  coffee.log',
      ].join('\n');
    },

    cat(args) {
      const file = (args[0] || '').toLowerCase();
      if (!file) return 'Usage: cat <file>  (try: resume, secrets, coffee.log)';
      if (file.includes('resume')) {
        return [
          'Kuldeep Kumar — Junior Data Scientist',
          'Stack: Python · XGBoost · PySpark · FastAPI · AWS',
          'Currently shipping ML at 20–30K predictions/day.',
          '→ Full version: resume.pdf',
        ].join('\n');
      }
      if (file.includes('secret')) {
        return 'Permission denied: secrets.env (nice try, hacker man)';
      }
      if (file.includes('coffee')) {
        return [
          '[2026-07-28 09:14] Brewing deployment...',
          '[2026-07-28 09:15] Caffeine levels: optimal',
          '[2026-07-28 09:16] Bug count: decreasing',
          '[2026-07-28 09:17] Production deploy: SUCCESS',
        ].join('\n');
      }
      return `cat: ${file}: No such file or directory`;
    },

    fortune() {
      const fortunes = ctx.data?.easterEgg?.fortunes || DEFAULT_FORTUNES;
      return `🥠  ${fortunes[Math.floor(Math.random() * fortunes.length)]}`;
    },

    cowsay(args) {
      const msg = args.join(' ') || 'moo — hire Kuldeep';
      return [
        ` ${'_'.repeat(msg.length + 2)}`,
        `< ${msg} >`,
        ` ${'-'.repeat(msg.length + 2)}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
      ].join('\n');
    },

    neofetch() {
      const { person } = ctx.data;
      const theme = getSiteTheme();
      return [
        ...NEOFETCH,
        '',
        `Host: ${person?.name || 'Kuldeep Kumar'}`,
        `Role: ${person?.title || 'Junior Data Scientist'}`,
        `Shell: inference_pipeline.py`,
        `Debug mode: ${ctx.unlocked ? 'enabled' : 'locked'}`,
        `Site theme: ${theme}`,
        `Matrix rain: ${ctx.isMatrixOn ? 'ON' : 'off'}`,
        `Commands run: ${ctx.history.length}`,
        'Uptime: since first "hello world"',
      ].join('\n');
    },

    matrix() {
      ctx.toggleMatrix();
      return ctx.isMatrixOn
        ? 'Wake up, Neo... full-page matrix enabled.'
        : 'Matrix mode disabled. Welcome back to reality.';
    },

    reset() {
      ctx.resetAll();
      return [
        'Reset complete.',
        '  site theme   → Precision Lab default',
        '  matrix rain  → off',
        '  terminal UI  → default',
      ].join('\n');
    },

    theme(args) {
      const current = getSiteTheme();

      if (!args.length) {
        return [
          'Available site themes:',
          listThemes(current),
          '',
          'Usage:',
          '  theme synthwave   — neon 80s redesign',
          '  theme terminal    — hacker CRT mode',
          '  theme paper       — light editorial',
          '  theme brutalist   — neo-brutalist chaos',
          '  theme random      — surprise me',
          '  theme reset       — back to default',
        ].join('\n');
      }

      const arg = args[0].toLowerCase();

      if (arg === 'random') {
        const pool = Object.keys(SITE_THEMES).filter(k => k !== current);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const result = applySiteTheme(pick);
        ctx.showToast(`${result.meta.emoji} ${result.meta.label}`);
        return [
          `Random theme selected: ${pick}`,
          result.meta.desc,
          'Type "theme reset" to undo.',
        ].join('\n');
      }

      const result = applySiteTheme(arg);
      if (!result.ok) return result.error;

      ctx.showToast(`${result.meta.emoji} ${result.meta.label} activated`);

      if (arg === 'reset' || arg === 'default') {
        return 'Site theme reset to Precision Lab default.';
      }

      return [
        `Full redesign applied: ${result.meta.label}`,
        result.meta.desc,
        '',
        'Type "theme" to see all themes  |  "theme reset" to undo',
      ].join('\n');
    },

    coffee() {
      return [
        '☕  Initiating coffee protocol...',
        '    Grinding beans... done',
        '    Brewing... done',
        '    Deploying to production... done',
        '    All systems caffeinated. ✓',
      ].join('\n');
    },

    ping() {
      const ms = (8 + Math.random() * 12).toFixed(1);
      return [
        'PING model-server.prod (10.0.0.42): 56 data bytes',
        `64 bytes: icmp_seq=1 ttl=64 time=${ms} ms`,
        `64 bytes: icmp_seq=2 ttl=64 time=${(Number(ms) + 1.2).toFixed(1)} ms`,
        '',
        '--- model-server.prod ping statistics ---',
        '2 packets transmitted, 2 received, 0% packet loss',
      ].join('\n');
    },

    roll() {
      const roll = Math.floor(Math.random() * 20) + 1;
      const msg = roll >= 18
        ? 'Critical hit! Hiring Kuldeep is strongly recommended.'
        : roll >= 12
          ? 'Solid roll. Consider reaching out.'
          : 'Low roll. Try "hire_kuldeep" for guaranteed success.';
      return [`🎲  Rolled d20: ${roll}`, msg].join('\n');
    },

    hire_kuldeep() {
      return [
        'Initiating hire sequence...',
        'Checking availability... ✓',
        'Stack match: Python, XGBoost, Production ML ✓',
        'Culture fit: ships code, not slides ✓',
        '',
        '→ deepkul2002@gmail.com',
        '→ linkedin.com/in/kuldeepkumar1207',
      ].join('\n');
    },

    contact() {
      const { person, social } = ctx.data;
      return [
        'Contact channels:',
        `  email     ${person?.email || 'deepkul2002@gmail.com'}`,
        ...(social || []).map((link) => `  ${link.label.padEnd(10)} ${link.url}`),
      ].join('\n');
    },

    about() {
      const section = ctx.data.about;
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      ctx.showToast('Scrolling to about...');
      if (!section) return 'About section not found.';
      return [
        `${section.title} ${section.titleBreak || ''}`.trim(),
        ...(section.paragraphs?.slice(0, 2) || []),
      ].join('\n');
    },

    skills() {
      const skills = ctx.data.skills;
      document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
      ctx.showToast('Scrolling to skills...');
      if (!skills?.categories?.length) return 'Skills data not loaded.';
      return [
        'Tech stack:',
        ...skills.categories.map((cat) => `  ${cat.title.padEnd(18)} ${cat.tech.join(' · ')}`),
      ].join('\n');
    },

    projects() {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
      ctx.showToast('Scrolling to projects...');
      return 'Navigating to #projects...';
    },

    history() {
      if (!ctx.history.length) return 'No command history yet.';
      return ctx.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
    },

    vim() {
      return [
        'Opening vim...',
        'You are now in vim.',
        'To exit: good luck. (just kidding, press Escape)',
        '',
        'Hint: type "clear" instead.',
      ].join('\n');
    },

    sudo(args) {
      if (args.join(' ') === 'debug') return '__UNLOCK__';
      return 'This incident will be reported. 🚨';
    },

    clear() {
      return '__CLEAR__';
    },
  };
}

export function initEasterEgg(portfolioData) {
  const unlockFromData = portfolioData?.easterEgg?.unlockCommands;
  const unlockCommands = unlockFromData
    ? new Set(unlockFromData.map(c => c.toLowerCase()))
    : UNLOCK_COMMANDS;

  const wrap = document.getElementById('heroTerminal');
  const panel = wrap?.querySelector('.terminal');
  const output = document.getElementById('terminalOutput');
  const form = document.getElementById('terminalForm');
  const input = document.getElementById('terminalInput');
  const badge = wrap?.querySelector('.terminal__badge');
  const toast = document.getElementById('toast');
  const matrixCanvas = document.getElementById('matrixCanvas');
  const dotRed = document.getElementById('terminalDotRed');
  const dotYellow = document.getElementById('terminalDotYellow');
  const dotGreen = document.getElementById('terminalDotGreen');
  const filename = wrap?.querySelector('.terminal__filename');

  if (!wrap || !output || !form || !input) return;

  let unlocked = false;
  let konamiIdx = 0;
  let history = [];
  try {
    history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }
  let historyIdx = -1;
  let matrixOn = false;
  let matrixAnim = null;
  let themeIdx = 0;
  let minimized = false;
  let hintIdx = 0;
  const themes = ['', 'is-theme-purple', 'is-theme-green'];

  const hints = portfolioData?.easterEgg?.hints || [
    'type "debug" to unlock',
    'try: konami code ↑↑↓↓←→←→BA',
    'try: sudo debug',
    'try: open sesame',
    'click the traffic lights ↑',
  ];

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2800);
  };

  const escapeHtml = (str) => {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  };

  const appendLine = (text, type = 'dim') => {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${type}`;
    if (type === 'cmd') {
      line.innerHTML = `<span class="t-prompt">$</span> ${escapeHtml(text)}`;
    } else if (type === 'accent') {
      line.innerHTML = `<span class="t-accent">${escapeHtml(text)}</span>`;
    } else if (type === 'success') {
      line.innerHTML = `<span class="t-success">${escapeHtml(text)}</span>`;
    } else if (type === 'warn') {
      line.innerHTML = `<span class="t-warn">${escapeHtml(text)}</span>`;
    } else {
      line.textContent = text;
    }
    output.appendChild(line);

    const lines = output.querySelectorAll('.terminal__line');
    if (lines.length > MAX_OUTPUT_LINES) {
      [...lines].slice(0, lines.length - MAX_OUTPUT_LINES).forEach((el) => el.remove());
    }

    output.scrollTop = output.scrollHeight;
  };

  const saveHistory = () => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-50)));
  };

  const resolveCommand = (raw) => {
    const [cmd, ...args] = raw.toLowerCase().split(/\s+/);
    return [COMMAND_ALIASES[cmd] || cmd, ...args];
  };

  const appendBlock = (text, type = 'dim') => {
    text.split('\n').forEach(line => appendLine(line, type));
  };

  const stopMatrixRain = () => {
    if (matrixAnim) cancelAnimationFrame(matrixAnim);
    matrixAnim = null;
    if (matrixCanvas?._resize) {
      removeEventListener('resize', matrixCanvas._resize);
      matrixCanvas._resize = null;
    }
  };

  const startMatrixRain = () => {
    if (!matrixCanvas) return;
    const canvas = matrixCanvas;
    const ctx2d = canvas.getContext('2d');
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    let cols;
    let drops;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / 16);
      drops = Array(cols).fill(1);
    };

    resize();

    const draw = () => {
      ctx2d.fillStyle = 'rgba(12, 15, 20, 0.06)';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
      ctx2d.fillStyle = '#34d399';
      ctx2d.font = '14px JetBrains Mono, monospace';

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx2d.fillText(char, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixAnim = requestAnimationFrame(draw);
    };

    matrixAnim = requestAnimationFrame(draw);
    canvas._resize = resize;
    addEventListener('resize', resize);
  };

  const setMatrix = (on) => {
    if (matrixOn === on) return;
    matrixOn = on;
    document.body.classList.toggle('is-matrix', matrixOn);
    wrap.classList.toggle('is-matrix', matrixOn);

    if (!matrixCanvas) return;

    if (matrixOn) {
      matrixCanvas.hidden = false;
      startMatrixRain();
      showToast('Follow the white rabbit...');
    } else {
      stopMatrixRain();
      matrixCanvas.hidden = true;
    }
  };

  const toggleMatrix = () => {
    setMatrix(!matrixOn);
  };

  const resetAll = () => {
    if (matrixOn) setMatrix(false);

    applySiteTheme('reset');

    themes.forEach((themeClass) => wrap.classList.remove(themeClass));
    themeIdx = 0;
    minimized = false;
    wrap.classList.remove('is-minimized', 'is-expanded');

    const expandBtn = document.getElementById('terminalExpandBtn');
    expandBtn?.setAttribute('aria-pressed', 'false');

    showToast('Defaults restored');
  };

  const ctx = {
    data: portfolioData,
    history,
    get unlocked() { return unlocked; },
    get isMatrixOn() { return matrixOn; },
    appendLine,
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    showToast,
    toggleMatrix,
    resetAll,
  };

  const COMMANDS = buildCommands(ctx);
  const normalizeInput = (raw) => raw.trim().replace(/^\$\s*/, '');

  const LOCKED_HELP = [
    'Production CLI — restricted mode.',
    'Unlock with one of:',
    '  debug         — enable debug mode',
    '  konami        — classic unlock',
    '  sudo debug    — escalate privileges',
    '  open sesame   — for the curious',
    '',
    'Tip: try the Konami code anywhere on this page.',
    'Tip: click the red/yellow/green dots for surprises.',
  ].join('\n');

  const LOCKED_EXTRAS = {
    hi: 'Hey! Type "help" to find the unlock commands.',
    hello: 'Hello, curious engineer. "help" has hints.',
    ls: 'drwxr-xr-x  [REDACTED]/\nAccess denied. Unlock debug mode first.',
    sudo: 'This incident will be reported. 🚨',
    vim: 'Even vim can\'t escape this firewall.',
    coffee: 'Coffee machine is locked behind debug mode.',
    fortune: 'The fortune says: unlock debug mode first.',
    matrix: 'The matrix has you... but not yet. Unlock debug mode.',
    theme: 'Full site redesign locked. Unlock debug mode first.',
    rm: 'Whoa there. That\'s a production server.',
    'rm -rf': 'Absolutely not. HR would like a word.',
    'rm -rf /': [
      'Deleting /...',
      'Just kidding. This incident will be reported.',
      'Type "debug" instead.',
    ].join('\n'),
  };

  const unlock = (source) => {
    if (unlocked) return;
    unlocked = true;
    wrap.classList.add('is-debug');
    panel?.classList.add('is-debug');
    if (badge) {
      badge.textContent = 'DEBUG';
      badge.classList.add('terminal__badge--debug');
    }
    appendLine('Debug mode activated.', 'accent');
    if (source === 'konami') {
      appendLine('Konami sequence accepted. Welcome, engineer.', 'success');
      appendLine('Achievement unlocked: Retro Gamer', 'warn');
    } else {
      appendLine('Type "help" to explore the pipeline.', 'dim');
    }
    showToast('Debug mode unlocked 🎉');
    input.focus();
    cyclePlaceholder();
  };

  const runLockedCommand = (lower) => {
    if (lower === 'help' || lower === '?') {
      appendBlock(LOCKED_HELP, 'dim');
      return true;
    }
    const extra = LOCKED_EXTRAS[lower];
    if (extra) {
      appendBlock(extra, lower.startsWith('rm') ? 'warn' : 'dim');
      return true;
    }
    if (lower.startsWith('rm')) {
      appendBlock(LOCKED_EXTRAS['rm -rf /'], 'warn');
      return true;
    }
    return false;
  };

  const runCommand = async (raw) => {
    const trimmed = normalizeInput(raw);
    if (!trimmed) return;

    appendLine(trimmed, 'cmd');
    history.push(trimmed);
    historyIdx = -1;
    saveHistory();

    if (!unlocked) {
      const lower = trimmed.toLowerCase();
      if (unlockCommands.has(lower)) {
        unlock('command');
        return;
      }
      if (runLockedCommand(lower)) return;
      appendLine(LOCKED_DENIALS[Math.floor(Math.random() * LOCKED_DENIALS.length)], 'dim');
      return;
    }

    const [cmd, ...args] = resolveCommand(trimmed);
    const handler = COMMANDS[cmd];

    if (!handler) {
      appendLine(`Command not found: ${cmd}. Type "help".`, 'dim');
      return;
    }

    const result = await handler(args);
    if (result === '__CLEAR__') {
      output.querySelectorAll('.terminal__line').forEach(el => el.remove());
      return;
    }
    if (result === '__UNLOCK__') {
      unlock('command');
      return;
    }
    if (result === '__DONE__') {
      appendLine('Training complete. val_loss=0.0412 ✓', 'success');
      return;
    }
    if (result) {
      appendBlock(result, ['hire_kuldeep', 'roll', 'reset'].includes(cmd) ? 'success' : 'dim');
    }
  };

  const commandNames = () => [
    ...Object.keys(COMMANDS),
    ...Object.keys(COMMAND_ALIASES),
  ];

  const tabComplete = (value) => {
    const trimmed = normalizeInput(value);
    const parts = trimmed.split(/\s+/);
    const base = parts[0].toLowerCase();
    const cmd = COMMAND_ALIASES[base] || base;

    if (parts.length === 1) {
      const matches = [...new Set([
        ...Object.keys(COMMANDS).filter((name) => name.startsWith(base)),
        ...Object.entries(COMMAND_ALIASES)
          .filter(([alias, target]) => alias.startsWith(base) || target.startsWith(base))
          .map(([alias]) => alias),
      ])];
      if (matches.length === 1) return `${matches[0]} `;
      if (matches.length > 1) appendBlock(matches.join('  '), 'dim');
      return value;
    }

    if (cmd === 'theme' && parts.length === 2) {
      const partial = parts[1].toLowerCase();
      const themeNames = ['default', 'reset', 'random', ...Object.keys(SITE_THEMES)];
      const matches = themeNames.filter((name) => name.startsWith(partial));
      if (matches.length === 1) return `theme ${matches[0]} `;
      if (matches.length > 1) appendBlock(matches.join('  '), 'dim');
      return value;
    }

    if (cmd === 'cat' && parts.length === 2) {
      const partial = parts[1].toLowerCase();
      const files = ['resume', 'secrets.env', 'coffee.log'];
      const matches = files.filter((file) => file.startsWith(partial));
      if (matches.length === 1) return `cat ${matches[0]} `;
      if (matches.length > 1) appendBlock(matches.join('  '), 'dim');
      return value;
    }

    return value;
  };

  const cyclePlaceholder = () => {
    input.placeholder = unlocked
      ? 'try: theme synthwave, matrix, reset, fortune'
      : hints[hintIdx % hints.length];
    hintIdx++;
  };

  setInterval(cyclePlaceholder, 5000);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'l' && (e.ctrlKey || e.metaKey) && unlocked) {
      e.preventDefault();
      output.querySelectorAll('.terminal__line').forEach((el) => el.remove());
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      historyIdx = Math.min(historyIdx + 1, history.length - 1);
      input.value = history[history.length - 1 - historyIdx];
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx <= 0) {
        historyIdx = -1;
        input.value = '';
        return;
      }
      historyIdx--;
      input.value = history[history.length - 1 - historyIdx];
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      input.value = tabComplete(input.value);
    }
  });

  wrap.addEventListener('click', (e) => {
    if (e.target.closest('.terminal__handle, .terminal__expand, .terminal__dot, .terminal__filename')) return;
    input.focus();
  });

  dotRed?.addEventListener('click', (e) => {
    e.stopPropagation();
    minimized = !minimized;
    wrap.classList.toggle('is-minimized', minimized);
    showToast(minimized ? 'Terminal minimized' : 'Terminal restored');
  });

  dotYellow?.addEventListener('click', (e) => {
    e.stopPropagation();
    themes.forEach(t => wrap.classList.remove(t));
    themeIdx = (themeIdx + 1) % themes.length;
    if (themes[themeIdx]) wrap.classList.add(themes[themeIdx]);
    const labels = ['Default theme', 'Purple mode', 'Matrix green'];
    showToast(labels[themeIdx]);
  });

  dotGreen?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (badge) {
      badge.textContent = 'REBOOT';
      badge.classList.add('terminal__badge--pulse');
      setTimeout(() => {
        badge.textContent = unlocked ? 'DEBUG' : 'RUNNING';
        badge.classList.remove('terminal__badge--pulse');
      }, 1200);
    }
    appendLine('Restarting inference pipeline...', 'dim');
    setTimeout(() => appendLine('All models loaded. ✓', 'success'), 600);
    showToast('Pipeline restarted');
  });

  filename?.addEventListener('click', (e) => {
    e.stopPropagation();
    appendLine('inference_pipeline.py — production EDD serving', 'accent');
    if (!unlocked) appendLine('(unlock debug mode to run commands)', 'dim');
    else showToast('inference_pipeline.py');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (matrixOn) {
        setMatrix(false);
        showToast('Matrix disabled');
        return;
      }
      if (document.activeElement === input) {
        input.blur();
        return;
      }
    }

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        unlock('konami');
      }
    } else {
      konamiIdx = key === KONAMI[0] ? 1 : 0;
    }
  });
}
