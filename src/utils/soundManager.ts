// Sound management utility for Lamp95
// Provides functions to play Windows 95-style sound effects

/**
 * Plays a sound effect by name
 * @param soundName - The name of the sound file (without extension)
 */
export function playSound(soundName: string): void {
    try {
        const audio = new Audio(`/sounds/${soundName}.wav`);
        audio.volume = 0.5; // Set volume to 50% to avoid being too loud
        audio.play().catch(error => {
            console.warn(`Failed to play sound ${soundName}:`, error);
        });
    } catch (error) {
        console.warn(`Error creating audio for ${soundName}:`, error);
    }
}

/**
 * Preloads sound files to reduce latency on first play
 * @param soundNames - Array of sound names to preload
 */
export function preloadSounds(soundNames: string[]): void {
    soundNames.forEach(soundName => {
        const audio = new Audio(`/sounds/${soundName}.wav`);
        audio.preload = 'auto';
        // Note: We don't need to do anything with the audio object,
        // just creating it with preload='auto' is sufficient
    });
}