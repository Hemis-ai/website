/**
 * HemisX — Animated Background: Variant C (.bg-noise-glow)
 * Mouse-parallax ambient blobs
 *
 * Usage:
 *   import { initNoiseGlow } from './animated-bg.js';
 *   initNoiseGlow(document.querySelector('.bg-noise-glow'));
 *
 * Or inline:
 *   <script src="animated-bg.js"></script>
 *   <script>initNoiseGlow(document.querySelector('.bg-noise-glow'));</script>
 */

function initNoiseGlow(sectionEl) {
    if (!sectionEl) return;

    /* ── Blob definitions ── */
    const blobs = [
        {
            w: 600, h: 600,
            bg: 'rgba(255, 225, 124, 0.06)',
            top: '-150px', left: '-150px',
            blur: 100,
            speed: 0.02          /* slowest — furthest back */
        },
        {
            w: 400, h: 400,
            bg: 'rgba(255, 95, 87, 0.04)',
            bottom: '-100px', right: '-100px',
            blur: 80,
            speed: 0.035
        },
        {
            w: 300, h: 300,
            bg: 'rgba(183, 198, 194, 0.05)',
            top: '40%', left: '60%',
            blur: 70,
            speed: 0.05           /* fastest — closest */
        }
    ];

    const els = [];
    const bx = [];
    const by = [];
    const tx = [];
    const ty = [];

    blobs.forEach((b, i) => {
        const el = document.createElement('div');
        el.className = 'bg-noise-glow__blob';
        Object.assign(el.style, {
            width: b.w + 'px',
            height: b.h + 'px',
            background: b.bg,
            filter: 'blur(' + b.blur + 'px)',
            ...(b.top != null && { top: b.top }),
            ...(b.left != null && { left: b.left }),
            ...(b.bottom != null && { bottom: b.bottom }),
            ...(b.right != null && { right: b.right }),
        });
        sectionEl.appendChild(el);
        els.push(el);
        bx.push(0);
        by.push(0);
        tx.push(0);
        ty.push(0);
    });

    /* ── Mouse tracking (opposite direction = parallax) ── */
    sectionEl.addEventListener('mousemove', (e) => {
        const rect = sectionEl.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width - 0.5;   /* -0.5 … 0.5 */
        const my = (e.clientY - rect.top) / rect.height - 0.5;

        blobs.forEach((b, i) => {
            tx[i] = -mx * b.speed * rect.width;
            ty[i] = -my * b.speed * rect.height;
        });
    });

    /* ── Lerp animation loop ── */
    const SMOOTH = 0.08;
    let rafId;

    function tick() {
        els.forEach((el, i) => {
            bx[i] += (tx[i] - bx[i]) * SMOOTH;
            by[i] += (ty[i] - by[i]) * SMOOTH;
            el.style.transform = 'translate(' + bx[i].toFixed(2) + 'px, ' + by[i].toFixed(2) + 'px)';
        });
        rafId = requestAnimationFrame(tick);
    }

    tick();

    /* ── Cleanup helper (optional) ── */
    return function destroy() {
        cancelAnimationFrame(rafId);
        els.forEach(el => el.remove());
    };
}
