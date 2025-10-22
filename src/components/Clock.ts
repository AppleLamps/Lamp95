// Clock component for Lamp95 taskbar
// Displays live time and date in Windows 95 style format

let clockInterval: number | null = null;

/**
 * Initializes the clock component
 * @param containerElement - The DOM element to render the clock in
 */
export function initClock(containerElement: HTMLElement): void {
    if (!containerElement) {
        console.error('Clock container element not found');
        return;
    }

    // Clear any existing interval
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    // Update clock immediately
    updateClock(containerElement);

    // Set up interval to update every second
    clockInterval = window.setInterval(() => {
        updateClock(containerElement);
    }, 1000);
}

/**
 * Updates the clock display with current time and date
 * @param containerElement - The DOM element containing the clock
 */
function updateClock(containerElement: HTMLElement): void {
    const now = new Date();

    // Format time: HH:MM AM/PM
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert to 12-hour format
    const timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    // Format date: MM/DD/YYYY
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${month}/${day}/${year}`;

    // Combine time and date
    const fullDisplay = `${timeString} - ${dateString}`;

    // Update the container content
    containerElement.textContent = fullDisplay;
}

/**
 * Stops the clock updates (cleanup function)
 */
export function stopClock(): void {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}