// src/widgets/MatrixRain.js - Versión corregida (retorna el canvas)
export const MatrixRain = (props = {}) => {
  const {
    chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    fontSize = 16,
    speed = 0.5,
    fadeAmount = 0.05,
    resetProbability = 0.975,
    useDynamicColor = true,
    position = "fixed",
    zIndex = 1, // ← valor bajo por defecto para que pueda estar detrás
  } = props;

  let canvas = null;
  let ctx = null;
  let animationId = null;
  let drops = [];
  let columns = 0;
  let resizeObserver = null;

  const getCanvasSize = () => {
    const parent = canvas?.parentElement;
    if (position === "absolute" && parent) {
      const rect = parent.getBoundingClientRect();
      return {
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const resizeCanvas = () => {
    if (!canvas) return;
    if (
      position === "absolute" &&
      !resizeObserver &&
      typeof ResizeObserver !== "undefined" &&
      canvas.parentElement
    ) {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvas.parentElement);
    }
    const { width, height } = getCanvasSize();
    canvas.width = width;
    canvas.height = height;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  };

  const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

  const getColor = (y, canvasHeight) => {
    if (!useDynamicColor) return "#0f0";
    const intensity = 100 + (y / canvasHeight) * 155;
    return `rgb(0, ${Math.min(255, intensity)}, 0)`;
  };

  const init = () => {
    canvas = document.createElement("canvas");
    resizeCanvas();
    canvas.style.display = "block";
    canvas.style.position = position;
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = zIndex;

    ctx = canvas.getContext("2d");

    draw();
  };

  const draw = () => {
    if (!ctx || !canvas) return;

    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = getRandomChar();
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = getColor(y, canvas.height);
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > resetProbability) {
        drops[i] = 0;
      }

      drops[i] += speed + Math.random() * speed;
    }

    animationId = requestAnimationFrame(draw);
  };

  // Iniciar
  init();

  // Manejar resize
  const handleResize = () => {
    resizeCanvas();
  };

  window.addEventListener("resize", handleResize);
  if (position === "absolute" && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
  }

  // Limpiar al desmontar
  const cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", handleResize);
    if (resizeObserver) resizeObserver.disconnect();
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };

  // Retornar el canvas directamente (no un contenedor vacío)
  canvas._cleanup = cleanup;

  return canvas;
};

export default MatrixRain;
