// boot.js
(function () {
  let isReload = false;
  if (window.performance) {
    if (window.performance.navigation && window.performance.navigation.type === 1) {
      isReload = true;
    }
    if (window.performance.getEntriesByType) {
      const navEntries = window.performance.getEntriesByType("navigation");
      if (navEntries.length > 0 && navEntries[0].type === "reload") {
        isReload = true;
      }
    }
  }

  const hasBooted = sessionStorage.getItem('hemisx_booted');
  const shouldRun = !hasBooted || isReload;

  if (!shouldRun) {
    return;
  }

  sessionStorage.setItem('hemisx_booted', 'true');

  const style = document.createElement('style');
  style.textContent = `
    body {
      overflow: hidden !important;
    }
    #boot-screen {
      position: fixed;
      inset: 0;
      background: #0d1210; /* HemisX dark background */
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.55);
      font-family: 'Satoshi', system-ui, sans-serif;
      font-weight: 700;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.8s ease, visibility 0.8s ease, filter 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      margin: 0;
      padding: 0;
    }
    
    /* The particle canvas sits behind the text */
    #boot-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
      opacity: 0.85; /* Increased opacity for more brightness */
    }

    #boot-screen.hidden {
      opacity: 0;
      visibility: hidden;
      filter: blur(12px);
      transform: scale(1.08);
      transition: opacity 1s ease, visibility 1s ease, filter 1s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    #boot-text {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      text-align: center;
      padding: 0 1rem;
      position: relative;
      font-size: clamp(0.9rem, 3vw, 1.5rem);
      word-break: break-all;
      max-width: 90vw;
      z-index: 10; /* Above canvas */
    }

    /* Fast, sharp themed glitch (Yellows, Sage Greens, Dark, Whites) */
    .glitch {
      animation: themedGlitch 0.08s infinite;
    }

    @keyframes themedGlitch {
      0% { transform: scale(1); filter: hue-rotate(0deg); opacity: 1; color: #ffe17c; text-shadow: 2px 0 0 #b7c6c2, -2px 0 0 #171e19; }
      33% { transform: translate(-3px, 1px) scale(1.02); filter: hue-rotate(20deg); color: #b7c6c2; text-shadow: -3px 0 0 #ffe17c, 3px 0 0 #000; opacity: 0.8; }
      66% { transform: translate(3px, -1px) scale(0.98); filter: hue-rotate(-20deg); color: #fff; text-shadow: 4px 0 0 #ffe17c, -4px 0 0 #3b82f6; opacity: 1; }
      100% { transform: scale(1); filter: hue-rotate(0deg); opacity: 1; color: #ffe17c; text-shadow: 2px 0 0 #b7c6c2, -2px 0 0 #171e19; }
    }

    /* Final Static Logo Form */
    #boot-text.logo-style {
      font-family: 'Cabinet Grotesk', 'Satoshi', sans-serif;
      font-size: clamp(3rem, 8vw, 6.5rem);
      font-weight: 800;
      color: #ffffff;
      text-transform: none;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      animation: none;
      text-shadow: none;
      transform: scale(0.9);
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), text-shadow 0.6s ease;
    }
    
    #boot-text.scale-up {
      transform: scale(1.02);
      text-shadow: 0 0 60px rgba(255, 225, 124, 0.3);
    }

    .boot-bolt {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: clamp(64px, 12vw, 90px);
      height: clamp(64px, 12vw, 90px);
      background: #000000;
      color: #ffe17c;
      border-radius: 12px;
      border: 3px solid #000000;
      box-shadow: 6px 6px 0 0 #ffe17c;
      font-size: clamp(32px, 6vw, 48px);
      transition: box-shadow 0.6s ease;
    }

    #boot-text.scale-up .boot-bolt {
      box-shadow: 6px 6px 0 0 #ffe17c, 0 0 40px rgba(255, 225, 124, 0.4);
    }

    @media (max-width: 768px) {
      #boot-text.logo-style {
        flex-direction: column;
        gap: 0.8rem;
        font-size: clamp(2.5rem, 10vw, 3.5rem);
      }
      .boot-bolt {
        width: clamp(48px, 15vw, 64px) !important;
        height: clamp(48px, 15vw, 64px) !important;
        font-size: clamp(24px, 8vw, 32px) !important;
      }
    }
  `;
  document.head.appendChild(style);

  const bootScreen = document.createElement('div');
  bootScreen.id = 'boot-screen';
  
  // Create Canvas for particle background
  const canvas = document.createElement('canvas');
  canvas.id = 'boot-canvas';
  bootScreen.appendChild(canvas);

  const bootText = document.createElement('div');
  bootText.id = 'boot-text';
  bootScreen.appendChild(bootText);
  document.documentElement.appendChild(bootScreen);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let isAnimating = true;
  let isFormingLogo = false;

  const boltPolygon = [
    {x: 0.1, y: -0.8},
    {x: -0.4, y: 0.2},
    {x: 0.05, y: 0.2},
    {x: -0.2, y: 0.9},
    {x: 0.4, y: -0.1},
    {x: -0.05, y: -0.1}
  ];

  function getRandomBoltPoint(scale, offsetX, offsetY) {
    const edges = [];
    let totalLength = 0;
    for (let i = 0; i < boltPolygon.length; i++) {
        const p1 = boltPolygon[i];
        const p2 = boltPolygon[(i + 1) % boltPolygon.length];
        const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        edges.push({ p1, p2, length });
        totalLength += length;
    }

    let randomVal = Math.random() * totalLength;
    let selectedEdge = edges[0];
    for (let edge of edges) {
        if (randomVal <= edge.length) {
            selectedEdge = edge;
            break;
        }
        randomVal -= edge.length;
    }

    const t = Math.random();
    const nx = selectedEdge.p1.x + t * (selectedEdge.p2.x - selectedEdge.p1.x);
    const ny = selectedEdge.p1.y + t * (selectedEdge.p2.y - selectedEdge.p1.y);

    return {
        x: offsetX + nx * scale,
        y: offsetY + ny * scale
    };
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      
      // Fast movement to match the rapid boot sequence
      this.speedX = (Math.random() - 0.5) * 5; 
      this.speedY = (Math.random() - 0.5) * 5;
      
      // Increased opacity from 0.4/0.2 to 0.7/0.5
      this.color = Math.random() > 0.5 ? 'rgba(255, 225, 124, 0.7)' : 'rgba(183, 198, 194, 0.5)'; // Yellow or Sage
    }
    update() {
      if (isFormingLogo) {
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;
      } else {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off walls
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    // Ensure enough particles on mobile to form the thunder shape, max 200 on desktop
    const count = Math.max(120, Math.min(window.innerWidth / 10, 200));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
  }

  function animateParticles() {
    if (!isAnimating) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      // Draw connecting lines if close enough
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          ctx.beginPath();
          // Increased opacity from 0.15 to 0.35 and reduced distance fade
          ctx.strokeStyle = `rgba(183, 198, 194, ${0.35 - distance / 500})`; 
          ctx.lineWidth = 1.5; /* Slightly thicker line */
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  // --- End Particle Logic ---


  // Shorter array of commands to keep it brief but intense
  const protocols = [
    "INIT > 0X00",
    "MEM_ALLOC: OK",
    "OVERRIDING TCP",
    "NEURAL_SYNC",
    "LOADING WEIGHTS",
    "HANDSHAKE [A]",
    "AI_CORE_ONLINE",
    "HEMISX" // Final lock
  ];

  const chars = 'A0B1C2D3E4F5X@#<>';

  // Scrambles text using the cypher characters
  function scrambleText(text) {
    return text.split('').map(char => {
      if (char === ' ' || Math.random() > 0.6) return char;
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
  }

  let step = 0;
  let flashCount = 0; 

  function runSequence() {
    if (step < protocols.length) {
      const isHemisx = protocols[step] === "HEMISX";

      if (isHemisx) {
        // SMASH INTO LOGO
        bootScreen.className = ''; 
        bootText.className = ''; 
        bootText.innerHTML = '<span class="boot-bolt">⚡</span><span>HemisX</span>';
        bootText.classList.add('logo-style');

        // Reshape particles to the HemisX Thunder Logo!
        isFormingLogo = true;
        const scale = Math.min(canvas.width, canvas.height) * 0.45;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        particles.forEach(p => {
          const target = getRandomBoltPoint(scale, cx, cy);
          p.targetX = target.x;
          p.targetY = target.y;
        });

        // Force reflow and scale up with massive glow
        requestAnimationFrame(() => {
          bootText.classList.add('scale-up');
        });

        // Hold pristine logo for an extra 0.1s (0.7s total) to let the particles settle, then dissolve
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          setTimeout(() => {
            if (bootScreen.parentNode) bootScreen.remove();
            if (style.parentNode) style.remove();
            window.removeEventListener('resize', resizeCanvas);
            document.body.style.overflow = '';
          }, 1000);
        }, 700);
      } else {
        // THEMED CYBER CHAOS
        bootText.classList.add('glitch');

        let currentText = protocols[step];

        // 50% chance to scramble the text on each flash tick
        if (Math.random() > 0.5) {
          bootText.textContent = scrambleText(currentText);
        } else {
          bootText.textContent = currentText;
        }

        flashCount++;
        
        // Very rapid progression (only 2-3 flashes per word)
        let targetFlashes = step > 4 ? 2 : 3;

        if (flashCount >= targetFlashes) {
          step++;
          flashCount = 0;
        }

        // Fire again even faster (reduced by 0.1s overall by tightening min/max times)
        // Previous was 30 + Math.random() * 20 -> New is 20 + Math.random() * 15
        setTimeout(runSequence, 20 + Math.random() * 15);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initParticles();
      animateParticles();
      runSequence();
    });
  } else {
    initParticles();
    animateParticles();
    runSequence();
  }
})();
