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
  { id: "snake_blue", type: "snake", cost: 20 },
  { id: "snake_gold", type: "snake", cost: 40 },
  { id: "snake_purple", type: "snake", cost: 60 },

  { id: "food_gold", type: "food", cost: 20 },
  { id: "food_blue", type: "food", cost: 40 },
  { id: "food_purple", type: "food", cost: 60 },

  { id: "bg_space", type: "bg", cost: 20 },
  { id: "bg_matrix", type: "bg", cost: 40 },
  { id: "bg_light", type: "bg", cost: 60 }
];

let owned = JSON.parse(localStorage.getItem("snakeOwned")) || {};
let equipped = JSON.parse(localStorage.getItem("snakeEquipped")) || {
  snake: "default",
  food: "default",
  bg: "default"
};

// --- COLORS ---
const skins = {
  default: { head:"#4ade80", body:"#22c55e", food:"#f43f5e", bg:"#020617" },
  snake_blue: { head:"#60a5fa", body:"#3b82f6" },
  snake_gold: { head:"#facc15", body:"#eab308" },
  snake_purple: { head:"#c084fc", body:"#a855f7" },

  food_gold: { food:"#facc15" },
  food_blue: { food:"#60a5fa" },
  food_purple: { food:"#c084fc" },

  bg_space: { bg:"#020617" },
  bg_matrix: { bg:"#001100" },
  bg_light: { bg:"#e5e7eb" }
};

// --- GAME ---
let snake, dx, dy, food, score, highScore, coins;
let speed = 120;
let lastTime = 0;
let gameRunning = true;

function startGame() {
  snake = [{x:10,y:10}];
  dx=1; dy=0;
  food=randomFood();
  score=0;
  speed=120;
  gameRunning=true;

  coins = parseInt(localStorage.getItem("snakeCoins"))||0;
  scoreEl.textContent=score;
  coinsEl.textContent=coins;

  highScore=localStorage.getItem("snakeHighScore")||0;
  highScoreEl.textContent=highScore;
}

function randomFood(){
  return {x:Math.floor(Math.random()*tileCount),y:Math.floor(Math.random()*tileCount)};
}

// LOOP
function loop(t){
  if(!gameRunning)return;
  if(t-lastTime>speed){
    update();
    lastTime=t;
  }
  draw(t);
  requestAnimationFrame(loop);
}

// UPDATE
function update(){
  const head={x:snake[0].x+dx,y:snake[0].y+dy};

  if(head.x<0||head.x>=tileCount||head.y<0||head.y>=tileCount)return gameOver();
  for(let p of snake) if(p.x===head.x&&p.y===head.y)return gameOver();

  snake.unshift(head);

  if(head.x===food.x&&head.y===food.y){
    score++; coins++;
    localStorage.setItem("snakeCoins",coins);
    scoreEl.textContent=score;
    coinsEl.textContent=coins;

    speed=Math.max(60,speed-2);

    if(score>highScore){
      highScore=score;
      localStorage.setItem("snakeHighScore",highScore);
      highScoreEl.textContent=highScore;
    }

    food=randomFood();
  } else snake.pop();
}

// DRAW (SMOOTH SLITHER)
function draw(t){
  const bg=skins[equipped.bg]?.bg||"#020617";
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const foodColor=skins[equipped.food]?.food||"#f43f5e";

  // animated food
  const pulse=Math.sin(t/150)*4;
  ctx.fillStyle=foodColor;
  ctx.beginPath();
  ctx.arc(food.x*20+10,food.y*20+10,8+pulse,0,Math.PI*2);
  ctx.fill();

  const headColor=skins[equipped.snake]?.head||"#4ade80";
  const bodyColor=skins[equipped.snake]?.body||"#22c55e";

  // SLITHER DRAW
  snake.forEach((p,i)=>{
    const prev=snake[i-1]||p;
    const x=p.x*20+10;
    const y=p.y*20+10;

    ctx.strokeStyle = i===0 ? headColor : bodyColor;
    ctx.lineWidth = 14 - i*0.3;
    ctx.lineCap="round";

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(prev.x*20+10, prev.y*20+10);
    ctx.stroke();

    // eyes on head
    if(i===0){
      ctx.fillStyle="black";
      ctx.beginPath();
      ctx.arc(x-3,y-3,2,0,Math.PI*2);
      ctx.arc(x+3,y-3,2,0,Math.PI*2);
      ctx.fill();
    }
  });
}

// GAME OVER
function gameOver(){
  gameRunning=false;
}

// INPUT
document.addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();

  if(e.key==="ArrowUp"&&dy!==1){dx=0;dy=-1;}
  else if(e.key==="ArrowDown"&&dy!==-1){dx=0;dy=1;}
  else if(e.key==="ArrowLeft"&&dx!==1){dx=-1;dy=0;}
  else if(e.key==="ArrowRight"&&dx!==-1){dx=1;dy=0;}
  else if(e.key==="r"||e.key==="R"){startGame();}
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

    const isOwned=owned[item.id];
    let text="Buy ("+item.cost+")";

    if(isOwned){
      text = equipped[item.type]===item.id ? "Equipped" : "Equip";
    }

    div.innerHTML=`
      <strong>${item.id}</strong>
      <button class="buyBtn">${text}</button>
    `;

    div.querySelector("button").onclick=()=>{
      if(!isOwned){
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

      coinsEl.textContent=coins;
      renderShop();
    };

    shopDiv.appendChild(div);
  });
}

// START
startGame();
requestAnimationFrame(loop);
