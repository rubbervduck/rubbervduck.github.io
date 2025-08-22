// Game variables
let gameRunning = false;
let gamePaused = false;
let score = 0;
let coins = 0;
let highScore = parseInt(localStorage.getItem('marioHighScore')) || 0;
let obstacles = [];
let coinElements = [];
let gameLoop;
let obstacleSpawnLoop;
let coinSpawnLoop;
let isJumping = false;
let gameSpeed = 2;

// Game elements
const mario = document.getElementById('mario');
const gameContainer = document.getElementById('marioGame');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const startMessage = document.getElementById('startMessage');
const pauseIndicator = document.getElementById('pauseIndicator');
const progressFill = document.getElementById('progressFill');
const headerMario = document.getElementById('headerMario');

// Initialize high score display
highScoreElement.textContent = highScore;

// Start the game
function startGame() {
  if (headerMario) {
    headerMario.style.display = 'none';
  }
  
  const game = document.getElementById('marioGame');
  if (game) {
    game.style.display = 'block';
    game.focus();
    game.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (startMessage) startMessage.style.display = 'block';
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    
    setTimeout(initGame, 500);
  }
}

// Close the game
function closeGame() {
  endGame();
  const game = document.getElementById('marioGame');
  if (game) {
    game.style.display = 'none';
  }
  if (headerMario) {
    headerMario.style.display = 'block';
  }
}

// Initialize game
function initGame() {
  if (gameRunning) return;
  
  gameRunning = true;
  gamePaused = false;
  score = 0;
  coins = 0;
  gameSpeed = 1;
  obstacles = [];
  coinElements = [];
  isJumping = false;
  
  startMessage.style.display = 'none';
  gameOverScreen.style.display = 'none';
  pauseIndicator.style.display = 'none';
  
  mario.className = 'mario';
  mario.style.left = '50px';
  
  document.querySelectorAll('.obstacle, .coin, .jump-particle').forEach(el => el.remove());
  
  updateScore();
  updateProgress();
  
  gameLoop = setInterval(updateGame, 16);
  obstacleSpawnLoop = setInterval(spawnObstacle, 2000);
  coinSpawnLoop = setInterval(spawnCoin, 3000);
}

// Create jump particles
function createJumpParticles() {
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'jump-particle';
    particle.style.left = (parseInt(mario.style.left) + Math.random() * 48) + 'px';
    particle.style.bottom = '20%';
    gameContainer.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.remove();
      }
    }, 600);
  }
}

// Make Mario jump
function jump() {
  if (!gameRunning) {
    initGame();
    return;
  }
  
  if (gamePaused || isJumping) return;
  
  isJumping = true;
  mario.classList.add('jumping');
  createJumpParticles();
  
  setTimeout(() => {
    mario.classList.remove('jumping');
    isJumping = false;
  }, 600);
}

// Spawn obstacle
function spawnObstacle() {
  if (!gameRunning || gamePaused) return;
  
  const obstacle = document.createElement('div');
  obstacle.className = 'obstacle';
  obstacle.style.animationDuration = (2 / gameSpeed) + 's';
  gameContainer.appendChild(obstacle);
  obstacles.push(obstacle);
  
  setTimeout(() => {
    if (obstacle.parentNode) {
      obstacle.remove();
      obstacles = obstacles.filter(obs => obs !== obstacle);
      if (gameRunning) {
        score++;
        updateScore();
        updateProgress();
        
        if (score % 5 === 0 && gameSpeed < 4) {
          gameSpeed += 0.1;
          clearInterval(obstacleSpawnLoop);
          obstacleSpawnLoop = setInterval(spawnObstacle, Math.max(1000, 2000 - score * 15));
        }
      }
    }
  }, (2 / gameSpeed) * 1000);
}

// Spawn coin
function spawnCoin() {
  if (!gameRunning || gamePaused) return;
  
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.style.animationDuration = (3 / gameSpeed) + 's';
  gameContainer.appendChild(coin);
  coinElements.push(coin);
  
  setTimeout(() => {
    if (coin.parentNode) {
      coin.remove();
      coinElements = coinElements.filter(c => c !== coin);
    }
  }, (3 / gameSpeed) * 1000);
}

// Update game state
function updateGame() {
  if (!gameRunning || gamePaused) return;
  
  checkCollisions();
  checkCoinCollection();
}

// Check for collisions
function checkCollisions() {
  const marioRect = mario.getBoundingClientRect();
  
  obstacles.forEach(obstacle => {
    const obstacleRect = obstacle.getBoundingClientRect();
    
    if (obstacleRect.right > marioRect.left && 
        obstacleRect.left < marioRect.right &&
        obstacleRect.bottom > marioRect.top &&
        obstacleRect.top < marioRect.bottom) {
      
      gameContainer.classList.add('shake');
      setTimeout(() => gameContainer.classList.remove('shake'), 500);
      endGame();
    }
  });
}

// Check coin collection
function checkCoinCollection() {
  const marioRect = mario.getBoundingClientRect();
  
  coinElements.forEach((coin, index) => {
    const coinRect = coin.getBoundingClientRect();
    
    if (coinRect.right > marioRect.left && 
        coinRect.left < marioRect.right &&
        coinRect.bottom > marioRect.top &&
        coinRect.top < marioRect.bottom) {
      
      coin.remove();
      coinElements.splice(index, 1);
      coins++;
      score += 2;
      updateScore();
      updateProgress();
    }
  });
}

// Update progress bar
function updateProgress() {
  const progress = Math.min((score / 50) * 100, 100);
  progressFill.style.width = progress + '%';
}

// End the game
function endGame() {
  gameRunning = false;
  gamePaused = false;
  
  clearInterval(gameLoop);
  clearInterval(obstacleSpawnLoop);
  clearInterval(coinSpawnLoop);
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('marioHighScore', highScore);
    highScoreElement.textContent = highScore;
  }
  
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalCoins').textContent = coins;
  document.getElementById('finalHighScore').textContent = highScore;
  gameOverScreen.style.display = 'flex';
  
  setTimeout(() => {
    obstacles.forEach(obs => obs.remove());
    coinElements.forEach(coin => coin.remove());
    obstacles = [];
    coinElements = [];
  }, 100);
}

// Restart the game
function restartGame() {
  endGame();
  setTimeout(initGame, 100);
}

// Update score display
function updateScore() {
  scoreElement.textContent = score;
  coinsElement.textContent = coins;
}

// Toggle pause
function togglePause() {
  if (!gameRunning) return;
  
  gamePaused = !gamePaused;
  
  if (gamePaused) {
    pauseIndicator.style.display = 'block';
    obstacles.forEach(obs => {
      obs.style.animationPlayState = 'paused';
    });
    coinElements.forEach(coin => {
      coin.style.animationPlayState = 'paused';
    });
    document.querySelectorAll('.cloud').forEach(cloud => {
      cloud.style.animationPlayState = 'paused';
    });
  } else {
    pauseIndicator.style.display = 'none';
    obstacles.forEach(obs => {
      obs.style.animationPlayState = 'running';
    });
    coinElements.forEach(coin => {
      coin.style.animationPlayState = 'running';
    });
    document.querySelectorAll('.cloud').forEach(cloud => {
      cloud.style.animationPlayState = 'running';
    });
  }
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    jump();
  } else if (e.code === 'Escape') {
    e.preventDefault();
    if (gameRunning) {
      togglePause();
    } else {
      closeGame();
    }
  }
});

gameContainer.addEventListener('click', (e) => {
  if (e.target === gameContainer || e.target.closest('.mario')) {
    jump();
  }
});

gameContainer.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    jump();
  }
});
