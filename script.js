const API_URL = "https://script.google.com/macros/s/AKfycbzot_90soeBaLZLocIXROyIwgsOrWWmkCh6ysEQB1NJEgRwItLhwrFSu2MTJ-VjAb9t/exec";

let currentOrderNumber = null;

// 🔐 Accès vendeur
function checkAccess() {
  const code = document.getElementById("accessCode").value;

  if (code === "0303") {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("search-screen").classList.remove("hidden");
  } else {
    document.getElementById("error").innerText = "Code incorrect";
  }
}

// 🔎 Recherche commande
function searchOrder() {
  const orderNumber = document.getElementById("orderNumber").value;

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "search",
      cmd: orderNumber
    })
  })
  .then(res => res.json())
  .then(data => {

    if (data.error) {
      document.getElementById("result").innerHTML =
        `<div class="card error">${data.error}</div>`;
      return;
    }

    currentOrderNumber = data.orderNumber;
    displayOrder(data);
  })
  .catch(err => {
    console.error("Erreur API:", err);
  });
}

// 🖥️ Affichage
function displayOrder(order) {

  const resultDiv = document.getElementById("result");

  const isCollected =
    order.status && order.status.toLowerCase().includes("retir");

  const statusClass = isCollected ? "collected" : "ready";
  const statusText = isCollected ? "Déjà retirée" : "Commande prête";

  let buttonHTML = "";

  if (!isCollected) {
    buttonHTML = `
      <button class="collect-btn" onclick="markCollected()">
        Marquer retirée
      </button>
    `;
  }

  resultDiv.innerHTML = `
    <div class="card ${statusClass}">
      <h3>${order.name}</h3>
      Commande n°${order.orderNumber}<br><br>

      👤 Préparée par : ${order.preparedBy}<br>
      📅 Créée le : ${formatDate(order.createdAt)}<br>
      📞 Téléphone : ${order.phone}<br>
      💰 Montant : ${order.amount} XPF<br><br>

      <strong>${statusText}</strong>
      ${buttonHTML}
    </div>
  `;

  resultDiv.classList.remove("hidden");
}

// ✅ Marquer retirée
function markCollected() {

  if (!confirm("Confirmer le retrait de la commande ?")) return;

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "collect",
      cmd: currentOrderNumber,
      seller: "Vendeur"
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      searchOrder();
    }
  })
  .catch(err => console.error(err));
}

// 🕒 Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR");
}
