// ====== SETUP =======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// ====== GAME CONSTANTS =======
const GRAVITY = 0.5;
const JUMP_FORCE = 12;
const GROUND_HEIGHT = 50;     // thickness of the ground at bottom
const OBSTACLE_SPEED = 6;     // how fast obstacles move left
const SPAWN_INTERVAL = 90;    // frames between obstacles spawn (lower = more frequent)
const OBSTACLE_WIDTH = 30;
const MIN_OBSTACLE_HEIGHT = 40;
const MAX_OBSTACLE_HEIGHT = 120;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 48;

// ====== PLAYER =======
let player = {
  x: 50,
  y: HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  vy: 0,         // vertical velocity
  jumping: false
};

// ====== OBSTACLES =======
let obstacles = [];  // Each obstacle: { x, y, width, height }

// ====== GAME STATE =======
let frameCount = 0;
let score = 0;
let highScore = 0; // stored in localStorage
let gameOver = false;

// Check for saved high score
if (localStorage.getItem("endlessRunnerHighScore")) {
  highScore = parseInt(localStorage.getItem("endlessRunnerHighScore"));
}

// ====== INPUT HANDLING =======
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameOver) {
      jump();
    } else {
      resetGame();
    }
  }
});

function jump() {
  if (!player.jumping) {
    player.vy = -JUMP_FORCE;
    player.jumping = true;
  }
}

// ====== GAME LOOP =======
function update() {
  if (gameOver) return;

  frameCount++;
  // Player gravity + position update
  player.vy += GRAVITY;
  player.y += player.vy;

  // Prevent falling below ground
  if (player.y + player.height >= HEIGHT - GROUND_HEIGHT) {
    player.y = HEIGHT - GROUND_HEIGHT - player.height;
    player.vy = 0;
    player.jumping = false;
  }

  // Spawn obstacles
  if (frameCount % SPAWN_INTERVAL === 0) {
    spawnObstacle();
  }

  // Move obstacles
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= OBSTACLE_SPEED;

    // Collision check
    if (checkCollision(player, obstacles[i])) {
      endGame();
    }

    // Remove offscreen obstacles
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      i--;
      // Increase score
      score++;
      if (score > highScore) {
        highScore = score;
      }
    }
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw ground
  ctx.fillStyle = "#4B4B4B";
  ctx.fillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, GROUND_HEIGHT);

  // Draw player
  ctx.fillStyle = "#FFC600";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw obstacles
  ctx.fillStyle = "#FF4444";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // UI text
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`High Score: ${highScore}`, 10, 60);

  // Game Over text
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "30px sans-serif";
    ctx.fillText("GAME OVER!", WIDTH / 2 - 90, HEIGHT / 2 - 20);
    ctx.font = "20px sans-serif";
    ctx.fillText("Press SPACE to restart", WIDTH / 2 - 120, HEIGHT / 2 + 10);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ====== HELPERS =======
function spawnObstacle() {
  let obstacleHeight = Math.floor(
    Math.random() * (MAX_OBSTACLE_HEIGHT - MIN_OBSTACLE_HEIGHT + 1)
  ) + MIN_OBSTACLE_HEIGHT;

  let obstacle = {
    x: WIDTH,
    y: HEIGHT - GROUND_HEIGHT - obstacleHeight,
    width: OBSTACLE_WIDTH,
    height: obstacleHeight
  };
  obstacles.push(obstacle);
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function endGame() {
  gameOver = true;
  localStorage.setItem("endlessRunnerHighScore", highScore.toString());
}

function resetGame() {
  // Reset everything
  player.x = 50;
  player.y = HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
  player.vy = 0;
  player.jumping = false;
  obstacles = [];
  frameCount = 0;
  score = 0;
  gameOver = false;
}

// Start loop
loop();
