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