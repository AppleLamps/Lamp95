// Type definitions for Lamp95

export interface MinesweeperCell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
    element: HTMLDivElement;
    row: number;
    col: number;
}

export interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

export interface AppData {
    windowEl: HTMLDivElement;
    taskbarButton: HTMLDivElement;
    isMaximized: boolean;
    previousTop?: string;
    previousLeft?: string;
    previousWidth?: string;
    previousHeight?: string;
}

export interface DosInstance {
    initialized: boolean;
}