// --- Game Variables ---
const gameContainer = document.getElementById('game-container');
const bird = document.getElementById('bird');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');

// --- 🔊 SOUND VARIABLES 🔊 ---
const soundWing = document.getElementById('sound-wing');
const soundHit = document.getElementById('sound-hit');
const soundPoint = document.getElementById('sound-point');

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const BIRD_SIZE = 30;

// 🌳 GROUND HEIGHT 🌳
const GROUND_HEIGHT = 100;

// --- CURRENT PHYSICS SETTINGS (Fast Mode / High Jump) ---
const JUMP_POWER = 90;   
const GRAVITY = 3.5;     
const PIPE_SPEED = 3.5;    
const PIPE_GENERATION_TIME = 1100; 
// --------------------------------------------------------

const PIPE_WIDTH = 52; 
const PIPE_GAP = 160;

let birdY = 250;
let velocity = 0;
let score = 0;
let isGameOver = true;
let gameLoopInterval;
let pipeGenerationInterval;

// --- Utility Functions ---

function setBirdY(y) {
    const MAX_BIRD_Y = GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
    birdY = Math.max(0, Math.min(MAX_BIRD_Y, y)); 
    bird.style.top = birdY + 'px';
}

function jump() {
    if (isGameOver) return;
    velocity = -JUMP_POWER;
    bird.style.transform = 'rotate(-45deg)'; 
    
    soundWing.currentTime = 0; 
    soundWing.play();
}

function startGame() {
    if (!isGameOver) return;

    // *** START SCREEN CONTENT RESET ***
    // Reinsert the Start Logo and Button images
    message.innerHTML = `
        <img src="https://i.ibb.co/v4PQxTQ0/Flappy-Bird-Transparent.png" alt="Flappy Bird Logo" style="width: 100%; display: block; margin-bottom: 10px;">
        <img src="https://i.ibb.co/6cxPvyZc/Start-button-sprite.png" alt="Tap or Space to Start" style="display: block; width: 150px; margin: 20px auto 0 auto;">
    `;
    
    // Reset state
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = score;
    velocity = 0;
    setBirdY(250);
    message.style.display = 'none';

    // Clear existing pipes
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

    // Start game loops
    gameLoopInterval = setInterval(gameLoop, 20); 
    pipeGenerationInterval = setInterval(generatePipe, PIPE_GENERATION_TIME); 
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(pipeGenerationInterval);
    
    // 🔊 Play HIT sound
    soundHit.currentTime = 0;
    soundHit.play();
    
    // --- 🖼️ CUSTOM GAME OVER SCREEN IMAGE INJECTION 🖼️ ---
    message.innerHTML = `
        <img src="https://i.ibb.co/CKSjtsZJ/IMG-20251122-080458.png" alt="Game Over Title" style="width: 100%; display: block; margin-bottom: 20px;">
        
        <p style="
            font-family: 'Press Start 2P', cursive; 
            font-size: 24px; 
            color: yellow;
            -webkit-text-stroke: 1px black; 
            text-shadow: 2px 2px 0px #000;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 20px;
        ">SCORE: ${score}</p>
        
        <img src="https://i.ibb.co/8DQW7Zj4/362223.png" alt="Restart" style="display: block; width: 150px; margin: 0 auto;">
    `;

    message.style.display = 'block';
}

// --- Pipe Management ---

function generatePipe() {
    if (isGameOver) return;

    const minHeight = 50;
    const maxHeight = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minHeight;
    const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - topPipeHeight - PIPE_GAP;

    const pipeTop = document.createElement('div');
    pipeTop.classList.add('pipe', 'pipe-top');
    pipeTop.style.height = topPipeHeight + 'px';
    pipeTop.style.left = GAME_WIDTH + 'px';
    gameContainer.appendChild(pipeTop);

    const pipeBottom = document.createElement('div');
    pipeBottom.classList.add('pipe', 'pipe-bottom');
    pipeBottom.style.height = bottomPipeHeight + 'px';
    pipeBottom.style.top = (topPipeHeight + PIPE_GAP) + 'px'; 
    pipeBottom.style.left = GAME_WIDTH + 'px';
    gameContainer.appendChild(pipeBottom);
}

function movePipes() {
    document.querySelectorAll('.pipe').forEach(pipe => {
        let pipeX = parseInt(pipe.style.left);
        
        pipeX -= PIPE_SPEED; 
        
        pipe.style.left = pipeX + 'px';

        if (pipeX + PIPE_WIDTH < 0) {
            pipe.remove();
        }

        // Score update
        if (pipe.classList.contains('pipe-top') && pipeX < 50 && pipeX + PIPE_SPEED >= 50) { 
            score++;
            scoreDisplay.textContent = score;
            
            soundPoint.currentTime = 0;
            soundPoint.play();
        }
    });
}

// --- Collision Detection ---

function checkCollision() {
    const birdRect = bird.getBoundingClientRect();
    
    const floorCollisionY = GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
    
    // Floor/Ceiling collision
    if (birdY >= floorCollisionY || birdY <= 0) {
        return true;
    }

    // Pipe collision
    const pipes = document.querySelectorAll('.pipe');
    for (let pipe of pipes) {
        const pipeRect = pipe.getBoundingClientRect();

        if (
            birdRect.left < pipeRect.right &&
            birdRect.right > pipeRect.left &&
            birdRect.top < pipeRect.bottom &&
            birdRect.bottom > pipeRect.top
        ) {
            return true;
        }
    }

    return false;
}

// --- Main Game Loop ---

function gameLoop() {
    if (isGameOver) return;

    // 1. Apply Gravity
    velocity += GRAVITY;
    setBirdY(birdY + velocity * 0.05);

    // Rotate the bird
    let rotation = Math.min(90, velocity * 1.5); 
    bird.style.transform = `rotate(${rotation}deg)`;

    // 2. Move Pipes
    movePipes();

    // 3. Check for Collision
    if (checkCollision()) {
        endGame();
    }
}

// --- Event Listeners (Controls) ---

function gameAction(e) {
    e.preventDefault(); 
    if (isGameOver) {
        startGame();
    } else {
        jump();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        gameAction(e);
    }
});

gameContainer.addEventListener('touchstart', gameAction);
gameContainer.addEventListener('click', gameAction);