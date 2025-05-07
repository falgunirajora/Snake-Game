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

let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let food = { x: 100, y: 100 };
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameInterval;
let speed = 200;
let isPaused = false;

startBtn.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  mobileControls.classList.remove("hidden");
  startSound.play();
  startGame();
});

quitBtn.addEventListener("click", () => {
  window.location.href = "https://www.google.com";
});

pauseBtn.addEventListener("click", () => {
  if (!isPaused) {
    clearInterval(gameInterval);
    isPaused = true;
  }
});

resumeBtn.addEventListener("click", () => {
  if (isPaused) {
    gameInterval = setInterval(gameLoop, speed);
    isPaused = false;
  }
});

function drawSnake() {
  ctx.fillStyle = "lime";
  snake.forEach(part => ctx.fillRect(part.x, part.y, 20, 20));
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, 20, 20);
}

function moveSnake() {
  const head = { ...snake[0] };
  switch (direction) {
    case "UP": head.y -= 20; break;
    case "DOWN": head.y += 20; break;
    case "LEFT": head.x -= 20; break;
    case "RIGHT": head.x += 20; break;
  }
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    foodSound.play();
    score++;
    updateScore();
    if (score % 5 === 0 && speed > 50) {
      clearInterval(gameInterval);
      speed -= 20;
      gameInterval = setInterval(gameLoop, speed);
    }
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  food.x = Math.floor(Math.random() * 20) * 20;
  food.y = Math.floor(Math.random() * 20) * 20;
}

function checkCollision() {
  const [head, ...body] = snake;
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    body.some(part => part.x === head.x && part.y === head.y)
  ) {
    gameOver();
  }
}

function updateScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function gameOver() {
  gameoverSound.play();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 120, 200);
  clearInterval(gameInterval);
  setTimeout(() => location.reload(), 3000);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  moveSnake();
  checkCollision();
  drawSnake();
  drawFood();
}

function startGame() {
  updateScore();
  document.addEventListener("keydown", startOnKey, { once: true });
}

function startOnKey(e) {
  switch (e.key) {
    case "ArrowUp": direction = "UP"; break;
    case "ArrowDown": direction = "DOWN"; break;
    case "ArrowLeft": direction = "LEFT"; break;
    case "ArrowRight": direction = "RIGHT"; break;
    default:
      document.addEventListener("keydown", startOnKey, { once: true });
      return;
  }
  moveSound.play();
  gameLoop();
  gameInterval = setInterval(gameLoop, speed);
  document.addEventListener("keydown", handleKeyDirection);
}

function handleKeyDirection(e) {
  switch (e.key) {
    case "ArrowUp": if (direction !== "DOWN") direction = "UP"; break;
    case "ArrowDown": if (direction !== "UP") direction = "DOWN"; break;
    case "ArrowLeft": if (direction !== "RIGHT") direction = "LEFT"; break;
    case "ArrowRight": if (direction !== "LEFT") direction = "RIGHT"; break;
  }
  moveSound.play();
}

function mobileControl(dir) {
  if (!gameInterval) {
    direction = dir;
    moveSound.play();
    gameLoop();
    gameInterval = setInterval(gameLoop, speed);
    document.addEventListener("keydown", handleKeyDirection);
    return;
  }

  if (
    (dir === "UP" && direction !== "DOWN") ||
    (dir === "DOWN" && direction !== "UP") ||
    (dir === "LEFT" && direction !== "RIGHT") ||
    (dir === "RIGHT" && direction !== "LEFT")
  ) {
    direction = dir;
    moveSound.play();
  }
}