/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import '@tailwindcss/browser';

//Gemini 95 was fully vibe-coded by @ammaar and @olacombe, while we don't endorse code quality, we thought it was a fun demonstration of what's possible with the model when a Designer and PM jam.
//An homage to an OS that inspired so many of us!

import { bringToFront, openApp, closeApp, minimizeApp, maximizeApp, activeWindow, openApps, dosInstances, getNextZIndex } from '@/src/windowManager';
import { initGeminiChat } from '@/src/apps/geminiChat';
import { initSimplePaintApp, startPaintCritique, stopPaintCritique } from '@/src/apps/paintApp';
import { initMinesweeperGame, cleanupMinesweeper } from '@/src/apps/minesweeperApp';
import { initMediaPlayer, cleanupMediaPlayer } from '@/src/apps/mediaPlayerApp';
import { initNotepadStory } from '@/src/apps/notepadApp';
import { initMyComputer } from '@/src/apps/myComputerApp';
import { initAiBrowser } from '@/src/apps/aiBrowserApp';
import { playSound, preloadSounds } from '@/src/utils/soundManager';
import { initClock } from '@/src/components/Clock';

// --- DOM Element References ---
const desktop = document.getElementById('desktop') as HTMLDivElement;
const windows = document.querySelectorAll('.window') as NodeListOf<HTMLDivElement>;
const icons = document.querySelectorAll('.icon') as NodeListOf<HTMLDivElement>; // This is a NodeList
const startMenu = document.getElementById('start-menu') as HTMLDivElement;
const startButton = document.getElementById('start-button') as HTMLButtonElement;
const taskbarAppsContainer = document.getElementById('taskbar-apps') as HTMLDivElement;
const taskbarClock = document.getElementById('taskbar-clock') as HTMLDivElement;

// Initialize clock
initClock(taskbarClock);

// --- Event Listeners Setup ---

icons.forEach(icon => {
    icon.addEventListener('click', async () => {
        const appName = icon.getAttribute('data-app');
        if (appName) {
            await openApp(appName);
            const appData = openApps.get(appName);
            if (appData) {
                appData.taskbarButton.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e, appName);
                });
            }
            startMenu.classList.remove('active');
        }
    });
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', `Open ${icon.querySelector('span')?.textContent || icon.dataset.app}`);
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            icon.click();
        }
    });
});

document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', async () => {
        const appName = (item as HTMLElement).getAttribute('data-app');
        if (appName) {
            await openApp(appName);
            const appData = openApps.get(appName);
            if (appData) {
                appData.taskbarButton.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e, appName);
                });
            }
            startMenu.classList.remove('active');
        }
    });
});

startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('active');
    if (startMenu.classList.contains('active')) {
        startMenu.style.zIndex = getNextZIndex().toString();
    }
});

windows.forEach(windowElement => {
    const titleBar = windowElement.querySelector('.window-titlebar') as HTMLDivElement | null;
    const closeButton = windowElement.querySelector('.window-close') as HTMLDivElement | null;
    const minimizeButton = windowElement.querySelector('.window-minimize') as HTMLDivElement | null;
    const maximizeButton = windowElement.querySelector('.window-maximize') as HTMLDivElement | null;
    const titleEl = windowElement.querySelector('.window-title') as HTMLSpanElement;

    if (titleEl) titleEl.id = `title-${windowElement.id}`;
    windowElement.setAttribute('role', 'dialog');
    windowElement.setAttribute('aria-labelledby', `title-${windowElement.id}`);
    windowElement.setAttribute('tabindex', '0');
    windowElement.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApp(windowElement.id);
        }
    });

    windowElement.addEventListener('mousedown', () => bringToFront(windowElement), true);

    if (closeButton) {
        closeButton.addEventListener('click', async (e) => { e.stopPropagation(); await closeApp(windowElement.id); });
    }
    if (minimizeButton) {
        minimizeButton.addEventListener('click', async (e) => { e.stopPropagation(); await minimizeApp(windowElement.id); });
    }
    if (maximizeButton) {
        maximizeButton.addEventListener('click', async (e) => { e.stopPropagation(); await maximizeApp(windowElement.id); });
    }

    if (titleBar) {
        let isDragging = false;
        let dragOffsetX: number, dragOffsetY: number;
        const startDragging = (e: PointerEvent) => {
            if (!(e.target === titleBar || titleBar.contains(e.target as Node)) || (e.target as Element).closest('.window-control-button')) {
                isDragging = false; return;
            }
            isDragging = true; bringToFront(windowElement);
            const rect = windowElement.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left; dragOffsetY = e.clientY - rect.top;
            titleBar.style.cursor = 'grabbing';
            document.addEventListener('pointermove', dragWindow);
            document.addEventListener('pointerup', stopDragging, { once: true });
        };
        const dragWindow = (e: PointerEvent) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling on touch
            let x = e.clientX - dragOffsetX; let y = e.clientY - dragOffsetY;
            const taskbarHeight = taskbarAppsContainer.parentElement?.offsetHeight ?? 36;
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight - taskbarHeight;
            const minX = -(windowElement.offsetWidth - 40);
            const maxXAdjusted = window.innerWidth - 40;
            x = Math.max(minX, Math.min(x, maxXAdjusted));
            y = Math.max(0, Math.min(y, maxY));
            windowElement.style.left = `${x}px`; windowElement.style.top = `${y}px`;
        };
        const stopDragging = () => {
            if (!isDragging) return;
            isDragging = false; titleBar.style.cursor = 'grab';
            document.removeEventListener('pointermove', dragWindow);
        };
        titleBar.addEventListener('pointerdown', startDragging);
    }

    if (!openApps.has(windowElement.id)) { // Only apply random for newly opened, not for bringToFront
        const randomTop = Math.random() * (window.innerHeight / 4) + 20;
        const randomLeft = Math.random() * (window.innerWidth / 3) + 20;
        windowElement.style.top = `${randomTop}px`;
        windowElement.style.left = `${randomLeft}px`;
    }

    const closeBtn = windowElement.querySelector('.window-close') as HTMLDivElement;
    if (closeBtn) closeBtn.setAttribute('aria-label', 'Close window');
    const minBtn = windowElement.querySelector('.window-minimize') as HTMLDivElement;
    if (minBtn) minBtn.setAttribute('aria-label', 'Minimize window');
    const maxBtn = windowElement.querySelector('.window-maximize') as HTMLDivElement;
    if (maxBtn) maxBtn.setAttribute('aria-label', 'Maximize window');
});

document.addEventListener('click', (e) => {
    if (startMenu.classList.contains('active') && !startMenu.contains(e.target as Node) && !startButton.contains(e.target as Node)) {
        startMenu.classList.remove('active');
    }
    const menu = document.getElementById('taskbar-context-menu');
    if (menu && menu.style.display !== 'none' && !menu.contains(e.target as Node)) {
        menu.style.display = 'none';
    }
});

function findIconElement(appName: string): HTMLDivElement | undefined {
    return Array.from(icons).find(icon => icon.dataset.app === appName);
}

function showContextMenu(e: MouseEvent, appName: string) {
    const menu = document.getElementById('taskbar-context-menu') as HTMLDivElement;
    menu.innerHTML = `
        <div class="context-menu-item" data-action="minimize">Minimize</div>
        <div class="context-menu-item" data-action="close">Close</div>
    `;
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.style.display = 'block';
    // Add listeners to items
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = (item as HTMLElement).dataset.action;
            if (action === 'minimize') minimizeApp(appName);
            else if (action === 'close') closeApp(appName);
            menu.style.display = 'none';
        });
    });
}

console.log("Gemini 95 Simulator Initialized (TS)");

// Preload sound effects and play startup sound
preloadSounds(['startup', 'click']);
playSound('startup');
