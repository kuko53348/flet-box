// widgets/CircularChart.js
import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

export const CircularChart = (props) => {
  let {
    data = [],
    size = null,
    strokeWidth = 20,
    innerRadius = null,
    rounded = false,
    cornerRadius = 0,
    startAngle = -Math.PI / 2,
    endAngle = null,
    animate = true,
    animationDuration = 1000,
    onComplete,
    centerContent = null,
    showLabels = false,
    labelSize = 12,
    labelColor = colors.text,
    onClick = null,
    onHover = null,
    defaultColors = [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.danger,
      colors.info,
    ],
    ref,
    shadowBlur = 0,
    shadowColor = "rgba(0,0,0,0.2)",
    glow = false,
    glowColor = null,
    semiCircle = null,
    borderRadius = 0,
    borderColor = null,
    borderWidth = 0,
    sliceBorderWidth = 0,
    sliceBorderColor = "#ffffff",
    ...rest
  } = props;

  if (!Array.isArray(data)) data = [];

  // Configurar ángulos para semi‑círculo
  if (semiCircle) {
    switch (semiCircle) {
      case "top":
        startAngle = -Math.PI;
        endAngle = 0;
        break;
      case "bottom":
        startAngle = 0;
        endAngle = Math.PI;
        break;
      case "left":
        startAngle = -Math.PI / 2;
        endAngle = Math.PI / 2;
        break;
      case "right":
        startAngle = Math.PI / 2;
        endAngle = (3 * Math.PI) / 2;
        break;
    }
  }

  let finalStartAngle = startAngle;
  let finalEndAngle = endAngle !== null ? endAngle : startAngle + Math.PI * 2;

  let finalInnerRadius = innerRadius;
  if (finalInnerRadius === null && strokeWidth > 0) {
    const defaultRadius = size ? size / 2 : 100;
    finalInnerRadius = defaultRadius - strokeWidth;
  }

  const isSemi = semiCircle !== null;
  const diameter = size || 200;
  const radius = diameter / 2;
  let canvasWidth = diameter;
  let canvasHeight = diameter;
  if (isSemi) {
    switch (semiCircle) {
      case "top":
        canvasHeight = radius;
        break;
      case "bottom":
        canvasHeight = radius;
        break;
      case "left":
        canvasWidth = radius;
        break;
      case "right":
        canvasWidth = radius;
        break;
    }
  }

  let canvas = null;
  let ctx = null;
  let container = null;
  let animationId = null;
  let currentData = [];
  let startTime = null;
  let resizeObserver = null;
  let currentWidth = canvasWidth;
  let currentHeight = canvasHeight;
  let hoveredIndex = -1;

  const isFixedSize = size !== null && size !== undefined;

  const updateCanvasSize = () => {
    if (!canvas) return;
    if (isFixedSize) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      currentWidth = canvasWidth;
      currentHeight = canvasHeight;
    } else {
      const rect = container.getBoundingClientRect();
      let w = rect.width;
      if (w <= 0) w = 200;
      if (isSemi) {
        if (semiCircle === "top" || semiCircle === "bottom") {
          canvas.width = w;
          canvas.height = w / 2;
        } else {
          canvas.width = w / 2;
          canvas.height = w;
        }
      } else {
        canvas.width = w;
        canvas.height = w;
      }
      currentWidth = canvas.width;
      currentHeight = canvas.height;
    }
  };

  const getCenterX = () => {
    if (!isSemi) return currentWidth / 2;
    switch (semiCircle) {
      case "left":
        return currentWidth;
      case "right":
        return 0;
      default:
        return currentWidth / 2;
    }
  };
  const getCenterY = () => {
    if (!isSemi) return currentHeight / 2;
    switch (semiCircle) {
      case "top":
        return currentHeight;
      case "bottom":
        return 0;
      default:
        return currentHeight / 2;
    }
  };
  const getRadiusVal = () => Math.min(currentWidth, currentHeight);

  const computeAngles = (values) => {
    if (!values || values.length === 0) return [];
    const total = values.reduce((sum, v) => sum + (v || 0), 0);
    if (total === 0) return [];
    let start = finalStartAngle;
    const slices = [];
    for (let i = 0; i < values.length; i++) {
      const angle = (values[i] / total) * (finalEndAngle - finalStartAngle);
      slices.push({
        start,
        end: start + angle,
        value: values[i] || 0,
        original: data[i] || { value: values[i] },
      });
      start += angle;
    }
    return slices;
  };

  let currentSlices = [];

  const getColor = (index, originalColor) => {
    if (originalColor) return originalColor;
    return defaultColors[index % defaultColors.length];
  };

  // Dibuja cada segmento con el redondeo en sus extremos (cada uno con su color)
  const drawRoundedSegment = (slice, index) => {
    const r = getRadiusVal() / 2;
    const innerR = finalInnerRadius !== null ? finalInnerRadius : 0;
    const cx = getCenterX();
    const cy = getCenterY();
    const start = slice.start;
    const end = slice.end;
    const color = getColor(index, slice.original?.color);

    // Para donut con cornerRadius > 0: dibujar como trazo redondeado en ambos extremos
    if (cornerRadius > 0 && innerR > 0) {
      const thickness = r - innerR;
      const midRadius = (r + innerR) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, midRadius, start, end);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
      ctx.lineCap = "round"; // Redondea los dos extremos del segmento
      ctx.stroke();
      ctx.restore();
    } else {
      // Modo normal (relleno)
      ctx.save();
      ctx.beginPath();
      if (innerR > 0) {
        ctx.arc(cx, cy, r, start, end);
        ctx.arc(cx, cy, innerR, end, start, true);
        ctx.closePath();
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    // Borde entre segmentos (opcional)
    if (sliceBorderWidth > 0 && sliceBorderColor) {
      ctx.save();
      ctx.strokeStyle = sliceBorderColor;
      ctx.lineWidth = sliceBorderWidth;
      ctx.beginPath();
      if (innerR > 0) {
        ctx.arc(cx, cy, r, start, end);
        ctx.arc(cx, cy, innerR, end, start, true);
        ctx.closePath();
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, end);
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();
    }

    // Rounded para pie chart (extremos redondeados)
    if (rounded && !innerR) {
      const midAngle = (start + end) / 2;
      const x = cx + r * Math.cos(midAngle);
      const y = cy + r * Math.sin(midAngle);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    // Etiquetas
    if (showLabels && slice.value > 0) {
      const midAngle = (start + end) / 2;
      const labelRadius = innerR > 0 ? (innerR + r) / 2 : r * 0.7;
      const x = cx + labelRadius * Math.cos(midAngle);
      const y = cy + labelRadius * Math.sin(midAngle);
      ctx.font = `${labelSize}px system-ui`;
      ctx.fillStyle = labelColor;
      ctx.shadowBlur = 0;
      const percent = Math.round(
        (slice.value / (slice.end - slice.start)) * 100,
      );
      ctx.fillText(slice.original?.label || `${percent}%`, x, y);
    }
  };

  const drawBackground = () => {
    if (finalInnerRadius > 0) {
      const r = getRadiusVal() / 2;
      const cx = getCenterX();
      const cy = getCenterY();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = colors.gray200;
      ctx.fill();
    }
  };

  const drawCenterContent = () => {
    if (!centerContent) return;
    let cx = getCenterX();
    let cy = getCenterY();
    if (isSemi) {
      const r = getRadiusVal() / 2;
      switch (semiCircle) {
        case "top":
          cy = cy - r * 0.3;
          break;
        case "bottom":
          cy = cy + r * 0.3;
          break;
        case "left":
          cx = cx - r * 0.3;
          break;
        case "right":
          cx = cx + r * 0.3;
          break;
      }
    }
    if (typeof centerContent === "string") {
      ctx.font = `${Math.min(currentWidth * 0.1, 24)}px system-ui`;
      ctx.fillStyle = colors.text;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerContent, cx, cy);
    }
  };

  const draw = () => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, currentWidth, currentHeight);
    drawBackground();
    if (currentSlices && currentSlices.length > 0) {
      currentSlices.forEach((slice, idx) => drawRoundedSegment(slice, idx));
    }
    ctx.shadowBlur = 0;
    drawCenterContent();
  };

  const updateAnimation = (timestamp) => {
    if (!ctx || !canvas) return;
    if (!startTime) {
      startTime = timestamp;
      requestAnimationFrame(updateAnimation);
      return;
    }
    const elapsed = timestamp - startTime;
    const progress = Math.min(1, elapsed / animationDuration);

    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const targetValue = data[i]?.value || 0;
        currentData[i] = targetValue * progress;
      }
    }
    currentSlices = computeAngles(currentData);
    draw();

    if (progress < 1 && animate) {
      animationId = requestAnimationFrame(updateAnimation);
    } else {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          currentData[i] = data[i]?.value || 0;
        }
      }
      currentSlices = computeAngles(currentData);
      draw();
      if (onComplete) onComplete();
      animationId = null;
    }
  };

  const startAnimation = () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (!ctx || !canvas) return;
    if (data && data.length > 0) {
      currentData = data.map((d) => 0);
    } else {
      currentData = [];
    }
    currentSlices = computeAngles(currentData);

    if (animate && data && data.length > 0) {
      startTime = null;
      animationId = requestAnimationFrame(updateAnimation);
    } else {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          currentData[i] = data[i]?.value || 0;
        }
      }
      currentSlices = computeAngles(currentData);
      draw();
    }
  };

  const resizeCanvas = () => {
    if (!canvas) return;
    updateCanvasSize();
    startAnimation();
  };

  const getSliceIndex = (x, y) => {
    if (!currentSlices || currentSlices.length === 0) return -1;
    const cx = getCenterX();
    const cy = getCenterY();
    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.hypot(dx, dy);
    const r = getRadiusVal() / 2;
    if (distance > r) return -1;
    if (finalInnerRadius > 0 && distance < finalInnerRadius) return -1;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;
    let adjusted = angle - finalStartAngle;
    if (adjusted < 0) adjusted += Math.PI * 2;
    for (let i = 0; i < currentSlices.length; i++) {
      const slice = currentSlices[i];
      let start = slice.start - finalStartAngle;
      if (start < 0) start += Math.PI * 2;
      let end = slice.end - finalStartAngle;
      if (end < 0) end += Math.PI * 2;
      if (adjusted >= start - 0.01 && adjusted <= end + 0.01) return i;
    }
    return -1;
  };

  const handleCanvasClick = (e) => {
    if (!onClick || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const idx = getSliceIndex(mouseX, mouseY);
    if (idx !== -1 && currentSlices[idx]) {
      onClick(currentSlices[idx].original, idx);
    }
  };

  const handleCanvasMousemove = (e) => {
    if (!onHover && !glow) return;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const idx = getSliceIndex(mouseX, mouseY);
    if (hoveredIndex !== idx) {
      hoveredIndex = idx;
      if (onHover)
        onHover(idx !== -1 ? currentSlices[idx]?.original : null, idx);
      draw();
    }
  };

  const initWidget = () => {
    container = WidgetFactory({
      tag: "div",
      style: {
        display: isFixedSize ? "inline-block" : "block",
        width: isFixedSize ? `${canvasWidth}px` : "100%",
        height: isFixedSize ? `${canvasHeight}px` : "auto",
        position: "relative",
        overflow: "hidden",
        borderRadius:
          typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        border:
          borderWidth > 0 && borderColor
            ? `${borderWidth}px solid ${borderColor}`
            : "none",
        ...rest.style,
      },
      ...rest,
    });

    // Eliminar canvas antiguo si existe
    const oldCanvas = container.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMousemove);
    canvas.addEventListener("mouseleave", () => {
      if (hoveredIndex !== -1) {
        hoveredIndex = -1;
        if (onHover) onHover(null, -1);
        draw();
      }
    });

    container.appendChild(canvas);
    ctx = canvas.getContext("2d");
    updateCanvasSize();

    if (!isFixedSize && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(container);
    } else if (!isFixedSize) {
      window.addEventListener("resize", resizeCanvas);
    }

    startAnimation();
    if (ref && typeof ref === "function") ref(canvas);
  };

  initWidget();

  const updateData = (newData, animateUpdate = true) => {
    if (!Array.isArray(newData)) return;
    data = newData;
    animate = animateUpdate;
    startAnimation();
  };

  const redraw = () => {
    updateCanvasSize();
    startAnimation();
  };

  const setCornerRadius = (newRadius) => {
    cornerRadius = newRadius;
    if (currentSlices && currentSlices.length > 0) {
      draw();
    } else if (data && data.length > 0) {
      startAnimation();
    } else {
      draw();
    }
  };

  container.updateData = updateData;
  container.redraw = redraw;
  container.setCornerRadius = setCornerRadius;

  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (resizeObserver) resizeObserver?.disconnect();
    else window.removeEventListener("resize", resizeCanvas);
    if (canvas) {
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("mousemove", handleCanvasMousemove);
      canvas.remove();
    }
    if (container && container.parentNode)
      container.parentNode.removeChild(container);
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default CircularChart;
