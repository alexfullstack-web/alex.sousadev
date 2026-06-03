window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");

  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("hidden");

    setTimeout(() => {
      loader.remove();
    }, 400); // mesmo tempo do transition
  }, 2000);
});

const btnInfo = document.getElementById("btnInfo");
const informacao = document.querySelector(".informacao");

btnInfo.addEventListener("click", () => {
  informacao.classList.toggle("open");
});

const notification = document.querySelector(".notification");
const notificationIcon = document.querySelector(".notification-icon");
const notificationMessage = document.querySelector(".notification-message");

let notificationTimeout;

function showNotification(message, type = "success") {
  clearTimeout(notificationTimeout);

  notification.classList.remove("success", "error", "info");

  let icon = "";

  switch (type) {
    case "success":
      icon = "fa-solid fa-circle-check";
      break;

    case "error":
      icon = "fa-solid fa-circle-xmark";
      break;

    case "info":
      icon = "fa-solid fa-circle-info";
      break;
  }

  notificationIcon.className = `notification-icon ${icon}`;
  notificationMessage.textContent = message;

  notification.classList.add(type, "show");

  notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

const form = document.getElementById("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  if (!username || !password) {
    showNotification("Preencha todos os campos", "error");
    return;
  }

  const data = {
    username: username.value,
    password: password.value,
  };

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      showNotification("Erro ao conectar com o servidor", "error");
    });

  form.reset();
});

showNotification("Esse sistema esta em desenvolvimento. Por favar aguarde....", "info");