const board = document.getElementById("board");
let gameMode = 'vs-computer';
let playerPositions = [1, 1]; // [Player 1, Player 2/Computer]
let currentPlayer = 0; // 0 = P1, 1 = P2/Computer
let isGameOver = false;

// Snakes and Ladders Maps (Key: Start, Value: End)
const snakes = { 99: 5, 91: 60, 87: 36, 63: 18, 48: 9, 31: 4 };
const ladders = { 3: 39, 12: 45, 29: 72, 41: 83, 67: 92, 79: 98 };

// Initialize Grid Boards dynamically
function createBoard() {
    board.innerHTML = '';
    // Build from 100 down to 1 row by row
    for (let r = 9; r >= 0; r--) {
        let rowCells = [];
        for (let c = 0; c < 10; c++) {
            let id = (r % 2 === 0) ? (r * 10 + c + 1) : (r * 10 + (9 - c) + 1);
            rowCells.push(id);
        }
        rowCells.forEach(id => {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${id}`;
            cell.innerHTML = `<span style="opacity:0.3">${id}</span>`;
            
            if(snakes[id]) cell.classList.add("snake-start");
            if(ladders[id]) cell.classList.add("ladder-start");
            
            board.appendChild(cell);
        });
    }
    updateTokens();
}

function setMode(mode) {
    gameMode = mode;
    document.getElementById("setup-zone").classList.add("hidden");
    document.getElementById("game-zone").classList.remove("hidden");
    resetGame();
}

function updateTokens() {
    document.querySelectorAll(".token").forEach(t => t.remove());
    
    // Draw Player 1
    if(playerPositions[0] > 0) {
        const cell1 = document.getElementById(`cell-${playerPositions[0]}`);
        if(cell1) cell1.innerHTML += `<div class="token p1"></div>`;
    }
    // Draw Player 2/Computer
    if(playerPositions[1] > 0) {
        const cell2 = document.getElementById(`cell-${playerPositions[1]}`);
        if(cell2) cell2.innerHTML += `<div class="token p2"></div>`;
    }
}

function playTurn() {
    if (isGameOver) return;
    
    document.getElementById("roll-btn").disabled = true;
    let roll = Math.floor(Math.random() * 6) + 1;
    document.getElementById("dice").innerText = roll;
    
    movePlayer(currentPlayer, roll);
}

function movePlayer(player, spaces) {
    let oldPos = playerPositions[player];
    let newPos = oldPos + spaces;
    
    if (newPos <= 100) {
        playerPositions[player] = newPos;
        
        // Check for Snakes or Ladders
        if (snakes[newPos]) {
            playerPositions[player] = snakes[newPos];
        } else if (ladders[newPos]) {
            playerPositions[player] = ladders[newPos];
        }
    }
    
    updateTokens();
    
    if (playerPositions[player] === 100) {
        document.getElementById("status-text").innerText = `🎉 Player ${player + 1} Wins!`;
        isGameOver = true;
        return;
    }
    
    // Switch turn
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    let label = currentPlayer === 0 ? "Player 1's Turn" : (gameMode === 'vs-computer' ? "Computer is thinking..." : "Player 2's Turn");
    document.getElementById("status-text").innerText = label;

    // Trigger Computer Move if applicable
    if (!isGameOver && gameMode === 'vs-computer' && currentPlayer === 1) {
        setTimeout(() => {
            let compRoll = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dice").innerText = compRoll;
            movePlayer(1, compRoll);
            document.getElementById("roll-btn").disabled = false;
        }, 1200);
    } else {
        document.getElementById("roll-btn").disabled = false;
    }
}

function resetGame() {
    playerPositions = [1, 1];
    currentPlayer = 0;
    isGameOver = false;
    document.getElementById("dice").innerText = "-";
    document.getElementById("status-text").innerText = "Player 1's Turn";
    document.getElementById("roll-btn").disabled = false;
    createBoard();
}