import { describe, it, expect } from 'vitest';

// Simplified cell for testing
interface TestCell {
    isMine: boolean;
}

// Helper function to count adjacent mines
function countAdjacentMines(grid: TestCell[][], row: number, col: number, rows: number, cols: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) count++;
        }
    }
    return count;
}

describe('countAdjacentMines', () => {
    it('should count 0 for a cell with no adjacent mines', () => {
        const grid: TestCell[][] = [
            [{ isMine: false }, { isMine: false }, { isMine: false }],
            [{ isMine: false }, { isMine: false }, { isMine: false }],
            [{ isMine: false }, { isMine: false }, { isMine: false }]
        ];
        expect(countAdjacentMines(grid, 1, 1, 3, 3)).toBe(0);
    });

    it('should count 1 for a cell with one adjacent mine', () => {
        const grid: TestCell[][] = [
            [{ isMine: false }, { isMine: true }, { isMine: false }],
            [{ isMine: false }, { isMine: false }, { isMine: false }],
            [{ isMine: false }, { isMine: false }, { isMine: false }]
        ];
        expect(countAdjacentMines(grid, 1, 1, 3, 3)).toBe(1);
    });

    it('should count 8 for a cell surrounded by mines', () => {
        const grid: TestCell[][] = [
            [{ isMine: true }, { isMine: true }, { isMine: true }],
            [{ isMine: true }, { isMine: false }, { isMine: true }],
            [{ isMine: true }, { isMine: true }, { isMine: true }]
        ];
        expect(countAdjacentMines(grid, 1, 1, 3, 3)).toBe(8);
    });

    it('should handle corner cells correctly', () => {
        const grid: TestCell[][] = [
            [{ isMine: false }, { isMine: true }],
            [{ isMine: true }, { isMine: false }]
        ];
        expect(countAdjacentMines(grid, 0, 0, 2, 2)).toBe(2);
    });

    it('should handle edge cells correctly', () => {
        const grid: TestCell[][] = [
            [{ isMine: false }, { isMine: true }, { isMine: false }],
            [{ isMine: false }, { isMine: false }, { isMine: false }]
        ];
        expect(countAdjacentMines(grid, 0, 1, 2, 3)).toBe(0);
    });
});