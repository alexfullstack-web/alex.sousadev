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

// ─── CHAT IA ────────────────────────────────────────────────────
const chatIaBtn = document.getElementById("chatIaBtn");
const chatIaModal = document.getElementById("chatIaModal");
const chatIaScrim = document.getElementById("chatIaScrim");
const chatIaFechar = document.getElementById("chatIaFechar");
const chatIaForm = document.getElementById("chatIaForm");
const chatIaInput = document.getElementById("chatIaInput");
const chatIaMensagens = document.getElementById("chatIaMensagens");
const chatIaDigitando = document.getElementById("chatIaDigitando");

let chatIaConversaId = localStorage.getItem("chatIaConversaId") || null;
let chatIaAguardandoHumano = false;
let chatIaPollingId = null;
let chatIaUltimaQtdMensagens = 0;

function abrirChatIa() {
  chatIaModal.classList.add("open");
  chatIaInput.focus();
  if (chatIaAguardandoHumano) iniciarPollingChatIa();
}
function fecharChatIa() {
  chatIaModal.classList.remove("open");
}

chatIaBtn.addEventListener("click", abrirChatIa);
chatIaFechar.addEventListener("click", fecharChatIa);
chatIaScrim.addEventListener("click", fecharChatIa);

function adicionarMensagemChatIa(texto, tipo) {
  const msg = document.createElement("div");
  msg.className = `chat-ia-msg ${tipo}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-ia-bubble";
  bubble.textContent = texto;
  msg.appendChild(bubble);

  if (chatIaDigitando && chatIaDigitando.parentNode === chatIaMensagens) {
    chatIaMensagens.insertBefore(msg, chatIaDigitando);
  } else {
    chatIaMensagens.appendChild(msg);
  }
  chatIaMensagens.scrollTop = chatIaMensagens.scrollHeight;
}

chatIaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = chatIaInput.value.trim();
  if (!texto) return;

  adicionarMensagemChatIa(texto, "eu");
  chatIaInput.value = "";
  chatIaInput.disabled = true;
  chatIaDigitando.style.display = "flex";

  try {
    const data = await enviarMensagemIA(texto);
    chatIaDigitando.style.display = "none";

    if (data.resposta) adicionarMensagemChatIa(data.resposta, "ia");

    chatIaAguardandoHumano = !!data.aguardandoHumano;
    if (chatIaAguardandoHumano) iniciarPollingChatIa();
  } catch (err) {
    chatIaDigitando.style.display = "none";
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

// ─── POLLING: verifica se o Alex já respondeu ──────────────────
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
  }, 5000); // verifica a cada 5s
}

// ─── INTEGRAÇÃO COM SUA API ─────────────────────────────────────
const CHAT_IA_API_BASE = "https://bancos-dados-alex-sousa-dev-erp.onrender.com/api/ia"; // <-- TROQUE AQUI
const CHAT_IA_VISITANTE_KEY = "chatIaVisitanteId";

async function enviarMensagemIA(mensagem) {
  if (CHAT_IA_API_BASE.includes("SEU_BACKEND_AQUI")) {
    console.error("[Chat IA] Configure CHAT_IA_API_BASE com a URL real do backend.");
    throw new Error("URL da API não configurada.");
  }

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
    chatIaUltimaQtdMensagens += 1; // conta a mensagem do usuário que acabou de ser salva
  }

  return data;
}