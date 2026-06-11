// src/utils/mediaTime.js
// Time formatting utilities for media players (audio/video)

export const formatMediaTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatMediaTimeLong = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getProgressPercent = (current, total) => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
};

export const percentToSeconds = (percent, total) => {
    if (!total || total <= 0) return 0;
    return (percent / 100) * total;
};

export const formatMediaProgress = (current, total) => {
    return `${formatMediaTime(current)} / ${formatMediaTime(total)}`;
};
