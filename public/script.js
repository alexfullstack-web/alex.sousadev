// ─── TELA DE CARREGAMENTO ──────────────────────────────────────────
(function iniciarLoader() {
  const loader = document.getElementById("loader");
  const barra = document.getElementById("loaderBarFill");
  const percentEl = document.getElementById("loaderPercent");
  if (!loader || !barra) return;

  document.body.classList.add("loading");

  let progresso = 0;
  function atualizar(valor) {
    progresso = valor;
    barra.style.width = progresso + "%";
    if (percentEl) percentEl.textContent = Math.round(progresso) + "%";
  }

  const intervalo = setInterval(() => {
    // avança rápido no início e desacelera perto do fim, simulando carregamento real
    const passo = progresso < 70 ? Math.random() * 10 : Math.random() * 3;
    atualizar(Math.min(progresso + passo, 92));
  }, 140);

  function esconderLoader() {
    clearInterval(intervalo);
    atualizar(100);
    setTimeout(() => {
      loader.classList.add("loader-hidden");
      document.body.classList.remove("loading");
    }, 320);
  }

  if (document.readyState === "complete") {
    esconderLoader();
  } else {
    window.addEventListener("load", esconderLoader);
    // tempo máximo de segurança, caso algum recurso demore demais para carregar
    setTimeout(esconderLoader, 4000);
  }
})();

// Hamburger menu
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileNav.classList.toggle("open");
});
function closeMobile() {
  hamburger.classList.remove("open");
  mobileNav.classList.remove("open");
}

// Header scroll effect + parallax sutil (orbs e ilustração)
let tickingScroll = false;
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  header.classList.toggle("scrolled", window.scrollY > 60);

  if (!tickingScroll) {
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--scrollY", window.scrollY);
      tickingScroll = false;
    });
    tickingScroll = true;
  }
});

// Scroll reveal (com atraso escalonado por grade)
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((el) => observer.observe(el));

// atraso escalonado dentro de cada grade (hero-features, services, badges)
document.querySelectorAll(".hero-features, .services-grid, .sobre-badge-stack").forEach((grid) => {
  [...grid.children].forEach((child, i) => {
    child.style.setProperty("--i", i);
  });
});

// ─── FUNDO ANIMADO: rede de conexões com pulsos de dados ─────────
(function iniciarRedeDados() {
  const canvas = document.getElementById("redeCanvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let largura, altura, nos, pulsos;
  const RAIO_CONEXAO = 170;
  const AREA_POR_NO = 16000;

  function redimensionar() {
    largura = canvas.width = window.innerWidth;
    altura = canvas.height = window.innerHeight;
  }

  function criarNos() {
    const qtd = Math.min(60, Math.floor((largura * altura) / AREA_POR_NO));
    nos = Array.from({ length: qtd }, () => ({
      x: Math.random() * largura,
      y: Math.random() * altura,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 1,
    }));
    pulsos = [];
  }

  function talvezCriarPulso() {
    if (Math.random() > 0.02 || nos.length < 2) return;
    const origem = nos[Math.floor(Math.random() * nos.length)];
    let destino = null;
    let menorDist = Infinity;
    nos.forEach((n) => {
      if (n === origem) return;
      const d = Math.hypot(n.x - origem.x, n.y - origem.y);
      if (d < RAIO_CONEXAO && d < menorDist) {
        menorDist = d;
        destino = n;
      }
    });
    if (destino) pulsos.push({ origem, destino, t: 0 });
  }

  function passo() {
    ctx.clearRect(0, 0, largura, altura);

    nos.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > largura) n.vx *= -1;
      if (n.y < 0 || n.y > altura) n.vy *= -1;
    });

    for (let i = 0; i < nos.length; i++) {
      for (let j = i + 1; j < nos.length; j++) {
        const a = nos[i],
          b = nos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < RAIO_CONEXAO) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(21, 84, 247, ${0.14 * (1 - d / RAIO_CONEXAO)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    nos.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(46, 163, 255, 0.55)";
      ctx.fill();
    });

    talvezCriarPulso();
    pulsos.forEach((p) => {
      p.t += 0.018;
      const x = p.origem.x + (p.destino.x - p.origem.x) * p.t;
      const y = p.origem.y + (p.destino.y - p.origem.y) * p.t;
      const brilho = ctx.createRadialGradient(x, y, 0, x, y, 7);
      brilho.addColorStop(0, "rgba(21, 84, 247, 0.85)");
      brilho.addColorStop(1, "rgba(21, 84, 247, 0)");
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = brilho;
      ctx.fill();
    });
    pulsos = pulsos.filter((p) => p.t < 1);

    requestAnimationFrame(passo);
  }

  redimensionar();
  criarNos();
  requestAnimationFrame(passo);
  window.addEventListener("resize", () => {
    redimensionar();
    criarNos();
  });
})();

// ─── BRILHO SEGUINDO O CURSOR ─────────────────────────────────────
(function iniciarCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;
  let ativo = false;
  window.addEventListener("mousemove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    if (!ativo) {
      glow.classList.add("active");
      ativo = true;
    }
  });
  window.addEventListener("mouseleave", () => glow.classList.remove("active"));
})();

// ─── TILT 3D NA ILUSTRAÇÃO DO HERO ────────────────────────────────
(function iniciarTiltIlustracao() {
  const frame = document.getElementById("heroImgFrame");
  if (!frame) return;
  frame.addEventListener("mousemove", (e) => {
    const rect = frame.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  frame.addEventListener("mouseleave", () => {
    frame.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
})();

// ─── RIPPLE NOS BOTÕES ─────────────────────────────────────────────
document.addEventListener("click", (e) => {
  const alvo = e.target.closest(".btn-primary, .btn-ghost");
  if (!alvo) return;
  const rect = alvo.getBoundingClientRect();
  const tamanho = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ui-ripple";
  ripple.style.width = ripple.style.height = `${tamanho}px`;
  ripple.style.left = `${e.clientX - rect.left - tamanho / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - tamanho / 2}px`;
  alvo.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

// ─── CONTADOR ANIMADO NAS ESTATÍSTICAS ────────────────────────────
(function iniciarContadores() {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  if (!nums.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const alvo = parseInt(el.dataset.count, 10);
        const sufixo = el.dataset.suffix || "";
        const duracao = 1200;
        const inicio = performance.now();
        function anima(agora) {
          const progresso = Math.min((agora - inicio) / duracao, 1);
          const valor = Math.floor(progresso * alvo);
          el.textContent = valor + sufixo;
          if (progresso < 1) requestAnimationFrame(anima);
          else el.textContent = alvo + sufixo;
        }
        requestAnimationFrame(anima);
        obs.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  nums.forEach((el) => obs.observe(el));
})();

// ─── FORMULÁRIO DE CONTATO ─────────────────────────────────────────
function Btn_envia(e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("mensagem").value.trim();
  const numero = 5599984686139;
  if (!nome || !email || !msg) {
    showToast("Preencha todos os campos!", "error");
    return;
  } else {
    window.open(
      "https://wa.me/" + numero + "?text=Olá, sou " + nome + ". " + email + ". " + msg,
    );
  }
  showToast("Mensagem enviada com sucesso!", "success");
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("mensagem").value = "";
}

function showToast(text, type) {
  const t = document.createElement("div");
  t.className = "toast toast-" + type;
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 3000);
}