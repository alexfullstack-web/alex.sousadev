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
            "https://wa.me/" + numero + "?text=Olá, sou " + nome + ". " + email + ". " + msg,
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

function abrirChatIa() {
  chatIaModal.classList.add("open");
  chatIaInput.focus();
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
  chatIaMensagens.insertBefore(msg, chatIaDigitando);
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
  chatIaMensagens.scrollTop = chatIaMensagens.scrollHeight;

  try {
    const respostaIa = await enviarMensagemIA(texto);
    chatIaDigitando.style.display = "none";
    adicionarMensagemChatIa(respostaIa, "ia");
  } catch (err) {
    chatIaDigitando.style.display = "none";
    adicionarMensagemChatIa(
      "Desculpe, tive um problema para responder agora. Tente novamente em instantes.",
      "ia"
    );
    console.error(err);
  } finally {
    chatIaInput.disabled = false;
    chatIaInput.focus();
  }
});

// ─── INTEGRAÇÃO COM SUA API (plugue aqui) ──────────────────────
const CHAT_IA_API_URL = "https://SEU_BACKEND_AQUI/api/ia/chat-portfolio";
const CHAT_IA_VISITANTE_KEY = "chatIaVisitanteId";

async function enviarMensagemIA(mensagem) {
  const visitanteId = localStorage.getItem(CHAT_IA_VISITANTE_KEY);

  const res = await fetch(CHAT_IA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(visitanteId ? { "x-visitante-id": visitanteId } : {}),
    },
    body: JSON.stringify({ mensagem }),
  });

  if (!res.ok) {
    throw new Error("Falha na resposta da IA");
  }

  const data = await res.json();

  if (data.visitanteId) {
    localStorage.setItem(CHAT_IA_VISITANTE_KEY, data.visitanteId);
  }

  return data.resposta;
}