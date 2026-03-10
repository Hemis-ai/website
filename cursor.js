/*  HemisX — Premium Magnetic Cursor
 *  Drop-in: <script src="cursor.js"></script> before </body>
 *  Self-initializes on DOMContentLoaded. No HTML required.
 */
(function () {
  'use strict';

  /* ── Skip on touch devices ── */
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* ══════════════════════════════════════════════════════════
     Inject styles
     ══════════════════════════════════════════════════════════ */
  const css = document.createElement('style');
  css.textContent = `
    /* ── Hide native cursor ── */
    html,
    html *,
    a, button, input, select, textarea, label,
    [role="button"] {
      cursor: none !important;
    }

    /* ── Inner dot ── */
    .hx-cursor-dot {
      position: fixed;
      top: 0; left: 0;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: #ffe17c;
      mix-blend-mode: difference;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width 0.25s ease,
                  height 0.25s ease,
                  background 0.25s ease,
                  opacity 0.25s ease;
      will-change: transform, width, height;
    }

    /* ── Outer ring ── */
    .hx-cursor-ring {
      position: fixed;
      top: 0; left: 0;
      width: 40px; height: 40px;
      border: 2px solid rgba(255,225,124,0.5);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: width 0.25s ease,
                  height 0.25s ease,
                  border-color 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      will-change: transform, width, height;
    }

    /* ── "VIEW" label inside ring (cursor-text mode) ── */
    .hx-cursor-ring__label {
      font-family: 'Satoshi', system-ui, sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #fff;
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
      user-select: none;
    }

    /* ── Hover: interactive elements ── */
    .hx-cursor-dot.is-hovering {
      width: 36px; height: 36px;
      background: #ff5f57;
    }
    .hx-cursor-ring.is-hovering {
      width: 24px; height: 24px;
      border-color: rgba(255,95,87,0.6);
    }

    /* ── Hover: .cursor-text ── */
    .hx-cursor-dot.is-text {
      opacity: 0;
      width: 0; height: 0;
    }
    .hx-cursor-ring.is-text {
      width: 80px; height: 80px;
      border-color: rgba(255,255,255,0.8);
    }
    .hx-cursor-ring.is-text .hx-cursor-ring__label {
      opacity: 1;
    }

    /* ── Mousedown squish ── */
    .hx-cursor-dot.is-pressing {
      transform: translate(-50%, -50%) scale(0.7) !important;
    }
    .hx-cursor-dot.is-releasing {
      transition: transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                  width 0.25s ease,
                  height 0.25s ease,
                  background 0.25s ease,
                  opacity 0.25s ease;
    }

    /* ── Magnetic pull on hovered element ── */
    .hx-magnet-pull {
      transition: transform 0.25s ease;
      transform: scale(1.1);
    }

    /* ── Mobile: leave cursor alone ── */
    @media (pointer: coarse) {
      .hx-cursor-dot,
      .hx-cursor-ring { display: none !important; }
      html, html * { cursor: auto !important; }
    }
  `;
  document.head.appendChild(css);

  /* ══════════════════════════════════════════════════════════
     Create cursor DOM
     ══════════════════════════════════════════════════════════ */
  const dot  = document.createElement('div');
  dot.className = 'hx-cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'hx-cursor-ring';

  const label = document.createElement('span');
  label.className = 'hx-cursor-ring__label';
  label.textContent = 'VIEW';
  ring.appendChild(label);

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  /* ══════════════════════════════════════════════════════════
     Tracking state
     ══════════════════════════════════════════════════════════ */
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  const LERP  = 0.12;          // outer ring lag factor

  let hoveredEl   = null;      // element currently hovered
  let isText      = false;
  let isHovering  = false;

  /* ── Mouse move: inner dot follows instantly ── */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* ── Outer ring lerp loop ── */
  function tick() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ══════════════════════════════════════════════════════════
     Hover detection (event delegation)
     ══════════════════════════════════════════════════════════ */
  function getInteractive(el) {
    return el.closest('a, button, .hoverable');
  }
  function getCursorText(el) {
    return el.closest('.cursor-text');
  }

  document.addEventListener('mouseover', (e) => {
    const textTarget = getCursorText(e.target);
    if (textTarget) {
      isText = true;
      isHovering = false;
      dot.classList.add('is-text');
      dot.classList.remove('is-hovering');
      ring.classList.add('is-text');
      ring.classList.remove('is-hovering');
      return;
    }

    const interactive = getInteractive(e.target);
    if (interactive && interactive !== hoveredEl) {
      hoveredEl = interactive;
      isHovering = true;
      dot.classList.add('is-hovering');
      ring.classList.add('is-hovering');
      hoveredEl.classList.add('hx-magnet-pull');
    }
  });

  document.addEventListener('mouseout', (e) => {
    /* cursor-text leave */
    if (isText) {
      const textTarget = getCursorText(e.target);
      if (textTarget && !textTarget.contains(e.relatedTarget)) {
        isText = false;
        dot.classList.remove('is-text');
        ring.classList.remove('is-text');
      }
    }

    /* interactive leave */
    if (hoveredEl) {
      const interactive = getInteractive(e.target);
      if (interactive === hoveredEl && !hoveredEl.contains(e.relatedTarget)) {
        hoveredEl.classList.remove('hx-magnet-pull');
        hoveredEl = null;
        isHovering = false;
        dot.classList.remove('is-hovering');
        ring.classList.remove('is-hovering');
      }
    }
  });

  /* ══════════════════════════════════════════════════════════
     Press & release
     ══════════════════════════════════════════════════════════ */
  document.addEventListener('mousedown', () => {
    dot.classList.remove('is-releasing');
    dot.classList.add('is-pressing');
  });

  document.addEventListener('mouseup', () => {
    dot.classList.remove('is-pressing');
    dot.classList.add('is-releasing');
    /* Remove the releasing class after the bounce finishes */
    setTimeout(() => dot.classList.remove('is-releasing'), 450);
  });

  /* ══════════════════════════════════════════════════════════
     Hide when pointer leaves the viewport
     ══════════════════════════════════════════════════════════ */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();
