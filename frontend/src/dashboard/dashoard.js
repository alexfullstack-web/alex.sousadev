/* ─── DASHBOARD.JS ───────────────────────────────────────────────── */

/* ── Dados mockados (substitua por chamadas de API reais) ─────────── */
const DATA = {
  users:        42,
  clients:      128,
  finance:      "R$ 34.750,00",
  projects:     17,
  documents:    93,
  appointments: 8,
  planning:     5,
  reports:      22,

  onlineUsers: [
    "Alex Sousa",
    "Maria Lima",
    "Carlos Mendes",
    "Fernanda Silva",
    "João Pereira",
  ],

  registeredProjects: [
    { name: "Site Institucional",    status: "Em andamento", color: "#00d4ff" },
    { name: "App Mobile E-commerce", status: "Concluído",    color: "#00ff88" },
    { name: "Dashboard Analytics",   status: "Em andamento", color: "#00d4ff" },
    { name: "API REST Node.js",      status: "Pausado",      color: "#ffd700" },
    { name: "Redesign Landing Page", status: "Concluído",    color: "#00ff88" },
  ],

  scheduling: {
    labels: ["08h", "09h", "10h", "11h", "13h", "14h", "15h", "16h"],
    data:   [2, 1, 3, 2, 4, 3, 2, 1],
  },

  projectsChart: {
    labels: ["Concluídos", "Em andamento", "Pausados", "A iniciar"],
    data:   [8, 5, 2, 2],
    colors: ["#00ff88", "#00d4ff", "#ffd700", "#8892b0"],
  },

  monthly: {
    labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    data:   [12, 18, 14, 22, 30, 25, 19, 28, 33, 27, 21, 36],
  },
};

/* ─── UTILITÁRIOS ────────────────────────────────────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showNotification(msg, type = "success") {
  const el = $(".notification");
  const msgEl = $(".natification-message");
  el.className = "notification show " + type;
  msgEl.textContent = msg;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3500);
}

/* ─── LOADER ─────────────────────────────────────────────────────── */
function hideLoader() {
  const loader = $(".loader");
  loader.style.opacity = "0";
  loader.style.pointerEvents = "none";
  setTimeout(() => loader.remove(), 400);
}

/* ─── HEADER: ACTIVE NAV LINK ────────────────────────────────────── */
function setActiveLink() {
  const current = location.pathname.split("/").pop() || "dashboard.html";
  $$(".nav a").forEach(a => {
    const href = a.getAttribute("href").split("/").pop();
    a.classList.toggle("active", href === current);
  });
}

/* ─── THEME TOGGLE ───────────────────────────────────────────────── */
function initTheme() {
  const tema = $(".tema");
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);

  tema.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    showNotification(next === "dark" ? "Tema escuro ativado" : "Tema claro ativado");
  });
}

/* ─── MOBILE NAV DRAWER ──────────────────────────────────────────── */
function initMobileNav() {
  // Cria botão hamburguer no header se não existir
  if (!$(".hamburger-dash")) {
    const btn = document.createElement("button");
    btn.className = "hamburger-dash";
    btn.setAttribute("aria-label", "Abrir menu");
    btn.innerHTML = `<i class="fa-solid fa-bars"></i>`;
    btn.style.cssText = `
      background:none; border:1px solid var(--border); color:var(--text-muted);
      border-radius:var(--radius-sm); width:36px; height:36px; cursor:pointer;
      display:none; align-items:center; justify-content:center; font-size:16px;
      transition:var(--transition); flex-shrink:0;
    `;
    $(".header").insertBefore(btn, $(".tema"));

    // Mostra só em mobile
    const mq = window.matchMedia("(max-width: 900px)");
    const toggle = () => btn.style.display = mq.matches ? "flex" : "none";
    mq.addEventListener("change", toggle);
    toggle();

    const nav = $(".nav");
    let overlay = null;

    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.querySelector("i").className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";

      if (open) {
        overlay = document.createElement("div");
        overlay.style.cssText = `
          position:fixed; inset:0; z-index:99;
          background:rgba(4,5,15,0.6); backdrop-filter:blur(4px);
        `;
        overlay.addEventListener("click", () => {
          nav.classList.remove("open");
          btn.querySelector("i").className = "fa-solid fa-bars";
          overlay.remove();
        });
        document.body.appendChild(overlay);
      } else if (overlay) {
        overlay.remove();
      }
    });
  }
}

/* ─── NOTIFICATIONS DROPDOWN ─────────────────────────────────────── */
function initNotifications() {
  const bell = $(".notifications");
  const list = $("#notification-list");
  const countEl = $(".notification-count");

  let notifs = [
    "Novo projeto cadastrado",
    "Agendamento às 15h confirmado",
    "Relatório mensal disponível",
  ];

  function renderNotifs() {
    const ul = $("#notification-items");
    ul.innerHTML = "";
    if (notifs.length === 0) {
      ul.innerHTML = `<li style="color:var(--text-muted);font-style:italic">Nenhuma notificação</li>`;
    } else {
      notifs.forEach((n, i) => {
        const li = document.createElement("li");
        li.textContent = n;
        li.addEventListener("click", () => {
          notifs.splice(i, 1);
          renderNotifs();
          showNotification("Notificação dispensada");
        });
        ul.appendChild(li);
      });
    }
    countEl.textContent = notifs.length;
    countEl.style.display = notifs.length ? "flex" : "none";
  }

  renderNotifs();

  // Fechar ao clicar fora
  document.addEventListener("click", e => {
    if (!bell.contains(e.target)) list.style.display = "none";
  });
  bell.addEventListener("click", e => {
    e.stopPropagation();
    list.style.display = list.style.display === "block" ? "none" : "block";
  });
}

/* ─── SETTINGS & LOGOUT ──────────────────────────────────────────── */
function initHeaderActions() {
  $("#settings")?.addEventListener("click", () =>
    showNotification("Configurações em breve…")
  );
  $("#logout")?.addEventListener("click", () => {
    if (confirm("Deseja realmente sair?")) {
      showNotification("Saindo…");
      setTimeout(() => location.href = "/", 1500);
    }
  });
}

/* ─── CONTADORES ANIMADOS ────────────────────────────────────────── */
function animateCounter(el, target, prefix = "", suffix = "", duration = 1200) {
  const isFloat = typeof target === "string" && target.includes(",");
  if (isFloat) { el.textContent = prefix + target + suffix; return; }

  const end = parseInt(target);
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.floor(eased * (end - start) + start) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function populateCards() {
  const map = {
    "user-count":        DATA.users,
    "client-count":      DATA.clients,
    "finance-count":     DATA.finance,
    "project-count":     DATA.projects,
    "document-count":    DATA.documents,
    "appointment-count": DATA.appointments,
    "planning-count":    DATA.planning,
    "report-count":      DATA.reports,
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof val === "string" && val.startsWith("R$")) {
      el.textContent = val;
    } else {
      animateCounter(el, val);
    }
  });
}

/* ─── ONLINE USERS ───────────────────────────────────────────────── */
function populateOnlineUsers() {
  const ul = document.getElementById("online-users");
  if (!ul) return;
  ul.innerHTML = "";
  DATA.onlineUsers.forEach(name => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-solid fa-user" style="color:var(--blue-light);font-size:13px"></i> ${name}`;
    ul.appendChild(li);
  });
}

/* ─── REGISTERED PROJECTS ────────────────────────────────────────── */
function populateProjects() {
  const ul = document.getElementById("registered-projects");
  if (!ul) return;
  ul.innerHTML = "";
  DATA.registeredProjects.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <i class="fa-solid fa-briefcase" style="color:var(--blue-light);font-size:13px;flex-shrink:0"></i>
      <span style="flex:1">${p.name}</span>
      <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:100px;
        background:${p.color}18;border:1px solid ${p.color}44;color:${p.color}">
        ${p.status}
      </span>
    `;
    ul.appendChild(li);
  });
}

/* ─── CHART.JS DEFAULTS ──────────────────────────────────────────── */
function applyChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.color = "#8892b0";
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.padding = 16;
}

/* ─── GRÁFICOS ───────────────────────────────────────────────────── */
function buildSchedulingChart() {
  const ctx = document.getElementById("schedulingChart");
  if (!ctx || !window.Chart) return;

  const { labels, data } = DATA.scheduling;
  const total = data.reduce((a, b) => a + b, 0);
  const el = document.getElementById("scheduling-total");
  if (el) animateCounter(el, total);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Agendamentos",
        data,
        backgroundColor: "rgba(26,75,255,0.5)",
        borderColor: "#4d73ff",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(26,75,255,0.06)" }, ticks: { color: "#8892b0" } },
        y: {
          grid: { color: "rgba(26,75,255,0.06)" },
          ticks: { color: "#8892b0", stepSize: 1 },
          beginAtZero: true,
        },
      },
    },
  });
}

function buildProjectsChart() {
  const ctx = document.getElementById("projectsChart");
  if (!ctx || !window.Chart) return;

  const { labels, data, colors } = DATA.projectsChart;
  const total = data.reduce((a, b) => a + b, 0);
  const el = document.getElementById("projects-total");
  if (el) animateCounter(el, total);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => c + "99"),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "65%",
      plugins: {
        legend: { position: "bottom", labels: { color: "#8892b0" } },
      },
    },
  });
}

function buildMonthlyChart() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx || !window.Chart) return;

  const { labels, data } = DATA.monthly;
  const total = data.reduce((a, b) => a + b, 0);
  const el = document.getElementById("yearly-total");
  if (el) animateCounter(el, total);

  const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, "rgba(26,75,255,0.4)");
  gradient.addColorStop(1, "rgba(26,75,255,0.02)");

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Registros",
        data,
        fill: true,
        backgroundColor: gradient,
        borderColor: "#4d73ff",
        borderWidth: 2.5,
        tension: 0.45,
        pointBackgroundColor: "#4d73ff",
        pointBorderColor: "#04050f",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(26,75,255,0.06)" }, ticks: { color: "#8892b0" } },
        y: {
          grid: { color: "rgba(26,75,255,0.06)" },
          ticks: { color: "#8892b0" },
          beginAtZero: true,
        },
      },
    },
  });
}

/* ─── INIT ───────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Simula carregamento
  setTimeout(() => {
    hideLoader();

    setActiveLink();
    initTheme();
    initMobileNav();
    initNotifications();
    initHeaderActions();
    populateCards();
    populateOnlineUsers();
    populateProjects();

    applyChartDefaults();
    buildSchedulingChart();
    buildProjectsChart();
    buildMonthlyChart();

    showNotification("Dashboard carregado com sucesso!");
  }, 800);
});