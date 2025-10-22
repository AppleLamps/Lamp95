// Notepad App for Lamp95
import { initializeGeminiIfNeeded, geminiInstance } from '../ai';

export async function initNotepadStory(windowElement: HTMLDivElement): Promise<void> {
    const textarea = windowElement.querySelector('.notepad-textarea') as HTMLTextAreaElement;
    const storyButton = windowElement.querySelector('.notepad-story-button') as HTMLButtonElement;
    if (!textarea || !storyButton) return;

    storyButton.addEventListener('click', async () => {
        const currentText = textarea.value;
        textarea.value = currentText + "\n\nGenerating story... Please wait...\n\n";
        textarea.scrollTop = textarea.scrollHeight;
        storyButton.disabled = true;
        storyButton.textContent = "Working...";
        try {
            if (!await initializeGeminiIfNeeded('initNotepadStory')) throw new Error("Failed to initialize Gemini API.");
            const prompt = "Write me a short creative story (250-300 words) with an unexpected twist ending. Make it engaging and suitable for all ages.";
            // @ts-ignore
            const result = await geminiInstance.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt
            });
            textarea.value = currentText + "\n\n";
            for await (const chunk of result) {
                textarea.value += chunk.text || "";
                textarea.scrollTop = textarea.scrollHeight;
            }
            textarea.value += "\n\n";
        } catch (error: any) {
            textarea.value = currentText + "\n\nError: " + (error.message || "Failed to generate story.") + "\n\n";
        } finally {
            storyButton.disabled = false;
            storyButton.textContent = "Generate Story";
            textarea.scrollTop = textarea.scrollHeight;
        }
    });
}