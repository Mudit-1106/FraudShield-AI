/* =========================================================
   GLOBAL STATE (SIMULATED – BACKEND READY)
========================================================= */
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc, 
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase.js";

/*const AppState = {
  user: null,
  balance: 0,
  role: "user", // user | admin
};*/


  const FRAUD_RULES = [
  {
    id: "HIGH_AMOUNT",
    condition: (ctx) => ctx.amount > 50000,
    weight: 30,
    message: "Transaction amount is unusually high"
  },
  {
    id: "NEW_RECIPIENT",
    condition: (ctx) => ctx.isNewRecipient,
    weight: 15,
    message: "Recipient not seen in transaction history"
  },
  {
    id: "ODD_TIME",
    condition: (ctx) => ctx.hour < 6,
    weight: 10,
    message: "Transaction initiated at unusual hours"
  },
  {
    id: "LOCATION_MISMATCH",
    condition: (ctx) => ctx.locationMismatch,
    weight: 20,
    message: "Location mismatch detected"
  },
  {
    id: "HIGH_FREQUENCY",
    condition: (ctx) => ctx.txnCount24h > 5,
    weight: 15,
    message: "High transaction frequency in short duration"
  },
  {
    id: "NEW_ACCOUNT",
    condition: (ctx) => ctx.accountAge < 30,
    weight: 10,
    message: "Account is relatively new"
  }
];

let fraudChartInstance = null;
let ALL_TRANSACTIONS = [];

/*import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";*/


function analyzeFraud(ctx) {
  let score = 0;
  const reasons = [];

  FRAUD_RULES.forEach(rule => {
    if (rule.condition(ctx)) {
      score += rule.weight;
      reasons.push(rule.message);
    }
  });

  let riskLevel = "LOW";
  if (score >= 60) riskLevel = "HIGH";
  else if (score >= 30) riskLevel = "MEDIUM";

  return {
    riskScore: score,
    riskLevel,
    reasons
  };
}


function loadTransactions() {
  const tbody = document.getElementById("incomingBody");
  if (!tbody) return;   // 👈 IMPORTANT LINE


  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    tbody.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();

      const tr = document.createElement("tr");
      tr.className =
        d.risk === "HIGH" ? "risk-high" :
        d.risk === "LOW" ? "risk-low" :
        "risk-review";

      tr.innerHTML = `
        <td>${d.createdAt?.toDate().toLocaleString()}</td>
        <td>₹${d.amount}</td>
        <td>${d.recipient}</td>
        <td>${d.risk}</td>
        <td>${d.status}</td>
      `;

      tbody.appendChild(tr);
    });
  });
}

const AppState = {
  user: {
    id: "FS1023",
    name: "Shiv Shanker",
    email: "shivshanker@gmail.com",
    joined: "15 Aug 2024",
    balance: 124560,
    avgAmount: 2500,
    commonLocations: ["Lucknow", "Kanpur"],
    peakTime: "10 AM – 1 PM",
    role: "user"
  },


  knownRecipients: [],

  ui: {
    activeSection: "dashboard",
    profileOpen: false
  },

  transactions: {
    incoming: [],
    outgoing: [],
    requests: []
  }
};

const DEMO_PROFILES = {
  user: {
    ...AppState.user,
    role: "user"
  },
  admin: {
    id: "ADMIN01",
    name: "Admin Kavach",
    email: "admin@fraudshield.ai",
    joined: "System",
    balance: 0,
    avgAmount: 0,
    commonLocations: [],
    peakTime: "-",
    role: "admin"
  }
};

function switchProfile(type) {
  AppState.user = DEMO_PROFILES[type];
  loadProfileFromState();
}


function loadProfileFromState() {
  const u = AppState.user;
  if (!u) return;

  document.getElementById("profileName").innerText = u.name;
  document.getElementById("profileEmail").innerText = u.email;
  document.getElementById("profileJoined").innerText = u.joined;
  document.getElementById("profileBalance").innerText =
    "₹" + u.balance.toLocaleString();

  document.getElementById("profileRole").innerText =
    u.role === "admin" ? "Administrator" : "User";
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfileFromState();
});



/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function qs(id) {
  return document.getElementById(id);
}

function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function showAlert(msg) {
  alert(msg);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTransactions();
});


/* =========================================================
   NAVIGATION & SECTIONS
========================================================= */


/*function showSection(id) {
  document.querySelectorAll(".section").forEach(s =>
    s.classList.add("hidden")
  );

  document.getElementById(id).classList.remove("hidden");

  if (id === "receiveSection") {
    loadIncomingTransactions();
  }

  if (id === "alerts") {
    loadFraudAlerts();
  }
}*/
 

/* =========================================================
   BALANCE HANDLING
========================================================= */

/*function toggleBalance() {
  const bal = qs("balanceAmount");
  if (bal.classList.contains("hidden")) {
    bal.textContent = formatCurrency(AppState.user.balance);
  }
  bal.classList.toggle("hidden");
}*/

/* =========================================================
   PROFILE DROPDOWN
========================================================= */

/*function toggleProfile(e) {
  e.stopPropagation();
  const drop = qs("profileDropdown");
  drop.classList.toggle("hidden");
  AppState.ui.profileOpen = !drop.classList.contains("hidden");
}*/

document.body.addEventListener("click", () => {
  const drop = qs("profileDropdown");
  if (drop && !drop.classList.contains("hidden")) {
    drop.classList.add("hidden");
    AppState.ui.profileOpen = false;
  }
});

/* =========================================================
   LOGOUT
========================================================= */


/* =========================================================
   SEND MONEY LOGIC
========================================================= */

function validateSendForm(amount, recipient) {
  if (!amount || Number(amount) <= 0) {
    showAlert("Please enter a valid amount");
    return false;
  }

  if (!recipient || recipient.trim() === "") {
    showAlert("Recipient / UPI ID is required");
    return false;
  }

  return true;
}

/*function simulateFraudAnalysis(amount) {
  // Simple heuristic (backend will replace this)
  if (amount > AppState.user.avgAmount * 5) {
    return { risk: "HIGH", reason: "Amount much higher than normal" };
  }
  return { risk: "LOW", reason: "Normal behavior" };
}

function simulateFraudAnalysis(amount) {
  let score = 0;
  let reasons = [];

  if (amount > 50000) {
    score += 40;
    reasons.push("High transaction amount");
  }

  if (new Date().getHours() < 6) {
    score += 15;
    reasons.push("Odd transaction time");
  }

  if (Math.random() > 0.6) {
    score += 25;
    reasons.push("New recipient");
  }

  let level = "LOW";
  if (score >= 70) level = "HIGH";
  else if (score >= 40) level = "MEDIUM";

  return {
    riskScore: score,
    riskLevel: level,
    reasons: reasons
  };
}*/

/*function analyzeFraud(txn) {
  let score = 0;
  let reasons = [];

  if (txn.amount > 50000) {
    score += 30;
    reasons.push("High transaction amount");
  }

  if (txn.user.country !== "India") {
    score += 25;
    reasons.push("Country mismatch");
  }

  if (txn.user.txnCount24h > 5) {
    score += 20;
    reasons.push("High transaction frequency");
  }

  if (txn.user.accountAge < 30) {
    score += 15;
    reasons.push("New account");
  }

  let riskLevel = "LOW";
  if (score >= 60) riskLevel = "HIGH";
  else if (score >= 30) riskLevel = "MEDIUM";

  return {
    riskScore: score,
    riskLevel,
    reasons
  };
}*/

/*async function handleSendMoney() {
  const amount = qs("amount").value.trim();
  const recipient = qs("recipient").value.trim();
  const statusBox = qs("statusBox");

  statusBox.classList.add("hidden");
  statusBox.innerText = "";

  if (!validateSendForm(amount, recipient)) return;

  // Fraud analysis (simulated)

  statusBox.classList.remove("hidden");

  if (analysis.risk === "HIGH") {
    statusBox.style.background = "#fff7ed";
    statusBox.style.color = "#9a3412";
    statusBox.innerText =
      "⚠️ Transaction held: " + analysis.reason;
  } else {
    statusBox.style.background = "#dcfce7";
    statusBox.style.color = "#166534";
    statusBox.innerText =
      "✅ Transaction accepted after fraud analysis";

    // Update local balance
    AppState.user.balance -= Number(amount);
  }

  // Store transaction
  AppState.transactions.outgoing.push({
    amount,
    recipient,
    risk: analysis.risk,
    time: new Date().toLocaleString()
  });

  // 🔥 SAVE TRANSACTION TO FIREBASE
await saveToFirebase({
  amount: Number(amount),
  recipient: recipient,
  risk: analysis.risk,
  status: analysis.risk === "HIGH" ? "HELD" : "APPROVED",
  createdAt: new Date()
});

const txn = {
  amount: Number(amount),
  locationMismatch: country !== AppState.user.country,
  txnCount24h: AppState.user.txnCount24h || 0,
  newRecipient: true,        // demo: first time
  deviceMismatch: true,      // demo
  oddTime: new Date().getHours() < 6,
  newAccount: AppState.user.accountAge < 30
};

const box = document.getElementById("riskBox");
box.classList.remove("hidden");

box.innerHTML = `
  <h4>🧠 Fraud Analysis</h4>
  <p><b>Risk Score:</b> ${analysis.riskScore}</p>
  <p><b>Risk Level:</b> ${analysis.riskLevel}</p>
  <ul>
    ${analysis.reasons.map(r => `<li>${r}</li>`).join("")}
  </ul>
`;


const analysis = simulateFraudAnalysis(amount);
console.log("🧠 Fraud analysis:", analysis);



}*/

/*async function handleSendMoney() {

  const amount = qs("amount").value.trim();
  const recipient = qs("recipient").value.trim();
  const statusBox = qs("statusBox");

  statusBox.classList.add("hidden");
  statusBox.innerText = "";

  if (!validateSendForm(amount, recipient)) return;

  /* ===============================
     STEP 1️⃣ FRAUD ANALYSIS (FIRST)
     =============================== */

  /*const txnContext = {
  amount: Number(amount),
  newRecipient: true,
  oddTime: new Date().getHours() < 6,
  locationMismatch: false,
  newAccount: false
};

const analysis = analyzeFraud(txnContext);*/

  /* ===============================
     STEP 2️⃣ SHOW RESULT UI
     =============================== */
  /*statusBox.classList.remove("hidden");

  if (analysis.riskLevel === "HIGH") {
    statusBox.style.background = "#fff7ed";
    statusBox.style.color = "#9a3412";
    statusBox.innerHTML = `
      ⚠️ Transaction Held<br>
      <b>Risk Score:</b> ${analysis.riskScore}<br>
      <b>Reasons:</b>
      <ul>${analysis.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
    `;
  } else {
    statusBox.style.background = "#dcfce7";
    statusBox.style.color = "#166534";
    statusBox.innerHTML = `
      ✅ Transaction Approved<br>
      <b>Risk Score:</b> ${analysis.riskScore}
    `;

    AppState.user.balance -= Number(amount);
  }
  statusBox.innerHTML = `
  <b>Risk Score:</b> ${analysis.riskScore}<br>
  <b>Risk Level:</b> ${analysis.riskLevel}<br>
  <ul>
    ${analysis.reasons.map(r => `<li>${r}</li>`).join("")}
  </ul>
`;*/


  /* ===============================
     STEP 3️⃣ SAVE TRANSACTION
     =============================== */
  /*await saveToFirebase({
    amount: Number(amount),
    recipient,
    risk: analysis.riskLevel,
    riskScore: analysis.riskScore,
    reasons: analysis.reasons,
    status: analysis.riskLevel === "HIGH" ? "HELD" : "APPROVED",
    createdAt: new Date()
  });
}*/

async function handleSendMoney() {

  const amount = Number(qs("amount").value);
  const recipient = qs("recipient").value;

  // (B) transaction context
  const context = {
  amount: Number(amount),
  isNewRecipient: !(
  Array.isArray(AppState.knownRecipients) &&
  AppState.knownRecipients.includes(recipient)),
  hour: new Date().getHours(),
  locationMismatch: true, // demo / from Firestore
  txnCount24h: AppState.user.txnCount24h || 0,
  accountAge: AppState.user.accountAge || 20
};

const analysis = analyzeFraud(context);

  // (C) FRAUD ANALYSIS (IMPORTANT)
  //const analysis = analyzeFraud(txnContext);

  // (D) UI show
  statusBox.classList.remove("hidden");
  statusBox.innerHTML = `
    <b>Risk Score:</b> ${analysis.riskScore}<br>
    <b>Risk Level:</b> ${analysis.riskLevel}
    <ul>
      ${analysis.reasons.map(r => `<li>${r}</li>`).join("")}
    </ul>
  `;

  // 🔥 (E) FIRESTORE SAVE — यही STEP 4 है
  await addDoc(collection(db, "transactions"), {
    amount,
    recipient,
    risk: analysis.riskLevel,
    riskScore: analysis.riskScore,
    reasons: analysis.reasons,
    status: analysis.riskLevel === "HIGH" ? "BLOCKED" : "APPROVED",
    createdAt: new Date()
  });

  if (!AppState.knownRecipients.includes(recipient)) {
  AppState.knownRecipients.push(recipient);}

  AppState.user.balance -= amount;
  if (typeof userData.balance === "number" && userData.balance > 0) {
  AppState.user.balance = userData.balance;
}


  document.getElementById("profileBalance").innerText =
  "₹" + AppState.user.balance.toLocaleString();



}

/* Attach listener */
document.addEventListener("DOMContentLoaded", () => {
  const btn = qs("payBtn");
  if (btn) btn.addEventListener("click", handleSendMoney);
});


/* =========================================================
   RECEIVE MONEY (SIMULATED)
========================================================= */

function simulateIncomingTransaction() {
  const txn = {
    from: "Rahul",
    amount: 20000,
    location: "Nepal",
    risk: "MEDIUM",
    reason: "New location"
  };

  AppState.transactions.incoming.push(txn);
}

/* =========================================================
   REQUEST HANDLING
========================================================= */

function handleRequest(action) {
  if (action === "ACCEPT") {
    showAlert("Request accepted");
  } else {
    showAlert("Request rejected");
  }

  // Backend hook here
}

/* =========================================================
   AUTO CREDIT LOGIC
========================================================= */

function isTrustedSource(sender) {
  // Dummy logic – backend will decide
  return sender === "SalaryAccount";
}

function autoCredit(txn) {
  if (isTrustedSource(txn.from)) {
    AppState.user.balance += txn.amount;
  }
}

/* =========================================================
   FRAUD ALERTS
========================================================= */

function generateFraudAlert(reason) {
  console.warn("Fraud Alert:", reason);
  // UI hook can be added
}

/* =========================================================
   SETTINGS HANDLERS
========================================================= */

function toggleSetting(name, value) {
  console.log("Setting changed:", name, value);
  // Backend sync later
}

/* =========================================================
   DASHBOARD HELPERS
========================================================= */

async function loadUserProfile() {
  console.log("👤 loadUserProfile CALLED");
  console.log("BALANCE CHECK →", AppState.user.balance);


  const userId = "FS1023"; // abhi hardcoded

  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    console.error("❌ User document not found");
    return;
  }

  const userData = docSnap.data();
  console.log("📦 userData from Firestore:", userData);

  // SAVE USER
  AppState.user = userData;
  AppState.user.role = userData.role || "user";

  console.log("🧠 User role set to:", AppState.user.role);

  // Profile balance
  const bal = document.getElementById("profileBalance");
  if (bal) {
    bal.innerText = AppState.user.balance.toLocaleString("en-IN");
  }

  // UI update call
  applyRoleBasedUI();
}

function loadDashboard() {
  showSection("dashboard");
  loadFraudAnalytics(); // 👈 ADD THIS
}

/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

async function saveToFirebase(txn) {
  try {
    await addDoc(
      collection(db, "transactions"),
      txn
    );
    console.log("✅ Transaction saved to Firestore");
  } catch (err) {
    console.error("❌ Firestore error:", err);
  }
}

function applyRoleBasedUI() {
  console.log("🎭 applyRoleBasedUI CALLED");
  console.log("🎭 Current role:", AppState.user.role);

  if (AppState.user.role !== "admin") {
    const fraudTab = document.getElementById("fraudAlertsNav");
    if (fraudTab) fraudTab.style.display = "none";
  }
}


/* =========================================================
   BACKEND INTEGRATION PLACEHOLDERS
========================================================= */

/*
fetch("/api/send", {
  method: "POST",
  body: JSON.stringify({...})
})
.then(res => res.json())
.then(data => updateUI(data));
*/

/* =========================================================
   DEBUG (REMOVE IN PROD)
========================================================= */



console.log("FraudShield AI frontend loaded");

// ===============================
// INCOMING TRANSACTIONS LOADER
// ===============================


function loadIncomingTransactions() {
  const tbody = document.getElementById("incomingBody");
  if (!tbody) return;

  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    tbody.innerHTML = "";

    snapshot.forEach((doc) => {
      const d = doc.data();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.createdAt?.toDate().toLocaleString()}</td>
        <td>₹${d.amount}</td>
        <td>${d.recipient}</td>
        <td>
       <span class="badge badge-${d.risk.toLowerCase()}">
      ${d.risk}</span></td>
      <td>${d.status}</td>`;
      tbody.appendChild(tr);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadIncomingTransactions();
});

// 🔹 Sidebar navigation fix
/*window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
};
*/

function loadFraudAlerts() {
  console.log("🚨 loadFraudAlerts CALLED");

  const body = document.getElementById("fraudAlertsBody");
  if (!body) return;

  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    body.innerHTML = "";
    ALL_TRANSACTIONS = []; // 🔥 RESET

    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const isHigh = d.risk === "HIGH";

      ALL_TRANSACTIONS.push(d); // 🔥 COLLECT DATA

      if (d.risk === "HIGH") {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${d.createdAt?.toDate().toLocaleString()}</td>
        <td>₹${d.amount}</td>
        <td>${d.recipient}</td>
        <td><span class="badge badge-high">HIGH</span></td>
        <td>${d.status}</td>
        <td>
          ${
            isHigh
              ? `
                <button class="action-btn review-btn"
                  onclick="reviewTxn('${docSnap.id}')">Review</button>

                <button class="action-btn block-btn"
                  onclick="blockTxn('${docSnap.id}')">Block</button>
              `
              : "-"
          }
        </td>
      `;
        body.appendChild(tr);
      }
    });

    // 🔥 GRAPH CALL — ONLY ONCE
    loadFraudAnalytics(ALL_TRANSACTIONS);
  });
}

/*function loadFraudAlerts() {
  console.log("🚀 loadFraudAlerts() CALLED");

  const body = document.getElementById("fraudAlertsBody");
  console.log("tbody:", body);

  onSnapshot(collection(db, "transactions"), (snapshot) => {
    console.log("📦 snapshot size:", snapshot.size);
  });
}*/

setTimeout(() => {
  console.log("⏱ calling loadFraudAlerts");
  loadFraudAlerts();
}, 1000);


/*document.addEventListener("DOMContentLoaded", () => {
loadFraudAlerts();
});*/

async function markReviewed(id) {
  await updateDoc(doc(db, "transactions", id), {
    status: "REVIEWED"
  });
  alert("Transaction marked as REVIEWED");
}

async function blockTxn(id) {
  await updateDoc(doc(db, "transactions", id), {
    status: "BLOCKED"
  });
  alert("Transaction BLOCKED");
}

window.markReviewed = async function (id) {
  await updateDoc(doc(db, "transactions", id), {
    status: "REVIEWED"
  });
};

window.blockTxn = async function (id) {
  await updateDoc(doc(db, "transactions", id), {
    status: "BLOCKED"
  });
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("FraudShield AI frontend loaded");
  loadUserProfile();
});

const allTxns = [];

function loadFraudAnalytics(transactions) {
  console.log("📊 loadFraudAnalytics", transactions);

  if (!transactions || transactions.length === 0) {
    console.log("❌ No analytics data");
    return;
  }

  const high = transactions.filter(t => t.risk === "HIGH").length;
  const medium = transactions.filter(t => t.risk === "MEDIUM").length;
  const low = transactions.filter(t => t.risk === "LOW").length;

const canvas = document.getElementById("fraudChart");
if (!canvas) return;

// 🔥 GLOBAL reference use karo
if (window.fraudChartInstance) {
  window.fraudChartInstance.destroy();
}

window.fraudChartInstance = new Chart(canvas, {
  type: "pie",
  data: {
    labels: ["High Risk", "Medium Risk", "Low Risk"],
    datasets: [{
      data: [high, medium, low],
      backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false   // ✅ chart chhota rahega
  }
});

console.log("✅ Fraud analytics chart rendered");

}

function reviewTxn(txnId) {
  alert("Reviewing transaction: " + txnId);
  // future: open modal / mark as reviewed
}

/*async function blockTxn(txnId) {
  if (!confirm("Block this transaction?")) return;

  await updateDoc(doc(db, "transactions", txnId), {
    status: "BLOCKED"
  });

  alert("Transaction blocked");
}
*/

// ====== MAKE ACTION FUNCTIONS GLOBAL ======
window.reviewTxn = function (txnId) {
  alert("🔍 Reviewing transaction: " + txnId);
};

window.blockTxn = function (txnId) {
  const ok = confirm("🚫 Block this transaction?");
  if (!ok) return;

  alert("⛔ Transaction blocked: " + txnId);
};


/*function logout() {
  AppState.user = null;

  // Clear UI
  document.getElementById("profileName").innerText = "";
  document.getElementById("profileEmail").innerText = "";
  document.getElementById("profileJoined").innerText = "";
  document.getElementById("profileBalance").innerText = "";
  document.getElementById("profileRole").innerText = "";

  alert("Logged out successfully");
}*/

// ===== UI ACTIONS (GLOBAL SAFE) =====

// =====================
// FINAL UI FUNCTIONS
// =====================

// Section switcher
function showSection(id, el) {
  document.querySelectorAll(".section").forEach(sec =>
    sec.classList.add("hidden")
  );

  const active = document.getElementById(id);
  if (active) active.classList.remove("hidden");

  // Sidebar active class
  document.querySelectorAll(".sidebar li").forEach(li =>
    li.classList.remove("active")
  );
  if (el) el.classList.add("active");

  if (id === "alerts") loadFraudAlerts();
}

// Balance toggle
function toggleBalance() {
  const el = document.getElementById("balanceAmount");
  if (!el) return;
  el.classList.toggle("hidden");
}

// Profile dropdown
function toggleProfile(e) {
  e.stopPropagation();
  const box = document.getElementById("profileDropdown");
  if (!box) return;
  box.classList.toggle("hidden");
}

// Logout
function logout() {
  alert("Logged out successfully (demo)");
  window.location.reload();
}

// Close profile on outside click
document.body.addEventListener("click", () => {
  const box = document.getElementById("profileDropdown");
  if (box) box.classList.add("hidden");
});

// =====================
// EXPOSE TO HTML
// =====================
window.showSection = showSection;
window.toggleBalance = toggleBalance;
window.toggleProfile = toggleProfile;
window.logout = logout;
window.switchProfile = switchProfile;
window.handleRequest = handleRequest;


document.addEventListener("DOMContentLoaded", () => {

  // BALANCE
  const balanceBtn = document.getElementById("balanceBtn");
  const balanceAmount = document.getElementById("balanceAmount");

  if (balanceBtn && balanceAmount) {
    balanceBtn.addEventListener("click", () => {
      balanceAmount.classList.toggle("hidden");
    });
  }

  // PROFILE DROPDOWN
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      profileDropdown.classList.add("hidden");
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      alert("Logged out (demo)");
      location.reload();
    });
  }

});

/* ===============================
   TOP BAR FUNCTIONS (FIX)
================================ */

// Show / Hide Balance
/*function toggleBalance() {
  const el = document.getElementById("balanceAmount");
  if (!el) return;

  el.classList.toggle("hidden");
  el.innerText = "₹" + AppState.user.balance.toLocaleString("en-IN");
}*/

// Open / Close Profile Dropdown
/*function toggleProfile(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("profileDropdown");
  if (!dropdown) return;

  dropdown.classList.toggle("hidden");
}

// Logout
function logout() {
  alert("Logged out successfully (demo)");
  location.reload(); // demo logout
}
*/
// Close profile if clicked outside
document.addEventListener("click", () => {
  const dropdown = document.getElementById("profileDropdown");
  if (dropdown) dropdown.classList.add("hidden");
});


/*function renderFraudChart(high, medium, low) {
  const canvas = document.getElementById("fraudChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Destroy old chart if exists
  if (window.fraudChartInstance) {
    window.fraudChartInstance.destroy();
  }

  window.fraudChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["High Risk", "Medium Risk", "Low Risk"],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false   // 🔥 YAHI STEP 3 HAI
    }
  });
}*/
