// Game Configuration and State
const BOARD_SIZE = 10;
const TOTAL_CELLS = 100;
let players = [{ id: 'p1', pos: 0 }, { id: 'p2', pos: 0 }];
let turn = 0; // 0 for p1, 1 for p2
let isAnimating = false;

// Snakes and Ladders mapping (Start: End)
const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

// Initialize App (Updated with Safety Checks)
document.addEventListener("DOMContentLoaded", () => {
    try {
        generateBoard();
        loadSettings();
    } catch (error) {
        console.error("Initialization error:", error);
    } finally {
        // This ensures the loading screen ALWAYS disappears, even if an error occurs
        setTimeout(() => navTo('screen-home'), 1000); 
    }
});

// Navigation System
function navTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screen-game') startGame();
    if (screenId === 'screen-leaderboard') loadLeaderboard();
}

// Generate 10x10 Zig-Zag Board
function generateBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    let cells = [];
    
    for (let row = 9; row >= 0; row--) {
        let rowCells = [];
        for (let col = 1; col <= 10; col++) {
            rowCells.push(row * 10 + col);
        }
        // Alternate rows for zig-zag
        if (row % 2 !== 0) rowCells.reverse(); 
        cells = cells.concat(rowCells);
    }

    cells.forEach(num => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${num}`;
        cell.innerText = num;
        
        // Visual indicator for snakes and ladders (Placeholder for images)
        if (snakes[num]) cell.innerText += ' 🐍';
        if (ladders[num]) cell.innerText += ' 🪜';
        
        board.appendChild(cell);
    });
}

// Core Game Logic
function startGame() {
    players = [{ id: 'p1', pos: 0 }, { id: 'p2', pos: 0 }];
    turn = 0;
    isAnimating = false;
    document.getElementById('player-2').classList.remove('hidden'); // Enable 2P
    updateTurnUI();
    moveToken(0, 0); // Reset p1
    moveToken(1, 0); // Reset p2
    document.getElementById('dice-result').innerText = "Tap to Roll";
}

function rollDice() {
    if (isAnimating) return;
    isAnimating = true;
    
    const diceEl = document.getElementById('dice');
    const resultEl = document.getElementById('dice-result');
    diceEl.classList.add('rolling');
    playSound('roll');

    setTimeout(() => {
        diceEl.classList.remove('rolling');
        const roll = Math.floor(Math.random() * 6) + 1;
        
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        diceEl.innerText = diceFaces[roll - 1];
        resultEl.innerText = `Rolled a ${roll}`;

        handleMovement(roll);
    }, 600);
}

function handleMovement(roll) {
    let currentPlayer = players[turn];
    let newPos = currentPlayer.pos + roll;

    if (newPos > TOTAL_CELLS) {
        // Must land exactly on 100
        endTurn();
        return;
    }

    currentPlayer.pos = newPos;
    moveToken(turn, newPos);

    setTimeout(() => {
        // Check Snakes and Ladders
        if (snakes[newPos]) {
            playSound('slide');
            currentPlayer.pos = snakes[newPos];
            moveToken(turn, currentPlayer.pos);
        } else if (ladders[newPos]) {
            playSound('climb');
            currentPlayer.pos = ladders[newPos];
            moveToken(turn, currentPlayer.pos);
        }

        setTimeout(() => {
            if (currentPlayer.pos === TOTAL_CELLS) {
                handleWin();
            } else {
                endTurn();
            }
        }, 600); // Wait for snake/ladder animation
    }, 600); // Wait for initial move animation
}

function endTurn() {
    turn = turn === 0 ? 1 : 0;
    updateTurnUI();
    isAnimating = false;
}

function updateTurnUI() {
    const pName = turn === 0 ? "Player 1" : "Player 2";
    const pColor = turn === 0 ? "#3498db" : "#f1c40f";
    const indicator = document.getElementById('turn-indicator');
    indicator.innerText = `${pName}'s Turn`;
    indicator.style.color = pColor;
}

// Convert board number to X/Y coordinates for smooth CSS transition
function moveToken(playerIndex, cellNumber) {
    if (cellNumber === 0) {
        // Off-board starting position
        const token = document.getElementById(playerIndex === 0 ? 'player-1' : 'player-2');
        token.style.left = `-10%`;
        token.style.top = `90%`;
        return;
    }

    // Math to calculate CSS Grid position
    let zeroBased = cellNumber - 1;
    let row = Math.floor(zeroBased / 10);
    let col = zeroBased % 10;
    
    // Zig-zag compensation
    if (row % 2 !== 0) col = 9 - col;
    
    // Convert to percentage (10% per cell)
    let cssX = col * 10;
    let cssY = (9 - row) * 10; // 0,0 in CSS is top-left

    const token = document.getElementById(playerIndex === 0 ? 'player-1' : 'player-2');
    // Offset for center of cell (+1% for centering)
    token.style.left = `${cssX + 1}%`;
    token.style.top = `${cssY + 1}%`;
}

// Winning and Leaderboard Logic (Updated for Safety)
function handleWin() {
    const winnerName = turn === 0 ? "Player 1" : "Player 2";
    document.getElementById('winner-text').innerText = `${winnerName} Wins!`;
    saveWin(winnerName);
    navTo('screen-win');
}

function saveWin(winner) {
    try {
        let scores = JSON.parse(localStorage.getItem('sl_scores')) || { 'Player 1': 0, 'Player 2': 0 };
        scores[winner]++;
        localStorage.setItem('sl_scores', JSON.stringify(scores));
    } catch(e) {
        console.warn("Could not save win due to storage restrictions.", e);
    }
}

function loadLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    let scores = { 'Player 1': 0, 'Player 2': 0 }; 
    try {
        scores = JSON.parse(localStorage.getItem('sl_scores')) || scores;
    } catch(e) {
        console.warn("Could not load leaderboard due to storage restrictions.", e);
    }
    list.innerHTML = `
        <li>Player 1: ${scores['Player 1']} Wins</li>
        <li>Player 2: ${scores['Player 2']} Wins</li>
    `;
}

function resetLeaderboard() {
    try {
        localStorage.removeItem('sl_scores');
    } catch (e) {
        console.warn("Could not reset leaderboard.", e);
    }
    loadLeaderboard();
}

// Utilities (Settings, Dialogs, Audio)
function confirmExit() {
    if (confirm("Are you sure you want to leave this game? Progress will be lost.")) {
        navTo('screen-home');
    }
}

function pauseGame() {
    alert("Game Paused. Click OK to resume.");
}

function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    document.body.className = theme;
    try {
        localStorage.setItem('sl_theme', theme);
    } catch(e) {
        console.warn("Could not save theme due to storage restrictions.", e);
    }
}

// Updated for Safety
function loadSettings() {
    try {
        const savedTheme = localStorage.getItem('sl_theme');
        if (savedTheme) {
            document.body.className = savedTheme;
            document.getElementById('theme-select').value = savedTheme;
        }
    } catch (e) {
        console.warn("LocalStorage access denied. Themes will not be saved, but you can still play.", e);
    }
}

// Audio Placeholder Function
function playSound(type) {
    const isSoundOn = document.getElementById('toggle-sound').checked;
    if (!isSoundOn) return;
    
    // To implement real sounds, add files to assets/sounds/ and uncomment:
    // const audio = new Audio(`assets/sounds/${type}.mp3`);
    // audio.play();
    console.log(`[Audio] Playing ${type} sound`);
}