// AI utilities for Lamp95
import { GEMINI_API_KEY } from './config';

let geminiInstance: any | null = null;

// Cache for API responses
const responseCache = new Map<string, { response: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(model: string, contents: any[], config: any): string {
    return JSON.stringify({ model, contents, config });
}

function getCachedResponse(key: string): any | null {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.response;
    }
    if (cached) responseCache.delete(key); // Expired
    return null;
}

function setCachedResponse(key: string, response: any): void {
    responseCache.set(key, { response, timestamp: Date.now() });
}

export async function initializeGeminiIfNeeded(context: string): Promise<boolean> {
    if (geminiInstance) return true;
    try {
        const module = await import('@google/genai');
        // @ts-ignore
        const GoogleAIClass = module.GoogleGenAI;
        if (typeof GoogleAIClass !== 'function') throw new Error("GoogleGenAI constructor not found.");
        if (!GEMINI_API_KEY) {
            alert("CRITICAL ERROR: Gemini API Key missing.");
            throw new Error("API Key is missing.");
        }
        // @ts-ignore
        geminiInstance = new GoogleAIClass({ apiKey: GEMINI_API_KEY });
        return true;
    } catch (error: any) {
        console.error(`Failed Gemini initialization in ${context}:`, error);
        alert(`CRITICAL ERROR: Gemini AI failed to initialize. ${error.message}`);
        return false;
    }
}

export async function cachedGenerateContent(model: string, contents: any[], config: any = { temperature: 0.7 }): Promise<any> {
    const key = getCacheKey(model, contents, config);
    const cached = getCachedResponse(key);
    if (cached) return cached;
    const result = await geminiInstance.models.generateContent({ model, contents, config });
    setCachedResponse(key, result);
    return result;
}

export { geminiInstance };