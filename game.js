const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const coinsEl = document.getElementById("coins");

const infoBtn = document.getElementById("infoBtn");
const dropdown = document.getElementById("dropdown");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 🔥 SKINS SYSTEM (expandable for shop)
const skins = {
  default: {
    head: "#4ade80",
    body: "#22c55e",
    eye: "#000",
    food: "#f43f5e"
  },
  blue: {
    head: "#60a5fa",
    body: "#3b82f6",
    eye: "#000",
    food: "#facc15"
  }
};

let currentSkin = "default";

let snake, dx, dy, food, score, highScore, coins;
let speed = 120;
let lastTime = 0;
let gameRunning = true;

// INIT
function startGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;

  food = randomFood();
  score = 0;
  speed = 120;
  gameRunning = true;

  coins = parseInt(localStorage.getItem("snakeCoins")) || 0;

  scoreEl.textContent = score;
  coinsEl.textContent = coins;

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

// LOOP
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

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount
  ) {
    gameOver();
    return;
  }

  for (let part of snake) {
    if (part.x === head.x && part.y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    coins++; // 🪙 COINS SYSTEM
    localStorage.setItem("snakeCoins", coins);

    scoreEl.textContent = score;
    coinsEl.textContent = coins;

    speed = Math.max(60, speed - 2);

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

  const skin = skins[currentSkin];

  // 🍎 Animated Food (better look)
  const pulse = Math.sin(Date.now() / 150) * 3;

  ctx.fillStyle = skin.food;
  ctx.beginPath();
  ctx.arc(
    food.x * gridSize + gridSize / 2,
    food.y * gridSize + gridSize / 2,
    gridSize / 2 - 3 + pulse,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // 🐍 Snake (actual look)
  snake.forEach((part, i) => {
    const x = part.x * gridSize;
    const y = part.y * gridSize;

    ctx.fillStyle = i === 0 ? skin.head : skin.body;

    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, gridSize - 4, gridSize - 4, 10);
    ctx.fill();

    // 👀 Eyes on head
    if (i === 0) {
      ctx.fillStyle = skin.eye;

      ctx.beginPath();
      ctx.arc(x + 7, y + 7, 2, 0, Math.PI * 2);
      ctx.arc(x + 13, y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// GAME OVER
function gameOver() {
  gameRunning = false;

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 110, 200);
}

// INPUT
document.addEventListener("keydown", function (e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
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

// UI
infoBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

// START
startGame();
requestAnimationFrame(loop);
