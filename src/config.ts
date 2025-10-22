// Configuration constants for Lamp95
export const DEFAULT_YOUTUBE_VIDEO_ID = 'WXuK6gekU1Y';
export const DIAL_UP_SOUND_URL = 'https://www.soundjay.com/communication/dial-up-modem-01.mp3';

export const APP_ICONS: Record<string, string> = {
    myComputer: 'https://storage.googleapis.com/gemini-95-icons/mycomputer.png',
    chrome: 'https://storage.googleapis.com/gemini-95-icons/chrome-icon-2.png',
    notepad: 'https://storage.googleapis.com/gemini-95-icons/GemNotes.png',
    paint: 'https://storage.googleapis.com/gemini-95-icons/gempaint.png',
    doom: 'https://64.media.tumblr.com/1d89dfa76381e5c14210a2149c83790d/7a15f84c681c1cf9-c1/s540x810/86985984be99d5591e0cbc0dea6f05ffa3136dac.png',
    gemini: 'https://storage.googleapis.com/gemini-95-icons/GeminiChatRetro.png',
    minesweeper: 'https://storage.googleapis.com/gemini-95-icons/gemsweeper.png',
    imageViewer: 'https://win98icons.alexmeub.com/icons/png/display_properties-4.png',
    mediaPlayer: 'https://storage.googleapis.com/gemini-95-icons/ytmediaplayer.png',
    calculator: 'https://win98icons.alexmeub.com/icons/png/calculator-0.png',
};

export const APP_TITLES: Record<string, string> = {
    myComputer: 'My Gemtop',
    chrome: 'Chrome',
    notepad: 'GemNotes',
    paint: 'GemPaint',
    doom: 'Doom II',
    gemini: 'Gemini App',
    minesweeper: 'GemSweeper',
    imageViewer: 'Image Viewer',
    mediaPlayer: 'GemPlayer',
    calculator: 'Calculator',
};

// API Key - TODO: Move to server-side for security
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;