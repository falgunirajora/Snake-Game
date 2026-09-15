// script.js - Snake Game with High Score Support
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start-btn");
const quitBtn = document.getElementById("quit-btn");
const welcomeScreen = document.getElementById("welcome-screen");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const mobileControls = document.getElementById("mobile-controls");

const startSound = document.getElementById("start-sound");
const moveSound = document.getElementById("move-sound");
const foodSound = document.getElementById("food-sound");
const gameoverSound = document.getElementById("gameover-sound");

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const START_SPEED = 200;
const MIN_SPEED = 60;

const OPPOSITE = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";   // buffered: applied once per tick
let food = { x: 0, y: 0 };
let score = 0;
let highScore = Number(localStorage.getItem("highScore")) || 0;
let gameInterval = null;
let speed = START_SPEED;
let isPaused = false;
let isRunning = false;         // loop has actually started
let isGameOver = false;

/* ---------- helpers ---------- */

// Restarting a clip that is already playing throws in Chrome; reset and swallow it.
function playSound(audio) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (e) {
    /* audio not available */
  }
}

function stopLoop() {
  clearInterval(gameInterval);
  gameInterval = null;
}

function startLoop() {
  stopLoop();
  gameInterval = setInterval(gameLoop, speed);
}

/* ---------- buttons ---------- */

startBtn.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  mobileControls.classList.remove("hidden");
  playSound(startSound);
  startGame();
});

quitBtn.addEventListener("click", () => {
  window.location.href = "https://www.google.com";
});

pauseBtn.addEventListener("click", () => {
  if (!isRunning || isGameOver || isPaused) return;   // nothing to pause yet
  stopLoop();
  isPaused = true;
  drawPausedBanner();
});

resumeBtn.addEventListener("click", () => {
  if (!isRunning || isGameOver || !isPaused) return;  // never start from Resume
  isPaused = false;
  startLoop();
});

/* ---------- drawing ---------- */

function drawSnake() {
  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? "#7CFC00" : "lime";
    ctx.fillRect(part.x, part.y, CELL, CELL);
  });
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, CELL, CELL);
}

function drawCenteredText(text, y, size = 30) {
  ctx.fillStyle = "white";
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, y);
  ctx.textAlign = "start";
}

function drawPausedBanner() {
  drawCenteredText("Paused", canvas.height / 2);
}

function drawStartBanner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
  drawCenteredText("Press an arrow key to start", canvas.height / 2, 20);
}

/* ---------- game logic ---------- */

function moveSnake() {
  // Apply the buffered turn exactly once per tick, so two fast key presses
  // can never reverse the snake into its own neck.
  if (nextDirection !== OPPOSITE[direction]) direction = nextDirection;

  const head = { ...snake[0] };
  switch (direction) {
    case "UP": head.y -= CELL; break;
    case "DOWN": head.y += CELL; break;
    case "LEFT": head.x -= CELL; break;
    case "RIGHT": head.x += CELL; break;
  }
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    playSound(foodSound);
    score++;
    updateScore();
    if (score % 5 === 0 && speed > MIN_SPEED) {
      speed = Math.max(MIN_SPEED, speed - 20);
      startLoop();
    }
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  const free = [];
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      const px = x * CELL;
      const py = y * CELL;
      if (!snake.some(part => part.x === px && part.y === py)) {
        free.push({ x: px, y: py });
      }
    }
  }
  if (free.length === 0) return win();          // board full
  food = free[Math.floor(Math.random() * free.length)];
}

function hasCollided() {
  const [head, ...body] = snake;
  return (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    body.some(part => part.x === head.x && part.y === head.y)
  );
}

function updateScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", String(highScore));
  }
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function endRound(message) {
  stopLoop();
  isRunning = false;
  isGameOver = true;
  document.removeEventListener("keydown", handleKeyDirection);
  drawCenteredText(message, canvas.height / 2);
  drawCenteredText("Press an arrow key to play again", canvas.height / 2 + 34, 18);
  document.addEventListener("keydown", startOnKey);
}

function gameOver() {
  playSound(gameoverSound);
  endRound("Game Over");
}

function win() {
  endRound("You Win!");
}

function gameLoop() {
  moveSnake();

  // Check before drawing, and stop here on death so the banner is not painted over.
  if (hasCollided()) {
    snake.shift();            // keep the fatal head off the board
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    gameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnake();
  drawFood();
}

/* ---------- start / restart ---------- */

function startGame() {
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  score = 0;
  speed = START_SPEED;
  isPaused = false;
  isRunning = false;
  isGameOver = false;
  stopLoop();
  generateFood();
  updateScore();
  drawStartBanner();
  document.removeEventListener("keydown", startOnKey);
  document.addEventListener("keydown", startOnKey);
}

function keyToDirection(key) {
  switch (key) {
    case "ArrowUp": case "w": case "W": return "UP";
    case "ArrowDown": case "s": case "S": return "DOWN";
    case "ArrowLeft": case "a": case "A": return "LEFT";
    case "ArrowRight": case "d": case "D": return "RIGHT";
    default: return null;
  }
}

function startOnKey(e) {
  const dir = keyToDirection(e.key);
  if (!dir) return;                 // ignore other keys, stay armed
  e.preventDefault();               // stop the page from scrolling

  if (isGameOver) {                 // an arrow key after a loss restarts
    document.removeEventListener("keydown", startOnKey);
    startGame();
  }

  document.removeEventListener("keydown", startOnKey);
  beginRun(dir);
}

function beginRun(dir) {
  direction = dir;
  nextDirection = dir;
  isRunning = true;
  isPaused = false;
  isGameOver = false;
  playSound(moveSound);
  document.addEventListener("keydown", handleKeyDirection);
  gameLoop();
  if (isRunning) startLoop();       // guard: first tick could already be fatal
}

function handleKeyDirection(e) {
  const dir = keyToDirection(e.key);
  if (!dir) return;
  e.preventDefault();
  if (isPaused || isGameOver) return;
  if (dir === OPPOSITE[direction] || dir === direction) return;
  nextDirection = dir;              // buffered, applied on the next tick
  playSound(moveSound);
}

function mobileControl(dir) {
  if (isGameOver) {
    startGame();
    beginRun(dir);
    return;
  }
  if (!isRunning) {
    document.removeEventListener("keydown", startOnKey);
    beginRun(dir);
    return;
  }
  if (isPaused) return;
  if (dir === OPPOSITE[direction] || dir === direction) return;
  nextDirection = dir;
  playSound(moveSound);
}
