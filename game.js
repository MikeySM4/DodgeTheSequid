/*************************************************
  Setup canvas and dynamic resizing
**************************************************/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');

/**
 * Matches the canvas’s internal resolution to its
 * displayed size in CSS for crisp rendering.
 */
function setCanvasResolution() {
  // The CSS sets the display size; read that
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width;
  canvas.height = height;
}

// Run once on load, and again whenever window resizes
setCanvasResolution();
window.addEventListener('resize', setCanvasResolution);

/*************************************************
  Game variables
**************************************************/
let gameStarted = false;
let timeLeft = 30;          // 30-second timer
let speedMultiplier = 1;    // Gradually increases to make objects fall faster
let objects = [];           // Array of falling objects

// Player object
let square = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  isDragging: false
};

/*************************************************
  Position player at bottom center on start/reset
**************************************************/
function positionPlayer() {
  square.x = canvas.width / 2 - square.width / 2;
  square.y = canvas.height - square.height - 10; // 10px above bottom
}
positionPlayer();

/*************************************************
  Load images with fallback
**************************************************/
let playerImg = new Image();
let playerImgLoaded = false;
playerImg.onload = () => {
  // If the image truly loaded (naturalWidth > 0)
  if (playerImg.naturalWidth > 0) {
    playerImgLoaded = true;
    console.log('Player image loaded successfully');
  }
};
playerImg.onerror = () => {
  console.error('Player image failed to load. Falling back to blue square.');
};
playerImg.src = './resizedinvinsible.jpg';

let objectImg = new Image();
let objectImgLoaded = false;
objectImg.onload = () => {
  if (objectImg.naturalWidth > 0) {
    objectImgLoaded = true;
    console.log('Object image loaded successfully');
  }
};
objectImg.onerror = () => {
  console.error('Object image failed to load. Falling back to red squares.');
};
objectImg.src = './resizedSequidNo.jpg';

/*************************************************
  Core game logic
**************************************************/
// Spawn a new falling object
function spawnObject() {
  objects.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    width: 20,
    height: 20,
    speed: 2 * speedMultiplier
  });
}

// Collision detection: axis-aligned bounding boxes
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Reset the game state
function resetGame() {
  objects = [];
  timeLeft = 30;
  speedMultiplier = 1;
  gameStarted = false;
  positionPlayer();
  timerDisplay.textContent = '30';
}

// The main update function: draws the player and objects
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);



  // Draw a colored background
  ctx.fillStyle = 'lightblue';   // or any color you like
  ctx.fillRect(0, 0, canvas.width, canvas.height);




  // 1) Draw the player
  if (playerImgLoaded) {
    ctx.drawImage(playerImg, square.x, square.y, square.width, square.height);
  } else {
    ctx.fillStyle = 'blue';
    ctx.fillRect(square.x, square.y, square.width, square.height);
  }

  // 2) Update and draw each falling object
  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].y += objects[i].speed;

    if (objectImgLoaded) {
      ctx.drawImage(objectImg, objects[i].x, objects[i].y, objects[i].width, objects[i].height);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
    }

    // Check collision
    if (checkCollision(square, objects[i])) {
      alert('Game Over!');
      resetGame();
      return;
    }

    // Remove if off-screen
    if (objects[i].y > canvas.height) {
      objects.splice(i, 1);
    }
  }

  // 3) Spawn new objects occasionally (if the game is active)
  if (gameStarted && Math.random() < 0.02 * speedMultiplier) {
    spawnObject();
  }
}

// Handle the timer and speed increase
function updateTimer() {
  if (gameStarted && timeLeft > 0) {
    timeLeft -= 1 / 60; // ~1 frame at 60fps
    timerDisplay.textContent = Math.ceil(timeLeft);
    speedMultiplier += 0.005; // Speed up objects gradually
  }

  if (timeLeft <= 0) {
    alert('You Win!');
    resetGame();
  }
}

/*************************************************
  Mouse & Touch events
**************************************************/
// Mouse
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  // Check if clicked inside the player square
  if (
    mouseX >= square.x &&
    mouseX <= square.x + square.width &&
    mouseY >= square.y &&
    mouseY <= square.y + square.height
  ) {
    square.isDragging = true;
    if (!gameStarted) {
      gameStarted = true;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (square.isDragging) {
    const rect = canvas.getBoundingClientRect();
    square.x = e.clientX - rect.left - square.width / 2;
    square.y = e.clientY - rect.top - square.height / 2;
    // Constrain within canvas
    square.x = Math.max(0, Math.min(canvas.width - square.width, square.x));
    square.y = Math.max(0, Math.min(canvas.height - square.height, square.y));
  }
});

canvas.addEventListener('mouseup', () => {
  square.isDragging = false;
});

// If mouse leaves canvas, stop dragging
canvas.addEventListener('mouseleave', () => {
  square.isDragging = false;
});

// Touch
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  const touchY = e.touches[0].clientY - rect.top;
  if (
    touchX >= square.x &&
    touchX <= square.x + square.width &&
    touchY >= square.y &&
    touchY <= square.y + square.height
  ) {
    square.isDragging = true;
    if (!gameStarted) {
      gameStarted = true;
    }
  }
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (square.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    square.x = touchX - square.width / 2;
    square.y = touchY - square.height / 2;
    // Constrain within canvas
    square.x = Math.max(0, Math.min(canvas.width - square.width, square.x));
    square.y = Math.max(0, Math.min(canvas.height - square.height, square.y));
  }
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  square.isDragging = false;
});

/*************************************************
  The main loop
**************************************************/
function gameLoop() {
  update();
  updateTimer();
  requestAnimationFrame(gameLoop);
}
gameLoop();
