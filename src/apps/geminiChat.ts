// Gemini Chat App for Lamp95
import { initializeGeminiIfNeeded, geminiInstance } from '../ai';
import { GeminiResponse } from '../types';

export async function initGeminiChat(windowElement: HTMLDivElement): Promise<void> {
    const historyDiv = windowElement.querySelector('.gemini-chat-history') as HTMLDivElement;
    const inputEl = windowElement.querySelector('.gemini-chat-input') as HTMLInputElement;
    const sendButton = windowElement.querySelector('.gemini-chat-send') as HTMLButtonElement;

    if (!historyDiv || !inputEl || !sendButton) {
        console.error("Gemini chat elements not found in window:", windowElement.id);
        return;
    }

    function addChatMessage(container: HTMLDivElement, text: string, className: string = '') {
        const p = document.createElement('p');
        if (className) p.classList.add(className);
        p.textContent = text;
        container.appendChild(p);
        container.scrollTop = container.scrollHeight;
    }

    addChatMessage(historyDiv, "Initializing AI...", "system-message");

    const sendMessage = async () => {
        if (!geminiInstance) {
            const initSuccess = await initializeGeminiIfNeeded('initGeminiChat');
            if (!initSuccess) {
                addChatMessage(historyDiv, "Error: Failed to initialize AI.", "error-message");
                return;
            }
            const initMsg = Array.from(historyDiv.children).find(el => el.textContent?.includes("Initializing AI..."));
            if (initMsg) initMsg.remove();
            addChatMessage(historyDiv, "AI Ready.", "system-message");
        }

        const message = inputEl.value.trim();
        if (!message) return;

        addChatMessage(historyDiv, `You: ${message}`, "user-message");
        inputEl.value = '';
        inputEl.disabled = true;
        sendButton.disabled = true;

        try {
            // @ts-ignore
            const chat = geminiInstance.chats.create({ model: 'gemini-2.5-flash', history: [] });
            // @ts-ignore
            const result = await chat.sendMessageStream({ message: message });
            let fullResponse = "";
            addChatMessage(historyDiv, "Gemini: ", "gemini-message");
            const lastMessageElement = historyDiv.lastElementChild as HTMLParagraphElement | null;
            for await (const chunk of result) {
                const chunkText = chunk.text || "";
                fullResponse += chunkText;
                if (lastMessageElement) {
                    lastMessageElement.textContent += chunkText;
                    historyDiv.scrollTop = historyDiv.scrollHeight;
                }
            }
        } catch (error: any) {
            addChatMessage(historyDiv, `Error: ${error.message || 'Failed to get response.'}`, "error-message");
        } finally {
            inputEl.disabled = false;
            sendButton.disabled = false;
            inputEl.focus();
        }
    };

    sendButton.onclick = sendMessage;
    inputEl.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    inputEl.disabled = false;
    sendButton.disabled = false;
    inputEl.focus();
}