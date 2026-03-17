const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

const infoBtn = document.getElementById("infoBtn");
const dropdown = document.getElementById("dropdown");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, dx, dy, food, score, highScore;
let gameRunning = true;

let speed = 120;
let lastTime = 0;

// INIT
function startGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;

  food = randomFood();
  score = 0;
  gameRunning = true;
  speed = 120;

  scoreEl.textContent = score;

  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreEl.textContent = highScore;
}

// FOOD
function randomFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

// GAME LOOP (NO FREEZE)
function loop(timestamp) {
  if (!gameRunning) return;

  if (timestamp - lastTime > speed) {
    update();
    draw();
    lastTime = timestamp;
  }

  requestAnimationFrame(loop);
}

// UPDATE
function update() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // WALL
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount
  ) {
    gameOver();
    return;
  }

  // SELF
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

    // SPEED INCREASE
    speed = Math.max(60, speed - 3);

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

// DRAW
function draw() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Animated food
  const pulse = Math.sin(Date.now() / 200) * 4;

  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 2 + pulse,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Snake (rounded + slither feel)
  snake.forEach((part, i) => {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    ctx.fillStyle = i === 0 ? "#4ade80" : "#22c55e";

    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, 8);
    ctx.fill();
  });
}

// GAME OVER
function gameOver() {
  gameRunning = false;

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 110, 200);
}

// INPUT (FIXES SCROLL ISSUE)
document.addEventListener("keydown", function (e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault(); // 🔥 stops page from moving
  }

  if (e.key === "ArrowUp" && dy !== 1) {
    dx = 0; dy = -1;
  } else if (e.key === "ArrowDown" && dy !== -1) {
    dx = 0; dy = 1;
  } else if (e.key === "ArrowLeft" && dx !== 1) {
    dx = -1; dy = 0;
  } else if (e.key === "ArrowRight" && dx !== -1) {
    dx = 1; dy = 0;
  } else if (e.key === "r" || e.key === "R") {
    startGame();
    requestAnimationFrame(loop);
  }
});

// INSTRUCTIONS DROPDOWN
infoBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

// START
startGame();
requestAnimationFrame(loop);
