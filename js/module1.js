import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./firebase.js";

/* ── STATE ── */
let currentStep = 0;
const totalSteps = 6;
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
  16: '🥑 Tu bebé tiene el tamaño de una palta',
  17: '🍐 Tu bebé tiene el tamaño de una pera',
  18: '🫑 Tu bebé tiene el tamaño de un pimentón grande'
};
document.getElementById('week-input').addEventListener('input', function () {
  const w = Math.min(18, Math.max(16, parseInt(this.value) || 16));
  document.getElementById('welcome-subtitle').textContent = `Semana ${w} de embarazo`;
  document.getElementById('avatar-week-label').textContent = w;
  document.getElementById('baby-size-pill').textContent = babyPills[w] || babyPills[16];
});

/* ── MI CUERPO — botones de semana ── */
const bodyData = {
  16: {
    uterus:    'Como una papaya',
    weight:    '2 – 4 kg acumulados',
    symptom:   'Aumento del flujo vaginal',
    desc:      'A las <strong>16 semanas</strong>, tu útero ha crecido considerablemente y ya se puede palpar sobre el pubis. Es común sentir el ligamento redondo del útero (como un dolor leve en la ingle) al moverte rápido. Muchas embarazadas notan que las náuseas del primer trimestre comienzan a disminuir.',
    emotional: 'Es normal sentir una mezcla de alegría, ansiedad y cierta nostalgia. El cerebro se está adaptando junto con el cuerpo. No hay emociones "incorrectas" durante el embarazo.',
    selfcare:  'Hidratación constante, caminatas suaves y no levantes objetos pesados para evitar molestias en la espalda.'
  },
  17: {
    uterus:    'Como un melón pequeño',
    weight:    '2,5 – 4,5 kg acumulados',
    symptom:   'Calambres en piernas y manos',
    desc:      'A las <strong>17 semanas</strong> son frecuentes los calambres en piernas y manos, que pueden llegar a despertar a la embarazada durante el sueño. Estas molestias se deben a la compresión de los nervios por el crecimiento uterino, al empeoramiento de la circulación sanguínea, a la retención de líquidos y a la disminución de potasio y calcio. También pueden aparecer ganas más frecuentes de orinar, ya que el útero en crecimiento deja menos espacio a la vejiga.',
    emotional: 'Muchas mujeres empiezan a anticipar con emoción los primeros movimientos fetales, que pueden ocurrir pronto. El centro de gravedad se está desplazando, lo que puede generar algo de inseguridad corporal o torpeza, sensaciones completamente normales en esta etapa.',
    selfcare:  'Cuando aparezca algún calambre, lo más recomendable es recostarse de lado y descansar. Mantener una buena hidratación y consumir alimentos ricos en calcio y potasio (lácteos, plátano, legumbres) ayuda a reducir estas molestias.'
  },
  18: {
    uterus:    'Como un pimentón grande',
    weight:    '4 – 5 kg acumulados',
    symptom:   'Primeros movimientos fetales (aleteo o burbujeo)',
    desc:      'A las <strong>18 semanas</strong>, la mayoría de las mujeres empiezan a notar los movimientos del bebé. Por ahora se sienten más como un suave aleteo que como una patada fuerte. También es frecuente el dolor de espalda, debido a los cambios posturales y al aumento progresivo de peso.',
    emotional: 'Este esfuerzo físico sostenido puede generar cansancio emocional. Es un buen momento para validar la necesidad de descanso sin culpa: el cuerpo está haciendo un trabajo enorme.',
    selfcare:  'Consumir comidas pequeñas y frecuentes, beber mucha agua e ingerir alimentos ricos en fibra ayuda a manejar la acidez, hinchazón y estreñimiento que son comunes en esta semana. Estirar las piernas antes de acostarse reduce los calambres nocturnos.'
  }
};

document.querySelectorAll('#panel-1 .baby-week-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#panel-1 .baby-week-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const w = parseInt(this.dataset.week);
    const d = bodyData[w];
    document.getElementById('uterus-size').textContent       = d.uterus;
    document.getElementById('weight-gain').textContent       = d.weight;
    document.getElementById('symptom').textContent           = d.symptom;
    document.getElementById('body-desc').innerHTML           = d.desc;
    document.getElementById('emotional-changes').textContent = d.emotional;
    document.getElementById('selfcare-tips').textContent     = d.selfcare;
  });
});

/* ── TU BEBÉ — botones de semana ── */
const babyData = {
  16: {
    fruit: '🥑',
    title: 'Semana 16',
    size:  'Tamaño: 16 cm · Peso: 135 g (como una palta)',
    desc:  'Tu bebé ya puede fruncir el ceño y hacer muecas. Su cabeza aún es desproporcionadamente grande comparado con el resto de su cuerpo, pero su tórax, brazos y piernas están empezando a crecer.',
    fact:  '✨ ¡Tu bebé ya puede percibir la luz a través de tu piel!'
  },
  17: {
    fruit: '🍐',
    title: 'Semana 17',
    size:  'Tamaño: 17 cm · Peso: 340 g (como una pera)',
    desc:  'El cerebro de tu bebé está desarrollando las vías neuronales que le permitirán comenzar a sentir las distintas partes de su propio cuerpo, lo que se conoce como propiocepción. También empieza a acumular grasa bajo la piel, fundamental para regular su temperatura después del nacimiento, y continúan formándose detalles como las uñas de los pies.',
    fact:  '✨ ¡Tu bebé ya tiene algo de pelillo en la cabeza, además de cejas y pestañas! Su cara se va poniendo más bonita cada semana.'
  },
  18: {
    fruit: '🫑',
    title: 'Semana 18',
    size:  'Tamaño: 18 cm · Peso: 340 g (como un pimentón grande)',
    desc:  'El cerebro comienza a descifrar los sentidos del tacto, gusto, olfato, visión y oído. Las retinas de sus ojos ya son sensibles a la luz, y la mayoría de los huesos se están endureciendo activamente.',
    fact:  '✨ ¡Tu bebé ya es capaz de comenzar a percibir sonidos!'
  }
};

document.querySelectorAll('#panel-2 .baby-week-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#panel-2 .baby-week-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const d = babyData[parseInt(this.dataset.baby)];
    document.getElementById('baby-fruit').textContent     = d.fruit;
    document.getElementById('baby-title').textContent     = d.title;
    document.getElementById('baby-size-text').textContent = d.size;
    document.getElementById('baby-desc').textContent      = d.desc;
    document.getElementById('baby-fact').textContent      = d.fact;
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
      // Mostrar explicación
      card.querySelector('.myth-explanation').style.display = 'block';
    });
  });
});

/* ── EMOCIÓN ── */
const emoData = {
  feliz: {
    title: '¡Qué hermoso sentirte así! 🌸',
    msg:   'La alegría y la esperanza son compañeras maravillosas en este viaje. Aprovecha este momento de bienestar para conectar con tu bebé: puedes hablarle, cantarle o simplemente respirar con calma y sentirlo.'
  },
  ansiosa: {
    title: 'Tu ansiedad tiene sentido 🤍',
    msg:   'Es completamente normal sentir nervios durante el embarazo. Hay muchos cambios y mucha información nueva. Intenta respirar profundo, hablar con alguien de confianza o escribir lo que sientes. Estás haciendo un trabajo extraordinario.'
  },
  cansada: {
    title: 'Tu cuerpo está trabajando mucho ✨',
    msg:   'El cansancio en el embarazo es real y válido. Tu cuerpo está construyendo una vida. Permítete descansar sin culpa, pide ayuda y acepta que no tienes que hacerlo todo sola.'
  },
  ambivalente: {
    title: 'Los sentimientos mixtos son muy comunes 🌊',
    msg:   'Muchas gestantes sienten alegría y miedo al mismo tiempo, ilusión y nostalgia, amor y preocupación. No tienes que sentirte de una sola manera. Todos esos sentimientos son válidos y forman parte de esta etapa.'
  },
  sola: {
    title: 'No estás sola en este camino 💜',
    msg:   'Si sientes que no tienes suficiente apoyo, es importante que lo comuniques a tu matrona o al equipo de salud de tu CESFAM. Tienes derecho a apoyo psicosocial. También puedes hablar con otras madres en grupos comunitarios de Chile Crece Contigo.'
  },
  curiosa: {
    title: 'Tu conexión con este proceso es especial 🌱',
    msg:   'Sentirte curiosa y conectada con tu embarazo es una señal hermosa de vínculo prenatal. Sigue explorando, preguntando y aprendiendo. Esa curiosidad beneficia tanto a tu bienestar como al de tu bebé.'
  }
};

document.querySelectorAll('.emotion-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');
    const d = emoData[this.dataset.emo];
    document.getElementById('emo-title').textContent = d.title;
    document.getElementById('emo-msg').textContent   = d.msg;
    // Usar display:block directamente (consistente con el CSS)
    document.getElementById('emotion-response').style.display = 'block';
  });
});

/* ── QUIZ ── */
const quizAnswers = { 0: 'b', 1: 'c', 2: 'b', 3: 'b', 4: 'a' };
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
    // Usar display:block directamente (consistente con el CSS)
    document.getElementById('fb-' + q).style.display = 'block';
  });
});

document.getElementById('quiz-submit-btn').addEventListener('click', function () {
  if (Object.keys(userAnswers).length < 5) {
    alert('Por favor responde todas las preguntas antes de ver tus resultados.');
    return;
  }
  let score = 0;
  for (let q in quizAnswers) { if (userAnswers[q] === quizAnswers[q]) score++; }

  document.getElementById('quiz-container').style.display = 'none';
  // Usar display:block directamente (consistente con el CSS)
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('quiz-score-text').textContent = `Obtuviste ${score} de 5`;
  document.getElementById('quiz-msg').textContent = score === 5
    ? '¡Excelente trabajo! Ya tienes todas las bases del módulo 1. ¡Tu bebé y tú están avanzando juntas!'
    : score >= 3
    ? '¡Muy bien! Tienes una base sólida. Puedes repasar las secciones donde tuviste dudas antes de continuar.'
    : 'Sigue aprendiendo. Te recomendamos repasar el módulo antes de continuar. ¡Cada intento es un paso adelante!';

  completed.add(5);
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