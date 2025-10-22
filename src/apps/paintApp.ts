// Paint App for Lamp95
import { initializeGeminiIfNeeded, cachedGenerateContent } from '../ai';
import { GeminiResponse } from '../types';

// Paint App State
const paintResizeObserverMap = new Map<Element, ResizeObserver>();
let paintCritiqueIntervalId: number | null = null;

// Debounce utility
function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM references for paint assistant
const paintAssistant = document.getElementById('paint-assistant') as HTMLDivElement;
const assistantBubble = paintAssistant?.querySelector('.assistant-bubble') as HTMLDivElement;

export function initSimplePaintApp(windowElement: HTMLDivElement): void {
    const canvas = windowElement.querySelector('#paint-canvas') as HTMLCanvasElement;
    const toolbar = windowElement.querySelector('.paint-toolbar') as HTMLDivElement;
    const contentArea = windowElement.querySelector('.window-content') as HTMLDivElement;
    const colorSwatches = windowElement.querySelectorAll('.paint-color-swatch') as NodeListOf<HTMLButtonElement>;
    const sizeButtons = windowElement.querySelectorAll('.paint-size-button') as NodeListOf<HTMLButtonElement>;
    const clearButton = windowElement.querySelector('.paint-clear-button') as HTMLButtonElement;

    if (!canvas || !toolbar || !contentArea || !clearButton) {
        return;
    }
    const ctxTemp = canvas.getContext('2d');
    if (!ctxTemp) {
        return;
    }
    const ctx = ctxTemp;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    let currentStrokeStyle = ctx.strokeStyle;
    let currentLineWidth = ctx.lineWidth;

    function resizeCanvas() {
        const rect = contentArea.getBoundingClientRect();
        const toolbarHeight = toolbar.offsetHeight;
        const newWidth = Math.floor(rect.width);
        const newHeight = Math.floor(rect.height - toolbarHeight);

        if (canvas.width === newWidth && canvas.height === newHeight && newWidth > 0 && newHeight > 0) return;

        canvas.width = newWidth > 0 ? newWidth : 1;
        canvas.height = newHeight > 0 ? newHeight : 1;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentStrokeStyle;
        ctx.lineWidth = currentLineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    const debouncedResizeCanvas = debounce(resizeCanvas, 100);
    const resizeObserver = new ResizeObserver(debouncedResizeCanvas);
    resizeObserver.observe(contentArea);
    paintResizeObserverMap.set(contentArea, resizeObserver);
    resizeCanvas();

    function getMousePos(canvasDom: HTMLCanvasElement, event: PointerEvent): { x: number, y: number } {
        const rect = canvasDom.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function startDrawing(e: PointerEvent) {
        isDrawing = true;
        const pos = getMousePos(canvas, e);
        [lastX, lastY] = [pos.x, pos.y];
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e: PointerEvent) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getMousePos(canvas, e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        [lastX, lastY] = [pos.x, pos.y];
    }

    function stopDrawing() {
        if (isDrawing) isDrawing = false;
    }

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw, { passive: false });
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointercancel', stopDrawing);

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            ctx.strokeStyle = swatch.dataset.color || 'black';
            currentStrokeStyle = ctx.strokeStyle;
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            if (swatch.dataset.color === 'white') {
                const largeSizeButton = Array.from(sizeButtons).find(b => b.dataset.size === '10');
                if (largeSizeButton) {
                    ctx.lineWidth = parseInt(largeSizeButton.dataset.size || '10', 10);
                    currentLineWidth = ctx.lineWidth;
                    sizeButtons.forEach(s => s.classList.remove('active'));
                    largeSizeButton.classList.add('active');
                }
            } else {
                const activeSizeButton = Array.from(sizeButtons).find(b => b.classList.contains('active'));
                if (activeSizeButton) {
                    ctx.lineWidth = parseInt(activeSizeButton.dataset.size || '2', 10);
                    currentLineWidth = ctx.lineWidth;
                }
            }
        });
    });

    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            ctx.lineWidth = parseInt(button.dataset.size || '2', 10);
            currentLineWidth = ctx.lineWidth;
            sizeButtons.forEach(s => s.classList.remove('active'));
            button.classList.add('active');
            const eraser = Array.from(colorSwatches).find(s => s.dataset.color === 'white');
            if (!eraser?.classList.contains('active')) {
                if (!Array.from(colorSwatches).some(s => s.classList.contains('active'))) {
                    const blackSwatch = Array.from(colorSwatches).find(s => s.dataset.color === 'black');
                    blackSwatch?.classList.add('active');
                    ctx.strokeStyle = 'black';
                    currentStrokeStyle = ctx.strokeStyle;
                }
            }
        });
    });

    clearButton.addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    (windowElement.querySelector('.paint-color-swatch[data-color="black"]') as HTMLButtonElement)?.classList.add('active');
    (windowElement.querySelector('.paint-size-button[data-size="2"]') as HTMLButtonElement)?.classList.add('active');
}

export async function critiquePaintDrawing(): Promise<void> {
    const paintWindow = document.getElementById('paint') as HTMLDivElement | null;
    if (!paintWindow || paintWindow.style.display === 'none') return;
    const canvas = paintWindow.querySelector('#paint-canvas') as HTMLCanvasElement | null;
    if (!canvas) {
        if (assistantBubble) assistantBubble.textContent = 'Error: Canvas not found!';
        return;
    }
    if (!await initializeGeminiIfNeeded('critiquePaintDrawing')) {
        if (assistantBubble) assistantBubble.textContent = 'Error: AI init failed!';
        return;
    }
    try {
        if (assistantBubble) assistantBubble.textContent = 'Analyzing...';
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = imageDataUrl.split(',')[1];
        if (!base64Data) throw new Error("Failed to get base64 data.");
        const prompt = "Critique this drawing with witty sarcasm (1-2 sentences).";
        const result = await cachedGenerateContent("gemini-2.5-pro-exp-03-25", [{
            role: "user",
            parts: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
        }]) as GeminiResponse;
        const critique = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Is this art?";
        if (assistantBubble) assistantBubble.textContent = critique;
    } catch (error: any) {
        if (assistantBubble) assistantBubble.textContent = `Critique Error: ${error.message}`;
    }
}

export function startPaintCritique(): void {
    if (paintAssistant) paintAssistant.classList.add('visible');
    if (assistantBubble) assistantBubble.textContent = 'Warming up my judging circuits...';
    if (paintCritiqueIntervalId) clearInterval(paintCritiqueIntervalId);
    paintCritiqueIntervalId = window.setInterval(critiquePaintDrawing, 15000);
}

export function stopPaintCritique(): void {
    if (paintCritiqueIntervalId) {
        clearInterval(paintCritiqueIntervalId);
        paintCritiqueIntervalId = null;
        if (paintAssistant) paintAssistant.classList.remove('visible');
    }
    // Disconnect resize observer
    const paintContent = document.querySelector('#paint .window-content') as HTMLDivElement | null;
    if (paintContent && paintResizeObserverMap.has(paintContent)) {
        paintResizeObserverMap.get(paintContent)?.disconnect();
        paintResizeObserverMap.delete(paintContent);
    }
}