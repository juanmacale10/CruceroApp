import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyDL-RgYFY5qgeb9R_NLbK-1o8n7IkyzJSU",
  authDomain: "cruceroapp-afe80.firebaseapp.com",
  projectId: "cruceroapp-afe80",
  storageBucket: "cruceroapp-afe80.firebasestorage.app",
  messagingSenderId: "352836142072",
  appId: "1:352836142072:web:ad74ceb9b8fbefbac54c0d",
  measurementId: "G-M4C72HQXPQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 📦 ESTADO */
let codigoViaje = "";
let personas = [];

/* 🚀 INIT */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const viajeURL = params.get("viaje");

  if (viajeURL) {
    entrar(viajeURL);
  }
});

/* 🚪 ENTRAR AL VIAJE */
window.entrar = function (codigo) {
  codigoViaje = codigo || document.getElementById("codigoViaje").value.trim();
  if (!codigoViaje) return;

  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("tituloViaje").innerText = codigoViaje;

  const ref = doc(db, "viajes", codigoViaje);

  onSnapshot(ref, (snap) => {
  if (snap.exists()) {
    personas = snap.data().personas || [];
  } else {
    personas = [];
  }
  render();
});

};

/* 💾 GUARDAR */
async function guardar() {
  if (!codigoViaje) return;
  const ref = doc(db, "viajes", codigoViaje);
  await setDoc(ref, { personas });
}

/* 👤 AGREGAR PERSONA */
window.agregarPersona = async function () {
  const nombre = prompt("Nombre de la persona");
  if (!nombre) return;

  personas.push({
    nombre,
    gastos: []
  });

  await guardar();
};


/* 💸 AGREGAR GASTO */
window.agregarGasto = function (i) {
  const concepto = prompt("Concepto");
  const monto = Number(prompt("Monto"));

  if (!concepto || isNaN(monto)) return;

  personas[i].gastos.push({ concepto, monto });
  guardar();
};

/* 🎨 RENDER */
function render() {
  const cont = document.getElementById("personas");
  cont.innerHTML = "";

  let totalGeneral = 0;

 personas.forEach((p, i) => {
  const total = p.gastos.reduce((a, g) => a + g.monto, 0);
  totalGeneral += total;

  const gastosHTML = p.gastos.map(g => `
    <div style="display:flex;justify-content:space-between;padding:4px 0">
      <span>${g.concepto}</span>
      <strong>$${g.monto}</strong>
    </div>
  `).join("");

  cont.innerHTML += `
    <div style="border:1px solid #ccc;padding:10px;margin-bottom:10px">
      <h3>${p.nombre}</h3>

      ${gastosHTML || "<em>Sin gastos</em>"}

      <div style="margin-top:8px;font-weight:bold">
        Total: $${total}
      </div>

      <button onclick="agregarGasto(${i})">Agregar gasto</button>
    </div>
  `;
});


  document.getElementById("totalGeneral").innerText = totalGeneral;
}
