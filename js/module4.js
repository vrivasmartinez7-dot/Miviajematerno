import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./firebase.js";

/* ── STATE ── */
let currentStep = 0;
const totalSteps = 8;
const completed = new Set();

/* ── PERFIL NAV ── */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const firstName = docSnap.data().name.split(" ")[0];
      const profileName = document.getElementById("profile-name");
      if (profileName) profileName.textContent = `Hola, ${firstName}`;
      const navAvatar = document.getElementById("nav-avatar");
      if (navAvatar) navAvatar.textContent = firstName.charAt(0).toUpperCase();
    }
  }
});

/* ── NAVIGATION ── */
function navigate(dir) {
  completed.add(currentStep);
  const next = currentStep + dir;
  if (next < 0 || next >= totalSteps) return;
  showStep(next);
}

function showStep(idx) {
  document.getElementById('panel-' + currentStep).classList.remove('active');
  document.getElementById('panel-' + idx).classList.add('active');

  const tabs = document.querySelectorAll('.step-tab');
  tabs[currentStep].classList.remove('active');
  if (completed.has(currentStep)) tabs[currentStep].classList.add('done');
  tabs[idx].classList.add('active');
  tabs[idx].classList.remove('done');

  currentStep = idx;
  updateNavButtons();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.step-tab').forEach(btn => {
  btn.addEventListener('click', () => showStep(parseInt(btn.dataset.step)));
});

function updateNavButtons() {
  document.getElementById('btn-prev').disabled = currentStep === 0;
  const nextBtn = document.getElementById('btn-next');
  nextBtn.textContent = currentStep === totalSteps - 1 ? 'Finalizar ✓' : 'Siguiente →';
  document.getElementById('step-indicator').textContent = `Sección ${currentStep + 1} de ${totalSteps}`;
}

function updateProgress() {
  const pct = Math.round((completed.size / totalSteps) * 100);
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-bar').style.width = pct + '%';
}

/* ── BIENVENIDA — semana input ── */
const babyPills = {
  32: '🥦 Tu bebé tiene el tamaño de un brócoli',
  33: '🍍 Tu bebé tiene el tamaño de una piña',
  34: '🎃 Tu bebé tiene el tamaño de un zapallo italiano grande'
};

document.getElementById('week-input').addEventListener('input', function () {
  const w = Math.min(34, Math.max(32, parseInt(this.value) || 32));
  document.getElementById('welcome-subtitle').textContent = `Semana ${w} de embarazo`;
  document.getElementById('avatar-week-label').textContent = w;
  document.getElementById('baby-size-pill').textContent = babyPills[w];
});

/* ── BEBÉ SEMANA A SEMANA ── */
const babyData = {
  32: {
    fruit: '🥦', title: 'Semana 32',
    size: 'Tamaño: 42 cm · Peso: 1.700 g (como un brócoli grande)',
    desc: 'Tu bebé practica la respiración moviendo su diafragma. Sus huesos se están endureciendo, aunque el cráneo sigue siendo flexible para facilitar el parto. Además, sus movimientos son cada vez más coordinados.',
    fact: '✨ El iris de tu bebé tiene un color azulado, pero el color definitivo de sus ojos se sabrá unos meses después del nacimiento.'
  },
  33: {
    fruit: '🍍', title: 'Semana 33',
    size: 'Tamaño: 44 cm · Peso: 1.900 g (como una piña)',
    desc: 'Su piel se va volviendo menos translúcida a medida que acumula grasa. Tu bebé crece y disminuye el líquido amniótico.',
    fact: '✨ ¡Tu bebé distingue tu voz de todas las demás!'
  },
  34: {
    fruit: '🎃', title: 'Semana 34',
    size: 'Tamaño: 45 cm · Peso: 2.100 g (como un zapallo italiano grande)',
    desc: 'Tu bebé puede que tenga bastante cabello sobre su cabeza. Sus uñas han crecido hasta los dedos y sus ojos pueden enfocar objetos cercanos. En estas semanas muchos bebés ya están en posición cefálica.',
    fact: '✨ La grasa subcutánea aumenta, dándole a tu bebé ese aspecto más redondeado y rosado.'
  }
};

document.querySelectorAll('.baby-week-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.baby-week-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const d = babyData[this.dataset.baby];
    document.getElementById('baby-fruit').textContent = d.fruit;
    document.getElementById('baby-title').textContent = d.title;
    document.getElementById('baby-size-text').textContent = d.size;
    document.getElementById('baby-desc').textContent = d.desc;
    document.getElementById('baby-fact').textContent = d.fact;
  });
});

/* ── SEÑALES (puerperio + RN) ── */
document.querySelectorAll('.signal-card').forEach(card => {
  const correct = card.dataset.answer;
  card.querySelectorAll('.signal-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (card.classList.contains('revealed')) return;
      card.classList.add('revealed');
      const chosen = this.dataset.val;
      card.querySelectorAll('.signal-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.val === correct) b.classList.add('selected-correct');
        else if (b === this && chosen !== correct) b.classList.add('selected-wrong');
      });
    });
  });
});

/* ── ACORDEÓN HÁBITOS ── */
document.querySelectorAll('.habit-card').forEach(card => {
  card.querySelector('.habit-header').addEventListener('click', function () {
    const isOpen = card.classList.contains('open');
    const grid = card.closest('.habits-grid');
    if (grid) grid.querySelectorAll('.habit-card').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  });
});

/* ── MITOS ── */
document.querySelectorAll('.myth-card').forEach(card => {
  const correct = card.dataset.answer;
  card.querySelectorAll('.myth-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (card.classList.contains('revealed-true') || card.classList.contains('revealed-false')) return;
      const chosen = this.dataset.val;
      if (chosen === correct) {
        card.classList.add('revealed-true');
        this.classList.add('selected-true');
      } else {
        card.classList.add('revealed-false');
        this.classList.add('selected-false');
      }
    });
  });
});

/* ── EMOCIÓN ── */
const emoData = {
  feliz: {
    title: '¡Qué hermoso es estar bien! 🌸',
    msg: 'Aprovecha esta vitalidad para conectar con tu bebé. Habla con él, cuéntale de tu día o ponle música suave.',
    tip: '💡 Habla con tu bebé, cuéntale de tu día o ponle música suave. Ya te reconoce.'
  },
  ansiosa: {
    title: 'Es normal tener miedo 🤍',
    msg: 'El embarazo trae muchas preguntas y eso también es válido. Informarte, como lo estás haciendo ahora, es una forma de cuidarte.',
    tip: '💡 Escribe en un papel lo que te preocupa y cuéntaselo a alguien de confianza o a tu matrona.'
  },
  cansada: {
    title: 'Tu cuerpo está haciendo un trabajo enorme ✨',
    msg: 'El cansancio en esta etapa final es real y completamente válido. Tu única tarea ahora mismo es prepararte para el gran encuentro.',
    tip: '💡 Descansa sin culpa. Pide ayuda con las tareas del hogar. Tus ratos de pausa son necesarios.'
  },
  ambivalente: {
    title: 'Sentir alegría y miedo al mismo tiempo es muy frecuente 🌊',
    msg: 'No hay emociones incorrectas. Todos esos sentimientos son válidos y forman parte de este proceso tan único.',
    tip: '💡 Practica 5 minutos de respiración profunda: inhala 4 tiempos y exhala 6 tiempos.'
  },
  sola: {
    title: 'Mereces acompañamiento 💜',
    msg: 'Hay redes de apoyo disponibles para ti. No tienes que atravesar esto sola.',
    tip: '💡 Habla con tu matrona: ella puede conectarte con apoyo psicosocial en tu CESFAM.'
  },
  curiosa: {
    title: 'Tu vínculo con tu bebé ya está floreciendo 🌱',
    msg: 'Sentirte curiosa y conectada es una señal hermosa de vínculo prenatal. Esa curiosidad beneficia tanto a tu bienestar como al de tu bebé.',
    tip: '💡 Dedica 5 minutos al día a tocar tu pancita y respirar. Ese tiempo es tuyo y de tu bebé.'
  }
};

document.querySelectorAll('.emotion-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    const d = emoData[this.dataset.emo];
    document.getElementById('emo-title').textContent = d.title;
    document.getElementById('emo-msg').textContent = d.msg;
    document.getElementById('emo-tip').textContent = d.tip;
    document.getElementById('emotion-response').classList.add('show');
  });
});

/* ── QUIZ (6 preguntas, índices 0–5) ── */
const quizAnswers = { 0: 'b', 1: 'b', 2: 'b', 3: 'c', 4: 'b', 5: 'b' };
const userAnswers = {};

document.querySelectorAll('.quiz-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    const q = parseInt(this.dataset.q);
    const val = this.dataset.val;
    if (userAnswers[q] !== undefined) return;
    userAnswers[q] = val;

    document.querySelectorAll(`.quiz-opt[data-q="${q}"]`).forEach(s => {
      s.disabled = true;
      if (s.dataset.val === quizAnswers[q]) s.classList.add('correct');
      else if (s === this) s.classList.add('wrong');
    });
    document.getElementById('fb-' + q).classList.add('show');
  });
});

document.getElementById('quiz-submit-btn').addEventListener('click', function () {
  if (Object.keys(userAnswers).length < 6) {
    alert('Por favor responde todas las preguntas antes de ver tus resultados.');
    return;
  }
  let score = 0;
  for (let q in quizAnswers) { if (userAnswers[q] === quizAnswers[q]) score++; }

  document.getElementById('quiz-container').style.display = 'none';
  const result = document.getElementById('quiz-result');
  result.classList.add('show');
  document.getElementById('quiz-score-text').textContent = `Obtuviste ${score} de 6`;
  document.getElementById('quiz-msg').textContent =
    score === 6
      ? '¡Perfecto! Has completado tu viaje materno digital. Estás preparada para recibir a tu bebé con amor, información y confianza. ¡Felicitaciones!'
      : score >= 4
      ? '¡Muy bien! Tienes una base muy sólida. Puedes repasar las secciones donde tuviste dudas. ¡Felicitaciones por completar los 4 módulos!'
      : 'Has completado todos los módulos. Te recomendamos repasar las secciones donde tuviste dudas. ¡Cada aprendizaje cuenta!';

  completed.add(7);
  updateProgress();

  // GUARDAR EN FIREBASE QUE EL MÓDULO 4 ESTÁ COMPLETADO
const user = auth.currentUser;
if (user) {
  const docRef = doc(db, "users", user.uid);
  getDoc(docRef).then(docSnap => {
    if (docSnap.exists()) {
      const moduleName = "module4";
      let modulesCompleted = docSnap.data().modulesCompleted || [];
      if (!modulesCompleted.includes(moduleName)) {
        modulesCompleted.push(moduleName);
        updateDoc(docRef, { modulesCompleted: modulesCompleted });
      }
    }
  });
}
  document.getElementById('btn-finish').addEventListener('click', () => { window.location.href = '../pages/dashboard.html'; });

});

/* ── BOTONES DE NAVEGACIÓN ── */
document.getElementById('btn-prev').addEventListener('click', () => navigate(-1));
document.getElementById('btn-next').addEventListener('click', () => {
  if (currentStep === totalSteps - 1) {
    window.location.href = "../pages/dashboard.html";
  } else {
    navigate(1);
  }
});