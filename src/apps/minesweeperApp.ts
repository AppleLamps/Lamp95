// Minesweeper App for Lamp95
import { initializeGeminiIfNeeded, cachedGenerateContent } from '../ai';
import { MinesweeperCell, GeminiResponse } from '../types';
let minesweeperTimerInterval: number | null = null;
let minesweeperTimeElapsed: number = 0;
let minesweeperFlagsPlaced: number = 0;
let minesweeperGameOver: boolean = false;
let minesweeperMineCount: number = 10;
let minesweeperGridSize: { rows: number; cols: number } = { rows: 9, cols: 9 };
let minesweeperFirstClick: boolean = true;

export function initMinesweeperGame(windowElement: HTMLDivElement): void {
    const boardElement = windowElement.querySelector('#minesweeper-board') as HTMLDivElement;
    const flagCountElement = windowElement.querySelector('.minesweeper-flag-count') as HTMLDivElement;
    const timerElement = windowElement.querySelector('.minesweeper-timer') as HTMLDivElement;
    const resetButton = windowElement.querySelector('.minesweeper-reset-button') as HTMLButtonElement;
    const hintButton = windowElement.querySelector('.minesweeper-hint-button') as HTMLButtonElement;
    const commentaryElement = windowElement.querySelector('.minesweeper-commentary') as HTMLDivElement;

    if (!boardElement || !flagCountElement || !timerElement || !resetButton || !hintButton || !commentaryElement) return;

    let grid: MinesweeperCell[][] = [];

    function resetGame() {
        if (minesweeperTimerInterval) clearInterval(minesweeperTimerInterval);
        minesweeperTimerInterval = null;
        minesweeperTimeElapsed = 0;
        minesweeperFlagsPlaced = 0;
        minesweeperGameOver = false;
        minesweeperFirstClick = true;
        minesweeperMineCount = 10;
        minesweeperGridSize = { rows: 9, cols: 9 };
        timerElement.textContent = `⏱️ 0`;
        flagCountElement.textContent = `🚩 ${minesweeperMineCount}`;
        resetButton.textContent = '🙂';
        commentaryElement.textContent = "Let's play! Click a square.";
        createGrid();
    }

    function createGrid() {
        boardElement.innerHTML = '';
        grid = [];
        boardElement.style.gridTemplateColumns = `repeat(${minesweeperGridSize.cols}, 20px)`;
        boardElement.style.gridTemplateRows = `repeat(${minesweeperGridSize.rows}, 20px)`;
        const fragment = document.createDocumentFragment();
        for (let r = 0; r < minesweeperGridSize.rows; r++) {
            const row: MinesweeperCell[] = [];
            for (let c = 0; c < minesweeperGridSize.cols; c++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('minesweeper-cell');
                const cellData: MinesweeperCell = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    element: cellElement,
                    row: r,
                    col: c
                };
                cellElement.addEventListener('click', () => handleCellClick(cellData));
                cellElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleCellRightClick(cellData);
                });
                row.push(cellData);
                fragment.appendChild(cellElement);
            }
            grid.push(row);
        }
        boardElement.appendChild(fragment);
    }

    function placeMines(firstClickRow: number, firstClickCol: number) {
        let minesPlaced = 0;
        while (minesPlaced < minesweeperMineCount) {
            const r = Math.floor(Math.random() * minesweeperGridSize.rows);
            const c = Math.floor(Math.random() * minesweeperGridSize.cols);
            if ((r === firstClickRow && c === firstClickCol) || grid[r][c].isMine) continue;
            grid[r][c].isMine = true;
            minesPlaced++;
        }
        for (let r = 0; r < minesweeperGridSize.rows; r++) {
            for (let c = 0; c < minesweeperGridSize.cols; c++) {
                if (!grid[r][c].isMine) grid[r][c].adjacentMines = countAdjacentMines(r, c);
            }
        }
    }

    function countAdjacentMines(row: number, col: number): number {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < minesweeperGridSize.rows && nc >= 0 && nc < minesweeperGridSize.cols && grid[nr][nc].isMine) count++;
            }
        }
        return count;
    }

    function handleCellClick(cell: MinesweeperCell) {
        if (minesweeperGameOver || cell.isRevealed || cell.isFlagged) return;
        if (minesweeperFirstClick && !minesweeperTimerInterval) {
            placeMines(cell.row, cell.col);
            minesweeperFirstClick = false;
            startTimer();
        }
        if (cell.isMine) gameOver(cell);
        else {
            revealCell(cell);
            checkWinCondition();
        }
    }

    function handleCellRightClick(cell: MinesweeperCell) {
        if (minesweeperGameOver || cell.isRevealed || (minesweeperFirstClick && !minesweeperTimerInterval)) return;
        cell.isFlagged = !cell.isFlagged;
        cell.element.textContent = cell.isFlagged ? '🚩' : '';
        minesweeperFlagsPlaced += cell.isFlagged ? 1 : -1;
        updateFlagCount();
        checkWinCondition();
    }

    function revealCell(cell: MinesweeperCell) {
        if (cell.isRevealed || cell.isFlagged || cell.isMine) return;
        cell.isRevealed = true;
        cell.element.classList.add('revealed');
        cell.element.textContent = '';
        if (cell.adjacentMines > 0) {
            cell.element.textContent = cell.adjacentMines.toString();
            cell.element.dataset.number = cell.adjacentMines.toString();
        } else {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = cell.row + dr;
                    const nc = cell.col + dc;
                    if (nr >= 0 && nr < minesweeperGridSize.rows && nc >= 0 && nc < minesweeperGridSize.cols) {
                        const neighbor = grid[nr][nc];
                        if (!neighbor.isRevealed && !neighbor.isFlagged) revealCell(neighbor);
                    }
                }
            }
        }
    }

    function startTimer() {
        if (minesweeperTimerInterval) return;
        minesweeperTimeElapsed = 0;
        timerElement.textContent = `⏱️ 0`;
        minesweeperTimerInterval = window.setInterval(() => {
            minesweeperTimeElapsed++;
            timerElement.textContent = `⏱️ ${minesweeperTimeElapsed}`;
        }, 1000);
    }

    function updateFlagCount() {
        flagCountElement.textContent = `🚩 ${minesweeperMineCount - minesweeperFlagsPlaced}`;
    }

    function gameOver(clickedMine: MinesweeperCell) {
        minesweeperGameOver = true;
        if (minesweeperTimerInterval) clearInterval(minesweeperTimerInterval);
        minesweeperTimerInterval = null;
        resetButton.textContent = '😵';
        grid.forEach(row => row.forEach(cell => {
            if (cell.isMine) {
                cell.element.classList.add('mine', 'revealed');
                cell.element.textContent = '💣';
            }
            if (!cell.isMine && cell.isFlagged) cell.element.textContent = '❌';
        }));
        clickedMine.element.classList.add('exploded');
        clickedMine.element.textContent = '💥';
    }

    function checkWinCondition() {
        if (minesweeperGameOver) return;
        let revealedCount = 0;
        let correctlyFlaggedMines = 0;
        grid.forEach(row => row.forEach(cell => {
            if (cell.isRevealed && !cell.isMine) revealedCount++;
            if (cell.isFlagged && cell.isMine) correctlyFlaggedMines++;
        }));
        const totalNonMineCells = (minesweeperGridSize.rows * minesweeperGridSize.cols) - minesweeperMineCount;
        if (revealedCount === totalNonMineCells || (correctlyFlaggedMines === minesweeperMineCount && minesweeperFlagsPlaced === minesweeperMineCount)) {
            minesweeperGameOver = true;
            if (minesweeperTimerInterval) clearInterval(minesweeperTimerInterval);
            minesweeperTimerInterval = null;
            resetButton.textContent = '😎';
            if (revealedCount === totalNonMineCells) {
                grid.forEach(row => row.forEach(cell => {
                    if (cell.isMine && !cell.isFlagged) {
                        cell.isFlagged = true;
                        cell.element.textContent = '🚩';
                        minesweeperFlagsPlaced++;
                    }
                }));
                updateFlagCount();
            }
        }
    }

    function getBoardStateAsText(): string {
        let boardString = `Flags: ${minesweeperMineCount - minesweeperFlagsPlaced}, Time: ${minesweeperTimeElapsed}s\nGrid (H=Hidden,F=Flag,Num=Mines):\n`;
        grid.forEach(row => {
            row.forEach(cell => {
                if (cell.isFlagged) boardString += " F ";
                else if (!cell.isRevealed) boardString += " H ";
                else if (cell.adjacentMines > 0) boardString += ` ${cell.adjacentMines} `;
                else boardString += " _ ";
            });
            boardString += "\n";
        });
        return boardString;
    }

    async function getAiHint() {
        if (minesweeperGameOver || minesweeperFirstClick) {
            commentaryElement.textContent = "Click a square first!";
            return;
        }
        hintButton.disabled = true;
        hintButton.textContent = '🤔';
        commentaryElement.textContent = 'Thinking...';
        if (!await initializeGeminiIfNeeded('getAiHint')) {
            commentaryElement.textContent = 'AI Init Error.';
            hintButton.disabled = false;
            hintButton.textContent = '💡 Hint';
            return;
        }
        try {
            const boardState = getBoardStateAsText();
            const prompt = `Minesweeper state:\n${boardState}\nShort, witty hint (1-2 sentences) for a safe move or dangerous area. Don't reveal exact mines unless certain. Hint:`;
            const result = await cachedGenerateContent("gemini-2.5-flash", [{ role: "user", parts: [{ text: prompt }] }], { temperature: 0.7 }) as GeminiResponse;
            const hintText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Try clicking somewhere?";
            commentaryElement.textContent = hintText;
        } catch (error: any) {
            commentaryElement.textContent = `Hint Error: ${error.message}`;
        } finally {
            hintButton.disabled = false;
            hintButton.textContent = '💡 Hint';
        }
    }

    resetButton.addEventListener('click', resetGame);
    hintButton.addEventListener('click', getAiHint);
    resetGame();
}

export function cleanupMinesweeper(): void {
    if (minesweeperTimerInterval) {
        clearInterval(minesweeperTimerInterval);
        minesweeperTimerInterval = null;
    }
}