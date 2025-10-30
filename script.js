// Elementos del display
let prevAnsEl = document.getElementById('prevAns');
let currentInputEl = document.getElementById('currentInput');
let questionEl = document.getElementById('question');
let feedbackEl = document.getElementById('feedback');

// Variables
let currentInput = '';
let ans = 0;
let questionIndex = 0;

// Preguntas con operación permitida
const questions = [
    // Preguntas tutorial
    { text: "Consigue un 3", answer: 3, op: ["+"] },                   // 0 + 3 = 3
    { text: "Suma 2 al resultado anterior", answer: 5, op: ["+"] },    // 3 + 2 = 5
    { text: "Multiplica por 2 el resultado anterior", answer: 10, op: ["*"] }, // 5 * 2 = 10

    // Preguntas de cultura general (fáciles/medias)
    { text: "Número de planetas en el sistema solar", answer: 8, op: ["-", "*"] },   // 10 - 2 --- 10 * 0.8 = 8
    { text: "Días que tiene un año bisiesto", answer: 366, op: ["+", "*"] },         // 8 * 45.75 = 366 ---- 8 + 358 = 366
    { text: "Población aproximada de España en millones", answer: 47, op: ["-", "*"] }, // 366 - 319 = 47 --- 366 * 0.128 = 47
    { text: "Altura del Monte Everest en metros", answer: 8849, op: ["*", "+"] },     // 47 * 188.27 = 8849 --- 47 + 8802 = 8849
    { text: "Número de estados en Estados Unidos", answer: 50, op: ["-", "*"] },       // 8849 - 8799 = 50 --- 8849 * 0.0057 = 50
    { text: "Número de minutos en 3 horas", answer: 180, op: ["*", "+"] },            // 50 * 3.6 = 180 --- 50 + 130 = 180
    { text: "Año en que Cristóbal Colón llegó a América", answer: 1492, op: ["+", "/"] }, // 180 / 0.12065 = 1492 --- 180 + 1312 = 1492
    { text: "Número de elementos químicos en la tabla periódica", answer: 118, op: ["-", "*"] }, // 1492 - 1374 = 118 --- 1492 * 0.079 = 118
    { text: "Cantidad de jugadores en un equipo de fútbol", answer: 11, op: ["-", "*"] }, // 118 - 107 = 11 --- 118 * 0.0932 = 11
    { text: "Año de inicio de la Segunda Guerra Mundial", answer: 1939, op: ["+", "*"] }, // 11 * 176.27 = 1939 --- 11 + 1928 = 1939
    { text: "Número de vértebras en la columna humana", answer: 33, op: ["-", "*"] }, // 1939 - 1906 = 33 --- 1939 * 0.017 = 33
    { text: "Número de países en la Unión Europea", answer: 27, op: ["-", "*"] },     // 33 - 6 = 27 --- 33 * 0.818 = 27
    { text: "Suma de los ángulos de un hexágono regular", answer: 240, op: ["+", "*"] }, // 27 + 213 = 240 --- 27 * 8.888 = 240

    // Preguntas más difíciles
    { text: "Número de minutos en un día", answer: 1440, op: ["*"] },                  // 240 * 6, = 1440
    { text: "Año en que se fundó la ONU", answer: 1945, op: ["+"] },                  // 1440 + 505 = 1945
    { text: "Número de segundos en una hora", answer: 3600, op: ["/"] },              // 1945 / 0.5403 = 3600
    { text: "Número de jugadores en un equipo de baloncesto", answer: 5, op: ["/"] }, // 3600 / 720 = 5
    { text: "Número de vértebras cervicales en el humano", answer: 7, op: ["*"] }     // 5 * 1.4 = 7
];



// Función para calcular input de manera segura
function calculateInput(input) {
    if (/^[\+\-\*\/]/.test(input)) {
        input = ans + input;
    }

    let safeInput = input
        .replace(/ans/g, ans)
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/pow/g, 'Math.pow')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan');

    return Function(`"use strict"; return (${safeInput})`)();
}

// Funciones de la calculadora
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

// Actualizar operaciones permitidas
function updateOperations() {
    const operations = ["+", "-", "*", "/"];
    const currentOp = questions[questionIndex].op; // ahora un array

    operations.forEach(op => {
        const btn = document.getElementById(`btn${op}`);
        if (btn) {
            if (currentOp.includes(op)) {
                btn.disabled = false;
                btn.style.opacity = 1;
            } else {
                btn.disabled = true;
                btn.style.opacity = 0.3;
            }
        }
    });
}

// Función principal
function calculate() {
    try {
        let userAns = calculateInput(currentInput);

        // Redondeo si la operación contiene * o /
        if (currentInput.includes("*") || currentInput.includes("/")) {
            userAns = Math.round(userAns);
        }

        let correctAns = questions[questionIndex].answer;

        if (Number(userAns) === Number(correctAns)) {
            ans = userAns;
            prevAnsEl.textContent = ans;
            currentInput = '';
            currentInputEl.textContent = '';

            questionIndex++;
            if (questionIndex < questions.length) {
                questionEl.textContent = questions[questionIndex].text;
                feedbackEl.textContent = "¡Correcto!";
                setTimeout(() => {
                    feedbackEl.textContent = '';
                }, 3000);
                updateOperations();
            } else {
                questionEl.textContent = "¡Juego terminado!";
                feedbackEl.textContent = '';
            }
        } else {
            feedbackEl.textContent = `Incorrecto, intenta de nuevo.`;
        }
    } catch (e) {
        currentInputEl.textContent = 'Error';
        feedbackEl.textContent = '';
    }
}

// Iniciar juego
questionEl.textContent = questions[questionIndex].text;
updateOperations();