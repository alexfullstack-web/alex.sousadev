(() => {
  const section = document.querySelector('#camera-sequence');
  const stage = document.querySelector('#camera-stage');
  if (!section || !stage) return;
  const layers = [...stage.querySelectorAll('[data-layer]')];
  const sceneImages = layers.map((layer) => layer.querySelector('img')).filter(Boolean);
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let ticking = false;
  const warmImage = (image) => {
    if (image && image.loading === 'lazy') image.loading = 'eager';
  };
  sceneImages.slice(0, 2).forEach(warmImage);
  sceneImages.forEach((image) => image.addEventListener('error', () => {
    const fallback = image.dataset.fallback;
    if (fallback && image.src !== new URL(fallback, document.baseURI).href) image.src = fallback;
  }, { once: true }));
  const render = () => {
    ticking = false;
    const bounds = section.getBoundingClientRect();
    const progress = clamp(-bounds.top / Math.max(1, section.offsetHeight - window.innerHeight));
    layers.forEach((layer, index) => {
      const start = index / layers.length; const end = (index + 1) / layers.length;
      const local = clamp((progress - start) / (end - start));
      const visible = Math.sin(local * Math.PI);
      const zoom = 1 + local * 1.9;
      layer.style.opacity = String(index === 0 ? 1 - progress * 3 : visible);
      layer.style.transform = `scale(${index === 0 ? 1 : zoom})`;
      layer.style.filter = `blur(${Math.max(0, local - .72) * 5}px)`;
      if (layer.dataset.layer === 'tela') {
        const code = layer.querySelector('.camera__code-window');
        if (code) code.style.opacity = String(clamp((local - .2) * 2));
      }
      layer.querySelectorAll('.camera__tags li').forEach((tag, tagIndex) => { tag.style.opacity = String(clamp((local - tagIndex * .12) * 4)); });
      if (local > .55) warmImage(sceneImages[index + 1]);
    });
    const rain = document.querySelector('#code-rain');
    if (rain) rain.style.opacity = String(clamp((progress - .7) * 4));
  };
  const requestRender = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  window.addEventListener('scroll', requestRender, { passive: true }); window.addEventListener('resize', requestRender); render();
})();
