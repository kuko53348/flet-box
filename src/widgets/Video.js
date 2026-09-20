// widgets/Video.js
import { WidgetFactory } from "../widget-factory/index.js";

export const Video = (props) => {
  const {
    src,
    width = "100%",
    height = "auto",
    autoplay = false,
    controls = true,
    loop = false,
    muted = false,
    poster,
    ref,
    ...rest
  } = props;

  const video = WidgetFactory({
    tag: "video",
    src: src,
    width: width,
    height: height,
    ...rest,
  });

  // Media attributes are element properties, not CSS — apply them directly.
  video.controls = Boolean(controls);
  video.loop = Boolean(loop);
  video.muted = Boolean(muted);
  video.autoplay = Boolean(autoplay);
  if (poster) video.poster = poster;

  // Save native methods
  const nativePlay = video.play.bind(video);
  const nativePause = video.pause.bind(video);

  // Add custom methods BEFORE calling the ref
  video.playVideo = () => {
    nativePlay().catch((error) => console.warn("Video play failed:", error));
    return video;
  };

  video.pauseVideo = () => {
    nativePause();
    return video;
  };

  video.stop = () => {
    nativePause();
    video.currentTime = 0;
    return video;
  };

  video.restart = () => {
    video.currentTime = 0;
    nativePlay();
    return video;
  };

  video.volumeUp = (step = 0.1) => {
    video.volume = Math.min(1, video.volume + step);
    return video;
  };

  video.volumeDown = (step = 0.1) => {
    video.volume = Math.max(0, video.volume - step);
    return video;
  };

  video.muteVideo = () => {
    video.muted = true;
    return video;
  };

  video.unmuteVideo = () => {
    video.muted = false;
    return video;
  };

  // Call the ref after adding the methods
  if (ref && typeof ref === "function") {
    ref(video);
  }

  return video;
};

export default Video;
