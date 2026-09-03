(() => {
  const rain = document.querySelector('#code-rain');
  const snippets = ['const server = express();','app.use(cors());','router.post("/login");','jwt.sign();','bcrypt.hash();','prisma.usuario.create();','mongodb.database();','async function authenticate() {}'];
  snippets.forEach((snippet, index) => { const line = document.createElement('span'); line.textContent = snippet; line.style.left = `${5 + (index * 13) % 88}%`; line.style.setProperty('--delay', `${-index * 2.4}s`); line.style.setProperty('--speed', `${15 + index % 4 * 3}s`); rain?.append(line); });
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: .12 });
  document.querySelectorAll('.projects, .architecture, .tech, .about, .timeline, .contact').forEach((section) => { section.classList.add('reveal'); observer.observe(section); });
})();
