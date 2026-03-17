const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let dx;
let dy;
let food;
let score;
let highScore;

let gameInterval;

// INIT GAME
function startGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1; // START MOVING RIGHT
  dy = 0;

  food = randomFood();
  score = 0;
  scoreEl.textContent = score;

  highScore = localStorage.getItem("snakeHighScore") || 0;
  highScoreEl.textContent = highScore;

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 120); // consistent timing
}

// FOOD
function randomFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

// MAIN LOOP
function gameLoop() {
  update();
  draw();
}

// UPDATE
function update() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // WALL COLLISION
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount
  ) {
    gameOver();
    return;
  }

  // SELF COLLISION
  for (let part of snake) {
    if (part.x === head.x && part.y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // EAT FOOD
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

// DRAW
function draw() {
  // CLEAR
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // FOOD
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize,
    gridSize
  );

  // SNAKE
  ctx.fillStyle = "#22c55e";
  snake.forEach((part) => {
    ctx.fillRect(
      part.x * gridSize,
      part.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });
}

// GAME OVER
function gameOver() {
  clearInterval(gameInterval);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 110, 200);
}

// CONTROLS (THIS WORKS)
document.addEventListener("keydown", function (e) {
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
  }
});

// START
startGame();
