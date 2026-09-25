// Particle Text Vanilla JS
(function() {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  function resolveFontSize(value, container, fontWeight, fontFamily) {
    if (typeof value === 'number') return value;
    const probe = document.createElement('span');
    probe.textContent = 'M';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.fontSize = value;
    probe.style.fontWeight = String(fontWeight);
    probe.style.fontFamily = fontFamily;
    container.appendChild(probe);
    const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
    probe.remove();
    return size;
  }

  window.initParticleText = function(container) {
    const text = 'INDIGO MULTIFAB';
    const particleSize = 5.2;
    const density = 4;
    const color = '#ffffff';
    const scatter = 350;
    const gatherDuration = 1600;
    const stagger = 420;
    const pointerRepel = 42;
    const repelRadius = 120;
    const fontSize = 'clamp(2.5rem, 4vw, 4rem)';
    const fontWeight = 900;
    const fontFamily = "'Geist', sans-serif";

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; 
    canvas.style.zIndex = '10'; // Above video and light layer
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame = null;
    let gathering = false;
    let gatherStart = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let globalOpacityTarget = 0;
    let globalOpacity = 0;

    const pointer = {
      active: false,
      x: 0, y: 0,
      smoothX: 0, smoothY: 0
    };

    function startGather() {
      if (!particles.length) return;
      const now = performance.now();
      particles.forEach(p => {
        p.startX = p.x;
        p.startY = p.y;
        p.delay = p.seed * stagger;
      });
      gatherStart = now;
      gathering = true;
      globalOpacityTarget = 1;
    }

    function scatterParticles() {
      gathering = false;
      globalOpacityTarget = 0;
      particles.forEach(p => {
        const angle = p.seed * Math.PI * 2;
        const distance = scatter * (0.35 + p.depth * 0.75);
        p.targetX_scatter = p.targetX + Math.cos(angle) * distance + (p.depth - 0.5) * scatter * 0.55;
        p.targetY_scatter = p.targetY + Math.sin(angle) * distance + (p.seed - 0.5) * scatter * 0.55;
      });
    }

    function render(now) {
      ctx.clearRect(0, 0, width, height);

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;
      globalOpacity += (globalOpacityTarget - globalOpacity) * 0.08;

      if (globalOpacity < 0.01 && globalOpacityTarget === 0) {
        // completely hidden, skip draw
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      ctx.fillStyle = color;
      
      let complete = true;

      particles.forEach(p => {
        let baseX = p.targetX;
        let baseY = p.targetY;
        let progress = 1;

        if (gathering) {
          const local = (now - gatherStart - p.delay) / gatherDuration;
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = p.startX + (p.targetX - p.startX) * eased;
          baseY = p.startY + (p.targetY - p.startY) * eased;
          if (progress < 1) complete = false;
        } else {
          baseX = p.targetX_scatter || p.startX;
          baseY = p.targetY_scatter || p.startY;
          progress = 0;
        }

        if (pointer.active && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < repelRadius) {
            const force = Math.pow(1 - dist / repelRadius, 2) * pointerRepel;
            baseX += (dx / dist) * force;
            baseY += (dy / dist) * force;
          }
        }

        const follow = 0.22;
        p.x += (baseX - p.x) * follow;
        p.y += (baseY - p.y) * follow;

        const alpha = clamp(progress * 0.9 + 0.1, 0, 1) * globalOpacity;
        ctx.globalAlpha = alpha;
        
        if (alpha > 0.02) {
          ctx.fillRect(Math.round(p.x - p.size/2), Math.round(p.y - p.size/2), p.size, p.size);
        }
      });

      if (gathering && complete) {
        gathering = false;
        particles.forEach(p => { p.targetX_scatter = p.targetX; p.targetY_scatter = p.targetY; });
      }

      animationFrame = window.requestAnimationFrame(render);
    }

    async function sampleText() {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const resolvedSize = resolveFontSize(fontSize, container, fontWeight, fontFamily);
      const font = String(fontWeight) + ' ' + resolvedSize + 'px ' + fontFamily;
      try { await document.fonts.load(font); } catch(e) {}

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      
      const maxW = width * 0.9;
      offCtx.font = font;
      let metrics = offCtx.measureText(text);
      let fSize = resolvedSize;
      if (metrics.width > maxW) {
        fSize = resolvedSize * (maxW / metrics.width);
        offCtx.font = String(fontWeight) + ' ' + fSize + 'px ' + fontFamily;
        metrics = offCtx.measureText(text);
      }

      const tw = Math.ceil(metrics.width);
      const th = Math.ceil(fSize);
      offscreen.width = tw + 20;
      offscreen.height = th + 40;
      offCtx.font = String(fontWeight) + ' ' + fSize + 'px ' + fontFamily;
      offCtx.textBaseline = 'top';
      offCtx.textAlign = 'center';
      offCtx.fillStyle = '#fff';
      offCtx.fillText(text, offscreen.width/2, 20);

      const imgData = offCtx.getImageData(0,0,offscreen.width,offscreen.height);
      const targets = [];
      const step = density;

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const a = imgData.data[(y*offscreen.width + x)*4 + 3];
          if (a > 40) {
            targets.push({
              x: width/2 - offscreen.width/2 + x,
              y: height/2 - offscreen.height/2 + y,
              alpha: a/255
            });
          }
        }
      }

      const maxP = 3000;
      const stride = Math.max(1, Math.ceil(targets.length / maxP));
      const selected = targets.filter((_, i) => i % stride === 0);

      particles = selected.map((t, i) => {
        const seed = ((i*9301+49297)%233280)/233280;
        const depth = 0.45 + (((i*233+97)%1000)/1000)*0.9;
        const angle = seed * Math.PI * 2;
        const dist = scatter * (0.35 + depth * 0.75);
        const startX = t.x + Math.cos(angle)*dist;
        const startY = t.y + Math.sin(angle)*dist;

        return {
          x: startX, y: startY,
          startX, startY,
          targetX: t.x, targetY: t.y,
          targetX_scatter: startX, targetY_scatter: startY,
          size: Math.max(0.6, particleSize * (0.75 + t.alpha * 0.45)),
          seed, depth, delay: seed * stagger
        };
      });

      pointer.x = width/2; pointer.y = height/2;
      pointer.smoothX = pointer.x; pointer.smoothY = pointer.y;

      if (!animationFrame) animationFrame = requestAnimationFrame(render);
    }

    sampleText();

        let hasGathered = false;
    container.addEventListener('mouseenter', () => {
      if (!hasGathered) {
        startGather();
        hasGathered = true;
      }
    });

    container.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    });

    container.addEventListener('mouseleave', () => {
      pointer.active = false;
      // scatterParticles(); removed so text stays permanently after first hover
    });

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      sampleText();
    });
  };
})();








