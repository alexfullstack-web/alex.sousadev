(() => {
  const grid = document.querySelector('#project-grid');
  if (!grid) return;
  const projects = [
    { title: 'API de autenticação', description: 'Fluxo de login com validação, JWT e senha protegida.', image: 'img/fundo6.jpg', stack: ['Node.js', 'Express', 'JWT', 'bcrypt'] },
    { title: 'Painel administrativo', description: 'Interface responsiva para acompanhar dados e operações.', image: 'img/fundo5.jpg', stack: ['HTML', 'CSS', 'JavaScript'] },
    { title: 'Integração de dados', description: 'Camada de persistência organizada para aplicações reais.', image: 'img/fundo4.jpg', stack: ['Prisma', 'MongoDB', 'REST API'] },
  ];
  grid.innerHTML = projects.map((project) => `<article class="project-card"><div class="project-card__media"><img src="${project.image}" alt="${project.title}" loading="lazy"></div><div class="project-card__body"><h3 class="project-card__title">${project.title}</h3><p class="project-card__desc">${project.description}</p><ul class="project-card__stack">${project.stack.map((item) => `<li>${item}</li>`).join('')}</ul><div class="project-card__links"><a href="https://github.com/alexfullstack-web" target="_blank" rel="noopener">GitHub</a><a href="#contato">Contato</a></div></div></article>`).join('');
})();
