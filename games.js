

// ============================================
// MINESWEEPER - Windows 98 Classic
// ============================================

// Game state
let msBoard = [];
let msRows = 9;
let msCols = 9;
let msMines = 10;
let msGameActive = true;
let msFirstMove = true;
let msFlagsPlaced = 0;
let msTimerInterval = null;
let msSeconds = 0;

// DOM elements
const msBoardElement = document.getElementById('msBoard');
const msMineCounter = document.getElementById('msMineCounter');
const msTimerElement = document.getElementById('msTimer');
const msFaceButton = document.getElementById('msFaceButton');

// Difficulty settings
const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

// Best times (stored in localStorage)
let bestTimes = {
    beginner: localStorage.getItem('msBestBeginner') ? parseInt(localStorage.getItem('msBestBeginner')) : 999,
    intermediate: localStorage.getItem('msBestIntermediate') ? parseInt(localStorage.getItem('msBestIntermediate')) : 999,
    expert: localStorage.getItem('msBestExpert') ? parseInt(localStorage.getItem('msBestExpert')) : 999
};

// ========== MENU SYSTEM ==========
const msGameMenu = document.getElementById('msGameMenu');
const msHelpMenu = document.getElementById('msHelpMenu');
const msGameDropdown = document.getElementById('msGameDropdown');
const msHelpDropdown = document.getElementById('msHelpDropdown');
const msNewGame = document.getElementById('msNewGame');
const msBestTimes = document.getElementById('msBestTimes');
const msAbout = document.getElementById('msAbout');
const msDialogOverlay = document.getElementById('msDialogOverlay');
const msDialogClose = document.getElementById('msDialogClose');
const msDialogOk = document.getElementById('msDialogOk');
const msResetTimes = document.getElementById('msResetTimes');

// Toggle dropdown menus
msGameMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    msGameDropdown.style.display = msGameDropdown.style.display === 'none' ? 'block' : 'none';
    msHelpDropdown.style.display = 'none';
    positionDropdown(msGameMenu, msGameDropdown);
});

msHelpMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    msHelpDropdown.style.display = msHelpDropdown.style.display === 'none' ? 'block' : 'none';
    msGameDropdown.style.display = 'none';
    positionDropdown(msHelpMenu, msHelpDropdown);
});

function positionDropdown(menu, dropdown) {
    const rect = menu.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
}

document.addEventListener('click', () => {
    msGameDropdown.style.display = 'none';
    msHelpDropdown.style.display = 'none';
});

// Difficulty selection
document.querySelectorAll('[data-difficulty]').forEach(item => {
    item.addEventListener('click', (e) => {
        const diff = item.dataset.difficulty;
        const setting = difficulties[diff];
        msRows = setting.rows;
        msCols = setting.cols;
        msMines = setting.mines;
        initGame();
        msGameDropdown.style.display = 'none';
    });
});

// New Game
msNewGame.addEventListener('click', () => {
    initGame();
    msGameDropdown.style.display = 'none';
});

// Best Times dialog
msBestTimes.addEventListener('click', () => {
    updateBestTimesDisplay();
    msDialogOverlay.style.display = 'flex';
    msGameDropdown.style.display = 'none';
});

msAbout.addEventListener('click', () => {
    alert("Minesweeper\nWindows 98 Classic Edition\n\nFind all mines without detonating them!\n\n© Microsoft Corporation");
    msHelpDropdown.style.display = 'none';
});

function closeDialog() {
    msDialogOverlay.style.display = 'none';
}

msDialogClose.addEventListener('click', closeDialog);
msDialogOk.addEventListener('click', closeDialog);

msResetTimes.addEventListener('click', () => {
    bestTimes = { beginner: 999, intermediate: 999, expert: 999 };
    localStorage.setItem('msBestBeginner', 999);
    localStorage.setItem('msBestIntermediate', 999);
    localStorage.setItem('msBestExpert', 999);
    updateBestTimesDisplay();
});

function updateBestTimesDisplay() {
    document.getElementById('msTimeBeginner').innerText = bestTimes.beginner === 999 ? '---' : bestTimes.beginner;
    document.getElementById('msTimeIntermediate').innerText = bestTimes.intermediate === 999 ? '---' : bestTimes.intermediate;
    document.getElementById('msTimeExpert').innerText = bestTimes.expert === 999 ? '---' : bestTimes.expert;
}

// ========== GAME LOGIC ==========
function initGame() {
    // Stop timer
    if (msTimerInterval) {
        clearInterval(msTimerInterval);
        msTimerInterval = null;
    }
    
    msGameActive = true;
    msFirstMove = true;
    msFlagsPlaced = 0;
    msSeconds = 0;
    msTimerElement.innerText = '000';
    msMineCounter.innerText = String(msMines).padStart(3, '0');
    msFaceButton.innerHTML = '🙂';
    
    // Initialize empty board
    msBoard = [];
    for (let i = 0; i < msRows; i++) {
        msBoard[i] = [];
        for (let j = 0; j < msCols; j++) {
            msBoard[i][j] = {
                isMine: false,
                revealed: false,
                flagged: false,
                neighborMines: 0
            };
        }
    }
    
    renderBoard();
}

function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < msMines) {
        const row = Math.floor(Math.random() * msRows);
        const col = Math.floor(Math.random() * msCols);
        
        // Don't place mine on first click cell or its neighbors (optional but classic)
        if (!msBoard[row][col].isMine && !(row === firstRow && col === firstCol)) {
            msBoard[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculate neighbor counts
    for (let i = 0; i < msRows; i++) {
        for (let j = 0; j < msCols; j++) {
            if (!msBoard[i][j].isMine) {
                msBoard[i][j].neighborMines = countNeighborMines(i, j);
            }
        }
    }
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < msRows && newCol >= 0 && newCol < msCols) {
                if (msBoard[newRow][newCol].isMine) count++;
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    if (!msGameActive) return;
    if (msBoard[row][col].revealed) return;
    if (msBoard[row][col].flagged) return;
    
    // First move - place mines
    if (msFirstMove) {
        placeMines(row, col);
        msFirstMove = false;
        startTimer();
    }
    
    if (msBoard[row][col].isMine) {
        // Game over
        msGameActive = false;
        msFaceButton.innerHTML = '💀';
        if (msTimerInterval) clearInterval(msTimerInterval);
        revealAllMines();
        alert('BOOM! Game Over!');
        return;
    }
    
    msBoard[row][col].revealed = true;
    
    if (msBoard[row][col].neighborMines === 0) {
        // Reveal neighbors
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < msRows && newCol >= 0 && newCol < msCols) {
                    if (!msBoard[newRow][newCol].revealed && !msBoard[newRow][newCol].flagged) {
                        revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    renderBoard();
    checkWin();
}

function toggleFlag(row, col) {
    if (!msGameActive) return;
    if (msBoard[row][col].revealed) return;
    
    if (!msBoard[row][col].flagged) {
        if (msFlagsPlaced < msMines) {
            msBoard[row][col].flagged = true;
            msFlagsPlaced++;
        }
    } else {
        msBoard[row][col].flagged = false;
        msFlagsPlaced--;
    }
    
    msMineCounter.innerText = String(msMines - msFlagsPlaced).padStart(3, '0');
    renderBoard();
}

function checkWin() {
    let revealedCount = 0;
    for (let i = 0; i < msRows; i++) {
        for (let j = 0; j < msCols; j++) {
            if (msBoard[i][j].revealed) revealedCount++;
        }
    }
    
    const totalNonMines = (msRows * msCols) - msMines;
    if (revealedCount === totalNonMines) {
        msGameActive = false;
        if (msTimerInterval) clearInterval(msTimerInterval);
        msFaceButton.innerHTML = '😎';
        
        // Check best time
        const difficulty = getCurrentDifficulty();
        if (bestTimes[difficulty] > msSeconds && msSeconds > 0) {
            bestTimes[difficulty] = msSeconds;
            localStorage.setItem(`msBest${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`, msSeconds);
            alert(`New Record! Time: ${msSeconds} seconds`);
        } else {
            alert(`You won! Time: ${msSeconds} seconds`);
        }
    }
}

function getCurrentDifficulty() {
    if (msRows === 9 && msCols === 9) return 'beginner';
    if (msRows === 16 && msCols === 16) return 'intermediate';
    return 'expert';
}

function revealAllMines() {
    for (let i = 0; i < msRows; i++) {
        for (let j = 0; j < msCols; j++) {
            if (msBoard[i][j].isMine) {
                msBoard[i][j].revealed = true;
            }
        }
    }
    renderBoard();
}

function startTimer() {
    if (msTimerInterval) clearInterval(msTimerInterval);
    msTimerInterval = setInterval(() => {
        if (msGameActive) {
            msSeconds++;
            msTimerElement.innerText = String(msSeconds).padStart(3, '0');
        }
    }, 1000);
}

// ========== RENDER BOARD ==========
function renderBoard() {
    msBoardElement.style.gridTemplateColumns = `repeat(${msCols}, 24px)`;
    msBoardElement.innerHTML = '';
    
    for (let i = 0; i < msRows; i++) {
        for (let j = 0; j < msCols; j++) {
            const cell = msBoard[i][j];
            const cellDiv = document.createElement('div');
            cellDiv.className = 'ms-cell';
            
            if (cell.revealed) {
                cellDiv.classList.add('revealed');
                if (cell.isMine) {
                    cellDiv.classList.add('mine-revealed');
                    cellDiv.innerHTML = '💣';
                } else if (cell.neighborMines > 0) {
                    cellDiv.setAttribute('data-value', cell.neighborMines);
                    cellDiv.innerHTML = cell.neighborMines;
                } else {
                    cellDiv.innerHTML = '';
                }
            } else if (cell.flagged) {
                cellDiv.classList.add('flagged');
                cellDiv.innerHTML = '⚑';
            } else {
                cellDiv.innerHTML = '';
            }
            
            cellDiv.addEventListener('click', (function(r, c) {
                return function() { revealCell(r, c); };
            })(i, j));
            
            cellDiv.addEventListener('contextmenu', (function(r, c) {
                return function(e) {
                    e.preventDefault();
                    toggleFlag(r, c);
                };
            })(i, j));
            
            msBoardElement.appendChild(cellDiv);
        }
    }
}

// Face button reset
msFaceButton.addEventListener('click', () => {
    initGame();
});

// Keyboard F2 for new game
document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
        e.preventDefault();
        initGame();
    }
});

// ========== INITIALIZE ==========
initGame();

