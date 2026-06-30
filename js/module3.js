import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./firebase.js";

/* ── STATE ── */
let currentStep = 0;
const totalSteps = 8;
const completed = new Set();

// ─────────────────────────────────────────
// MENÚ HAMBURGUESA
// ─────────────────────────────────────────

const hamburgerBtn = document.getElementById("hamburger-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
}

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
  27: '🥬 Tu bebé tiene el tamaño de una lechuga romana',
  28: '🍆 Tu bebé tiene el tamaño de una berenjena'
};

document.getElementById('week-input').addEventListener('input', function () {
  const w = Math.min(28, Math.max(27, parseInt(this.value) || 27));
  document.getElementById('welcome-subtitle').textContent = `Semana ${w} de embarazo`;
  document.getElementById('avatar-week-label').textContent = w;
  document.getElementById('baby-size-pill').textContent = babyPills[w];
});

/* ── BEBÉ SEMANA A SEMANA ── */
const babyData = {
  27: {
    fruit: '🥬', title: 'Semana 27',
    size: 'Tamaño: 36 cm · Peso: 875 g (como una lechuga romana)',
    desc: 'Tiene menos espacio para moverse y sentirás como se acomoda. Puede abrir y cerrar los ojos. Su sistema inmune comienza a madurar. Patalea con mucha fuerza y ya puedes sentir sus movimientos claramente.',
    fact: '✨ Tu bebé está recubierto por una sustancia grasosa llamada "Vernix"'
  },
  28: {
    fruit: '🍆', title: 'Semana 28',
    size: 'Tamaño: 37 cm · Peso: 1.000 g (como una berenjena)',
    desc: 'Tu bebé pesa ya aproximadamente 1 kilo. Sus pulmones están más maduros y produce surfactante. Puede soñar en fase REM. Reconoce tu voz y reacciona a estímulos sonoros del exterior.',
    fact: '✨ ¡Tu bebé ya pesa 1 kilo y puede reconocer tu voz!'
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

/* ── SEÑALES DE PARTO ── */
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

/* ── LÍNEA DE TIEMPO ── */
document.querySelectorAll('.timeline-item').forEach(item => {
  item.querySelector('.timeline-header').addEventListener('click', function () {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
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
  emocionada: {
    title: '¡Tu energía y confianza son un regalo! 🌸',
    msg: 'Estás preparándote con amor y determinación. Esa confianza es también una forma de preparar tu cuerpo para el parto.',
    tip: '💡 Practica la visualización positiva: cierra los ojos e imagínate sosteniendo a tu bebé por primera vez.'
  },
  asustada: {
    title: 'El miedo al parto es una de las emociones más comunes y válidas 🤍',
    msg: 'No estás sola. Muchas madres sienten miedo frente al parto, y eso es completamente comprensible. Conocer el proceso ayuda a reducir la ansiedad.',
    tip: '💡 Escribe tus miedos y cuéntaselos a tu matrona en tu próximo control. Tiene respuestas para cada uno de ellos.'
  },
  cansada: {
    title: 'El tercer trimestre es físicamente exigente ✨',
    msg: 'Tu cansancio es completamente real y válido. Tu cuerpo está haciendo un trabajo enorme: prepararse para dar vida.',
    tip: '💡 Descansa cuando puedas y delega tareas. Tu única tarea ahora mismo es prepararte para el gran día.'
  },
  ambivalente: {
    title: 'Sentir alegría y miedo al mismo tiempo es totalmente normal 🌊',
    msg: 'Muchas madres sienten emoción e incertidumbre mezcladas frente al parto. Todos esos sentimientos son válidos y forman parte del proceso.',
    tip: '💡 Practica la respiración consciente: inhala lento 4 tiempos, exhala 6 tiempos. Repite 5 veces.'
  },
  sola: {
    title: 'Mereces acompañamiento en este momento tan importante 💜',
    msg: 'Si sientes que no tienes suficiente apoyo, es fundamental que lo comuniques a tu matrona o al equipo de salud de tu CESFAM. Tienes derecho a un acompañante durante el parto.',
    tip: '💡 Habla con tu matrona sobre quién puede ser tu acompañante de parto. Es un derecho que te protege el modelo de atención humanizada.'
  },
  paz: {
    title: 'Esa calma que sientes es también una forma de preparación 🌸',
    msg: 'Confiar en tu cuerpo y en el proceso es uno de los recursos más poderosos que puedes tener durante el parto. Esa paz interior es un regalo.',
    tip: '💡 Dedica 10 minutos al día a hablarle a tu bebé y contarle que pronto se van a conocer. Ese tiempo es de los dos.'
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
const quizAnswers = { 0: 'b', 1: 'b', 2: 'b', 3: 'a', 4: 'c', 5: 'c' };
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
      ? '¡Excelente! Ya estás preparada para reconocer el parto y recibir a tu bebé con amor. ¡El encuentro está muy cerca!'
      : score >= 4
      ? '¡Muy bien! Tienes una base sólida. Puedes repasar las secciones donde tuviste dudas antes de continuar.'
      : 'Sigue aprendiendo. Te recomendamos repasar el módulo antes de continuar. ¡Cada intento es un paso adelante!';

  completed.add(7);
  updateProgress();

const user = auth.currentUser;
if (user) {
  const docRef = doc(db, "users", user.uid);
  getDoc(docRef).then(docSnap => {
    if (docSnap.exists()) {
      const moduleName = "module3"; 
      let modulesCompleted = docSnap.data().modulesCompleted || [];
      if (!modulesCompleted.includes(moduleName)) {
        modulesCompleted.push(moduleName);
        updateDoc(docRef, { modulesCompleted: modulesCompleted });
      }
    }
  });
}

  document.getElementById('btn-finish').addEventListener('click', () => { window.location.href = '../pages/module4.html';
});
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
