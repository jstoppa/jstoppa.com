const GRID_WIDTH = 12;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 24;

// Define Tetris shapes as arrays of coordinates
const SHAPES = [
    [[0, 0], [1, 0], [0, 1], [1, 1]], // Square
    [[0, 0], [1, 0], [2, 0], [3, 0]], // Line
    [[0, 0], [1, 0], [2, 0], [2, 1]], // L
    [[0, 1], [1, 1], [2, 1], [2, 0]], // J
    [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
    [[0, 1], [1, 1], [1, 0], [2, 0]], // S
    [[0, 0], [1, 0], [2, 0], [1, 1]]  // T
];

const SHAPE_COLORS = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.gameOverDiv = document.getElementById('gameOver');
        this.restartButton = document.getElementById('restartButton');
        this.scoreElement = document.getElementById('score');
        
        // Create offscreen canvas for double buffering
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });
        
        this.grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        this.currentShape = this.getRandomShape();
        this.score = 0;
        this.gameOver = false;
        this.lastDropTime = 0;
        this.dropInterval = 1000; // 1 second
        this.animationFrameId = null;

        this.setupCanvas();
        this.setupEventListeners();
        this.startGame();
    }

    setupCanvas() {
        this.canvas.width = GRID_WIDTH * BLOCK_SIZE;
        this.canvas.height = GRID_HEIGHT * BLOCK_SIZE;
        this.offscreenCanvas.width = this.canvas.width;
        this.offscreenCanvas.height = this.canvas.height;
        
        // Set up canvas for better performance
        this.ctx.imageSmoothingEnabled = false;
        this.offscreenCtx.imageSmoothingEnabled = false;
    }

    setupEventListeners() {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.restartButton.addEventListener('click', this.restartGame.bind(this));
    }

    getRandomShape() {
        const index = Math.floor(Math.random() * SHAPES.length);
        return {
            shape: SHAPES[index],
            color: SHAPE_COLORS[index],
            x: Math.floor(GRID_WIDTH / 2) - 1,
            y: 0
        };
    }

    drawGrid() {
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y][x]) {
                    this.offscreenCtx.fillStyle = this.grid[y][x];
                    this.offscreenCtx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    this.offscreenCtx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    drawShape() {
        this.offscreenCtx.fillStyle = this.currentShape.color;
        this.currentShape.shape.forEach(([x, y]) => {
            this.offscreenCtx.fillRect(
                (this.currentShape.x + x) * BLOCK_SIZE,
                (this.currentShape.y + y) * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
            this.offscreenCtx.strokeRect(
                (this.currentShape.x + x) * BLOCK_SIZE,
                (this.currentShape.y + y) * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        });
    }

    isValidMove(shape, newX, newY, newShape = shape.shape) {
        for (const [x, y] of newShape) {
            const gridX = newX + x;
            const gridY = newY + y;

            if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
                return false;
            }

            if (gridY < 0) continue;

            if (this.grid[gridY][gridX]) {
                return false;
            }
        }
        return true;
    }

    rotateShape() {
        const newShape = this.currentShape.shape.map(([x, y]) => [y, -x]).reverse();
        if (this.isValidMove(this.currentShape, this.currentShape.x, this.currentShape.y, newShape)) {
            this.currentShape.shape = newShape;
        }
    }

    moveShape(dx) {
        if (this.isValidMove(this.currentShape, this.currentShape.x + dx, this.currentShape.y)) {
            this.currentShape.x += dx;
        }
    }

    dropShape() {
        if (this.isValidMove(this.currentShape, this.currentShape.x, this.currentShape.y + 1)) {
            this.currentShape.y += 1;
        } else {
            this.freezeShape();
        }
    }

    freezeShape() {
        this.currentShape.shape.forEach(([x, y]) => {
            const gridY = this.currentShape.y + y;
            const gridX = this.currentShape.x + x;
            if (gridY >= 0) {
                this.grid[gridY][gridX] = this.currentShape.color;
            }
        });
        this.clearLines();
        this.currentShape = this.getRandomShape();
        if (!this.isValidMove(this.currentShape, this.currentShape.x, this.currentShape.y)) {
            this.endGame();
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(GRID_WIDTH).fill(null));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
            this.scoreElement.textContent = `Score: ${this.score}`;
        }
    }

    handleKeyDown(event) {
        if (this.gameOver) return;
        switch (event.key) {
            case 'ArrowLeft':
                this.moveShape(-1);
                break;
            case 'ArrowRight':
                this.moveShape(1);
                break;
            case 'ArrowDown':
                this.dropShape();
                break;
            case 'ArrowUp':
                this.rotateShape();
                break;
        }
    }

    gameLoop(timestamp) {
        if (this.gameOver) return;

        // Drop the shape based on time instead of fixed intervals
        if (timestamp - this.lastDropTime > this.dropInterval) {
            this.dropShape();
            this.lastDropTime = timestamp;
        }

        this.drawGrid();
        this.drawShape();
        
        // Copy the offscreen canvas to the visible canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    startGame() {
        this.lastDropTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    endGame() {
        this.gameOver = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.gameOverDiv.classList.remove('hidden');
    }

    restartGame() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        this.currentShape = this.getRandomShape();
        this.score = 0;
        this.gameOver = false;
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.gameOverDiv.classList.add('hidden');
        this.startGame();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new TetrisGame();
}); 