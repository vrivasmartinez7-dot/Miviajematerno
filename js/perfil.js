import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./firebase.js";

/* ── CARGAR DATOS ── */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const data = docSnap.data();

  // Nombre en nav
  const firstName = data.name.split(" ")[0];
  const profileName = document.getElementById("profile-name");
  if (profileName) profileName.textContent = `Hola, ${firstName}`;

  // Avatar nav
  const navAvatar = document.getElementById("nav-avatar");

  // Foto de perfil
  if (data.photoURL) {
    document.getElementById("perfil-foto").src = data.photoURL;
    document.getElementById("perfil-foto").style.display = "block";
    document.getElementById("perfil-inicial").style.display = "none";
    if (navAvatar) {
      navAvatar.innerHTML = `<img src="${data.photoURL}" alt="perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
  } else {
    document.getElementById("perfil-inicial").textContent = firstName.charAt(0).toUpperCase();
    if (navAvatar) navAvatar.textContent = firstName.charAt(0).toUpperCase();
  }

  // Encabezado
  document.getElementById("perfil-nombre-header").textContent = data.name;
  document.getElementById("perfil-cesfam-header").textContent = data.cesfam || "";

  // Datos personales — vista
  document.getElementById("view-nombre").textContent = data.name || "—";
  document.getElementById("view-rut").textContent = data.rut || "—";
  document.getElementById("view-cesfam").textContent = data.cesfam || "—";

  // Datos personales — inputs
  document.getElementById("edit-nombre").value = data.name || "";
  document.getElementById("edit-rut").value = data.rut || "";
  document.getElementById("edit-cesfam").value = data.cesfam || "";

  // Embarazo
  if (data.fur) {
    const furDate = new Date(data.fur + "T00:00:00");
    const today = new Date();
    const days = Math.floor((today - furDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;

    const fpp = new Date(furDate);
    fpp.setDate(fpp.getDate() + 280);

    document.getElementById("view-fur").textContent = furDate.toLocaleDateString("es-CL");
    document.getElementById("view-semanas").textContent = `${weeks} semanas + ${remainingDays} días`;
    document.getElementById("view-fpp").textContent = fpp.toLocaleDateString("es-CL");
    document.getElementById("edit-fur").value = data.fur;
  }

  // Módulos completados
  const modulesCompleted = data.modulesCompleted || [];
  ["module1", "module2", "module3", "module4"].forEach(mod => {
    const row = document.getElementById(`row-${mod}`);
    const estado = document.getElementById(`estado-${mod}`);
    if (modulesCompleted.includes(mod)) {
      row.classList.add("completado");
      estado.textContent = "✓ Completado";
    }
  });
});

/* ── FOTO DE PERFIL ── */

document.getElementById("foto-input").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (e) {
    const base64 = e.target.result;

    // Mostrar en el avatar
    document.getElementById("perfil-foto").src = base64;
    document.getElementById("perfil-foto").style.display = "block";
    document.getElementById("perfil-inicial").style.display = "none";

    // Actualizar nav
    const navAvatar = document.getElementById("nav-avatar");
    if (navAvatar) {
      navAvatar.innerHTML = `<img src="${base64}" alt="perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }

    // Guardar en Firestore
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { photoURL: base64 });
    }
  };
  reader.readAsDataURL(file);
});

/* ── EDITAR DATOS PERSONALES ── */

document.getElementById("btn-edit-personal").addEventListener("click", () => {
  document.getElementById("view-personal").style.display = "none";
  document.getElementById("edit-personal").style.display = "block";
  document.getElementById("btn-edit-personal").style.display = "none";
});

document.getElementById("btn-cancel-personal").addEventListener("click", () => {
  document.getElementById("view-personal").style.display = "block";
  document.getElementById("edit-personal").style.display = "none";
  document.getElementById("btn-edit-personal").style.display = "inline-block";
});

document.getElementById("btn-save-personal").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const nombre = document.getElementById("edit-nombre").value.trim();
  const rut = document.getElementById("edit-rut").value.trim();
  const cesfam = document.getElementById("edit-cesfam").value.trim();

  if (!nombre) {
    alert("El nombre no puede quedar vacío.");
    return;
  }

  const docRef = doc(db, "users", user.uid);
  await updateDoc(docRef, { name: nombre, rut: rut, cesfam: cesfam });

  // Actualizar vista
  document.getElementById("view-nombre").textContent = nombre || "—";
  document.getElementById("view-rut").textContent = rut || "—";
  document.getElementById("view-cesfam").textContent = cesfam || "—";
  document.getElementById("perfil-nombre-header").textContent = nombre;
  document.getElementById("perfil-cesfam-header").textContent = cesfam;

  document.getElementById("view-personal").style.display = "block";
  document.getElementById("edit-personal").style.display = "none";
  document.getElementById("btn-edit-personal").style.display = "inline-block";
});

/* ── EDITAR EMBARAZO ── */

document.getElementById("btn-edit-embarazo").addEventListener("click", () => {
  document.getElementById("view-embarazo").style.display = "none";
  document.getElementById("edit-embarazo").style.display = "block";
  document.getElementById("btn-edit-embarazo").style.display = "none";
});

document.getElementById("btn-cancel-embarazo").addEventListener("click", () => {
  document.getElementById("view-embarazo").style.display = "block";
  document.getElementById("edit-embarazo").style.display = "none";
  document.getElementById("btn-edit-embarazo").style.display = "inline-block";
});

document.getElementById("btn-save-embarazo").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const fur = document.getElementById("edit-fur").value;
  if (!fur) {
    alert("Por favor ingresa la fecha de última regla.");
    return;
  }

  const docRef = doc(db, "users", user.uid);
  await updateDoc(docRef, { fur: fur });

  // Recalcular y actualizar vista
  const furDate = new Date(fur + "T00:00:00");
  const today = new Date();
  const days = Math.floor((today - furDate) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  const fpp = new Date(furDate);
  fpp.setDate(fpp.getDate() + 280);

  document.getElementById("view-fur").textContent = furDate.toLocaleDateString("es-CL");
  document.getElementById("view-semanas").textContent = `${weeks} semanas + ${remainingDays} días`;
  document.getElementById("view-fpp").textContent = fpp.toLocaleDateString("es-CL");

  document.getElementById("view-embarazo").style.display = "block";
  document.getElementById("edit-embarazo").style.display = "none";
  document.getElementById("btn-edit-embarazo").style.display = "inline-block";
});