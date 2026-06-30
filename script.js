// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnTimeout;            // Holds the timeout for spawning items
let timerInterval;           // Holds the interval for the countdown timer
const canIncrease = 2;
const grid = document.querySelector('.game-grid');

// Difficulty settings, keyed by the <select> option values (1, 2, 3)
const DIFFICULTY_SETTINGS = {
  '1': { label: 'easy',   spawnDelay: 1200, timerDuration: 40, winThreshold: 15, decreaseCans: 1 },
  '2': { label: 'medium', spawnDelay: 1000, timerDuration: 30, winThreshold: 20, decreaseCans: 1 },
  '3': { label: 'hard',   spawnDelay: 800,  timerDuration: 20, winThreshold: 25, decreaseCans: 2 },
};

let currentDifficulty = '2'; // default to medium
let SPAWN_DELAY = DIFFICULTY_SETTINGS[currentDifficulty].spawnDelay;
let TIMER_DURATION = DIFFICULTY_SETTINGS[currentDifficulty].timerDuration;
let WIN_THRESHOLD = DIFFICULTY_SETTINGS[currentDifficulty].winThreshold;
let DECREASE_CANS = DIFFICULTY_SETTINGS[currentDifficulty].decreaseCans;
let timeLeft = TIMER_DURATION;

// Confetti
const jsConfetti = new JSConfetti();

const timerDisplay = document.getElementById('timer');
const cansDisplay = document.getElementById('current-cans');
const achievementsEl = document.getElementById('achievements');
const resetButton = document.getElementById('reset-game');
const difficultySelect = document.getElementById('difficulty-select');
let total = document.getElementById("total");

// Apply a difficulty level (expects '1', '2', or '3')
function setDifficulty(level) {
  const settings = DIFFICULTY_SETTINGS[level];
  if (!settings) return;

  currentDifficulty = level;
  SPAWN_DELAY = settings.spawnDelay;
  TIMER_DURATION = settings.timerDuration;
  WIN_THRESHOLD = settings.winThreshold;
  DECREASE_CANS = settings.decreaseCans;
  total.textContent = WIN_THRESHOLD;


  // Keep the displayed timer in sync if a game hasn't started yet
  if (!gameActive) {
    timeLeft = TIMER_DURATION;
    updateTimerDisplay();
  }
}

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

function scheduleNextSpawn() {
  if (!gameActive) return;

  clearTimeout(spawnTimeout);
  spawnTimeout = setTimeout(spawnWaterCan, SPAWN_DELAY);
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

  scheduleNextSpawn();
}

function handleGridClick(event) {
  if (!gameActive) return;

  if (event.target.closest('.water-can')) {
    currentCans += canIncrease;
    updateCansDisplay();
    spawnWaterCan();
    return;
  }

  currentCans = Math.max(0, currentCans - DECREASE_CANS);
  updateCansDisplay();
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active

  // Lock in whichever difficulty is currently selected
  if (difficultySelect) {
    setDifficulty(difficultySelect.value);
  }
  if (difficultySelect) difficultySelect.disabled = true; // prevent changing mid-round

  createGrid(); // Ensure the grid is set up before starting

  window.scrollTo(0, document.body.scrollHeight); // Jump instantly to the bottom of the page

  document.getElementById('start-game').style.display = 'none'; // Hide the start button once the game starts

  gameActive = true;
  currentCans = 0;
  timeLeft = TIMER_DURATION;
  updateCansDisplay();
  updateTimerDisplay();

  // Hide any previous end-of-game message
  if (achievementsEl) {
    achievementsEl.className = 'achievement';
    achievementsEl.innerHTML = '';
  }

  spawnWaterCan();

  if (resetButton) resetButton.style.display = 'inline-block';
  timerInterval = setInterval(() => {
    if (!gameActive) return;
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      endGame();
      const didWin = currentCans >= WIN_THRESHOLD;
      showEndMessage(didWin);
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearTimeout(spawnTimeout); // Stop spawning water cans
  clearInterval(timerInterval); // Stop countdown timer
  grid.innerHTML = ''; // Clear any existing grid cells
  if (resetButton) resetButton.style.display = 'none';
  if (difficultySelect) difficultySelect.disabled = false; // allow changing difficulty again
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

// Update timer preview immediately when difficulty changes (before game starts)
if (difficultySelect) {
  difficultySelect.addEventListener('change', () => {
    if (!gameActive) setDifficulty(difficultySelect.value);
  });
  // Initialize from whatever the select's default value is on page load
  setDifficulty(difficultySelect.value);
}