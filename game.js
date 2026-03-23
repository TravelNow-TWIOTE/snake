const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const coinsEl = document.getElementById("coins");

const infoBtn = document.getElementById("infoBtn");
const dropdown = document.getElementById("dropdown");
const shopBtn = document.getElementById("shopBtn");
const shopDiv = document.getElementById("shop");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// --- SHOP ITEMS ---
const shopItems = [
  { id:"snake_blue", type:"snake", cost:20 },
  { id:"snake_gold", type:"snake", cost:40 },
  { id:"snake_purple", type:"snake", cost:60 },

  { id:"food_gold", type:"food", cost:20 },
  { id:"food_blue", type:"food", cost:40 },
  { id:"food_purple", type:"food", cost:60 },

  { id:"food_waffle", type:"food", cost:1000 }, // 🧇 NEW

  { id:"bg_space", type:"bg", cost:20 },
  { id:"bg_matrix", type:"bg", cost:40 },
  { id:"bg_light", type:"bg", cost:60 }
];

let owned = JSON.parse(localStorage.getItem("snakeOwned")) || {};
let equipped = JSON.parse(localStorage.getItem("snakeEquipped")) || {
  snake:"default", food:"default", bg:"default"
};

// --- SKINS ---
const skins = {
  default:{ head:"#4ade80", body:"#22c55e", food:"#f43f5e", bg:"#020617" },
  snake_blue:{ head:"#60a5fa", body:"#3b82f6" },
  snake_gold:{ head:"#facc15", body:"#eab308" },
  snake_purple:{ head:"#c084fc", body:"#a855f7" },

  food_gold:{ food:"#facc15" },
  food_blue:{ food:"#60a5fa" },
  food_purple:{ food:"#c084fc" },
  food_waffle:{ food:"#d97706" }, // 🧇 NEW

  bg_space:{ bg:"#020617" },
  bg_matrix:{ bg:"#001100" },
  bg_light:{ bg:"#e5e7eb" }
};

// --- GAME ---
let snake, dx, dy, food, score, highScore, coins;
let speed = 120;
let lastMoveTime = 0;

// 🔥 INPUT QUEUE
let nextDirection = { x:1, y:0 };

// INIT
function startGame(){
  snake=[{x:10,y:10}];
  dx=1; dy=0;
  nextDirection={x:1,y:0};

  food=randomFood();
  score=0;
  speed=120;

  coins=parseInt(localStorage.getItem("snakeCoins"))||0;
  highScore=localStorage.getItem("snakeHighScore")||0;

  updateUI();
}

// UI
function updateUI(){
  scoreEl.textContent=score;
  coinsEl.textContent=coins;
  highScoreEl.textContent=highScore;
}

// LOOP
function loop(time){
  if(time - lastMoveTime > speed){
    dx = nextDirection.x;
    dy = nextDirection.y;

    update();
    lastMoveTime = time;
  }

  draw();
  requestAnimationFrame(loop);
}

// UPDATE
function update(){
  const head={x:snake[0].x+dx,y:snake[0].y+dy};

  if(head.x<0||head.x>=tileCount||head.y<0||head.y>=tileCount){
    startGame();
    return;
  }

  for(let p of snake){
    if(p.x===head.x && p.y===head.y){
      startGame();
      return;
    }
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    score++;
    coins++;

    localStorage.setItem("snakeCoins",coins);

    speed = Math.max(60, speed-2);

    if(score>highScore){
      highScore=score;
      localStorage.setItem("snakeHighScore",highScore);
    }

    food=randomFood();
    updateUI();
  } else {
    snake.pop();
  }
}

function randomFood(){
  return {
    x:Math.floor(Math.random()*tileCount),
    y:Math.floor(Math.random()*tileCount)
  };
}

// DRAW
function draw(){
  const bg=skins[equipped.bg]?.bg || "#020617";
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const foodColor=skins[equipped.food]?.food || "#f43f5e";

  // 🧇 WAFFLE DRAW
  if(equipped.food === "food_waffle"){
    const x = food.x * 20;
    const y = food.y * 20;

    ctx.fillStyle = "#d97706";
    ctx.fillRect(x+3,y+3,14,14);

    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 1;

    for(let i=5;i<=15;i+=4){
      ctx.beginPath();
      ctx.moveTo(x+i,y+3);
      ctx.lineTo(x+i,y+17);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x+3,y+i);
      ctx.lineTo(x+17,y+i);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle=foodColor;
    ctx.beginPath();
    ctx.arc(
      food.x*20+10,
      food.y*20+10,
      8+Math.sin(Date.now()/200)*2,
      0,
      Math.PI*2
    );
    ctx.fill();
  }

  const headColor=skins[equipped.snake]?.head || "#4ade80";
  const bodyColor=skins[equipped.snake]?.body || "#22c55e";

  ctx.lineWidth = 14;
  ctx.lineCap = "round";

  ctx.beginPath();
  snake.forEach((p,i)=>{
    const x=p.x*20+10;
    const y=p.y*20+10;

    if(i===0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });

  ctx.strokeStyle = bodyColor;
  ctx.stroke();

  const h=snake[0];
  ctx.fillStyle=headColor;
  ctx.beginPath();
  ctx.arc(h.x*20+10,h.y*20+10,8,0,Math.PI*2);
  ctx.fill();
}

// INPUT (WORKS)
document.addEventListener("keydown",(e)=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){
    e.preventDefault();
  }

  if(e.key==="ArrowUp" && dy!==1){
    nextDirection = {x:0,y:-1};
  }
  else if(e.key==="ArrowDown" && dy!==-1){
    nextDirection = {x:0,y:1};
  }
  else if(e.key==="ArrowLeft" && dx!==1){
    nextDirection = {x:-1,y:0};
  }
  else if(e.key==="ArrowRight" && dx!==-1){
    nextDirection = {x:1,y:0};
  }
  else if(e.key==="r"||e.key==="R"){
    startGame();
  }
});

// UI
infoBtn.onclick=()=>dropdown.classList.toggle("hidden");

shopBtn.onclick=()=>{
  shopDiv.classList.toggle("hidden");
  renderShop();
};

// SHOP
function renderShop(){
  shopDiv.innerHTML="<h3>Shop</h3>";

  shopItems.forEach(item=>{
    const div=document.createElement("div");
    div.className="shopItem";

    const color = skins[item.id]?.body || skins[item.id]?.food || skins[item.id]?.bg || "#888";

    const ownedItem=owned[item.id];
    let text="Buy ("+item.cost+")";

    if(ownedItem){
      text = equipped[item.type]===item.id ? "Equipped" : "Equip";
    }

    div.innerHTML=`
      <div class="preview" style="background:${color}"></div>
      <strong>${item.id}</strong>
      <button class="buyBtn">${text}</button>
    `;

    div.querySelector("button").onclick=()=>{
      if(!ownedItem){
        if(coins>=item.cost){
          coins-=item.cost;
          owned[item.id]=true;
          localStorage.setItem("snakeOwned",JSON.stringify(owned));
          localStorage.setItem("snakeCoins",coins);
        }
      } else {
        equipped[item.type]=item.id;
        localStorage.setItem("snakeEquipped",JSON.stringify(equipped));
      }

      updateUI();
      renderShop();
    };

    shopDiv.appendChild(div);
  });
}

// START
startGame();
requestAnimationFrame(loop);
