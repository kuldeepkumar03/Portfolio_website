/**
 * Easter egg — Konami code + interactive terminal CLI
 */

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const COMMANDS = {
  help() {
    return [
      'Available commands:',
      '  help          — show this message',
      '  predict       — run a sample EDD prediction',
      '  explain       — SHAP-style feature breakdown',
      '  status        — production model health',
      '  hire_kuldeep  — you know what to do',
      '  clear         — clear terminal output',
    ].join('\n');
  },

  predict(args) {
    const pincode = args[0] || '400001';
    const days = (2 + Math.random() * 2).toFixed(1);
    const conf = (0.88 + Math.random() * 0.08).toFixed(2);
    return [
      `Running EDD inference for pincode ${pincode}...`,
      `Predicted delivery: ${days} days`,
      `Confidence: ${conf}`,
      `Model: xgboost_ensemble_v3`,
    ].join('\n');
  },

  explain() {
    return [
      'Top features (SHAP):',
      '  courier_tat        +0.31',
      '  zone_density       +0.22',
      '  historical_rto     -0.18',
      '  shipment_weight    +0.09',
      '  pickup_hour        +0.06',
    ].join('\n');
  },

  status() {
    return [
      'Model health check:',
      '  uptime             99.97%',
      '  latency p99        12ms',
      '  drift score        0.04  ✓',
      '  daily predictions  28,470',
      '  last retrain       3 days ago',
    ].join('\n');
  },

  hire_kuldeep() {
    return [
      'Initiating hire sequence...',
      'Checking availability... ✓',
      'Stack match: Python, XGBoost, Production ML ✓',
      '',
      '→ deepkul2002@gmail.com',
      '→ linkedin.com/in/kuldeepkumar1207',
    ].join('\n');
  },

  clear() {
    return '__CLEAR__';
  },
};

const UNLOCK_COMMANDS = new Set(['debug', 'konami', 'sudo debug']);

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

  if (!wrap || !output || !form || !input) return;

  let unlocked = false;
  let konamiIdx = 0;
  const history = [];

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

  const appendLine = (text, type = 'dim') => {
    const line = document.createElement('div');
    line.className = `terminal__line terminal__line--${type}`;
    if (type === 'cmd') {
      line.innerHTML = `<span class="t-prompt">$</span> ${escapeHtml(text)}`;
    } else if (type === 'accent') {
      line.innerHTML = `<span class="t-accent">${escapeHtml(text)}</span>`;
    } else if (type === 'success') {
      line.innerHTML = `<span class="t-success">${escapeHtml(text)}</span>`;
    } else {
      line.textContent = text;
    }
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  const appendBlock = (text, type = 'dim') => {
    text.split('\n').forEach(line => {
      if (line) appendLine(line, type);
    });
  };

  const escapeHtml = (str) => {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  };

  const normalizeInput = (raw) => raw.trim().replace(/^\$\s*/, '');

  const LOCKED_HELP = [
    'Production CLI — restricted mode.',
    'Unlock with one of:',
    '  debug         — enable debug mode',
    '  konami        — classic unlock',
    '  sudo debug    — escalate privileges',
    '',
    'Tip: try the Konami code anywhere on this page.',
  ].join('\n');

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
    } else {
      appendLine('Type "help" to explore the pipeline.', 'dim');
    }
    showToast('Debug mode unlocked');
    input.focus();
  };

  const runCommand = (raw) => {
    const trimmed = normalizeInput(raw);
    if (!trimmed) return;

    appendLine(trimmed, 'cmd');
    history.push(trimmed);

    if (!unlocked) {
      const lower = trimmed.toLowerCase();

      if (unlockCommands.has(lower)) {
        unlock('command');
        return;
      }

      if (lower === 'help' || lower === '?') {
        appendBlock(LOCKED_HELP, 'dim');
        return;
      }

      appendLine('Access denied. Type "help" for unlock hints.', 'dim');
      return;
    }

    const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);
    const handler = COMMANDS[cmd];

    if (!handler) {
      appendLine(`Command not found: ${cmd}. Type "help".`, 'dim');
      return;
    }

    const result = handler(args, portfolioData);
    if (result === '__CLEAR__') {
      output.innerHTML = '';
      return;
    }
    appendBlock(result, cmd === 'hire_kuldeep' ? 'success' : 'dim');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCommand(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length) input.value = history[history.length - 1];
    }
  });

  wrap.addEventListener('click', (e) => {
    if (e.target.closest('.terminal__handle, .terminal__expand, .terminal__dot')) return;
    input.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === input) {
      input.blur();
      return;
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
