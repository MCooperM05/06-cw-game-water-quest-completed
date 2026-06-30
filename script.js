// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
const TIMER_DURATION = 30;   // Seconds for the countdown timer
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the countdown timer
let timeLeft = TIMER_DURATION;
const canIncrease = 2;
const grid = document.querySelector('.game-grid');

// Confetti
const jsConfetti = new JSConfetti();

const timerDisplay = document.getElementById('timer');
const cansDisplay = document.getElementById('current-cans');
const achievementsEl = document.getElementById('achievements');
const resetButton = document.getElementById('reset-game');

function updateTimerDisplay() {
  timerDisplay.textContent = timeLeft;
}

function updateCansDisplay() {
  cansDisplay.textContent = currentCans;
}

function showEndMessage(didWin) {
  if (!achievementsEl) return;
  achievementsEl.className = 'achievement show ' + (didWin ? 'win' : 'lose');
  achievementsEl.innerHTML = `
    <div class="end-title">${didWin ? 'You won! 🎉' : "Time's up — you lost"}</div>
    <div class="end-sub">You collected ${currentCans} cans.</div>
  `;

  if (didWin) {
    jsConfetti.addConfetti({
      confettiColors: ['#ff0a54', '#ff477e', '#ff7096'],
      confettiNumber: 100,
    });
  }
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
}

function handleGridClick(event) {
  if (!gameActive) return;

  if (event.target.closest('.water-can')) {
    currentCans += canIncrease;
    updateCansDisplay();
    spawnWaterCan();
    return;
  }

  currentCans = Math.max(0, currentCans - 1);
  updateCansDisplay();
}

// Initializes and starts a new game
function startGame() {
  createGrid(); // Ensure the grid is set up before starting

  window.scrollTo(0, document.body.scrollHeight); // Jump instantly to the bottom of the page

  document.getElementById('start-game').style.display = 'none'; // Hide the start button once the game starts

  if (gameActive) return; // Prevent starting a new game if one is already active

  gameActive = true;
  currentCans = 0;
  timeLeft = TIMER_DURATION;
  updateCansDisplay();
  updateTimerDisplay();
  createGrid(); // Set up the game 
  
  // Hide any previous end-of-game message
  if (achievementsEl) {
    achievementsEl.className = 'achievement';
    achievementsEl.innerHTML = '';
  }

  spawnWaterCan();

  if (resetButton) resetButton.style.display = 'inline-block';
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
      const didWin = currentCans >= 20;
      showEndMessage(didWin);
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
  grid.innerHTML = ''; // Clear any existing grid cells
  if (resetButton) resetButton.style.display = 'none';
  document.getElementById('start-game').style.display = 'inline-block'; // Show the start button
  document.getElementById('start-game').textContent = 'Retry?'; // Change button text to indicate restart

}

// Set up click handlers
document.querySelector('.game-grid').addEventListener('click', handleGridClick);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', () => {
  endGame(); // End the current game if active
  currentCans = 0;
  timeLeft = TIMER_DURATION;
  updateCansDisplay();
  updateTimerDisplay();
  document.getElementById('start-game').textContent = 'Start Game'; // Change button text to indicate start
});
