// AI Browser App for Lamp95
import { DIAL_UP_SOUND_URL } from '../config';
import { initializeGeminiIfNeeded, geminiInstance } from '../ai';

export function initAiBrowser(windowElement: HTMLDivElement): void {
    const addressBar = windowElement.querySelector('.browser-address-bar') as HTMLInputElement;
    const goButton = windowElement.querySelector('.browser-go-button') as HTMLButtonElement;
    const iframe = windowElement.querySelector('#browser-frame') as HTMLIFrameElement;
    const loadingEl = windowElement.querySelector('.browser-loading') as HTMLDivElement;
    let dialUpAudio: HTMLAudioElement | null = null;

    if (!addressBar || !goButton || !iframe || !loadingEl) return;

    async function navigateToUrl(url: string): Promise<void> {
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;

            // --- RESTORED DIALUP ANIMATION ---
            loadingEl.innerHTML = `
                <style>
                    .dialup-animation .dot {
                        animation: dialup-blink 1.4s infinite both;
                    }
                    .dialup-animation .dot:nth-child(2) {
                        animation-delay: 0.2s;
                    }
                    .dialup-animation .dot:nth-child(3) {
                        animation-delay: 0.4s;
                    }
                    @keyframes dialup-blink {
                        0%, 80%, 100% { opacity: 0; }
                        40% { opacity: 1; }
                    }
                    .browser-loading p { margin: 5px 0; }
                    .browser-loading .small-text { font-size: 0.8em; color: #aaa; }
                </style>
                <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/000/948/341/datas/original.gif"/>
                <p>Connecting to ${domain}<span class="dialup-animation"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span></p>
                <!-- Sound will play via JS -->
            `;
            loadingEl.style.display = 'flex';
            // --- END RESTORED DIALUP ANIMATION ---

            try {
                if (!dialUpAudio) {
                    dialUpAudio = new Audio(DIAL_UP_SOUND_URL);
                    dialUpAudio.loop = true;
                }
                await dialUpAudio.play();
            } catch (audioError) {
                console.error("Dial-up sound error:", audioError);
            }

            try {
                if (!await initializeGeminiIfNeeded('initAiBrowser')) {
                    iframe.src = 'data:text/plain;charset=utf-8,AI Init Error';
                    loadingEl.style.display = 'none';
                    return;
                }
                const websitePrompt = `
                Create a complete 90s-style website for the domain "${domain}".
                MUST include: 1 relevant image, garish 90s styling (neon, comic sans, tables), content specific to "${domain}", scrolling marquee, retro emoji/ascii, blinking text, visitor counter (9000+), "Under Construction" signs. Fun, humorous, 1996 feel. Image MUST match theme. No modern design.
                `;
                // @ts-ignore
                const result = await geminiInstance.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: [{ role: 'user', parts: [{ text: websitePrompt }] }],
                    config: { temperature: 0.9, responseModalities: ['TEXT', 'IMAGE'] }
                });
                let htmlContent = "";
                const images: string[] = [];
                if (result.candidates?.[0]?.content) {
                    for (const part of result.candidates[0].content.parts) {
                        if (part.text) htmlContent += part.text.replace(/```html|```/g, '').trim();
                        else if (part.inlineData?.data) images.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
                    }
                }
                if (!htmlContent.includes("<html")) {
                    htmlContent = `<!DOCTYPE html><html><head><title>${domain}</title><style>body{font-family:"Comic Sans MS";background:lime;color:blue;}marquee{background:yellow;color:red;}img{max-width:80%; display:block; margin:10px auto; border: 3px ridge gray;}</style></head><body><marquee>Welcome to ${domain}!</marquee><h1>${domain}</h1><div>${htmlContent}</div></body></html>`;
                }
                if (images.length > 0) {
                    if (!htmlContent.includes('<img src="data:')) {
                        htmlContent = htmlContent.replace(/(<\/h1>)/i, `$1\n<img src="${images[0]}" alt="Site Image">`);
                    }
                }
                iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
                addressBar.value = url;
            } catch (e: any) {
                iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(`<html><body>Error generating site: ${e.message}</body></html>`);
            } finally {
                loadingEl.style.display = 'none';
                if (dialUpAudio) {
                    dialUpAudio.pause();
                    dialUpAudio.currentTime = 0;
                }
            }
        } catch (e) {
            alert("Invalid URL");
            loadingEl.style.display = 'none';
        }
    }

    goButton.addEventListener('click', () => navigateToUrl(addressBar.value));
    addressBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigateToUrl(addressBar.value);
    });
    addressBar.addEventListener('click', () => addressBar.select());
}