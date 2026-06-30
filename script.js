/* =========================================================
   SNAKES & LADDERS — script.js
   Generates the boustrophedon board, draws snakes/ladders
   as SVG, and runs turn-based dice movement.
   ========================================================= */

const SIZE = 10;

// start -> end
const LADDERS = { 1:38, 4:14, 9:21, 28:84, 40:59, 51:67, 63:81, 71:91, 80:100 };
// start (head, higher) -> end (tail, lower)
const SNAKES  = { 98:78, 95:75, 93:73, 87:24, 64:60, 62:19, 56:53, 49:11, 17:7 };

const PLAYER_COLORS = ["red", "blue", "green", "yellow"];
const PLAYER_NAMES  = ["Red", "Blue", "Green", "Yellow"];

let players = [];
let currentPlayerIndex = 0;
let gameActive = false;
let computerFlags = [false, true, true, true]; // default: P1 human, rest computer

const boardEl = document.getElementById("board");
const svgEl = document.getElementById("board-svg");
const laddersLayer = document.getElementById("ladders-layer");
const snakesLayer = document.getElementById("snakes-layer");
const tokensLayer = document.getElementById("tokens-layer");

/* ---------------- board numbering ---------------- */
// returns the cell number (1-100) for a given row (0=top) and col (0=left)
function numberAt(row, col) {
  const rowFromBottom = SIZE - 1 - row;
  const base = rowFromBottom * SIZE;
  const ascending = rowFromBottom % 2 === 0;
  return ascending ? base + col + 1 : base + (SIZE - col);
}

function colorFor(n) {
  const palette = ["red", "blue", "green", "yellow", "cream"];
  const seed = (n * 9301 + 49297) % 233280;
  return palette[seed % palette.length];
}

function buildBoard() {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const n = numberAt(row, col);
      const cell = document.createElement("div");
      cell.className = `cell color-${colorFor(n)}`;
      cell.dataset.number = n;
      cell.style.gridRowStart = row + 1;
      cell.style.gridColumnStart = col + 1;

      if (n === 100) {
        cell.classList.add("finish");
        cell.innerHTML = `<span class="finish-num">100</span><span class="finish-tag">FINISH</span>`;
      } else {
        cell.textContent = n;
      }
      boardEl.appendChild(cell);
    }
  }
}

/* ---------------- coordinate helpers ---------------- */
function cellCenter(n) {
  const row = Math.floor((100 - n) / SIZE);
  const rowFromBottom = SIZE - 1 - row;
  let col;
  const ascending = rowFromBottom % 2 === 0;
  if (ascending) col = (n - rowFromBottom * SIZE) - 1;
  else col = SIZE - (n - rowFromBottom * SIZE);
  const cellSize = 100 / SIZE;
  return { x: col * cellSize + cellSize / 2, y: row * cellSize + cellSize / 2 };
}

/* ---------------- drawing ladders ---------------- */
function drawLadders() {
  Object.entries(LADDERS).forEach(([start, end]) => {
    const a = cellCenter(Number(start));
    const b = cellCenter(Number(end));
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = -dy / len, uy = dx / len; // perpendicular unit vector
    const offset = 2.2;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    [-1, 1].forEach((side) => {
      const rail = document.createElementNS("http://www.w3.org/2000/svg", "line");
      rail.setAttribute("x1", a.x + ux * offset * side);
      rail.setAttribute("y1", a.y + uy * offset * side);
      rail.setAttribute("x2", b.x + ux * offset * side);
      rail.setAttribute("y2", b.y + uy * offset * side);
      rail.setAttribute("class", "ladder-rail");
      g.appendChild(rail);
    });

    const rungCount = Math.max(3, Math.round(len / 6));
    for (let i = 1; i < rungCount; i++) {
      const t = i / rungCount;
      const cx = a.x + dx * t, cy = a.y + dy * t;
      const rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
      rung.setAttribute("x1", cx + ux * offset);
      rung.setAttribute("y1", cy + uy * offset);
      rung.setAttribute("x2", cx - ux * offset);
      rung.setAttribute("y2", cy - uy * offset);
      rung.setAttribute("class", "ladder-rung");
      g.appendChild(rung);
    }
    laddersLayer.appendChild(g);
  });
}

/* ---------------- drawing snakes ---------------- */
function buildSnakePath(a, b) {
  // wavy cubic-bezier path from head (a) to tail (b)
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const ux = -dy / len, uy = dx / len;
  const segments = 3;
  let d = `M ${a.x} ${a.y}`;
  for (let i = 0; i < segments; i++) {
    const t1 = (i + 0.33) / segments;
    const t2 = (i + 0.66) / segments;
    const tEnd = (i + 1) / segments;
    const wobble = (i % 2 === 0 ? 1 : -1) * (len * 0.09);
    const c1x = a.x + dx * t1 + ux * wobble;
    const c1y = a.y + dy * t1 + uy * wobble;
    const c2x = a.x + dx * t2 - ux * wobble;
    const c2y = a.y + dy * t2 - uy * wobble;
    const ex = a.x + dx * tEnd;
    const ey = a.y + dy * tEnd;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
  }
  return d;
}

function drawSnakes() {
  const colorClasses = ["s-a", "s-b", "s-c"];
  Object.entries(SNAKES).forEach(([start, end], i) => {
    const a = cellCenter(Number(start));
    const b = cellCenter(Number(end));
    const path = buildSnakePath(a, b);
    const colorClass = colorClasses[i % colorClasses.length];

    const body = document.createElementNS("http://www.w3.org/2000/svg", "path");
    body.setAttribute("d", path);
    body.setAttribute("class", `snake-body ${colorClass}`);
    snakesLayer.appendChild(body);

    const scales = document.createElementNS("http://www.w3.org/2000/svg", "path");
    scales.setAttribute("d", path);
    scales.setAttribute("class", "snake-scales");
    snakesLayer.appendChild(scales);

    // head
    const headG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    headG.setAttribute("class", "snake-head");
    const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    head.setAttribute("cx", a.x);
    head.setAttribute("cy", a.y);
    head.setAttribute("rx", 1.9);
    head.setAttribute("ry", 1.5);
    head.setAttribute("class", `snake-head-shape ${colorClass}`);
    headG.appendChild(head);

    [-1, 1].forEach((side) => {
      const eye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      eye.setAttribute("cx", a.x + side * 1.4);
      eye.setAttribute("cy", a.y - 1);
      eye.setAttribute("r", 0.9);
      eye.setAttribute("class", "snake-eye");
      headG.appendChild(eye);
      const pupil = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pupil.setAttribute("cx", a.x + side * 1.4);
      pupil.setAttribute("cy", a.y - 1);
      pupil.setAttribute("r", 0.4);
      pupil.setAttribute("class", "snake-pupil");
      headG.appendChild(pupil);
    });

    const tongue = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tongue.setAttribute("d", `M ${a.x} ${a.y + 2} q 1 1.5 2.4 1.6 m -2.4 -1.6 q -1 1.5 -2.4 1.6`);
    tongue.setAttribute("class", "snake-tongue");
    headG.appendChild(tongue);

    snakesLayer.appendChild(headG);
  });
}

/* ---------------- players & tokens ---------------- */
function createPlayers(count) {
  players = [];
  for (let i = 0; i < count; i++) {
    players.push({
      color: PLAYER_COLORS[i],
      name: PLAYER_NAMES[i],
      position: 0,
      isComputer: computerFlags[i],
      el: null,
    });
  }
  currentPlayerIndex = 0;
}

function renderPlayerList() {
  const list = document.getElementById("player-list");
  list.innerHTML = "";
  players.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "player-row" + (i === currentPlayerIndex ? " active-turn" : "");
    li.id = `player-row-${i}`;
    li.innerHTML = `
      <span class="player-dot t-${p.color}"></span>
      <span class="player-name">${p.name}</span>
      ${p.isComputer ? '<span class="cpu-badge">CPU</span>' : ""}
      <span class="player-pos" id="player-pos-${i}">Start</span>
    `;
    list.appendChild(li);
  });
}

function renderTokens() {
  tokensLayer.innerHTML = "";
  players.forEach((p, i) => {
    const tok = document.createElement("div");
    tok.className = `token t-${p.color}`;
    p.el = tok;
    tokensLayer.appendChild(tok);
    placeToken(p, i);
  });
}

function placeToken(player, index) {
  // off-board cluster for position 0, otherwise centered on the cell
  // with a slight per-player offset so multiple tokens on one cell are visible
  const offsets = [
    { dx: -10, dy: -10 }, { dx: 10, dy: -10 },
    { dx: -10, dy: 10 },  { dx: 10, dy: 10 },
  ];
  const off = offsets[index % offsets.length];

  let x, y;
  if (player.position === 0) {
    const start = cellCenter(1);
    x = start.x + off.dx * 0.3;
    y = start.y + off.dy * 0.3 + 6;
  } else {
    const c = cellCenter(player.position);
    x = c.x + off.dx * 0.25;
    y = c.y + off.dy * 0.25;
  }
  player.el.style.left = `${x}%`;
  player.el.style.top = `${y}%`;
}

function updatePlayerPosUI(index) {
  const p = players[index];
  const posEl = document.getElementById(`player-pos-${index}`);
  posEl.textContent = p.position === 0 ? "Start" : `Square ${p.position}`;
}

function setActiveTurnUI() {
  players.forEach((_, i) => {
    document.getElementById(`player-row-${i}`).classList.toggle(
      "active-turn", i === currentPlayerIndex
    );
  });
}

/* ---------------- dice + turn logic ---------------- */
const diceEl = document.getElementById("dice");
const rollBtn = document.getElementById("roll-btn");
const turnMsg = document.getElementById("turn-msg");

function setDiceFace(value) {
  const pipMap = {
    1: ["p3"], 2: ["p1", "p6"], 3: ["p1", "p3", "p6"],
    4: ["p1", "p2", "p5", "p6"], 5: ["p1", "p2", "p3", "p5", "p6"],
    6: ["p1", "p2", "p3", "p4", "p5", "p6"],
  };
  document.querySelectorAll(".pip").forEach((p) => (p.style.opacity = 0));
  pipMap[value].forEach((cls) =>
    document.querySelector(`.${cls}`).style.opacity = 1
  );
}

function resolveJumps(position) {
  if (LADDERS[position]) return { newPos: LADDERS[position], type: "ladder" };
  if (SNAKES[position]) return { newPos: SNAKES[position], type: "snake" };
  return { newPos: position, type: null };
}

function rollDice() {
  if (!gameActive) return;
  if (players[currentPlayerIndex].isComputer) return; // computer rolls itself
  performRoll();
}

function performRoll() {
  rollBtn.disabled = true;
  diceEl.classList.remove("thinking");
  diceEl.classList.add("rolling");

  setTimeout(() => {
    const value = 1 + Math.floor(Math.random() * 6);
    setDiceFace(value);
    diceEl.classList.remove("rolling");
    movePlayer(value);
  }, 500);
}

function maybeComputerTurn() {
  if (!gameActive) return;
  const p = players[currentPlayerIndex];
  if (!p.isComputer) {
    rollBtn.disabled = false;
    rollBtn.textContent = "Roll Dice";
    return;
  }
  rollBtn.disabled = true;
  rollBtn.textContent = "Computer's Turn…";
  turnMsg.textContent = `${p.name} (Computer) is thinking…`;
  diceEl.classList.add("thinking");

  setTimeout(() => {
    diceEl.classList.remove("thinking");
    performRoll();
  }, 900);
}

function movePlayer(steps) {
  const p = players[currentPlayerIndex];
  let target = p.position + steps;

  if (target > 100) {
    turnMsg.textContent = `${p.name} rolled ${steps} — needs exact roll to finish.`;
    endTurn(steps === 6);
    return;
  }

  p.position = target;
  p.el.classList.add("moving");
  placeToken(p, currentPlayerIndex);
  updatePlayerPosUI(currentPlayerIndex);

  setTimeout(() => {
    p.el.classList.remove("moving");
    const { newPos, type } = resolveJumps(p.position);

    if (type) {
      setTimeout(() => {
        p.position = newPos;
        placeToken(p, currentPlayerIndex);
        updatePlayerPosUI(currentPlayerIndex);
        turnMsg.textContent = type === "ladder"
          ? `${p.name} climbed a ladder to ${newPos}!`
          : `${p.name} got bitten — sliding down to ${newPos}!`;
        finishMoveCheck(steps);
      }, 350);
    } else {
      turnMsg.textContent = `${p.name} rolled ${steps} → square ${p.position}.`;
      finishMoveCheck(steps);
    }
  }, 420);
}

function finishMoveCheck(steps) {
  const p = players[currentPlayerIndex];
  if (p.position === 100) {
    showWin(p);
    return;
  }
  endTurn(steps === 6);
}

function endTurn(extraTurn) {
  if (!extraTurn) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } else {
    turnMsg.textContent += " Rolled a 6 — go again!";
  }
  setActiveTurnUI();
  maybeComputerTurn();
}

function showWin(player) {
  gameActive = false;
  document.getElementById("win-text").textContent = `${player.name} wins! 🎉`;
  document.getElementById("win-overlay").hidden = false;
}

/* ---------------- setup flow ---------------- */
let selectedCount = 2;

function renderPlayerConfig(count) {
  const container = document.getElementById("player-config");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "config-row";
    const isCpu = computerFlags[i];
    row.innerHTML = `
      <span class="player-dot t-${PLAYER_COLORS[i]}"></span>
      <span class="config-name">${PLAYER_NAMES[i]}</span>
      <span class="mode-toggle" data-index="${i}">
        <button type="button" class="mode-human ${!isCpu ? "active" : ""}">Human</button>
        <button type="button" class="mode-cpu ${isCpu ? "active cpu-active" : ""}">Computer</button>
      </span>
    `;
    container.appendChild(row);
  }

  container.querySelectorAll(".mode-toggle").forEach((toggle) => {
    const idx = Number(toggle.dataset.index);
    toggle.querySelector(".mode-human").addEventListener("click", () => {
      computerFlags[idx] = false;
      renderPlayerConfig(selectedCount);
    });
    toggle.querySelector(".mode-cpu").addEventListener("click", () => {
      computerFlags[idx] = true;
      renderPlayerConfig(selectedCount);
    });
  });
}

document.querySelectorAll(".count-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".count-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCount = Number(btn.dataset.count);
    renderPlayerConfig(selectedCount);
  });
});
document.querySelector('.count-btn[data-count="2"]').classList.add("active");
renderPlayerConfig(selectedCount);

document.getElementById("start-btn").addEventListener("click", () => {
  createPlayers(selectedCount);
  renderPlayerList();
  renderTokens();
  setActiveTurnUI();

  document.getElementById("setup-card").hidden = true;
  document.getElementById("players-card").hidden = false;
  document.getElementById("dice-card").hidden = false;
  turnMsg.textContent = `${players[0].name} goes first. Roll the dice!`;
  gameActive = true;
  maybeComputerTurn();
});

document.getElementById("roll-btn").addEventListener("click", rollDice);

document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("win-overlay").hidden = true;
  document.getElementById("setup-card").hidden = false;
  document.getElementById("players-card").hidden = true;
  document.getElementById("dice-card").hidden = true;
});

/* ---------------- init ---------------- */
buildBoard();
drawLadders();
drawSnakes();
svgEl.setAttribute("viewBox", "0 0 100 100");