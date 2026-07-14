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

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  header.classList.toggle("scrolled", window.scrollY > 60);
});

// Scroll reveal
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

// Contact form
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

// ─── CHAT IA (estilo WhatsApp) ───────────────────────────────────
const chatIaBtn = document.getElementById("chatIaBtn");
const chatIaBadge = document.getElementById("chatIaBadge");
const chatIaModal = document.getElementById("chatIaModal");
const chatIaScrim = document.getElementById("chatIaScrim");
const chatIaFechar = document.getElementById("chatIaFechar");
const chatIaForm = document.getElementById("chatIaForm");
const chatIaInput = document.getElementById("chatIaInput");
const chatIaMensagens = document.getElementById("chatIaMensagens");
const chatIaDigitando = document.getElementById("chatIaDigitando");
const chatIaStatusText = document.getElementById("chatIaStatusText");
const chatIaHeaderInfo = document.getElementById("chatIaHeaderInfo");
const chatIaInfoPanel = document.getElementById("chatIaInfoPanel");
const chatIaInfoFechar = document.getElementById("chatIaInfoFechar");

const CHAT_IA_API_BASE = "https://bancos-dados-alex-sousa-dev-erp.onrender.com/api/ia";
const CHAT_IA_VISITANTE_KEY = "chatIaVisitanteId";

let chatIaConversaId = localStorage.getItem("chatIaConversaId") || null;
let chatIaAguardandoHumano = false;
let chatIaPollingId = null;
let chatIaUltimaQtdMensagens = 0;
let chatIaAberto = false;
let chatIaNaoLidas = 0;

// ─── Abrir / fechar ──────────────────────────────────────────────
function abrirChatIa() {
  chatIaModal.classList.add("open");
  chatIaAberto = true;
  chatIaNaoLidas = 0;
  atualizarBadge();
  chatIaInput.focus();
  if (chatIaAguardandoHumano) iniciarPollingChatIa();
}
function fecharChatIa() {
  chatIaModal.classList.remove("open");
  chatIaAberto = false;
  fecharPainelInfo();
}
chatIaBtn.addEventListener("click", abrirChatIa);
chatIaFechar.addEventListener("click", fecharChatIa);
chatIaScrim.addEventListener("click", fecharChatIa);

function atualizarBadge() {
  if (chatIaNaoLidas > 0) {
    chatIaBadge.textContent = chatIaNaoLidas > 9 ? "9+" : chatIaNaoLidas;
    chatIaBadge.style.display = "flex";
  } else {
    chatIaBadge.style.display = "none";
  }
}

// ─── Painel de perfil ────────────────────────────────────────────
function abrirPainelInfo() {
  chatIaInfoPanel.classList.add("open");
}
function fecharPainelInfo() {
  chatIaInfoPanel.classList.remove("open");
}
chatIaHeaderInfo.addEventListener("click", abrirPainelInfo);
chatIaInfoFechar.addEventListener("click", fecharPainelInfo);

// ─── Utilitários visuais ─────────────────────────────────────────
function horaAtual() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function iconeCheck(duplo) {
  return `
    <svg class="chat-ia-ticks" width="14" height="14" viewBox="0 0 16 15" fill="none">
      <path d="M11.5 3.5 5.5 10 3 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      ${duplo ? '<path d="M15 3.5 9 10l-1-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' : ""}
    </svg>`;
}

function adicionarMensagemChatIa(texto, tipo) {
  const msg = document.createElement("div");
  msg.className = `chat-ia-msg ${tipo}`;

  if (tipo === "ia") {
    const avatar = document.createElement("img");
    avatar.src = "img/MarianaIA.png";
    avatar.className = "chat-ia-msg-avatar";
    avatar.alt = "";
    msg.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-ia-bubble";

  const textoEl = document.createElement("div");
  textoEl.className = "chat-ia-text";
  textoEl.textContent = texto;
  bubble.appendChild(textoEl);

  const meta = document.createElement("span");
  meta.className = "chat-ia-meta";
  meta.innerHTML = `<span class="chat-ia-hora">${horaAtual()}</span>${tipo === "eu" ? iconeCheck(true) : ""}`;
  bubble.appendChild(meta);

  msg.appendChild(bubble);

  if (chatIaDigitando && chatIaDigitando.parentNode === chatIaMensagens) {
    chatIaMensagens.insertBefore(msg, chatIaDigitando);
  } else {
    chatIaMensagens.appendChild(msg);
  }
  chatIaMensagens.scrollTop = chatIaMensagens.scrollHeight;

  // notificação se o chat estiver fechado e a mensagem for da IA/Alex
  if (!chatIaAberto && tipo === "ia") {
    chatIaNaoLidas++;
    atualizarBadge();
  }
}

function definirStatus(texto, digitando = false) {
  chatIaStatusText.textContent = texto;
  chatIaStatusText.classList.toggle("digitando", digitando);
}

// ─── Envio de mensagem ───────────────────────────────────────────
chatIaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = chatIaInput.value.trim();
  if (!texto) return;

  adicionarMensagemChatIa(texto, "eu");
  chatIaInput.value = "";
  chatIaInput.disabled = true;
  chatIaDigitando.style.display = "flex";
  definirStatus("digitando...", true);
  chatIaMensagens.scrollTop = chatIaMensagens.scrollHeight;

  try {
    const data = await enviarMensagemIA(texto);
    chatIaDigitando.style.display = "none";
    definirStatus("online");

    if (data.resposta) adicionarMensagemChatIa(data.resposta, "ia");

    chatIaAguardandoHumano = !!data.aguardandoHumano;
    if (chatIaAguardandoHumano) iniciarPollingChatIa();
  } catch (err) {
    chatIaDigitando.style.display = "none";
    definirStatus("online");
    console.error("[Chat IA] Erro completo:", err);
    adicionarMensagemChatIa(
      "Desculpe, tive um problema para responder agora. Tente novamente em instantes.",
      "ia"
    );
  } finally {
    chatIaInput.disabled = false;
    chatIaInput.focus();
  }
});

// ─── Polling: verifica se o Alex já respondeu ───────────────────
function iniciarPollingChatIa() {
  if (chatIaPollingId || !chatIaConversaId) return;

  chatIaPollingId = setInterval(async () => {
    try {
      const visitanteId = localStorage.getItem(CHAT_IA_VISITANTE_KEY);
      const res = await fetch(
        `${CHAT_IA_API_BASE}/chat-portfolio/${chatIaConversaId}/mensagens`,
        { headers: visitanteId ? { "x-visitante-id": visitanteId } : {} }
      );
      const data = await res.json();
      if (!data?.sucesso) return;

      const mensagens = data.dados || [];
      if (mensagens.length > chatIaUltimaQtdMensagens) {
        const novas = mensagens.slice(chatIaUltimaQtdMensagens);
        novas.forEach((m) => {
          if (m.role === "alex") adicionarMensagemChatIa(m.conteudo, "ia");
        });
        chatIaUltimaQtdMensagens = mensagens.length;
      }

      if (data.status === "encerrada") {
        clearInterval(chatIaPollingId);
        chatIaPollingId = null;
      }
    } catch (err) {
      console.error("[Chat IA] Erro no polling:", err);
    }
  }, 5000);
}

// ─── Integração com a API ────────────────────────────────────────
async function enviarMensagemIA(mensagem) {
  const visitanteId = localStorage.getItem(CHAT_IA_VISITANTE_KEY);

  let res;
  try {
    res = await fetch(`${CHAT_IA_API_BASE}/chat-portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(visitanteId ? { "x-visitante-id": visitanteId } : {}),
      },
      body: JSON.stringify({ mensagem, conversaId: chatIaConversaId }),
    });
  } catch (erroDeRede) {
    console.error("[Chat IA] Falha de rede/CORS:", erroDeRede);
    throw new Error("Não foi possível conectar ao servidor da IA.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("[Chat IA] Backend retornou erro:", res.status, data);
    throw new Error(data?.mensagem || "Erro ao obter resposta da IA.");
  }

  if (data.visitanteId) localStorage.setItem(CHAT_IA_VISITANTE_KEY, data.visitanteId);
  if (data.conversaId) {
    chatIaConversaId = data.conversaId;
    localStorage.setItem("chatIaConversaId", chatIaConversaId);
    chatIaUltimaQtdMensagens += 1;
  }

  return data;
}

// ─── CARROSSEL DE PROJETOS ────────────────────────────────────────
const PROJETOS_API_URL = "https://bancos-dados-alex-sousa-dev-erp.onrender.com/api/projetos";

let carrosselProjetos = [];
let carrosselIndex = 0;
let carrosselAutoplayId = null;

async function carregarProjetos() {
  const track = document.getElementById("carrosselTrack");
  const vazio = document.getElementById("projetosVazio");
  const dots = document.getElementById("carrosselDots");
  const wrap = document.getElementById("projetoCarrossel");
  if (!track) return;

  try {
    const res = await fetch(PROJETOS_API_URL);
    if (!res.ok) throw new Error(`Erro ${res.status} ao buscar projetos`);
    const data = await res.json();
    const projetos = data.dados || data.projetos || data || [];

    if (!Array.isArray(projetos) || projetos.length === 0) {
      wrap.style.display = "none";
      dots.style.display = "none";
      vazio.textContent = "Nenhum projeto encontrado no momento.";
      vazio.style.display = "block";
      return;
    }

    carrosselProjetos = projetos;
    montarCarrossel();
  } catch (err) {
    console.error("[Projetos] Erro ao carregar:", err);
    wrap.style.display = "none";
    dots.style.display = "none";
    vazio.textContent = "🔧 A vitrine de projetos está em manutenção no momento. Volte em instantes!";
    vazio.style.display = "block";
  }
}

function montarCarrossel() {
  const track = document.getElementById("carrosselTrack");
  const dotsWrap = document.getElementById("carrosselDots");

  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  carrosselProjetos.forEach((projeto, i) => {
    track.appendChild(criarSlideProjeto(projeto, i));

    const dot = document.createElement("button");
    dot.className = "carrossel-dot";
    dot.setAttribute("aria-label", `Ir para projeto ${i + 1}`);
    dot.addEventListener("click", () => irParaSlide(i));
    dotsWrap.appendChild(dot);
  });

  atualizarCarrossel();
  iniciarAutoplayCarrossel();

  document.getElementById("carrosselPrev").addEventListener("click", () => {
    irParaSlide(carrosselIndex - 1);
    reiniciarAutoplayCarrossel();
  });
  document.getElementById("carrosselNext").addEventListener("click", () => {
    irParaSlide(carrosselIndex + 1);
    reiniciarAutoplayCarrossel();
  });

  const viewport = document.querySelector(".carrossel-viewport");
  viewport.addEventListener("mouseenter", pararAutoplayCarrossel);
  viewport.addEventListener("mouseleave", iniciarAutoplayCarrossel);

  // swipe touch
  let touchStartX = 0;
  viewport.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      irParaSlide(carrosselIndex + (diff < 0 ? 1 : -1));
      reiniciarAutoplayCarrossel();
    }
  });
}

function criarSlideProjeto(projeto, index) {
  const slide = document.createElement("div");
  slide.className = "carrossel-slide";

  const imgWrap = document.createElement("div");
  imgWrap.className = "carrossel-img-wrap";
  const img = document.createElement("img");
  img.src = projeto.imagem || "img/projeto-placeholder.jpg";
  img.alt = projeto.titulo || "Projeto";
  imgWrap.appendChild(img);

  const conteudo = document.createElement("div");
  conteudo.className = "carrossel-conteudo";

  const idx = document.createElement("span");
  idx.className = "carrossel-index";
  idx.textContent = `PROJETO ${String(index + 1).padStart(2, "0")} / ${String(carrosselProjetos.length).padStart(2, "0")}`;

  const titulo = document.createElement("h3");
  titulo.textContent = projeto.titulo || "Sem título";

  const desc = document.createElement("p");
  desc.textContent = projeto.descricao || "";

  const tags = document.createElement("div");
  tags.className = "carrossel-tags";
  (projeto.tecnologias || []).forEach((t) => {
    const tag = document.createElement("span");
    tag.className = "projeto-tag";
    tag.textContent = t;
    tags.appendChild(tag);
  });

  const links = document.createElement("div");
  links.className = "carrossel-links";
  if (projeto.linkDemo) {
    const a = document.createElement("a");
    a.href = projeto.linkDemo;
    a.target = "_blank";
    a.className = "btn-primary";
    a.textContent = "Ver Demo";
    links.appendChild(a);
  }
  if (projeto.linkRepo) {
    const a = document.createElement("a");
    a.href = projeto.linkRepo;
    a.target = "_blank";
    a.className = "btn-ghost";
    a.textContent = "GitHub";
    links.appendChild(a);
  }

  conteudo.append(idx, titulo, desc, tags, links);
  slide.append(imgWrap, conteudo);
  return slide;
}

function atualizarCarrossel() {
  const track = document.getElementById("carrosselTrack");
  const slides = track.querySelectorAll(".carrossel-slide");
  const dots = document.querySelectorAll(".carrossel-dot");
  const prevBtn = document.getElementById("carrosselPrev");
  const nextBtn = document.getElementById("carrosselNext");

  track.style.transform = `translateX(-${carrosselIndex * 100}%)`;

  slides.forEach((s, i) => s.classList.toggle("ativo", i === carrosselIndex));
  dots.forEach((d, i) => d.classList.toggle("ativo", i === carrosselIndex));

  prevBtn.disabled = false;
  nextBtn.disabled = false;
}

function irParaSlide(novoIndex) {
  const total = carrosselProjetos.length;
  carrosselIndex = (novoIndex + total) % total;
  atualizarCarrossel();
}

function iniciarAutoplayCarrossel() {
  if (carrosselAutoplayId || carrosselProjetos.length <= 1) return;
  carrosselAutoplayId = setInterval(() => irParaSlide(carrosselIndex + 1), 6000);
}
function pararAutoplayCarrossel() {
  clearInterval(carrosselAutoplayId);
  carrosselAutoplayId = null;
}
function reiniciarAutoplayCarrossel() {
  pararAutoplayCarrossel();
  iniciarAutoplayCarrossel();
}

document.addEventListener("DOMContentLoaded", carregarProjetos);

const chatIaConvite = document.getElementById("chatIaConvite");
const chatIaConviteFechar = document.getElementById("chatIaConviteFechar");

const CHAT_IA_CONVITE_VISTO_KEY = "chatIaConviteVisto";
let chatIaConviteTimeoutId = null;

function mostrarConvite() {
  // não mostra de novo se a pessoa já abriu o chat ou já fechou o convite antes
  if (localStorage.getItem(CHAT_IA_CONVITE_VISTO_KEY)) return;
  if (chatIaAberto) return;
  chatIaConvite.classList.add("show");
}

function esconderConvite(marcarComoVisto = true) {
  chatIaConvite.classList.remove("show");
  if (marcarComoVisto) {
    localStorage.setItem(CHAT_IA_CONVITE_VISTO_KEY, "1");
  }
  if (chatIaConviteTimeoutId) {
    clearTimeout(chatIaConviteTimeoutId);
    chatIaConviteTimeoutId = null;
  }
}

// aparece sozinho depois de alguns segundos na página
chatIaConviteTimeoutId = setTimeout(mostrarConvite, 4000);

// clicar no balão abre o chat direto
chatIaConvite.querySelector(".chat-ia-convite-conteudo").addEventListener("click", () => {
  esconderConvite();
  abrirChatIa();
});

// botão "x" só fecha o convite, sem abrir o chat
chatIaConviteFechar.addEventListener("click", (e) => {
  e.stopPropagation();
  esconderConvite();
});

function abrirChatIa() {
  esconderConvite(); // <-- adicione esta linha
  chatIaModal.classList.add("open");
  chatIaAberto = true;
  chatIaNaoLidas = 0;
  atualizarBadge();
  chatIaInput.focus();
  if (chatIaAguardandoHumano) iniciarPollingChatIa();
}