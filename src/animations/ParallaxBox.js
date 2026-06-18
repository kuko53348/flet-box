// widgets/ParallaxBox.js
import { WidgetFactory } from "../widget-factory/index.js";
import { AnimatedBox } from "../animations/AnimatedBox.js";

export const ParallaxBox = (props) => {
  let {
    type = "scroll", // 'scroll', 'mouse', 'hover'
    speed = 0.5,
    direction = "vertical", // 'vertical', 'horizontal', 'both'
    maxOffset = 100,
    reverse = false,
    child,
    disabled = false,
    onParallaxMove,
    duration = 300,
    easing = "easeOut",
    ...rest
  } = props;

  if (!child) return null;

  let containerRef = null;
  let animationFrame = null;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let animatedContent = null;

  const applyTransform = (x, y, animate = true) => {
    if (disabled) return;

    let moveX = x;
    let moveY = y;

    if (direction === "vertical") moveX = 0;
    if (direction === "horizontal") moveY = 0;

    if (reverse) {
      moveX = -moveX;
      moveY = -moveY;
    }

    moveX = Math.max(-maxOffset, Math.min(maxOffset, moveX));
    moveY = Math.max(-maxOffset, Math.min(maxOffset, moveY));

    targetX = moveX;
    targetY = moveY;

    if (onParallaxMove) onParallaxMove({ x: moveX, y: moveY });

    if (animatedContent) {
      const transformParts = [];
      if (direction === "horizontal" || direction === "both") {
        transformParts.push(`translateX(${moveX}px)`);
      }
      if (direction === "vertical" || direction === "both") {
        transformParts.push(`translateY(${moveY}px)`);
      }
      animatedContent.style.transform = transformParts.join(" ");
      if (animate) {
        animatedContent.style.transition = `transform ${duration}ms ${easing}`;
      } else {
        animatedContent.style.transition = "none";
      }
      setTimeout(() => {
        if (animatedContent) animatedContent.style.transition = "";
      }, duration);
    }
  };

  const resetTransform = (animate = true) => {
    targetX = 0;
    targetY = 0;
    if (animatedContent) {
      animatedContent.style.transform = "translateX(0) translateY(0)";
      if (animate) {
        animatedContent.style.transition = `transform ${duration}ms ${easing}`;
      } else {
        animatedContent.style.transition = "none";
      }
      setTimeout(() => {
        if (animatedContent) animatedContent.style.transition = "";
      }, duration);
    }
    if (onParallaxMove) onParallaxMove({ x: 0, y: 0 });
  };

  const handleScroll = () => {
    if (disabled || type !== "scroll") return;
    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      let moveY = scrollY * speed;
      let moveX = scrollX * speed;

      applyTransform(moveX, moveY, true);
    });
  };

  const handleMouseMove = (e) => {
    if (disabled || (type !== "mouse" && type !== "hover")) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
      const rect = containerRef.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let moveX = (e.clientX - centerX) / (rect.width / 2);
      let moveY = (e.clientY - centerY) / (rect.height / 2);

      moveX = moveX * maxOffset;
      moveY = moveY * maxOffset;

      applyTransform(moveX, moveY, true);
    });
  };

  const handleMouseEnter = (e) => {
    if (disabled || type !== "hover") return;
    const rect = containerRef.getBoundingClientRect();
    const percentX = (e.clientX - rect.left) / rect.width;
    const percentY = (e.clientY - rect.top) / rect.height;

    let moveX = (percentX - 0.5) * maxOffset * 2;
    let moveY = (percentY - 0.5) * maxOffset * 2;

    applyTransform(moveX, moveY, true);
  };

  const handleMouseLeave = () => {
    if (disabled || (type !== "mouse" && type !== "hover")) return;
    resetTransform(true);
  };

  // ✅ CORREGIDO: WidgetFactory sin función anidada
  const container = WidgetFactory({
    tag: "div",
    position: "relative",
    overflow: "hidden",
    style: rest.style || {},
    ...rest,
  });

  containerRef = container;

  // Crear contenido animado
  const animatedWrapper = WidgetFactory({
    tag: "div",
    style: {
      willChange: "transform",
      transition: `transform ${duration}ms ${easing}`,
      transform: "translateX(0) translateY(0)",
    },
  });

  if (child) {
    if (child instanceof HTMLElement) {
      animatedWrapper.appendChild(child);
    } else if (typeof child === "string") {
      const textNode = document.createTextNode(child);
      animatedWrapper.appendChild(textNode);
    } else if (Array.isArray(child)) {
      child.forEach((item) => {
        if (item instanceof HTMLElement) animatedWrapper.appendChild(item);
        else if (typeof item === "string") {
          animatedWrapper.appendChild(document.createTextNode(item));
        }
      });
    }
  }

  animatedContent = animatedWrapper;
  container.appendChild(animatedWrapper);

  // Attach event listeners
  if (type === "scroll") {
    window.addEventListener("scroll", handleScroll);
    setTimeout(() => handleScroll(), 100);
  } else if (type === "mouse" || type === "hover") {
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    if (type === "hover") {
      container.addEventListener("mouseenter", handleMouseEnter);
    }
  }

  // ========== PUBLIC METHODS ==========
  container.updateSpeed = (newSpeed) => {
    speed = newSpeed;
    if (type === "scroll") handleScroll();
  };

  container.updateDirection = (newDirection) => {
    direction = newDirection;
    if (type === "scroll") handleScroll();
    else resetTransform(true);
  };

  container.setPosition = (x, y, animate = true) => {
    applyTransform(x, y, animate);
  };

  container.reset = (animate = true) => {
    resetTransform(animate);
  };

  // Cleanup
  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (type === "scroll") {
      window.removeEventListener("scroll", handleScroll);
    } else {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (type === "hover") {
        container.removeEventListener("mouseenter", handleMouseEnter);
      }
    }
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default ParallaxBox;
