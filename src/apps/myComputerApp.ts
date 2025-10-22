// My Computer App for Lamp95
export function initMyComputer(windowElement: HTMLDivElement): void {
    const cDriveIcon = windowElement.querySelector('#c-drive-icon') as HTMLDivElement;
    const cDriveContent = windowElement.querySelector('#c-drive-content') as HTMLDivElement;
    const secretImageIcon = windowElement.querySelector('#secret-image-icon') as HTMLDivElement;
    if (!cDriveIcon || !cDriveContent || !secretImageIcon) return;
    cDriveIcon.addEventListener('click', () => {
        cDriveIcon.style.display = 'none';
        cDriveContent.style.display = 'block';
    });
    secretImageIcon.addEventListener('click', () => {
        const imageViewerWindow = document.getElementById('imageViewer') as HTMLDivElement | null;
        const imageViewerImg = document.getElementById('image-viewer-img') as HTMLImageElement | null;
        const imageViewerTitle = document.getElementById('image-viewer-title') as HTMLSpanElement | null;
        if (!imageViewerWindow || !imageViewerImg || !imageViewerTitle) {
            alert("Image Viewer corrupted!");
            return;
        }
        imageViewerImg.src = 'https://storage.googleapis.com/gemini-95-icons/%40ammaar%2B%40olacombe.png';
        imageViewerImg.alt = 'dontshowthistoanyone.jpg';
        imageViewerTitle.textContent = 'dontshowthistoanyone.jpg - Image Viewer';
        // Note: openApp('imageViewer') should be called from index.tsx
    });
}