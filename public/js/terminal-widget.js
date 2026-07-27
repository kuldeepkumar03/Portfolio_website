/**
 * Terminal widget — drag (with ghost) + expand/collapse
 * Constrained to the hero video area.
 */

const EDGE_PAD = 12;

export function initTerminalWidget() {
  const wrap = document.getElementById('heroTerminal');
  const panel = document.getElementById('heroTerminalPanel');
  const handle = document.getElementById('terminalDragHandle');
  const expandBtn = document.getElementById('terminalExpandBtn');
  const media = wrap?.closest('.hero__media');

  if (!wrap || !panel || !handle || !expandBtn || !media) return;

  let ghost = null;
  let drag = null;
  let rafId = null;
  let pendingX = 0;
  let pendingY = 0;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const boundsFor = (width, height) => {
    const parent = media.getBoundingClientRect();
    return {
      minX: parent.left + EDGE_PAD,
      minY: parent.top + EDGE_PAD,
      maxX: parent.left + parent.width - width - EDGE_PAD,
      maxY: parent.top + parent.height - height - EDGE_PAD,
    };
  };

  const pinPosition = () => {
    const wrapRect = wrap.getBoundingClientRect();
    const parentRect = media.getBoundingClientRect();
    wrap.style.bottom = 'auto';
    wrap.style.right = 'auto';
    wrap.style.left = `${wrapRect.left - parentRect.left}px`;
    wrap.style.top = `${wrapRect.top - parentRect.top}px`;
  };

  const createGhost = () => {
    const rect = wrap.getBoundingClientRect();
    const node = panel.cloneNode(true);
    node.classList.add('terminal__ghost');
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    node.querySelectorAll('button, input').forEach((el) => {
      el.setAttribute('tabindex', '-1');
      if (el.tagName === 'INPUT') el.setAttribute('readonly', '');
    });
    node.style.width = `${rect.width}px`;
    document.body.appendChild(node);
    return node;
  };

  const positionGhost = (clientX, clientY) => {
    if (!ghost || !drag) return;

    const { minX, minY, maxX, maxY } = boundsFor(drag.width, drag.height);
    const x = clamp(clientX - drag.offsetX, minX, maxX);
    const y = clamp(clientY - drag.offsetY, minY, maxY);

    ghost.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.01)`;
    drag.lastX = x;
    drag.lastY = y;
  };

  const scheduleGhost = (clientX, clientY) => {
    pendingX = clientX;
    pendingY = clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      positionGhost(pendingX, pendingY);
    });
  };

  const cleanupDrag = () => {
    ghost?.remove();
    ghost = null;
    drag = null;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    wrap.classList.remove('is-dragging');
    handle.classList.remove('is-dragging');
    document.body.classList.remove('is-terminal-dragging');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
  };

  const endDrag = (clientX, clientY) => {
    if (!drag) return;

    positionGhost(clientX, clientY);

    const parentRect = media.getBoundingClientRect();
    wrap.style.left = `${drag.lastX - parentRect.left}px`;
    wrap.style.top = `${drag.lastY - parentRect.top}px`;

    cleanupDrag();
  };

  const onPointerMove = (e) => {
    if (!drag) return;
    scheduleGhost(e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    if (!drag) return;
    endDrag(e.clientX, e.clientY);
  };

  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    pinPosition();

    const wrapRect = wrap.getBoundingClientRect();
    drag = {
      offsetX: e.clientX - wrapRect.left,
      offsetY: e.clientY - wrapRect.top,
      width: wrapRect.width,
      height: wrapRect.height,
      lastX: wrapRect.left,
      lastY: wrapRect.top,
    };

    ghost = createGhost();
    positionGhost(e.clientX, e.clientY);

    wrap.classList.add('is-dragging');
    handle.classList.add('is-dragging');
    document.body.classList.add('is-terminal-dragging');

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    handle.setPointerCapture(e.pointerId);
  });

  expandBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = wrap.classList.toggle('is-expanded');
    expandBtn.setAttribute('aria-pressed', String(expanded));
    expandBtn.setAttribute(
      'aria-label',
      expanded ? 'Collapse terminal' : 'Expand terminal',
    );
    expandBtn.title = expanded ? 'Collapse' : 'Expand';
  });
}
