/**
 * @file Chart.js
 * @description A canvas-based chart widget supporting bar, line, area, and
 * candlestick chart types. Features smooth Bézier curves, gradient fills,
 * configurable grid/axis rendering, and automatic resizing via ResizeObserver.
 * Candlestick charts support horizontal scrolling when the data set is wider
 * than the container.
 */

import { WidgetFactory } from "../widget-factory/index.js";
import { colors } from "../utils/themes.js";

/**
 * Creates a Chart widget rendered on an HTML5 `<canvas>` element.
 *
 * @param {Object} props - Configuration for the chart.
 * @param {'candle'|'bar'|'line'|'area'} [props.type='candle'] - Chart type to render.
 * @param {Array} [props.data=[]] - Dataset.
 *   - For 'bar', 'line', 'area': an array of numbers.
 *   - For 'candle': an array of `{open, high, low, close}` objects, or 4-element arrays `[open, high, low, close]`.
 * @param {string[]} [props.labels=[]] - X-axis labels, one per data point.
 * @param {number|string} [props.width='100%'] - Container width (CSS value or pixel number).
 * @param {number} [props.height=400] - Container height in pixels.
 * @param {string} [props.bgColor=colors.surface] - Background color of the chart container.
 * @param {Object} [props.padding={top:20,right:50,bottom:50,left:50}] - Canvas padding in pixels. Can also be a single number.
 * @param {number} [props.candleWidth=8] - Width of each candlestick body in pixels.
 * @param {number} [props.candleSpacing=2] - Gap between consecutive candlesticks in pixels.
 * @param {string} [props.barColor=colors.primary] - Fill color for bar chart bars.
 * @param {string} [props.lineColor=colors.primary] - Stroke color for line/area charts.
 * @param {string} [props.areaColor] - Fill color for the area under line charts (default: primary at 25% opacity).
 * @param {boolean} [props.smooth=false] - When true, line/area charts use quadratic Bézier curves instead of straight segments.
 * @param {boolean} [props.areaGradient=false] - When true, the area fill uses a vertical gradient instead of a flat color.
 * @param {string[]|null} [props.areaGradientColors=null] - Two-element color array `[bottomColor, topColor]` for the gradient. Defaults to `[lineColor, transparent]`.
 * @param {string} [props.candleUpColor=colors.success] - Candlestick body color for bullish (close ≥ open) candles.
 * @param {string} [props.candleDownColor=colors.danger] - Candlestick body color for bearish (close < open) candles.
 * @param {string} [props.axisColor=colors.border] - Color of the axis lines and grid lines.
 * @param {string} [props.textColor=colors.textSecondary] - Color of axis labels.
 * @param {string} [props.yAxisColor=colors.primary] - Color of the Y-axis value labels.
 * @param {boolean} [props.showGrid=true] - Whether to render horizontal grid lines.
 * @param {boolean} [props.showLabels=true] - Whether to render X-axis labels below each data point.
 * @param {boolean} [props.showValues=false] - Whether to render the raw value above each data point.
 * @param {number} [props.borderRadius=8] - Corner radius of the chart container in pixels.
 * @returns {HTMLElement} The chart container element, augmented with `updateData` and `redraw` methods.
 */
export const Chart = (props) => {
  const {
    type = "candle",
    data = [],
    labels = [],
    width = "100%",
    height = 400,
    bgColor = colors.surface,
    padding = { top: 20, right: 50, bottom: 50, left: 50 },
    candleWidth = 8,
    candleSpacing = 2,
    barColor = colors.primary,
    lineColor = colors.primary,
    areaColor = `${colors.primary}40`,
    // Smooth curves and gradient fill options
    smooth = false,
    areaGradient = false,
    areaGradientColors = null,
    candleUpColor = colors.success,
    candleDownColor = colors.danger,
    axisColor = colors.border,
    textColor = colors.textSecondary,
    yAxisColor = colors.primary,
    showGrid = true,
    showLabels = true,
    showValues = false,
    borderRadius = 8,
    ...rest
  } = props;

  if (!data.length) return null;

  let canvasRef = null;
  let context = null;
  let scrollContainerRef = null;
  let isCandle = type === "candle";
  let dynamicCandleWidth = candleWidth;
  let dynamicCandleSpacing = candleSpacing;
  let useFixedWidth = true;

  /**
   * Normalises the `padding` prop into a consistent `{top, right, bottom, left}` object.
   * Accepts either a single number (applied to all sides) or a partial object.
   *
   * @returns {{top: number, right: number, bottom: number, left: number}}
   */
  const normalizePadding = () => {
    if (typeof padding === "number") {
      return { top: padding, right: padding, bottom: padding, left: padding };
    }
    return { top: 20, right: 50, bottom: 50, left: 50, ...padding };
  };

  const pad = normalizePadding();

  /**
   * Normalises the candle data so that every entry is a `{open, high, low, close}` object,
   * regardless of whether the caller passed 4-element arrays or plain objects.
   *
   * @returns {{open: number, high: number, low: number, close: number}[]}
   */
  const normalizeCandleData = () => {
    return data.map((item) => {
      if (Array.isArray(item)) {
        return { open: item[0], high: item[1], low: item[2], close: item[3] };
      }
      return item;
    });
  };

  /**
   * Computes the minimum and maximum values across the dataset, adding 10%
   * padding on each side so data points are never flush against the edges.
   *
   * @returns {{maxValue: number, minValue: number}}
   */
  const getMinMaxValues = () => {
    let minVal, maxVal;
    if (type === "candle") {
      const candleData = normalizeCandleData();
      const highs = candleData.map((d) => d.high);
      const lows = candleData.map((d) => d.low);
      maxVal = Math.max(...highs);
      minVal = Math.min(...lows);
    } else {
      maxVal = Math.max(...data);
      minVal = Math.min(...data);
    }
    const range = maxVal - minVal;
    const paddingRange = range * 0.1;
    return {
      maxValue: maxVal + paddingRange,
      minValue: Math.max(0, minVal - paddingRange),
    };
  };

  /**
   * Converts a data value to a Y pixel coordinate on the canvas.
   *
   * @param {number} value - The data value to convert.
   * @param {number} minValue - Minimum value in the visible range.
   * @param {number} maxValue - Maximum value in the visible range.
   * @param {number} chartHeight - Total canvas height in pixels.
   * @returns {number} The Y coordinate in canvas space.
   */
  const getYPosition = (value, minValue, maxValue, chartHeight) => {
    const range = maxValue - minValue;
    if (range === 0) return chartHeight - pad.bottom;
    const ratio = (value - minValue) / range;
    return (
      chartHeight - pad.bottom - ratio * (chartHeight - pad.top - pad.bottom)
    );
  };

  /**
   * Draws a bar chart onto the canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} chartHeight
   * @param {number} maxValue
   * @param {number} minValue
   */
  const drawBar = (ctx, canvasWidth, chartHeight, maxValue, minValue) => {
    const availableWidth = canvasWidth - pad.left - pad.right;
    const barWidth = (availableWidth / data.length) * 0.7;
    const barSpacing = (availableWidth / data.length) * 0.3;

    data.forEach((value, index) => {
      const x = pad.left + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = getYPosition(value, minValue, maxValue, chartHeight);
      const baselineY = getYPosition(0, minValue, maxValue, chartHeight);
      const barHeight = Math.abs(y - baselineY);

      ctx.fillStyle = barColor;
      ctx.fillRect(x, Math.min(y, baselineY), barWidth, barHeight);

      if (showValues && labels[index]) {
        ctx.fillStyle = textColor;
        ctx.font = "8px sans-serif";
        ctx.fillText(value, x + barWidth / 2 - 5, y - 2);
        ctx.save();
        ctx.translate(x + barWidth / 2, chartHeight - pad.bottom + 8);
        ctx.rotate(-0.3);
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      }
    });
  };

  /**
   * Draws a line or area chart onto the canvas context.
   * Uses quadratic Bézier midpoints to produce smooth curves when `smooth` is true.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} chartHeight
   * @param {number} maxValue
   * @param {number} minValue
   * @param {boolean} [isArea=false] - When true, fills the area below the line.
   */
  const drawLine = (
    ctx,
    canvasWidth,
    chartHeight,
    maxValue,
    minValue,
    isArea = false,
  ) => {
    const availableWidth = canvasWidth - pad.left - pad.right;
    const step = availableWidth / (data.length - 1);
    const points = [];

    data.forEach((value, index) => {
      const x = pad.left + index * step;
      const y = getYPosition(value, minValue, maxValue, chartHeight);
      points.push({ x, y, value, label: labels[index] });
    });

    if (points.length < 2) return;

    // Fill the area under the line when rendering an area chart
    if (isArea) {
      // Build a gradient or flat fill depending on configuration
      let fillStyle = areaColor;
      if (areaGradient) {
        let grad;
        if (areaGradientColors && areaGradientColors.length >= 2) {
          // Caller-supplied two-color gradient (bottom → top)
          grad = ctx.createLinearGradient(
            0,
            chartHeight - pad.bottom,
            0,
            pad.top,
          );
          grad.addColorStop(0, areaGradientColors[0]);
          grad.addColorStop(1, areaGradientColors[1]);
        } else {
          // Default gradient: solid lineColor at bottom, transparent at top
          grad = ctx.createLinearGradient(
            0,
            chartHeight - pad.bottom,
            0,
            pad.top,
          );
          grad.addColorStop(0, lineColor);
          grad.addColorStop(1, "transparent");
        }
        fillStyle = grad;
      }
      ctx.beginPath();
      if (smooth) {
        // Smooth area: trace through midpoints, then close back to the baseline
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.quadraticCurveTo(
          points[points.length - 2].x,
          points[points.length - 2].y,
          points[points.length - 1].x,
          points[points.length - 1].y,
        );
        ctx.lineTo(points[points.length - 1].x, chartHeight - pad.bottom);
        ctx.lineTo(points[0].x, chartHeight - pad.bottom);
        ctx.fillStyle = fillStyle;
        ctx.fill();
      } else {
        // Straight-line area
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineTo(points[points.length - 1].x, chartHeight - pad.bottom);
        ctx.lineTo(points[0].x, chartHeight - pad.bottom);
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
    }

    // Draw the line stroke on top of (or without) the fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (smooth) {
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y,
      );
    } else {
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw small circles at each data point and optional labels
    points.forEach((point) => {
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();

      if (showValues) {
        ctx.fillStyle = textColor;
        ctx.font = "8px sans-serif";
        ctx.fillText(point.value, point.x - 5, point.y - 4);
      }
      if (showLabels && point.label) {
        ctx.save();
        ctx.translate(point.x, chartHeight - pad.bottom + 8);
        ctx.rotate(-0.3);
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(point.label, 0, 0);
        ctx.restore();
      }
    });
  };

  /**
   * Draws a candlestick chart onto the canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} chartHeight
   * @param {number} maxValue
   * @param {number} minValue
   * @param {number} candleW - Width of each candle body in pixels.
   * @param {number} candleSp - Spacing between candles in pixels.
   */
  const drawCandle = (
    ctx,
    canvasWidth,
    chartHeight,
    maxValue,
    minValue,
    candleW,
    candleSp,
  ) => {
    const candleData = normalizeCandleData();
    const step = candleW + candleSp;
    const startX = pad.left;

    candleData.forEach((item, index) => {
      const isUp = item.close >= item.open;
      const color = isUp ? candleUpColor : candleDownColor;
      const x = startX + index * step;
      const highY = getYPosition(item.high, minValue, maxValue, chartHeight);
      const lowY = getYPosition(item.low, minValue, maxValue, chartHeight);
      const openY = getYPosition(item.open, minValue, maxValue, chartHeight);
      const closeY = getYPosition(item.close, minValue, maxValue, chartHeight);

      // Wick (high–low line through the center of the candle)
      ctx.beginPath();
      ctx.moveTo(x + candleW / 2, highY);
      ctx.lineTo(x + candleW / 2, lowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Candle body (open–close rectangle); minimum 1 px tall for doji candles
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleW, bodyHeight);

      if (showLabels && labels[index]) {
        ctx.save();
        ctx.translate(x + candleW / 2, chartHeight - pad.bottom + 8);
        ctx.rotate(-0.3);
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      }
    });
  };

  /**
   * Draws horizontal grid lines and Y-axis value labels.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} chartHeight
   * @param {number} maxValue
   * @param {number} minValue
   */
  const drawGrid = (ctx, canvasWidth, chartHeight, maxValue, minValue) => {
    if (!showGrid) return;

    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 0.5;

    const steps = 5;
    const range = maxValue - minValue;

    for (let i = 0; i <= steps; i++) {
      const value = minValue + (i / steps) * range;
      const y = getYPosition(value, minValue, maxValue, chartHeight);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(canvasWidth - pad.right, y);
      ctx.stroke();

      // Round very small floating-point values to 0 to avoid displaying "-0.00"
      const displayValue = Math.abs(value) < 0.01 ? 0 : Math.round(value);
      ctx.fillStyle = yAxisColor;
      ctx.font = "9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(displayValue, pad.left - 5, y + 3);
    }
  };

  /**
   * Draws the X and Y axis lines.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} canvasWidth
   * @param {number} chartHeight
   */
  const drawAxis = (ctx, canvasWidth, chartHeight) => {
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, chartHeight - pad.bottom);
    ctx.lineTo(canvasWidth - pad.right, chartHeight - pad.bottom);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  /**
   * Full redraw cycle: clears the canvas, recomputes sizes, and paints all layers.
   * Triggered by ResizeObserver, window resize, and data updates.
   */
  const draw = () => {
    if (!canvasRef || !context || !scrollContainerRef) return;

    const containerRect =
      scrollContainerRef.parentElement.getBoundingClientRect();
    const chartHeight = containerRect.height;
    const containerWidth = containerRect.width;

    if (isCandle) {
      // For candlestick charts: if the data fits inside the container, distribute
      // candles evenly; otherwise use fixed sizes and enable horizontal scrolling
      const fixedTotalWidth =
        pad.left + data.length * (candleWidth + candleSpacing) + pad.right;

      if (fixedTotalWidth <= containerWidth) {
        useFixedWidth = false;
        const availableWidth = containerWidth - pad.left - pad.right;
        const totalSpacing = (data.length - 1) * candleSpacing;
        let newCandleWidth = (availableWidth - totalSpacing) / data.length;
        newCandleWidth = Math.max(2, newCandleWidth);
        dynamicCandleWidth = newCandleWidth;
        dynamicCandleSpacing = candleSpacing;

        canvasRef.width = containerWidth;
        canvasRef.style.width = "100%";
      } else {
        useFixedWidth = true;
        dynamicCandleWidth = candleWidth;
        dynamicCandleSpacing = candleSpacing;
        const totalFixed =
          pad.left + data.length * (candleWidth + candleSpacing) + pad.right;
        canvasRef.width = totalFixed;
        canvasRef.style.width = `${totalFixed}px`;
      }
    } else {
      canvasRef.width = containerWidth;
      canvasRef.style.width = "100%";
    }

    canvasRef.height = chartHeight;
    canvasRef.style.height = `${chartHeight}px`;

    context.clearRect(0, 0, canvasRef.width, chartHeight);

    const { maxValue, minValue } = getMinMaxValues();
    const canvasWidth = canvasRef.width;

    drawGrid(context, canvasWidth, chartHeight, maxValue, minValue);
    drawAxis(context, canvasWidth, chartHeight);

    if (type === "bar") {
      drawBar(context, canvasWidth, chartHeight, maxValue, minValue);
    } else if (type === "line") {
      drawLine(context, canvasWidth, chartHeight, maxValue, minValue, false);
    } else if (type === "area") {
      drawLine(context, canvasWidth, chartHeight, maxValue, minValue, true);
    } else if (type === "candle") {
      drawCandle(
        context,
        canvasWidth,
        chartHeight,
        maxValue,
        minValue,
        dynamicCandleWidth,
        dynamicCandleSpacing,
      );
    }
  };

  // ========== DOM CONSTRUCTION ==========

  const container = WidgetFactory({
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    backgroundColor: bgColor,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    ...rest,
  });

  // Inner scrollable layer — only relevant for candlestick overflow
  const scrollContainer = WidgetFactory({
    tag: "div",
    style: {
      flex: 1,
      overflow: isCandle && useFixedWidth ? "auto" : "hidden",
      position: "relative",
    },
  });
  scrollContainerRef = scrollContainer;

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";

  canvasRef = canvas;
  context = canvas.getContext("2d");

  scrollContainer.appendChild(canvas);
  container.appendChild(scrollContainer);

  // Throttle scroll redraws to ~60 fps
  let drawTimeout;
  const handleScroll = () => {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(draw, 16);
  };

  if (isCandle) {
    scrollContainer.addEventListener("scroll", handleScroll);
  }

  // Automatically redraw when the container is resized
  const resizeObserver = new ResizeObserver(() => draw());
  resizeObserver.observe(scrollContainer);

  /**
   * Updates the scroll container's overflow mode after a draw, since
   * `useFixedWidth` may have changed during the draw call.
   */
  const updateOverflow = () => {
    if (isCandle && scrollContainerRef) {
      const shouldScroll = useFixedWidth;
      scrollContainerRef.style.overflow = shouldScroll ? "auto" : "hidden";
    }
  };

  const drawWithOverflow = () => {
    draw();
    updateOverflow();
  };

  // Throttle window resize redraws to avoid excessive repaints
  let windowResizeTimeout;
  const handleWindowResize = () => {
    if (windowResizeTimeout) clearTimeout(windowResizeTimeout);
    windowResizeTimeout = setTimeout(drawWithOverflow, 50);
  };
  window.addEventListener("resize", handleWindowResize);

  // Defer the initial draw so the container has been laid out by the browser
  const initialDrawTimeout = setTimeout(drawWithOverflow, 100);

  // ========== PUBLIC API ==========

  /**
   * Replaces the chart's dataset and redraws.
   *
   * @param {Array} newData - New data array (same format as the original `data` prop).
   * @param {string[]} [newLabels] - New labels array. When provided, replaces the existing labels.
   */
  container.updateData = (newData, newLabels) => {
    data.length = 0;
    data.push(...newData);
    if (newLabels) {
      labels.length = 0;
      labels.push(...newLabels);
    }
    drawWithOverflow();
  };

  /** Triggers a full redraw without changing the data. */
  container.redraw = drawWithOverflow;

  // Cleanup: remove all listeners, observers, and timers
  const originalCleanup = container._cleanup;
  container._cleanup = () => {
    if (drawTimeout) clearTimeout(drawTimeout);
    if (windowResizeTimeout) clearTimeout(windowResizeTimeout);
    if (initialDrawTimeout) clearTimeout(initialDrawTimeout);
    resizeObserver?.disconnect();
    window.removeEventListener("resize", handleWindowResize);
    if (isCandle) {
      scrollContainer.removeEventListener("scroll", handleScroll);
    }
    if (originalCleanup) originalCleanup();
  };

  return container;
};

export default Chart;
