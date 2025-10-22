// Window management for Lamp95
import { APP_ICONS, APP_TITLES } from './config';
import { AppData, DosInstance } from './types';
import { playSound } from './utils/soundManager';

// State variables
export let activeWindow: HTMLDivElement | null = null;
export let highestZIndex: number = 20;
export function getNextZIndex(): number {
    highestZIndex++;
    return highestZIndex;
}
export const openApps = new Map<string, AppData>();
export const dosInstances: Record<string, DosInstance> = {};

// DOM references (assuming they exist globally)
const desktop = document.getElementById('desktop') as HTMLDivElement;
const windows = document.querySelectorAll('.window') as NodeListOf<HTMLDivElement>;
const icons = document.querySelectorAll('.icon') as NodeListOf<HTMLDivElement>;
const startMenu = document.getElementById('start-menu') as HTMLDivElement;
const startButton = document.getElementById('start-button') as HTMLButtonElement;
const taskbarAppsContainer = document.getElementById('taskbar-apps') as HTMLDivElement;

/** Brings a window to the front and sets it as active */
export function bringToFront(windowElement: HTMLDivElement): void {
    if (activeWindow === windowElement) return;

    if (activeWindow) {
        activeWindow.classList.remove('active');
        const appName = activeWindow.id;
        if (openApps.has(appName)) {
            openApps.get(appName)?.taskbarButton.classList.remove('active');
        }
    }

    windowElement.style.zIndex = getNextZIndex().toString();
    windowElement.classList.add('active');
    activeWindow = windowElement;

    const appNameRef = windowElement.id;
    if (openApps.has(appNameRef)) {
        openApps.get(appNameRef)?.taskbarButton.classList.add('active');
    }
    if ((appNameRef === 'doom' || appNameRef === 'wolf3d') && dosInstances[appNameRef]) {
        const container = document.getElementById(`${appNameRef}-container`);
        const canvas = container?.querySelector('canvas');
        canvas?.focus();
    }
}

/** Opens an application window */
export async function openApp(appName: string): Promise<void> {
    const windowElement = document.getElementById(appName) as HTMLDivElement | null;
    if (!windowElement) {
        console.error(`Window element not found for app: ${appName}`);
        return;
    }

    if (openApps.has(appName)) {
        bringToFront(windowElement);
        windowElement.style.display = 'flex';
        windowElement.classList.add('active');
        return;
    }

    windowElement.style.display = 'flex';
    windowElement.classList.add('active', 'animate-in');
    bringToFront(windowElement);

    playSound('click'); // Play open sound

    const taskbarButton = document.createElement('div');
    taskbarButton.classList.add('taskbar-app');
    taskbarButton.dataset.appName = appName;

    let iconSrc = '';
    let title = appName;
    const iconElement = findIconElement(appName);
    if (iconElement) {
        const img = iconElement.querySelector('img');
        const span = iconElement.querySelector('span');
        if (img) iconSrc = img.src;
        if (span) title = span.textContent || appName;
    } else {
        // Fallback for apps opened via start menu but maybe no desktop icon
        iconSrc = APP_ICONS[appName] || '';
        title = APP_TITLES[appName] || appName;
    }

    if (iconSrc) {
        const img = document.createElement('img');
        img.src = iconSrc;
        img.alt = title;
        taskbarButton.appendChild(img);
    }
    taskbarButton.appendChild(document.createTextNode(title));

    taskbarButton.addEventListener('click', () => {
        if (windowElement === activeWindow && windowElement.style.display !== 'none') {
            minimizeApp(appName);
        } else {
            windowElement.style.display = 'flex';
            bringToFront(windowElement);
        }
    });

    taskbarAppsContainer.appendChild(taskbarButton);
    openApps.set(appName, { windowEl: windowElement, taskbarButton: taskbarButton, isMaximized: false });
    taskbarButton.classList.add('active');

    // Initialize specific applications
    try {
        if (appName === 'chrome') {
            const { initAiBrowser } = await import('./apps/aiBrowserApp');
            initAiBrowser(windowElement);
        } else if (appName === 'notepad') {
            const { initNotepadStory } = await import('./apps/notepadApp');
            await initNotepadStory(windowElement);
        } else if (appName === 'paint') {
            const { initSimplePaintApp, startPaintCritique } = await import('./apps/paintApp');
            initSimplePaintApp(windowElement);
            startPaintCritique();
        } else if (appName === 'doom' && !dosInstances['doom']) {
            const doomContainer = document.getElementById('doom-content') as HTMLDivElement;
            if (doomContainer) {
                doomContainer.innerHTML = '<iframe src="https://js-dos.com/games/doom.exe.html" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>';
                dosInstances['doom'] = { initialized: true };
            }
        } else if (appName === 'gemini') {
            const { initGeminiChat } = await import('./apps/geminiChat');
            await initGeminiChat(windowElement);
        } else if (appName === 'minesweeper') {
            const { initMinesweeperGame } = await import('./apps/minesweeperApp');
            initMinesweeperGame(windowElement);
        } else if (appName === 'myComputer') {
            const { initMyComputer } = await import('./apps/myComputerApp');
            initMyComputer(windowElement);
        } else if (appName === 'mediaPlayer') {
            const { initMediaPlayer } = await import('./apps/mediaPlayerApp');
            await initMediaPlayer(windowElement);
        } else if (appName === 'calculator') {
            const { initCalculator } = await import('./apps/calculatorApp');
            initCalculator(windowElement);
        }
    } catch (error: any) {
        alert(`Failed to open ${appName}: ${error.message}`);
    }
}
;

/** Closes an application window */
export async function closeApp(appName: string): Promise<void> {
    const appData = openApps.get(appName);
    if (!appData) return;

    const { windowEl, taskbarButton } = appData;

    // Add animation class and wait for animation to complete before hiding
    windowEl.classList.add('animate-out');
    windowEl.classList.remove('active');

    playSound('click'); // Play close sound

    // Remove from taskbar and openApps immediately
    taskbarButton.remove();
    openApps.delete(appName);

    // Wait for animation to complete before hiding
    setTimeout(() => {
        windowEl.style.display = 'none';
        windowEl.classList.remove('animate-out');
    }, 300); // Match animation duration

    if (dosInstances[appName]) {
        console.log(`Cleaning up ${appName} instance (iframe approach)`);
        const container = document.getElementById(`${appName}-content`);
        if (container) container.innerHTML = '';
        delete dosInstances[appName];
    }

    // Specific cleanup for apps
    if (appName === 'paint') {
        const { stopPaintCritique } = await import('./apps/paintApp');
        stopPaintCritique();
    }
    if (appName === 'minesweeper') {
        const { cleanupMinesweeper } = await import('./apps/minesweeperApp');
        cleanupMinesweeper();
    }
    if (appName === 'mediaPlayer') {
        const { cleanupMediaPlayer } = await import('./apps/mediaPlayerApp');
        cleanupMediaPlayer(appName);
    }

    if (activeWindow === windowEl) {
        activeWindow = null;
        let nextAppToActivate: HTMLDivElement | null = null;
        let maxZ = -1;
        openApps.forEach((data) => {
            const z = parseInt(data.windowEl.style.zIndex || '0', 10);
            if (z > maxZ) {
                maxZ = z;
                nextAppToActivate = data.windowEl;
            }
        });
        if (nextAppToActivate) {
            bringToFront(nextAppToActivate);
        }
    }
}

/** Minimizes an application window */
export function minimizeApp(appName: string): void {
    const appData = openApps.get(appName);
    if (!appData) return;

    const { windowEl, taskbarButton } = appData;

    windowEl.style.display = 'none';
    windowEl.classList.remove('active');
    taskbarButton.classList.remove('active');

    if (activeWindow === windowEl) {
        activeWindow = null;
        let nextAppToActivate: string | null = null;
        let maxZ = 0;
        openApps.forEach((data, name) => {
            if (data.windowEl.style.display !== 'none') {
                const z = parseInt(data.windowEl.style.zIndex || '0', 10);
                if (z > maxZ) {
                    maxZ = z;
                    nextAppToActivate = name;
                }
            }
        });
        if (nextAppToActivate) {
            bringToFront(openApps.get(nextAppToActivate)!.windowEl);
        }
    }
}

/** Maximizes or restores an application window */
export function maximizeApp(appName: string): void {
    const appData = openApps.get(appName);
    if (!appData) return;

    const { windowEl } = appData;

    if (appData.isMaximized) {
        // Restore
        if (appData.previousTop !== undefined) windowEl.style.top = appData.previousTop;
        if (appData.previousLeft !== undefined) windowEl.style.left = appData.previousLeft;
        if (appData.previousWidth !== undefined) windowEl.style.width = appData.previousWidth;
        if (appData.previousHeight !== undefined) windowEl.style.height = appData.previousHeight;
        appData.isMaximized = false;
    } else {
        // Maximize
        appData.previousTop = windowEl.style.top;
        appData.previousLeft = windowEl.style.left;
        appData.previousWidth = windowEl.style.width;
        appData.previousHeight = windowEl.style.height;
        windowEl.style.top = '0px';
        windowEl.style.left = '0px';
        windowEl.style.width = '100vw';
        windowEl.style.height = 'calc(100vh - 36px)';
        appData.isMaximized = true;
        bringToFront(windowEl);
    }
}

function findIconElement(appName: string): HTMLDivElement | undefined {
    return Array.from(icons).find(icon => icon.dataset.app === appName);
}