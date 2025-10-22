// Media Player App for Lamp95
import { DEFAULT_YOUTUBE_VIDEO_ID } from '../config';

// @ts-ignore: YT will be defined by the YouTube API script
const youtubePlayers: Record<string, YT.Player | null> = {};
let ytApiLoaded = false;
let ytApiLoadingPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
    if (ytApiLoaded) return Promise.resolve();
    if (ytApiLoadingPromise) return ytApiLoadingPromise;

    ytApiLoadingPromise = new Promise((resolve, reject) => {
        // @ts-ignore
        if (window.YT && window.YT.Player) {
            ytApiLoaded = true;
            resolve();
            return;
        }
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onerror = (err) => {
            console.error("Failed to load YouTube API script:", err);
            ytApiLoadingPromise = null;
            reject(new Error("YouTube API script load failed"));
        };
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

        // @ts-ignore
        window.onYouTubeIframeAPIReady = () => {
            ytApiLoaded = true;
            ytApiLoadingPromise = null;
            resolve();
        };
        setTimeout(() => {
            if (!ytApiLoaded) {
                // @ts-ignore
                if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady = null;
                ytApiLoadingPromise = null;
                reject(new Error("YouTube API load timeout"));
            }
        }, 10000);
    });
    return ytApiLoadingPromise;
}

function getYouTubeVideoId(urlOrId: string): string | null {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
    const match = urlOrId.match(regExp);
    return (match && match[1]) ? match[1] : null;
}

export { getYouTubeVideoId };

export async function initMediaPlayer(windowElement: HTMLDivElement): Promise<void> {
    const appName = windowElement.id; // 'mediaPlayer'
    const urlInput = windowElement.querySelector('.media-player-input') as HTMLInputElement;
    const loadButton = windowElement.querySelector('.media-player-load-button') as HTMLButtonElement;
    const playerContainerDivId = `youtube-player-${appName}`;
    const playerDiv = windowElement.querySelector(`#${playerContainerDivId}`) as HTMLDivElement;
    const playButton = windowElement.querySelector('#media-player-play') as HTMLButtonElement;
    const pauseButton = windowElement.querySelector('#media-player-pause') as HTMLButtonElement;
    const stopButton = windowElement.querySelector('#media-player-stop') as HTMLButtonElement;

    if (!urlInput || !loadButton || !playerDiv || !playButton || !pauseButton || !stopButton) {
        console.error("Media Player elements not found for", appName);
        if (playerDiv) playerDiv.innerHTML = `<p class="media-player-status-message" style="color:red;">Error: Player UI missing.</p>`;
        return;
    }

    const updateButtonStates = (playerState?: number) => {
        // @ts-ignore
        const YTPlayerState = window.YT?.PlayerState;
        if (!YTPlayerState) {
            playButton.disabled = true;
            pauseButton.disabled = true;
            stopButton.disabled = true;
            return;
        }
        const state = playerState !== undefined ? playerState
            // @ts-ignore
            : (youtubePlayers[appName] && typeof youtubePlayers[appName].getPlayerState === 'function' ? youtubePlayers[appName].getPlayerState() : YTPlayerState.UNSTARTED);

        playButton.disabled = state === YTPlayerState.PLAYING || state === YTPlayerState.BUFFERING;
        pauseButton.disabled = state !== YTPlayerState.PLAYING && state !== YTPlayerState.BUFFERING;
        stopButton.disabled = state === YTPlayerState.ENDED || state === YTPlayerState.UNSTARTED || state === -1;
    };

    updateButtonStates(-1); // Initial state (unstarted)

    const showPlayerMessage = (message: string, isError: boolean = false) => {
        const player = youtubePlayers[appName];
        if (player) {
            try {
                if (typeof player.destroy === 'function') player.destroy();
            } catch (e) {
                console.warn("Minor error destroying player:", e);
            }
            delete youtubePlayers[appName];
        }
        playerDiv.innerHTML = `<p class="media-player-status-message" style="color:${isError ? 'red' : '#ccc'};">${message}</p>`;
        updateButtonStates(-1);
    };

    const initialStatusMessageEl = playerDiv.querySelector('.media-player-status-message');
    if (initialStatusMessageEl) initialStatusMessageEl.textContent = 'Connecting to YouTube...';

    try {
        await loadYouTubeApi();
        if (initialStatusMessageEl) initialStatusMessageEl.textContent = 'YouTube API Ready. Loading default video...';
    } catch (error: any) {
        showPlayerMessage(`Error: Could not load YouTube Player API. ${error.message}`, true);
        return;
    }

    const createPlayer = (videoId: string) => {
        const existingPlayer = youtubePlayers[appName];
        if (existingPlayer) {
            try {
                if (typeof existingPlayer.destroy === 'function') existingPlayer.destroy();
            } catch (e) {
                console.warn("Minor error destroying previous player:", e);
            }
        }
        playerDiv.innerHTML = ''; // Clear previous content/message

        try {
            // @ts-ignore
            youtubePlayers[appName] = new YT.Player(playerContainerDivId, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'autoplay': 1,
                    'controls': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'fs': 0,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': (event: any) => {
                        updateButtonStates(event.target.getPlayerState());
                    },
                    'onError': (event: any) => {
                        const errorMessages: { [key: number]: string } = {
                            2: "Invalid video ID.",
                            5: "HTML5 Player error.",
                            100: "Video not found/private.",
                            101: "Playback disallowed.",
                            150: "Playback disallowed."
                        };
                        showPlayerMessage(errorMessages[event.data] || `Playback Error (Code: ${event.data})`, true);
                    },
                    'onStateChange': (event: any) => {
                        updateButtonStates(event.data);
                    }
                }
            });
        } catch (error: any) {
            showPlayerMessage(`Failed to create video player: ${error.message}`, true);
        }
    };

    loadButton.addEventListener('click', () => {
        const videoUrlOrId = urlInput.value.trim();
        const videoId = getYouTubeVideoId(videoUrlOrId);
        if (videoId) {
            showPlayerMessage("Loading video..."); // Show loading message immediately
            createPlayer(videoId);
        } else {
            showPlayerMessage("Invalid YouTube URL or Video ID.", true);
        }
    });

    playButton.addEventListener('click', () => {
        const player = youtubePlayers[appName];
        // @ts-ignore
        if (player && typeof player.playVideo === 'function') player.playVideo();
    });
    pauseButton.addEventListener('click', () => {
        const player = youtubePlayers[appName];
        // @ts-ignore
        if (player && typeof player.pauseVideo === 'function') player.pauseVideo();
    });
    stopButton.addEventListener('click', () => {
        const player = youtubePlayers[appName];
        // @ts-ignore
        if (player && typeof player.stopVideo === 'function') {
            player.stopVideo();
            // @ts-ignore - Manually set to ended for button state update
            updateButtonStates(window.YT?.PlayerState?.ENDED);
        }
    });

    if (DEFAULT_YOUTUBE_VIDEO_ID) {
        if (initialStatusMessageEl) initialStatusMessageEl.textContent = `Loading default video...`;
        createPlayer(DEFAULT_YOUTUBE_VIDEO_ID);
    } else {
        showPlayerMessage("Enter a YouTube URL or Video ID and click 'Load'.");
    }
}

export function cleanupMediaPlayer(appName: string): void {
    const player = youtubePlayers[appName];
    if (player) {
        try {
            if (typeof player.stopVideo === 'function') player.stopVideo();
            if (typeof player.destroy === 'function') player.destroy();
        } catch (e) {
            console.warn("Error stopping/destroying media player:", e);
        }
        delete youtubePlayers[appName];
        console.log("Destroyed YouTube player for", appName);
    }
    // Reset the player area with a message
    const playerDivId = `youtube-player-${appName}`;
    const playerDiv = document.getElementById(playerDivId) as HTMLDivElement | null;
    if (playerDiv) {
        playerDiv.innerHTML = `<p class="media-player-status-message">Player closed. Enter a YouTube URL to load.</p>`;
    }
    // Reset control buttons state (optional, but good practice)
    const mediaPlayerWindow = document.getElementById(appName);
    if (mediaPlayerWindow) {
        const playBtn = mediaPlayerWindow.querySelector('#media-player-play') as HTMLButtonElement;
        const pauseBtn = mediaPlayerWindow.querySelector('#media-player-pause') as HTMLButtonElement;
        const stopBtn = mediaPlayerWindow.querySelector('#media-player-stop') as HTMLButtonElement;
        if (playBtn) playBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = true;
    }
}