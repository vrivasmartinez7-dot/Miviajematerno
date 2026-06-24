import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "./firebase.js";


// ─────────────────────────────────────────
// MENÚ
// ─────────────────────────────────────────

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}


// ─────────────────────────────────────────
// CALCULAR EDAD GESTACIONAL
// ─────────────────────────────────────────

const furInput = document.getElementById("fur");

if (furInput) {
  furInput.addEventListener("change", () => {

    const furDate = new Date(furInput.value);
    const today = new Date();

    // Diferencia en milisegundos → días
    const difference = today - furDate;
    const daysPregnant = Math.floor(difference / (1000 * 60 * 60 * 24));

    // Semanas y días
    const weeks = Math.floor(daysPregnant / 7);
    const days = daysPregnant % 7;

    // Calcular FPP
    const dueDate = new Date(furDate);
    dueDate.setDate(dueDate.getDate() + 280);

    // Formatear fecha
    const dueDateFormatted = dueDate.toLocaleDateString("es-CL");

    // Mostrar resultados
    document.getElementById("gestational-age").textContent =
      `Edad gestacional: ${weeks} semanas + ${days} días`;

    document.getElementById("due-date").textContent =
      `Fecha probable de parto: ${dueDateFormatted}`;

  });
}


// ─────────────────────────────────────────
// REGISTRO FIREBASE
// ─────────────────────────────────────────

const registerForm = document.getElementById("register-form");
console.log("Formulario encontrado");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Datos del formulario
      const name = document.getElementById("name").value;
      const rut = document.getElementById("rut").value;
      const fur = document.getElementById("fur").value;
      const cesfam = document.getElementById("cesfam").value;

      // Guardar en Firestore
      console.log("Guardando datos...");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        rut: rut,
        email: email,
        fur: fur,
        cesfam: cesfam,
        modulesCompleted: [],
        createdAt: new Date()
      });

      console.log("Datos guardados en Firestore");
      alert("Cuenta creada correctamente 💛");
      console.log(user);

    } catch (error) {
      alert(error.message);
      console.log(error);
    }

  });
}


// ─────────────────────────────────────────
// FAQ INTERACTIVO
// ─────────────────────────────────────────

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});


// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";

    } catch (error) {
      alert(error.message);
      console.log(error);
    }

  });
}


// ─────────────────────────────────────────
// REDIRECCIÓN AUTOMÁTICA (login/register → dashboard)
// ─────────────────────────────────────────

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (
      window.location.pathname.includes("login.html") ||
      window.location.pathname.includes("register.html")
    ) {
      window.location.href = "dashboard.html";
    }
  }
});


// ─────────────────────────────────────────
// DASHBOARD REAL
// ─────────────────────────────────────────

const userName = document.getElementById("user-name");
const profileName = document.getElementById("profile-name");
const gestationWeeks = document.getElementById("gestation-weeks");
const fppDate = document.getElementById("fpp-date");

onAuthStateChanged(auth, async (user) => {

  if (user) {

    // Obtener datos del usuario
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Nombre
      const firstName = data.name.split(" ")[0];
      if (userName) userName.textContent = `Hola, ${firstName}`;
      if (profileName) profileName.textContent = `Hola, ${firstName}`;
      
      const nombreMadre = document.getElementById("nombre-madre");
      if (nombreMadre) nombreMadre.textContent = firstName;

      const navAvatar = document.getElementById("nav-avatar");
      if (navAvatar) {
      if (data.photoURL) {navAvatar.innerHTML = `<img src="${data.photoURL}" alt="perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`; } else { navAvatar.textContent = firstName.charAt(0).toUpperCase();}}

      // FUR → edad gestacional
      const furDate = new Date(data.fur + "T00:00:00");
      const today = new Date();
      const difference = today - furDate;
      const daysPregnant = Math.floor(difference / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(daysPregnant / 7);

      if (gestationWeeks) gestationWeeks.textContent = `Semana ${weeks} de embarazo`;

      // TAMAÑO DEL BEBÉ SEGÚN SEMANA
const babySizes = {
  16: "🥑 Tu bebé tiene el tamaño de una palta",
  17: "🍐 Tu bebé tiene el tamaño de una pera",
  18: "🫑 Tu bebé tiene el tamaño de un pimentón",
  22: "🥭 Tu bebé tiene el tamaño de un mango",
  23: "🌽 Tu bebé tiene el tamaño de un choclo",
  27: "🥬 Tu bebé tiene el tamaño de una lechuga romana",
  28: "🍆 Tu bebé tiene el tamaño de una berenjena",
  32: "🥦 Tu bebé tiene el tamaño de un brócoli",
  33: "🍍 Tu bebé tiene el tamaño de una piña",
  34: "🎃 Tu bebé tiene el tamaño de un zapallo italiano grande"
};

const babySizeEl = document.getElementById("baby-size-dashboard");
if (babySizeEl) {
  babySizeEl.textContent = babySizes[weeks] || `🤰 Semana ${weeks} de embarazo`;
}

      // FPP
      const dueDate = new Date(furDate);
      dueDate.setDate(dueDate.getDate() + 280);
      const formattedDate = dueDate.toLocaleDateString("es-CL");

      if (fppDate) fppDate.textContent = formattedDate;

      // Cargar progreso de módulos
      const completedModules = data.modulesCompleted || [];
      updateProgress(completedModules);
      markCompletedModules(completedModules);

      // Cargar acompañantes
      await cargarAcompanantes(user.uid);

      if (data.photoURL) {
      const profileImg = document.getElementById("profile-img");
      if (profileImg) profileImg.src = data.photoURL;}

    }

  } else {

    // Sin sesión → redirigir si está en dashboard
    if (window.location.pathname.includes("dashboard.html")) {
      window.location.href = "login.html";
    }

  }

});


// ─────────────────────────────────────────
// BOTONES MÓDULOS
// ─────────────────────────────────────────

const module1Btn = document.getElementById("module1-btn");
const module2Btn = document.getElementById("module2-btn");
const module3Btn = document.getElementById("module3-btn");
const module4Btn = document.getElementById("module4-btn");

async function completeModule(moduleName) {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    let completed = data.modulesCompleted || [];

    // Evitar duplicados
    if (!completed.includes(moduleName)) {
      completed.push(moduleName);

      await updateDoc(docRef, { modulesCompleted: completed });
      alert("Módulo completado 💛");
      updateProgress(completed);
      markCompletedModules(completed);
    }
  }
}

if (module1Btn) module1Btn.addEventListener("click", () => completeModule("module1"));
if (module2Btn) module2Btn.addEventListener("click", () => completeModule("module2"));
if (module3Btn) module3Btn.addEventListener("click", () => completeModule("module3"));
if (module4Btn) module4Btn.addEventListener("click", () => completeModule("module4"));


// ─────────────────────────────────────────
// ACTUALIZAR PROGRESO
// ─────────────────────────────────────────

function updateProgress(completed) {

  const totalModules = 4;
  const completedModules = completed.length;
  const percent = Math.round((completedModules / totalModules) * 100);

  const progressPercent = document.getElementById("progress-percent");
  const modulesCount = document.getElementById("modules-count");
  const progressFill = document.getElementById("progress-fill");

  if (progressPercent) {
    progressPercent.textContent = `${percent}%`;
  }

  if (modulesCount) {
    modulesCount.textContent =
      `Módulos completados: ${completedModules} de ${totalModules}`;
  }

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

}

// ─────────────────────────────────────────
// MARCAR MÓDULOS COMPLETADOS
// ─────────────────────────────────────────

function markCompletedModules(completed) {

  completed.forEach(module => {

    const button = document.getElementById(`${module}-btn`);

    if (button) {

      button.textContent = "✓ Ya visitado";

      button.classList.add("module-visited");

    }

  });

}

// ─────────────────────────────────────────
// CARGAR ACOMPAÑANTES EN EL DASHBOARD
// ─────────────────────────────────────────

async function cargarAcompanantes(uid) {
  const companionsRef = collection(db, 'users', uid, 'companions');
  const snapshot = await getDocs(companionsRef);

  const list = document.getElementById('companions-list');
  const noMsg = document.getElementById('no-companions-msg');
  const verTodosBtn = document.getElementById('ver-todos-btn');

  if (!list) return;

  if (snapshot.empty) {
    if (noMsg) noMsg.style.display = 'block';
    return;
  }

  if (noMsg) noMsg.style.display = 'none';
  if (verTodosBtn && snapshot.size > 1) verTodosBtn.style.display = 'block';

  // Mostrar máximo 2 en el dashboard
  let count = 0;
  snapshot.forEach((docSnap) => {
    if (count >= 2) return;
    const c = docSnap.data();

    const photoHTML = c.photoURL
      ? `<img src="${c.photoURL}" alt="${c.name}" class="companion-photo">`
      : `<div class="companion-photo-placeholder">${c.name.charAt(0).toUpperCase()}</div>`;

    const box = document.createElement('div');
    box.className = 'companion-box';
    box.innerHTML = `
      ${photoHTML}
      <div>
        <h3>${c.name}</h3>
        <span>${c.roleLabel || 'Acompañante'}</span>
      </div>
      <button onclick="window.location.href='../pages/acompañantes.html'">
        Ver recursos
      </button>
    `;

    list.appendChild(box);
    count++;
  });
}