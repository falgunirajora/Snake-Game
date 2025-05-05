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
let gameInterval;

// Audio elements
const bgMusic = document.getElementById("bgMusic");
const moveSound = document.getElementById("moveSound");
const foodSound = document.getElementById("foodSound");
const gameOverSound = document.getElementById("gameOverSound");

// Start game on first key press
document.addEventListener("keydown", startGameOnce, { once: true });

function startGameOnce(e) {
  setDirection(e);
  bgMusic.play();
  gameStarted = true;
  gameInterval = setInterval(draw, 150);
  document.addEventListener("keydown", setDirection);
}

function setDirection(e) {
  if (!gameStarted) return;

  moveSound.currentTime = 0;
  moveSound.play();

  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
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

  // Collision with wall or self
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

  // Display scores
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 240, 20);
}

function collision(head, arr) {
  return arr.some(segment => head.x === segment.x && head.y === segment.y);
}
