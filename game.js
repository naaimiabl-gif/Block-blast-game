// Block Blast Game
const BOARD_SIZE = 8;
const COLORS = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8'];

// Beschikbare blokvormen
const SHAPES = [
    // Enkele blok
    [[1]],
    // Horizontale lijn 2
    [[1, 1]],
    // Horizontale lijn 3
    [[1, 1, 1]],
    // Horizontale lijn 4
    [[1, 1, 1, 1]],
    // Verticale lijn 2
    [[1], [1]],
    // Verticale lijn 3
    [[1], [1], [1]],
    // Verticale lijn 4
    [[1], [1], [1], [1]],
    // Vierkant 2x2
    [[1, 1], [1, 1]],
    // Vierkant 3x3
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    // L-vorm
    [[1, 0], [1, 0], [1, 1]],
    // Omgekeerde L
    [[0, 1], [0, 1], [1, 1]],
    // T-vorm
    [[1, 1, 1], [0, 1, 0]],
    // Omgekeerde T
    [[0, 1, 0], [1, 1, 1]],
    // Z-vorm
    [[1, 1, 0], [0, 1, 1]],
    // S-vorm
    [[0, 1, 1], [1, 1, 0]],
    // Kleine L
    [[1, 1], [1, 0]],
    // Kleine omgekeerde L
    [[1, 1], [0, 1]],
    // Hoek links-onder
    [[1, 0], [1, 1]],
    // Hoek rechts-onder
    [[0, 1], [1, 1]],
];

class BlockBlast {
    constructor() {
        this.board = [];
        this.boardColors = [];
        this.score = 0;
        this.pieces = [null, null, null];
        this.pieceColors = [null, null, null];
        this.usedPieces = [false, false, false];
        this.draggedPiece = null;
        this.draggedPieceIndex = null;

        this.init();
    }

    init() {
        this.createBoard();
        this.generateNewPieces();
        this.setupEventListeners();
        this.updateScore();
    }

    createBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < BOARD_SIZE; row++) {
            this.board[row] = [];
            this.boardColors[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.board[row][col] = 0;
                this.boardColors[row][col] = null;

                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
    }

    generateNewPieces() {
        for (let i = 0; i < 3; i++) {
            this.pieces[i] = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            this.pieceColors[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.usedPieces[i] = false;
        }
        this.renderPieces();
    }

    renderPieces() {
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`piece-slot-${i}`);
            slot.innerHTML = '';

            if (this.usedPieces[i]) continue;

            const piece = this.pieces[i];
            const pieceElement = document.createElement('div');
            pieceElement.className = `piece ${this.pieceColors[i]}`;
            pieceElement.dataset.pieceIndex = i;
            pieceElement.draggable = true;

            const rows = piece.length;
            const cols = piece[0].length;
            pieceElement.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
            pieceElement.style.gridTemplateRows = `repeat(${rows}, 25px)`;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement('div');
                    cell.className = `piece-cell ${piece[r][c] ? 'filled' : ''}`;
                    pieceElement.appendChild(cell);
                }
            }

            slot.appendChild(pieceElement);
        }
    }

    setupEventListeners() {
        // Drag events voor stukken
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('piece')) {
                this.draggedPieceIndex = parseInt(e.target.dataset.pieceIndex);
                this.draggedPiece = this.pieces[this.draggedPieceIndex];
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('piece')) {
                e.target.classList.remove('dragging');
                this.clearPreview();
                this.draggedPiece = null;
                this.draggedPieceIndex = null;
            }
        });

        // Drop events voor het bord
        const boardElement = document.getElementById('game-board');

        boardElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.cell');
            if (cell && this.draggedPiece) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.showPreview(row, col);
            }
        });

        boardElement.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget?.closest('#game-board')) {
                this.clearPreview();
            }
        });

        boardElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const cell = e.target.closest('.cell');
            if (cell && this.draggedPiece) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.placePiece(row, col);
            }
        });

        // Touch support
        this.setupTouchEvents();

        // Restart knop
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    setupTouchEvents() {
        let touchPieceIndex = null;
        let touchPiece = null;
        let ghostElement = null;

        document.addEventListener('touchstart', (e) => {
            const pieceEl = e.target.closest('.piece');
            if (pieceEl && !pieceEl.classList.contains('used')) {
                touchPieceIndex = parseInt(pieceEl.dataset.pieceIndex);
                touchPiece = this.pieces[touchPieceIndex];
                pieceEl.classList.add('dragging');

                // Maak ghost element
                ghostElement = pieceEl.cloneNode(true);
                ghostElement.style.position = 'fixed';
                ghostElement.style.pointerEvents = 'none';
                ghostElement.style.zIndex = '1000';
                ghostElement.style.opacity = '0.8';
                document.body.appendChild(ghostElement);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (touchPiece && ghostElement) {
                e.preventDefault();
                const touch = e.touches[0];
                ghostElement.style.left = `${touch.clientX - 40}px`;
                ghostElement.style.top = `${touch.clientY - 40}px`;

                // Zoek cel onder touch
                const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                const cell = elemBelow?.closest('.cell');
                if (cell) {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    this.draggedPiece = touchPiece;
                    this.draggedPieceIndex = touchPieceIndex;
                    this.showPreview(row, col);
                } else {
                    this.clearPreview();
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (touchPiece) {
                const pieceEl = document.querySelector(`.piece[data-piece-index="${touchPieceIndex}"]`);
                if (pieceEl) pieceEl.classList.remove('dragging');

                if (ghostElement) {
                    const touch = e.changedTouches[0];
                    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                    const cell = elemBelow?.closest('.cell');
                    if (cell) {
                        const row = parseInt(cell.dataset.row);
                        const col = parseInt(cell.dataset.col);
                        this.draggedPiece = touchPiece;
                        this.draggedPieceIndex = touchPieceIndex;
                        this.placePiece(row, col);
                    }

                    ghostElement.remove();
                    ghostElement = null;
                }

                this.clearPreview();
                touchPiece = null;
                touchPieceIndex = null;
                this.draggedPiece = null;
                this.draggedPieceIndex = null;
            }
        });
    }

    showPreview(row, col) {
        this.clearPreview();

        if (!this.draggedPiece) return;

        const canPlace = this.canPlacePiece(row, col, this.draggedPiece);
        const cells = document.querySelectorAll('.cell');

        for (let r = 0; r < this.draggedPiece.length; r++) {
            for (let c = 0; c < this.draggedPiece[r].length; c++) {
                if (this.draggedPiece[r][c]) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    if (targetRow < BOARD_SIZE && targetCol < BOARD_SIZE) {
                        const cellIndex = targetRow * BOARD_SIZE + targetCol;
                        if (cells[cellIndex]) {
                            cells[cellIndex].classList.add(canPlace ? 'preview' : 'invalid-preview');
                        }
                    }
                }
            }
        }
    }

    clearPreview() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('preview', 'invalid-preview');
        });
    }

    canPlacePiece(row, col, piece) {
        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    const targetRow = row + r;
                    const targetCol = col + c;

                    if (targetRow >= BOARD_SIZE || targetCol >= BOARD_SIZE) {
                        return false;
                    }
                    if (this.board[targetRow][targetCol]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece(row, col) {
        if (!this.draggedPiece || !this.canPlacePiece(row, col, this.draggedPiece)) {
            return;
        }

        const colorClass = this.pieceColors[this.draggedPieceIndex];
        let blocksPlaced = 0;

        // Plaats het stuk
        for (let r = 0; r < this.draggedPiece.length; r++) {
            for (let c = 0; c < this.draggedPiece[r].length; c++) {
                if (this.draggedPiece[r][c]) {
                    const targetRow = row + r;
                    const targetCol = col + c;
                    this.board[targetRow][targetCol] = 1;
                    this.boardColors[targetRow][targetCol] = colorClass;
                    blocksPlaced++;
                }
            }
        }

        // Score voor geplaatste blokken
        this.score += blocksPlaced;

        // Markeer stuk als gebruikt
        this.usedPieces[this.draggedPieceIndex] = true;

        this.renderBoard();
        this.renderPieces();

        // Check voor volle rijen/kolommen
        setTimeout(() => {
            this.checkAndClearLines();
        }, 50);
    }

    renderBoard() {
        const cells = document.querySelectorAll('.cell');
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cellIndex = row * BOARD_SIZE + col;
                const cell = cells[cellIndex];

                // Reset klassen
                cell.className = 'cell';

                if (this.board[row][col]) {
                    cell.classList.add('filled');
                    if (this.boardColors[row][col]) {
                        cell.classList.add(this.boardColors[row][col]);
                    }
                }
            }
        }
    }

    checkAndClearLines() {
        const rowsToClear = [];
        const colsToClear = [];

        // Check rijen
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (this.board[row].every(cell => cell === 1)) {
                rowsToClear.push(row);
            }
        }

        // Check kolommen
        for (let col = 0; col < BOARD_SIZE; col++) {
            let full = true;
            for (let row = 0; row < BOARD_SIZE; row++) {
                if (this.board[row][col] !== 1) {
                    full = false;
                    break;
                }
            }
            if (full) {
                colsToClear.push(col);
            }
        }

        if (rowsToClear.length === 0 && colsToClear.length === 0) {
            this.checkForNewPieces();
            this.checkGameOver();
            return;
        }

        // Animatie voor clearen
        const cells = document.querySelectorAll('.cell');
        const cellsToClear = new Set();

        rowsToClear.forEach(row => {
            for (let col = 0; col < BOARD_SIZE; col++) {
                cellsToClear.add(row * BOARD_SIZE + col);
            }
        });

        colsToClear.forEach(col => {
            for (let row = 0; row < BOARD_SIZE; row++) {
                cellsToClear.add(row * BOARD_SIZE + col);
            }
        });

        cellsToClear.forEach(index => {
            cells[index].classList.add('clearing');
        });

        // Bereken score
        const linesCleared = rowsToClear.length + colsToClear.length;
        const basePoints = cellsToClear.size;
        const bonusMultiplier = linesCleared > 1 ? linesCleared : 1;
        this.score += basePoints * bonusMultiplier * 10;

        this.updateScore();

        // Clear na animatie
        setTimeout(() => {
            rowsToClear.forEach(row => {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    this.board[row][col] = 0;
                    this.boardColors[row][col] = null;
                }
            });

            colsToClear.forEach(col => {
                for (let row = 0; row < BOARD_SIZE; row++) {
                    this.board[row][col] = 0;
                    this.boardColors[row][col] = null;
                }
            });

            this.renderBoard();
            this.checkForNewPieces();
            this.checkGameOver();
        }, 300);
    }

    checkForNewPieces() {
        // Als alle stukken gebruikt zijn, genereer nieuwe
        if (this.usedPieces.every(used => used)) {
            this.generateNewPieces();
        }
    }

    canPlaceAnyPiece() {
        for (let i = 0; i < 3; i++) {
            if (this.usedPieces[i]) continue;

            const piece = this.pieces[i];
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    if (this.canPlacePiece(row, col, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkGameOver() {
        if (!this.canPlaceAnyPiece()) {
            this.gameOver();
        }
    }

    gameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    restart() {
        document.getElementById('game-over').classList.add('hidden');
        this.score = 0;
        this.updateScore();
        this.createBoard();
        this.generateNewPieces();
    }
}

// Start het spel
document.addEventListener('DOMContentLoaded', () => {
    new BlockBlast();
});
