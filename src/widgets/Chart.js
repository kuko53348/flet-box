// widgets/Chart.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const Chart = (props) => {
    const {
        type = 'candle',
        data = [],
        labels = [],
        width = '100%',
        height = 400,
        bgColor = colors.surface,
        padding = { top: 20, right: 50, bottom: 50, left: 50 },
        candleWidth = 8,
        candleSpacing = 2,
        barColor = colors.primary,
        lineColor = colors.primary,
        areaColor = `${colors.primary}40`,
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
    let isCandle = type === 'candle';
    let dynamicCandleWidth = candleWidth;
    let dynamicCandleSpacing = candleSpacing;
    let useFixedWidth = true;

    const normalizePadding = () => {
        if (typeof padding === 'number') {
            return { top: padding, right: padding, bottom: padding, left: padding };
        }
        return { top: 20, right: 50, bottom: 50, left: 50, ...padding };
    };

    const pad = normalizePadding();

    const normalizeCandleData = () => {
        return data.map(item => {
            if (Array.isArray(item)) {
                return { open: item[0], high: item[1], low: item[2], close: item[3] };
            }
            return item;
        });
    };

    const getMinMaxValues = () => {
        let minVal, maxVal;
        if (type === 'candle') {
            const candleData = normalizeCandleData();
            const highs = candleData.map(d => d.high);
            const lows = candleData.map(d => d.low);
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
            minValue: Math.max(0, minVal - paddingRange)
        };
    };

    const getYPosition = (value, minValue, maxValue, chartHeight) => {
        const range = maxValue - minValue;
        if (range === 0) return chartHeight - pad.bottom;
        const ratio = (value - minValue) / range;
        return chartHeight - pad.bottom - (ratio * (chartHeight - pad.top - pad.bottom));
    };

    const drawBar = (ctx, canvasWidth, chartHeight, maxValue, minValue) => {
        const availableWidth = canvasWidth - pad.left - pad.right;
        const barWidth = availableWidth / data.length * 0.7;
        const barSpacing = availableWidth / data.length * 0.3;
        
        data.forEach((value, index) => {
            const x = pad.left + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = getYPosition(value, minValue, maxValue, chartHeight);
            const baselineY = getYPosition(0, minValue, maxValue, chartHeight);
            const barHeight = Math.abs(y - baselineY);
            
            ctx.fillStyle = barColor;
            ctx.fillRect(x, Math.min(y, baselineY), barWidth, barHeight);
            
            if (showValues && labels[index]) {
                ctx.fillStyle = textColor;
                ctx.font = '8px sans-serif';
                ctx.fillText(value, x + barWidth / 2 - 5, y - 2);
                ctx.save();
                ctx.translate(x + barWidth / 2, chartHeight - pad.bottom + 8);
                ctx.rotate(-0.3);
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], 0, 0);
                ctx.restore();
            }
        });
    };

    const drawLine = (ctx, canvasWidth, chartHeight, maxValue, minValue, isArea = false) => {
        const availableWidth = canvasWidth - pad.left - pad.right;
        const step = availableWidth / (data.length - 1);
        const points = [];
        
        data.forEach((value, index) => {
            const x = pad.left + index * step;
            const y = getYPosition(value, minValue, maxValue, chartHeight);
            points.push({ x, y, value, label: labels[index] });
        });
        
        if (points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (isArea && points.length > 0) {
            ctx.lineTo(points[points.length - 1].x, chartHeight - pad.bottom);
            ctx.lineTo(points[0].x, chartHeight - pad.bottom);
            ctx.fillStyle = areaColor;
            ctx.fill();
        }
        
        points.forEach(point => {
            ctx.fillStyle = lineColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            if (showValues) {
                ctx.fillStyle = textColor;
                ctx.font = '8px sans-serif';
                ctx.fillText(point.value, point.x - 5, point.y - 4);
            }
            if (showLabels && point.label) {
                ctx.save();
                ctx.translate(point.x, chartHeight - pad.bottom + 8);
                ctx.rotate(-0.3);
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.fillText(point.label, 0, 0);
                ctx.restore();
            }
        });
    };

    const drawCandle = (ctx, canvasWidth, chartHeight, maxValue, minValue, candleW, candleSp) => {
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
            
            ctx.beginPath();
            ctx.moveTo(x + candleW / 2, highY);
            ctx.lineTo(x + candleW / 2, lowY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1, Math.abs(closeY - openY));
            ctx.fillStyle = color;
            ctx.fillRect(x, bodyTop, candleW, bodyHeight);
            
            if (showLabels && labels[index]) {
                ctx.save();
                ctx.translate(x + candleW / 2, chartHeight - pad.bottom + 8);
                ctx.rotate(-0.3);
                ctx.fillStyle = textColor;
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], 0, 0);
                ctx.restore();
            }
        });
    };

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
            
            const displayValue = Math.abs(value) < 0.01 ? 0 : Math.round(value);
            ctx.fillStyle = yAxisColor;
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(displayValue, pad.left - 5, y + 3);
        }
    };

    const drawAxis = (ctx, canvasWidth, chartHeight) => {
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top);
        ctx.lineTo(pad.left, chartHeight - pad.bottom);
        ctx.lineTo(canvasWidth - pad.right, chartHeight - pad.bottom);
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    };

    const draw = () => {
        if (!canvasRef || !context || !scrollContainerRef) return;
        
        const containerRect = scrollContainerRef.parentElement.getBoundingClientRect();
        const chartHeight = containerRect.height;
        const containerWidth = containerRect.width;
        
        if (isCandle) {
            const fixedTotalWidth = pad.left + data.length * (candleWidth + candleSpacing) + pad.right;
            
            if (fixedTotalWidth <= containerWidth) {
                useFixedWidth = false;
                const availableWidth = containerWidth - pad.left - pad.right;
                const totalSpacing = (data.length - 1) * candleSpacing;
                let newCandleWidth = (availableWidth - totalSpacing) / data.length;
                newCandleWidth = Math.max(2, newCandleWidth);
                dynamicCandleWidth = newCandleWidth;
                dynamicCandleSpacing = candleSpacing;
                
                canvasRef.width = containerWidth;
                canvasRef.style.width = '100%';
            } else {
                useFixedWidth = true;
                dynamicCandleWidth = candleWidth;
                dynamicCandleSpacing = candleSpacing;
                const totalFixed = pad.left + data.length * (candleWidth + candleSpacing) + pad.right;
                canvasRef.width = totalFixed;
                canvasRef.style.width = `${totalFixed}px`;
            }
        } else {
            canvasRef.width = containerWidth;
            canvasRef.style.width = '100%';
        }
        
        canvasRef.height = chartHeight;
        canvasRef.style.height = `${chartHeight}px`;
        
        context.clearRect(0, 0, canvasRef.width, chartHeight);
        
        const { maxValue, minValue } = getMinMaxValues();
        const canvasWidth = canvasRef.width;
        
        drawGrid(context, canvasWidth, chartHeight, maxValue, minValue);
        drawAxis(context, canvasWidth, chartHeight);
        
        if (type === 'bar') {
            drawBar(context, canvasWidth, chartHeight, maxValue, minValue);
        } else if (type === 'line') {
            drawLine(context, canvasWidth, chartHeight, maxValue, minValue, false);
        } else if (type === 'area') {
            drawLine(context, canvasWidth, chartHeight, maxValue, minValue, true);
        } else if (type === 'candle') {
            drawCandle(context, canvasWidth, chartHeight, maxValue, minValue, dynamicCandleWidth, dynamicCandleSpacing);
        }
    };

    // Main container using WidgetFactory
    const container = WidgetFactory({
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: bgColor,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...rest
    });

    const scrollContainer = WidgetFactory({
        tag: 'div',
        style: {
            flex: 1,
            overflow: (isCandle && useFixedWidth) ? 'auto' : 'hidden',
            position: 'relative'
        }
    });
    scrollContainerRef = scrollContainer;

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    
    canvasRef = canvas;
    context = canvas.getContext('2d');
    
    scrollContainer.appendChild(canvas);
    container.appendChild(scrollContainer);
    
    let drawTimeout;
    const handleScroll = () => {
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = setTimeout(draw, 16);
    };
    
    if (isCandle) {
        scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(scrollContainer);
    
    const updateOverflow = () => {
        if (isCandle && scrollContainerRef) {
            const shouldScroll = useFixedWidth;
            scrollContainerRef.style.overflow = shouldScroll ? 'auto' : 'hidden';
        }
    };
    
    const drawWithOverflow = () => {
        draw();
        updateOverflow();
    };
    
    window.addEventListener('resize', () => {
        setTimeout(drawWithOverflow, 50);
    });
    
    setTimeout(drawWithOverflow, 100);
    
    container.updateData = (newData, newLabels) => {
        data.length = 0;
        data.push(...newData);
        if (newLabels) {
            labels.length = 0;
            labels.push(...newLabels);
        }
        drawWithOverflow();
    };
    
    container.redraw = drawWithOverflow;
    
    return container;
};

export default Chart;
