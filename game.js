const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, direction, food, score, highScore;
let gameRunning = true;

// Timing
let lastTime = 0;
let speed = 8;

// Ensure page can receive input
document.body.tabIndex = 0;
document.body.focus();

function init() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 }; // START MOVING RIGHT (fix)
  food = randomFood();
  score = 0;
  gameRunning = true;
  scoreEl.textContent = score;

  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreEl.textContent = highScore;
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function gameLoop(time) {
  if (!gameRunning) return;

  if (time - lastTime > 1000 / speed) {
    update();
    draw();
    lastTime = time;
  }

  requestAnimationFrame(gameLoop);
}

function update() {
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Wall collision
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount
  ) {
    gameOver();
    return;
  }

  // Self collision
  for (let part of snake) {
    if (part.x === head.x && part.y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
      highScoreEl.textContent = highScore;
    }

    food = randomFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Food animation
  const time = Date.now() / 200;
  const size = gridSize / 2 + Math.sin(time) * 3;

  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    size,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Snake
  snake.forEach((part, index) => {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    const gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
    gradient.addColorStop(0, "#22c55e");
    gradient.addColorStop(1, "#4ade80");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, 6);
    ctx.fill();

    if (index === 0) {
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
}

function gameOver() {
  gameRunning = false;

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 110, 200);
}

// 🔥 FIXED INPUT HANDLER
document.addEventListener("keydown", function (e) {
  const key = e.key;

  if (key === "ArrowUp" && direction.y !== 1) {
    direction = { x: 0, y: -1 };
  } else if (key === "ArrowDown" && direction.y !== -1) {
    direction = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" && direction.x !== 1) {
    direction = { x: -1, y: 0 };
  } else if (key === "ArrowRight" && direction.x !== -1) {
    direction = { x: 1, y: 0 };
  } else if (key === "r" || key === "R") {
    init();
    requestAnimationFrame(gameLoop);
  }
});

init();
requestAnimationFrame(gameLoop);
