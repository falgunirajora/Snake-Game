const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let snake = [{ x: 9 * box, y: 10 * box }];
let food = {
  x: Math.floor(Math.random() * 19 + 1) * box,
  y: Math.floor(Math.random() * 19 + 1) * box
};

let direction = null;
let gameStarted = false;
let isPaused = false;
let gameInterval;

// Audio elements
const bgMusic = document.getElementById("bgMusic");
const moveSound = document.getElementById("moveSound");
const foodSound = document.getElementById("foodSound");
const gameOverSound = document.getElementById("gameOverSound");

// Handle keyboard input
document.addEventListener("keydown", startGameOnce, { once: true });

function startGameOnce(e) {
  setDirection(e);
  startGame();
}

function startGame() {
  if (gameStarted) return;
  bgMusic.play();
  gameStarted = true;
  isPaused = false;
  gameInterval = setInterval(draw, 150);
  document.addEventListener("keydown", setDirection);
  document.getElementById("pauseBtn").innerText = "⏸️ Pause";
}

function setDirection(e) {
  if (!gameStarted || isPaused) return;

  moveSound.currentTime = 0;
  moveSound.play();

  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function setDirectionByButton(dir) {
  if (!gameStarted) {
    setDirection({ key: dir });
    startGame();
    return;
  }

  if (isPaused) return;

  moveSound.currentTime = 0;
  moveSound.play();

  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "UP" && direction !== "DOWN") direction = "UP";
  else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  // Move head
  if (direction === "LEFT") headX -= box;
  else if (direction === "UP") headY -= box;
  else if (direction === "RIGHT") headX += box;
  else if (direction === "DOWN") headY += box;

  // Eat food
  if (headX === food.x && headY === food.y) {
    score++;
    foodSound.currentTime = 0;
    foodSound.play();
    food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box
    };
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // Collision detection
  if (
    headX < 0 || headX >= canvas.width ||
    headY < 0 || headY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(gameInterval);
    bgMusic.pause();
    gameOverSound.play();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    alert(`Game Over!\nYour Score: ${score}`);
    return;
  }

  snake.unshift(newHead);

  // Draw scores
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 240, 20);
}

function collision(head, arr) {
  return arr.some(segment => head.x === segment.x && head.y === segment.y);
}

function restartGame() {
  clearInterval(gameInterval);
  bgMusic.pause();
  score = 0;
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  gameStarted = false;
  isPaused = false;
  food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.removeEventListener("keydown", setDirection);
  document.addEventListener("keydown", startGameOnce, { once: true });
  document.getElementById("pauseBtn").innerText = "⏸️ Pause";
}

function togglePause() {
  if (!gameStarted) return;

  if (isPaused) {
    gameInterval = setInterval(draw, 150);
    bgMusic.play();
    document.getElementById("pauseBtn").innerText = "⏸️ Pause";
  } else {
    clearInterval(gameInterval);
    bgMusic.pause();
    document.getElementById("pauseBtn").innerText = "▶️ Resume";
  }

  isPaused = !isPaused;
}
