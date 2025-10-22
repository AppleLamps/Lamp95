import { describe, it, expect } from 'vitest';
import { getYouTubeVideoId } from '../apps/mediaPlayerApp';

describe('getYouTubeVideoId', () => {
    it('should return null for empty string', () => {
        expect(getYouTubeVideoId('')).toBe(null);
    });

    it('should return the ID if it is already a valid 11-character ID', () => {
        const id = 'dQw4w9WgXcQ';
        expect(getYouTubeVideoId(id)).toBe(id);
    });

    it('should extract ID from youtube.com watch URL', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from youtu.be URL', () => {
        const url = 'https://youtu.be/dQw4w9WgXcQ';
        expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from embed URL', () => {
        const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
        const url = 'https://example.com/video';
        expect(getYouTubeVideoId(url)).toBe(null);
    });

    it('should handle URLs with additional parameters', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s';
        expect(getYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });
});