/**
 * animations/index.js - Public entry point for the animations module.
 *
 * Re-exports all animation widgets and imperative animation utilities so
 * consumers can import from a single path:
 *
 * @example
 * import { AnimatedBox, animate, fadeInAsync } from "./animations/index.js";
 *
 * @module animations
 */
export { ParallaxBox } from "./ParallaxBox.js";
export { AnimatedBox } from "./AnimatedBox.js";
export { AnimatedText } from "./AnimatedText.js";
export { MatrixRain } from "./MatrixRain.js";
export {
	animate,
	animateAsync,
	animateSpring,
	animateSpringAsync,
	stopAnimation,
	fadeOut,
	fadeIn,
	pulse,
	fadeOutAsync,
	fadeInAsync,
	pulseAsync,
} from "./animate.js";
export {
	slideIn,
	slideInAsync,
	slideOut,
	slideOutAsync,
	popIn,
	popInAsync,
	shake,
	shakeAsync,
} from "./transitions.js";
export {
	prefersReducedMotion,
	getMotionMode,
	setMotionMode,
	onMotionModeChange,
	motionDuration,
	stagger,
} from "./motion.js";
export { EASING_NAMES, cubicBezier, spring } from "./easings.js";
