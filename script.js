const TUTORIAL = [
  { text: "Consigue un 3", answer: 3, op: ["+"] },
  { text: "Suma 2 al resultado anterior", answer: 5, op: ["+"] },
  { text: "Multiplica el resultado por 2", answer: 10, op: ["*"] }
];

const EASY = [
  { text: "Planetas en el sistema solar", answer: 8, op: ["-", "*"] },
  { text: "Jugadores en un equipo de fútbol", answer: 11, op: ["-", "*"] },
  { text: "Meses en un año", answer: 12, op: ["+", "*"] },
  { text: "Horas en un día", answer: 24, op: ["+", "*"] },
  { text: "Países en la Unión Europea (2024)", answer: 27, op: ["-", "*"] },
  { text: "Días en un año bisiesto", answer: 366, op: ["+", "*"] },
  { text: "Comunidades autónomas de España", answer: 17, op: ["-", "+"] },
  { text: "Número de colores en el arcoíris", answer: 7, op: ["-", "*"] },
  { text: "Semanas en un año", answer: 52, op: ["+", "*"] },
  { text: "Teclas en un piano estándar", answer: 88, op: ["+", "*"] }
];

const MEDIUM = [
  { text: "Elementos en la tabla periódica", answer: 118, op: ["-", "*"] },
  { text: "Año en que Colón llegó a América", answer: 1492, op: ["+", "/"] },
  { text: "Población de España en millones (aprox. 2024)", answer: 48, op: ["+", "*"] },
  { text: "Año de inicio de la Segunda Guerra Mundial", answer: 1939, op: ["+", "*"] },
  { text: "Minutos en 3 horas", answer: 180, op: ["*", "+"] },
  { text: "Huesos en el cuerpo humano adulto", answer: 206, op: ["+", "*"] },
  { text: "Año de fundación de la ONU", answer: 1945, op: ["+"] },
  { text: "Suma de ángulos de un hexágono (grados)", answer: 720, op: ["*", "+"] },
  { text: "Velocidad de la luz en millones de km/s (aprox)", answer: 300, op: ["*", "/"] },
  { text: "Año en que España se unió a la UE", answer: 1986, op: ["+", "*"] }
];

const HARD = [
  { text: "Altura del Monte Everest en metros", answer: 8849, op: ["*", "+"] },
  { text: "Minutos en un día", answer: 1440, op: ["*"] },
  { text: "Segundos en una hora", answer: 3600, op: ["/", "*"] },
  { text: "Año en que cayó el Muro de Berlín", answer: 1989, op: ["+"] },
  { text: "Distancia media Tierra-Luna en km (aprox)", answer: 384400, op: ["*"] },
  { text: "Año en que se fundó Google", answer: 1998, op: ["+"] },
  { text: "Número de vértebras en la columna humana", answer: 33, op: ["-", "*"] },
  { text: "Año en que se aprobó la Constitución española", answer: 1978, op: ["+", "*"] },
  { text: "Número de escaños en el Congreso de los Diputados", answer: 350, op: ["*", "+"] },
  { text: "Número de vértebras cervicales en el humano", answer: 7, op: ["*"] }
];

const MAX_GAME_QUESTIONS = 10;
const MAX_LIVES = 3;

let currentInput = '';
let ans = 0;
let lives = MAX_LIVES;
let isTutorial = true;
let tutorialIdx = 0;
let gameQueue = [];
let gameIdx = 0;
let currentQ = null;
let skipTutorialOnRestart = false;

// Elementos del DOM
const prevAnsEl = document.getElementById('prevAns');
const currentInputEl = document.getElementById('currentInput');
const questionEl = document.getElementById('question');
const feedbackEl = document.getElementById('feedback');
const progressFill = document.getElementById('progress-fill');
const qCounter = document.getElementById('q-counter');
const phaseBadge = document.getElementById('phase-badge');
const overlay = document.getElementById('overlay');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGameQueue() {
  const easy = shuffle(EASY).slice(0, 3);
  const medium = shuffle(MEDIUM).slice(0, 4);
  const hard = shuffle(HARD).slice(0, 3);
  return [...easy, ...medium, ...hard];
}

function getPhase(q) {
  if (EASY.includes(q)) return 'easy';
  if (MEDIUM.includes(q)) return 'medium';
  if (HARD.includes(q)) return 'hard';
  return 'tutorial';
}

function setPhaseBadge(phase) {
  const labels = { tutorial: 'Tutorial', easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
  phaseBadge.textContent = labels[phase];
  phaseBadge.className = 'phase-badge phase-' + phase;
}

function updateHearts() {
  for (let i = 0; i < 3; i++) {
    document.getElementById('h' + i).classList.toggle('lost', i >= lives);
  }
}

function updateCounter() {
  if (isTutorial) {
    qCounter.textContent = `${tutorialIdx + 1}/3`;
  } else {
    qCounter.textContent = `${gameIdx + 1}/${MAX_GAME_QUESTIONS}`;
  }
}

function updateProgress() {
  let pct = 0;
  if (isTutorial) {
    pct = (tutorialIdx / 3) * 100;
  } else {
    pct = (gameIdx / MAX_GAME_QUESTIONS) * 100;
  }
  progressFill.style.width = pct + '%';
}

function loadQuestion(q) {
  currentQ = q;
  questionEl.textContent = q.text;
  const phase = isTutorial ? 'tutorial' : getPhase(q);
  setPhaseBadge(phase);
  updateOperations(q.op);
  updateCounter();
  updateProgress();
}

function updateOperations(allowed) {
  ['+', '-', '*', '/'].forEach(op => {
    const btn = document.getElementById('btn' + op);
    if (btn) {
      btn.disabled = !allowed.includes(op);
      btn.style.opacity = allowed.includes(op) ? 1 : 0.3;
    }
  });
}

function appendNumber(num) {
  currentInput += num;
  currentInputEl.textContent = currentInput;
}

function appendOperator(op) {
  currentInput += op;
  currentInputEl.textContent = currentInput;
}

function clearDisplay() {
  currentInput = '';
  currentInputEl.textContent = '';
}

function calculateInput(input) {
  if (/^[\+\-\*\/]/.test(input)) input = ans + input;
  const safe = input.replace(/ans/g, ans);
  return Function('"use strict"; return (' + safe + ')')();
}

function setFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className = type === 'ok' ? 'feedback-ok' : (type === 'err' ? 'feedback-err' : '');
}

function showOverlay(icon, title, sub, btnLabel) {
  document.getElementById('ov-icon').textContent = icon;
  document.getElementById('ov-title').textContent = title;
  document.getElementById('ov-sub').textContent = sub;
  document.getElementById('ov-btn').textContent = btnLabel;
  overlay.style.display = 'flex';
}

function restart() {
  overlay.style.display = 'none';
  lives = MAX_LIVES;
  updateHearts();
  ans = 0;
  prevAnsEl.textContent = '';
  currentInput = '';
  currentInputEl.textContent = '';
  setFeedback('', '');

  if (skipTutorialOnRestart) {
    isTutorial = false;
    gameIdx = 0;
    gameQueue = buildGameQueue();
    loadQuestion(gameQueue[0]);
  } else {
    isTutorial = true;
    tutorialIdx = 0;
    loadQuestion(TUTORIAL[0]);
  }
  updateProgress();
}

function advance() {
  if (isTutorial) {
    tutorialIdx++;
    if (tutorialIdx < TUTORIAL.length) {
      loadQuestion(TUTORIAL[tutorialIdx]);
    } else {
      isTutorial = false;
      gameIdx = 0;
      gameQueue = buildGameQueue();
      loadQuestion(gameQueue[gameIdx]);
    }
  } else {
    gameIdx++;
    updateProgress();
    if (gameIdx >= MAX_GAME_QUESTIONS) {
      showOverlay('🏆', '¡Has ganado!', `Respondiste ${MAX_GAME_QUESTIONS} preguntas correctamente. ¡Eres un crack!`, 'Jugar de nuevo');
    } else {
      loadQuestion(gameQueue[gameIdx]);
    }
  }
}

function calculate() {
  if (!currentInput) return;
  let userAns;
  try {
    userAns = calculateInput(currentInput);
    if (currentInput.includes('*') || currentInput.includes('/')) {
      userAns = Math.round(userAns);
    }
  } catch (e) {
    currentInputEl.textContent = 'Error';
    currentInput = '';
    return;
  }

  if (Number(userAns) === Number(currentQ.answer)) {
    ans = userAns;
    prevAnsEl.textContent = ans;
    currentInput = '';
    currentInputEl.textContent = '';
    setFeedback('¡Correcto! ✓', 'ok');
    setTimeout(() => { setFeedback('', ''); advance(); }, 900);
  } else {
    lives--;
    updateHearts();
    setFeedback('Incorrecto, intenta de nuevo.', 'err');
    if (lives <= 0) {
      setTimeout(() => {
        skipTutorialOnRestart = true;
        showOverlay('💀', 'Has perdido', '3 errores cometidos. ¡Inténtalo de nuevo!', 'Jugar de nuevo');
      }, 600);
    }
  }
}

// Iniciar
loadQuestion(TUTORIAL[0]);
updateHearts();
updateCounter();