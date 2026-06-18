// widgets/Audio.js
import { WidgetFactory } from "../widget-factory/index.js";

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
    autoplay: autoplay,
    controls: controls,
    loop: loop,
    muted: muted,
    volume: volume,
    preload: "metadata",
    ...rest,
  });

  const nativePlay = audio.play.bind(audio);
  const nativePause = audio.pause.bind(audio);

  let currentTime = 0;
  let duration = 0;
  let durationPoll = null;
  let audioContextFallbackAttempted = false;

  const updateTime = () => {
    currentTime = audio.currentTime || 0;
    const percent = duration ? (currentTime / duration) * 100 : 0;
    if (onTimeUpdate) onTimeUpdate(currentTime, duration, percent);
    if (onProgress) onProgress(percent);
  };

  const setDuration = (dur) => {
    if (dur > 0 && duration === 0) {
      duration = dur;
      if (onLoad) onLoad(duration);
      if (durationPoll) clearInterval(durationPoll);
      durationPoll = null;
    }
  };

  // Intentar obtener duración del elemento audio
  const tryGetDurationFromAudio = () => {
    const d = audio.duration;
    if (d && d !== Infinity && d > 0) {
      setDuration(d);
      return true;
    }
    return false;
  };

  const pollDuration = () => {
    if (durationPoll) return;
    durationPoll = setInterval(() => {
      if (tryGetDurationFromAudio()) {
        clearInterval(durationPoll);
        durationPoll = null;
      }
    }, 200);
  };

  // Fallback: usar AudioContext para calcular duración si el elemento no puede
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

  // Eventos del elemento audio
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

  // Inicial: intentar duración directa
  if (!tryGetDurationFromAudio()) {
    pollDuration();
    // Si tras 2 segundos sigue sin duración, lanzar fallback con fetch
    setTimeout(() => {
      if (!duration) fallbackGetDuration();
    }, 2000);
  }

  // Limpiar
  const originalCleanup = audio._cleanup;
  audio._cleanup = () => {
    if (durationPoll) clearInterval(durationPoll);
    if (originalCleanup) originalCleanup();
  };

  // Métodos públicos
  audio.playAudio = () => {
    nativePlay().catch((e) => console.warn(e));
    return audio;
  };
  audio.pauseAudio = () => {
    nativePause();
    return audio;
  };
  audio.stop = () => {
    nativePause();
    audio.currentTime = 0;
    updateTime();
    return audio;
  };
  audio.seekTo = (seconds) => {
    if (seconds >= 0 && seconds <= (duration || audio.duration)) {
      audio.currentTime = seconds;
      updateTime();
    }
    return audio;
  };
  audio.seekToPercent = (percent) => {
    const total = duration || audio.duration;
    if (total) audio.seekTo((percent / 100) * total);
    return audio;
  };
  audio.getCurrentTime = () => currentTime;
  audio.getDuration = () => duration || audio.duration || 0;
  audio.getProgressPercent = () => {
    const total = duration || audio.duration;
    return total ? (currentTime / total) * 100 : 0;
  };
  audio.volumeUp = (step = 0.1) => {
    audio.volume = Math.min(1, audio.volume + step);
    return audio;
  };
  audio.volumeDown = (step = 0.1) => {
    audio.volume = Math.max(0, audio.volume - step);
    return audio;
  };
  audio.muteAudio = () => {
    audio.muted = true;
    return audio;
  };
  audio.unmuteAudio = () => {
    audio.muted = false;
    return audio;
  };
  audio.isPlaying = () => !audio.paused;

  if (ref && typeof ref === "function") ref(audio);

  return audio;
};

export default Audio;
