// src/utils/mediaTime.js
// Time formatting utilities for media players (audio/video)

/**
 * Formats a duration in seconds as a `MM:SS` string.
 * Returns `"00:00"` for falsy or `NaN` values.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Zero-padded `"MM:SS"` string (e.g. `"03:07"`).
 * @example
 * formatMediaTime(187)  // "03:07"
 * formatMediaTime(0)    // "00:00"
 */
export const formatMediaTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Formats a duration in seconds as a `HH:MM:SS` or `MM:SS` string,
 * including hours only when the value is 3600 seconds or more.
 * Returns `"00:00"` for falsy or `NaN` values.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Zero-padded `"HH:MM:SS"` or `"MM:SS"` string.
 * @example
 * formatMediaTimeLong(3723)  // "01:02:03"
 * formatMediaTimeLong(187)   // "03:07"
 */
export const formatMediaTimeLong = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Calculates the playback progress as a percentage between 0 and 100.
 * Returns `0` when `total` is falsy or zero to avoid division by zero.
 * @param {number} current - Current playback position in seconds.
 * @param {number} total - Total media duration in seconds.
 * @returns {number} Progress percentage clamped to `[0, 100]`.
 * @example
 * getProgressPercent(30, 120)  // 25
 * getProgressPercent(0, 0)     // 0
 */
export const getProgressPercent = (current, total) => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
};

/**
 * Converts a progress percentage back to an absolute position in seconds.
 * Returns `0` when `total` is falsy or zero.
 * @param {number} percent - Progress value between 0 and 100.
 * @param {number} total - Total media duration in seconds.
 * @returns {number} Corresponding position in seconds.
 * @example
 * percentToSeconds(25, 120)  // 30
 */
export const percentToSeconds = (percent, total) => {
  if (!total || total <= 0) return 0;
  return (percent / 100) * total;
};

/**
 * Formats the combined current/total progress as a `"MM:SS / MM:SS"` string.
 * Delegates to {@link formatMediaTime} for each value.
 * @param {number} current - Current playback position in seconds.
 * @param {number} total - Total media duration in seconds.
 * @returns {string} Progress string (e.g. `"01:23 / 04:56"`).
 */
export const formatMediaProgress = (current, total) => {
  return `${formatMediaTime(current)} / ${formatMediaTime(total)}`;
};
