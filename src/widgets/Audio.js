/**
 * @file Audio.js
 * @description A thin wrapper around the native `<audio>` element that adds
 * reliable duration detection (with an AudioContext fallback for formats where
 * the browser cannot report duration from metadata alone), progress callbacks,
 * and a clean imperative API for controlling playback.
 */

import { WidgetFactory } from "../widget-factory/index.js";

/**
 * Creates an Audio widget — an `<audio>` element enriched with helper methods
 * and reliable duration detection.
 *
 * Duration detection works in three stages:
 * 1. Read directly from `audio.duration` on `loadedmetadata` / `canplay`.
 * 2. Poll every 200 ms for up to two seconds if the element still reports NaN or Infinity.
 * 3. Fetch the file as an ArrayBuffer and decode it with AudioContext as a last resort.
 *
 * @param {Object} props - Configuration for the audio widget.
 * @param {string} props.src - URL of the audio file to load.
 * @param {boolean} [props.autoplay=false] - Whether playback starts automatically on load.
 * @param {boolean} [props.controls=false] - Whether to render the browser's native playback controls.
 * @param {boolean} [props.loop=false] - Whether playback restarts automatically when the track ends.
 * @param {boolean} [props.muted=false] - Whether the audio starts muted.
 * @param {number} [props.volume=1] - Initial volume level (0.0–1.0).
 * @param {Function} [props.onPlay] - Fired when playback begins.
 * @param {Function} [props.onPause] - Fired when playback is paused.
 * @param {Function} [props.onEnd] - Fired when the track finishes.
 * @param {Function} [props.onTimeUpdate] - Fired on each timeupdate event. Receives `(currentTime, duration, percentPlayed)`.
 * @param {Function} [props.onProgress] - Fired on each timeupdate event with only the percent value.
 * @param {Function} [props.onLoad] - Fired once when the duration is successfully resolved. Receives `(duration)`.
 * @param {Function} [props.ref] - Callback that receives the `<audio>` element after creation.
 * @returns {HTMLAudioElement} The audio element, extended with playback control methods.
 */
export const Audio = (props) => {
  const {
    src,
    autoplay = false,
    controls = false,
    loop = false,
    muted = false,
    volume = 1,
    onPlay,
    onPause,
    onEnd,
    onTimeUpdate,
    onProgress,
    onLoad,
    ref,
    ...rest
  } = props;

  const audio = WidgetFactory({
    tag: "audio",
    src: src,
    ...rest,
  });

  // Audio attributes are element properties, not CSS attributes — set them directly
  audio.controls = Boolean(controls);
  audio.loop = Boolean(loop);
  audio.muted = Boolean(muted);
  audio.autoplay = Boolean(autoplay);
  audio.preload = "metadata";
  audio.volume = typeof volume === "number" ? volume : 1;

  // Keep native play/pause bound before we might override them
  const nativePlay = audio.play.bind(audio);
  const nativePause = audio.pause.bind(audio);

  let currentTime = 0;
  let duration = 0;
  let durationPoll = null;
  let audioContextFallbackAttempted = false;

  /**
   * Recalculates the current playback position and fires the progress callbacks.
   * Called on every `timeupdate` event from the element.
   */
  const updateTime = () => {
    currentTime = audio.currentTime || 0;
    const percent = duration ? (currentTime / duration) * 100 : 0;
    if (onTimeUpdate) onTimeUpdate(currentTime, duration, percent);
    if (onProgress) onProgress(percent);
  };

  /**
   * Stores the resolved duration and fires `onLoad` exactly once.
   * Clears any active polling interval once the duration is known.
   *
   * @param {number} dur - The resolved audio duration in seconds.
   */
  const setDuration = (dur) => {
    if (dur > 0 && duration === 0) {
      duration = dur;
      if (onLoad) onLoad(duration);
      if (durationPoll) clearInterval(durationPoll);
      durationPoll = null;
    }
  };

  /**
   * Attempts to read the duration directly from the audio element.
   *
   * @returns {boolean} `true` if a valid finite duration was obtained.
   */
  const tryGetDurationFromAudio = () => {
    const d = audio.duration;
    if (d && d !== Infinity && d > 0) {
      setDuration(d);
      return true;
    }
    return false;
  };

  /**
   * Starts a polling interval that retries duration detection every 200 ms.
   * Useful for formats (e.g. MP3 with VBR) where the browser reports duration
   * later than `loadedmetadata`.
   */
  const pollDuration = () => {
    if (durationPoll) return;
    durationPoll = setInterval(() => {
      if (tryGetDurationFromAudio()) {
        clearInterval(durationPoll);
        durationPoll = null;
      }
    }, 200);
  };

  /**
   * Last-resort fallback: fetches the audio file as a binary buffer, decodes
   * it with the Web Audio API, and extracts the duration from the resulting
   * AudioBuffer. Only attempted once per instance.
   *
   * This is necessary for some file formats where the browser's media pipeline
   * cannot determine duration without fully downloading the file.
   */
  const fallbackGetDuration = async () => {
    if (audioContextFallbackAttempted) return;
    audioContextFallbackAttempted = true;

    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const durationSeconds = audioBuffer.duration;
      setDuration(durationSeconds);
      audioContext.close();
    } catch (err) {
      console.warn("[Audio] Fallback duration fetch failed:", err);
    }
  };

  // Wire up native audio element events
  audio.addEventListener("loadedmetadata", () => {
    if (!tryGetDurationFromAudio()) pollDuration();
  });
  audio.addEventListener("durationchange", () => tryGetDurationFromAudio());
  audio.addEventListener("canplay", () => {
    if (!tryGetDurationFromAudio()) pollDuration();
  });
  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("play", () => {
    if (onPlay) onPlay();
  });
  audio.addEventListener("pause", () => {
    if (onPause) onPause();
  });
  audio.addEventListener("ended", () => {
    if (onEnd) onEnd();
  });
  audio.addEventListener("error", (e) => console.warn("[Audio] Error:", e));

  // Kick off duration detection immediately; if unavailable after 2 s, use fetch fallback
  if (!tryGetDurationFromAudio()) {
    pollDuration();
    setTimeout(() => {
      if (!duration) fallbackGetDuration();
    }, 2000);
  }

  // Extend _cleanup to also cancel the polling interval
  const originalCleanup = audio._cleanup;
  audio._cleanup = () => {
    if (durationPoll) clearInterval(durationPoll);
    if (originalCleanup) originalCleanup();
  };

  // ========== PUBLIC PLAYBACK API ==========

  /**
   * Starts playback. Silently swallows the NotAllowedError thrown by browsers
   * that require a user gesture before audio can play.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.playAudio = () => {
    nativePlay().catch((e) => console.warn(e));
    return audio;
  };

  /**
   * Pauses playback.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.pauseAudio = () => {
    nativePause();
    return audio;
  };

  /**
   * Stops playback and resets the playhead to the beginning.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.stop = () => {
    nativePause();
    audio.currentTime = 0;
    updateTime();
    return audio;
  };

  /**
   * Seeks to an absolute position in seconds.
   * Silently ignores out-of-range values.
   *
   * @param {number} seconds - Target time in seconds.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.seekTo = (seconds) => {
    if (seconds >= 0 && seconds <= (duration || audio.duration)) {
      audio.currentTime = seconds;
      updateTime();
    }
    return audio;
  };

  /**
   * Seeks to a percentage of the total duration (0–100).
   *
   * @param {number} percent - Target position as a percentage.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.seekToPercent = (percent) => {
    const total = duration || audio.duration;
    if (total) audio.seekTo((percent / 100) * total);
    return audio;
  };

  /** @returns {number} The current playback position in seconds. */
  audio.getCurrentTime = () => currentTime;

  /** @returns {number} The total track duration in seconds, or 0 if not yet known. */
  audio.getDuration = () => duration || audio.duration || 0;

  /** @returns {number} The current playback position as a percentage (0–100). */
  audio.getProgressPercent = () => {
    const total = duration || audio.duration;
    return total ? (currentTime / total) * 100 : 0;
  };

  /**
   * Increases volume by `step` (clamped to 1.0).
   * @param {number} [step=0.1] - Volume increment.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.volumeUp = (step = 0.1) => {
    audio.volume = Math.min(1, audio.volume + step);
    return audio;
  };

  /**
   * Decreases volume by `step` (clamped to 0.0).
   * @param {number} [step=0.1] - Volume decrement.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.volumeDown = (step = 0.1) => {
    audio.volume = Math.max(0, audio.volume - step);
    return audio;
  };

  /**
   * Mutes the audio element without changing the volume setting.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.muteAudio = () => {
    audio.muted = true;
    return audio;
  };

  /**
   * Unmutes the audio element.
   * @returns {HTMLAudioElement} The audio element (for chaining).
   */
  audio.unmuteAudio = () => {
    audio.muted = false;
    return audio;
  };

  /** @returns {boolean} `true` if the audio is currently playing. */
  audio.isPlaying = () => !audio.paused;

  // Expose the element via ref callback if provided
  if (ref && typeof ref === "function") ref(audio);

  return audio;
};

export default Audio;
