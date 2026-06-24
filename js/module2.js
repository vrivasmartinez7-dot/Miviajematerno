import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./firebase.js";

/* ── STATE ── */
let currentStep = 0;
const totalSteps = 7;
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

/* ── SEMANA BIENVENIDA ── */
const babyPills = {
  22: '🌽 Tu bebé tiene el tamaño de un choclo',
  23: '🥭 Tu bebé tiene el tamaño de un mango'
};

document.getElementById('week-input').addEventListener('input', function () {
  const w = Math.min(23, Math.max(22, parseInt(this.value) || 22));
  document.getElementById('welcome-subtitle').textContent = `Semana ${w} de embarazo`;
  document.getElementById('avatar-week-label').textContent = w;
  document.getElementById('baby-size-pill').textContent = babyPills[w] || babyPills[22];
});

/* ── BEBÉ SEMANA A SEMANA ── */
const babyData = {
  22: {
    fruit: '🌽',
    title: 'Semana 22',
    size: 'Tamaño: 27 cm · Peso: 430 g (como un choclo)',
    desc: 'Tu bebé puede realizar movimientos coordinados como acercarse la mano a la cara o chuparse el dedo. Además, ya se podría conocer el sexo en la ecografía del segundo trimestre.',
    fact: '✨ ¡Tu bebé ya ha pasado la mitad de su gestación!'
  },
  23: {
    fruit: '🥭',
    title: 'Semana 23',
    size: 'Tamaño: 28 cm · Peso: 500 g (como un mango)',
    desc: 'Tu bebé desarrolla sus pulmones activamente y comienza a producir surfactante, sustancia clave para respirar al nacer. Ya tiene períodos de sueño y vigilia. Su piel ya no es traslúcida y aparecen pliegues en sus manos y dedos.',
    fact: '✨ ¡Tu bebé ya tiene ciclos de sueño y vigilia propios!'
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

/* ── VIDEO ── */
function markVideoDone() {
  completed.add(2);
  updateProgress();
  navigate(1);
}

/* ── HÁBITOS (acordeón) ── */
document.querySelectorAll('.habit-card').forEach(card => {
  card.querySelector('.habit-header').addEventListener('click', function () {
    const isOpen = card.classList.contains('open');

    // Cierra todos
    document.querySelectorAll('.habit-card').forEach(c => c.classList.remove('open'));

    // Abre el clickeado si estaba cerrado
    if (!isOpen) {
      card.classList.add('open');
    }
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
    title: '¡Qué hermoso sentirte así! 🌸',
    msg: 'La alegría y la energía son señales de que tu cuerpo y tu mente están en un buen momento. Aprovecha esta vitalidad para conectar con tu bebé: háblale, cantale o simplemente toca tu barriga y respira con calma.'
  },
  ansiosa: {
    title: 'Tu ansiedad tiene sentido 🤍',
    msg: 'El segundo trimestre trae muchas novedades: movimientos, ecografías, preparativos. Es normal sentir nervios. Escribe lo que te preocupa y cuéntaselo a alguien de confianza. Recuerda que el equipo de tu CESFAM está aquí para acompañarte.'
  },
  cansada: {
    title: 'Tu cuerpo está trabajando mucho ✨',
    msg: 'El cansancio en el embarazo es real y completamente válido. Tu cuerpo está construyendo una vida. Permítete descansar sin culpa, acepta la ayuda que te ofrezcan y recuerda: las siestas cortas también cuentan.'
  },
  ambivalente: {
    title: 'Los sentimientos mixtos son muy comunes 🌊',
    msg: 'Sentir alegría y miedo al mismo tiempo, ilusión y nostalgia, es algo que muchas gestantes experimentan. No tienes que sentirte de una sola manera. Todos esos sentimientos son válidos y forman parte de este proceso tan único.'
  },
  sola: {
    title: 'No estás sola en este camino 💜',
    msg: 'Si sientes que no tienes el apoyo que necesitas, es muy importante que lo cuentes a tu matrona o al equipo de salud de tu CESFAM. Tienes derecho a acompañamiento psicosocial. También puedes conectar con otras madres en los grupos comunitarios de Chile Crece Contigo.'
  },
  conectada: {
    title: 'Tu vínculo con tu bebé ya está floreciendo 🌱',
    msg: 'Sentirte conectada con tu bebé en esta etapa es una señal hermosa del vínculo prenatal que están construyendo juntas. Sigue hablándole, tocando tu barriga y disfrutando de estos momentos únicos. Ese lazo ya es real.'
  }
};

document.querySelectorAll('.emotion-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    const d = emoData[this.dataset.emo];
    const resp = document.getElementById('emotion-response');
    document.getElementById('emo-title').textContent = d.title;
    document.getElementById('emo-msg').textContent = d.msg;
    resp.classList.add('show');
  });
});

/* ── QUIZ ── */
const quizAnswers = { 0: 'b', 1: 'b', 2: 'c', 3: 'c', 4: 'a' };
const userAnswers = {};

document.querySelectorAll('.quiz-opt').forEach(btn => {
  btn.addEventListener('click', function () {
    const q = parseInt(this.dataset.q);
    const val = this.dataset.val;
    if (userAnswers[q]) return;
    userAnswers[q] = val;

    const siblings = document.querySelectorAll(`.quiz-opt[data-q="${q}"]`);
    siblings.forEach(s => {
      s.disabled = true;
      if (s.dataset.val === quizAnswers[q]) s.classList.add('correct');
      else if (s === this) s.classList.add('wrong');
    });
    document.getElementById('fb-' + q).classList.add('show');
  });
});

document.getElementById('quiz-submit-btn').addEventListener('click', function () {
  if (Object.keys(userAnswers).length < 5) {
    alert('Por favor responde todas las preguntas antes de ver tus resultados.');
    return;
  }
  let score = 0;
  for (let q in quizAnswers) {
    if (userAnswers[q] === quizAnswers[q]) score++;
  }

  document.getElementById('quiz-container').style.display = 'none';
  const result = document.getElementById('quiz-result');
  result.classList.add('show');
  document.getElementById('quiz-score-text').textContent = `Obtuviste ${score} de 5`;
  document.getElementById('quiz-msg').textContent = score === 5
    ? '¡Excelente trabajo! Ya tienes todas las herramientas para cuidarte en esta etapa. ¡Tu bebé y tú siguen avanzando juntas!'
    : score >= 3
    ? '¡Muy bien! Tienes una base sólida. Puedes repasar las secciones donde tuviste dudas antes de continuar.'
    : 'Sigue aprendiendo. Te recomendamos repasar el módulo antes de continuar. ¡Cada intento es un paso adelante!';

  completed.add(6);
  updateProgress();

  const user = auth.currentUser;
if (user) {
  const docRef = doc(db, "users", user.uid);
  getDoc(docRef).then(docSnap => {
    if (docSnap.exists()) {
      const moduleName = "module3"; // cambiar a "module4" en el módulo 4
      let modulesCompleted = docSnap.data().modulesCompleted || [];
      if (!modulesCompleted.includes(moduleName)) {
        modulesCompleted.push(moduleName);
        updateDoc(docRef, { modulesCompleted: modulesCompleted });
      }
    }
  });
}

document.getElementById('btn-finish').addEventListener('click', () => { window.location.href = '../pages/module3.html';
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