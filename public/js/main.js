(() => {
  const navbar = document.querySelector('#navbar');
  const toggle = document.querySelector('#navbar-toggle');
  const nav = document.querySelector('#navbar-nav');
  const canvas = document.querySelector('#bg-canvas');
  const context = canvas?.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const updateNavbar = () => navbar?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  if (!context || reducedMotion) return;
  const particles = Array.from({ length: 42 }, () => ({ x: Math.random(), y: Math.random(), speed: .00008 + Math.random() * .00018, size: 1 + Math.random() * 1.5 }));
  const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio; context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  const draw = () => {
    const width = window.innerWidth; const height = window.innerHeight;
    context.clearRect(0, 0, width, height); context.fillStyle = 'rgba(232,163,61,.45)';
    particles.forEach((particle) => { particle.y -= particle.speed * 16; if (particle.y < -.02) particle.y = 1.02; context.beginPath(); context.arc(particle.x * width, particle.y * height, particle.size, 0, Math.PI * 2); context.fill(); });
    requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize); draw();
})();
