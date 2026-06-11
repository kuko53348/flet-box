// widgets/CircularBar.js - Funcionalidades extendidas sin romper lo existente
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const CircularBar = (props) => {
    let {
        // === Núcleo (ya existente) ===
        value = 0,
        max = 100,
        size = null,
        strokeWidth = 12,
        color = colors.primary,
        backgroundColor = colors.gray200,
        showValue = true,
        valueColor = colors.text,
        valueSize = 24,
        label,
        labelColor = colors.textSecondary,
        labelSize = 12,
        lineCap = 'round',
        animate = true,
        animationDuration = 1000,
        onComplete,
        ref,
        ...rest
    } = props;

    // === NUEVAS PROPS (opcionales, no rompen) ===
    const {
        // Formato del valor
        valueFormat = 'percent',   // 'percent', 'value', 'custom'
        valueSuffix = '',
        valuePrefix = '',
        valueDecimals = 0,
        customValueFormatter = null, // (currentValue, max) => string
        
        // Gradiente
        gradient = null,           // array de colores ['red', 'yellow', 'green'] o string con gradiente CSS
        gradientAngle = 135,
        
        // Sombra
        shadowBlur = 0,
        shadowColor = 'rgba(0,0,0,0.3)',
        
        // Efectos visuales adicionales
        glow = false,
        glowColor = null,          // si no se especifica, usa el color del trazo
        
        // Marcadores (puntos en el perímetro)
        markers = [],              // [{ value, color, size, label }]
        
        // Anillo interior extra (para dona con dos capas)
        innerStrokeWidth = 0,
        innerColor = null,
        
        // Eventos
        onClick = null,
        onHover = null,
        
        // Texto adicional
        subtitle = null,
        subtitleColor = colors.textSecondary,
        subtitleSize = 10,
        
        // Tooltip al pasar el ratón
        tooltip = null,
    } = props;

    // Variables internas (sin cambios en la lógica central)
    let canvas = null;
    let ctx = null;
    let animationId = null;
    let currentValue = 0;
    let startTime = null;
    let resizeObserver = null;
    let container = null;
    let currentWidth = 0;
    let isHovering = false;

    const isFixedSize = size !== null && size !== undefined;
    const fixedSize = isFixedSize ? size : 200;

    const updateCanvasSize = () => {
        if (!canvas) return;
        let width;
        if (isFixedSize) width = fixedSize;
        else {
            const rect = container.getBoundingClientRect();
            width = rect.width;
            if (width <= 0) width = 200;
        }
        canvas.width = width;
        canvas.height = width;
        currentWidth = width;
    };

    const getCenter = () => currentWidth / 2;
    const getRadius = () => (currentWidth - strokeWidth) / 2;

    const getGradient = () => {
        if (!gradient) return color;
        if (typeof gradient === 'string') return gradient;
        if (Array.isArray(gradient)) {
            const grad = ctx.createLinearGradient(0, 0, currentWidth, currentWidth);
            gradient.forEach((c, i) => {
                grad.addColorStop(i / (gradient.length - 1), c);
            });
            return grad;
        }
        return color;
    };

    const getFormattedValue = () => {
        if (customValueFormatter) return customValueFormatter(currentValue, max);
        if (valueFormat === 'percent') {
            const percent = Math.round((currentValue / max) * 100 * Math.pow(10, valueDecimals)) / Math.pow(10, valueDecimals);
            return `${valuePrefix}${percent}${valueSuffix}`;
        }
        if (valueFormat === 'value') {
            const val = Math.round(currentValue * Math.pow(10, valueDecimals)) / Math.pow(10, valueDecimals);
            return `${valuePrefix}${val}${valueSuffix}`;
        }
        return `${currentValue}/${max}`;
    };

    const drawBackground = () => {
        ctx.beginPath();
        ctx.arc(getCenter(), getCenter(), getRadius(), 0, Math.PI * 2);
        ctx.strokeStyle = backgroundColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = lineCap;
        ctx.stroke();

        // Anillo interior (opcional)
        if (innerStrokeWidth > 0 && innerColor) {
            ctx.beginPath();
            ctx.arc(getCenter(), getCenter(), getRadius() - innerStrokeWidth / 2, 0, Math.PI * 2);
            ctx.strokeStyle = innerColor;
            ctx.lineWidth = innerStrokeWidth;
            ctx.stroke();
        }
    };

    const drawProgress = (angleRad) => {
        ctx.beginPath();
        ctx.arc(getCenter(), getCenter(), getRadius(), -Math.PI / 2, -Math.PI / 2 + angleRad);
        ctx.strokeStyle = getGradient();
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = lineCap;
        if (glow) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = glowColor || color;
        } else {
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = shadowColor;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    const drawMarkers = () => {
      if (!markers.length) return;
      // Radio del círculo interior (donde va el trazo)
      const r = getRadius();
      const center = getCenter();
      markers.forEach(m => {
          const angle = (m.value / max) * Math.PI * 2 - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(x, y, m.size || 4, 0, Math.PI * 2);
          ctx.fillStyle = m.color || colors.textSecondary;
          ctx.fill();
          if (m.label) {
              ctx.font = `10px system-ui`;
              ctx.fillStyle = colors.textSecondary;
              ctx.fillText(m.label, x + 6, y - 4);
          }
      });
  };

    const drawText = () => {
        if (showValue) {
            ctx.font = `${valueSize}px system-ui, sans-serif`;
            ctx.fillStyle = valueColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(getFormattedValue(), getCenter(), getCenter() - (subtitle ? 8 : 0));
        }
        if (label) {
            ctx.font = `${labelSize}px system-ui, sans-serif`;
            ctx.fillStyle = labelColor;
            ctx.fillText(label, getCenter(), getCenter() + valueSize / 1.5 + (subtitle ? 4 : 0));
        }
        if (subtitle) {
            ctx.font = `${subtitleSize}px system-ui, sans-serif`;
            ctx.fillStyle = subtitleColor;
            ctx.fillText(subtitle, getCenter(), getCenter() + valueSize / 1.5 + (label ? 14 : 4));
        }
    };

    const drawStatic = () => {
        if (!ctx || !canvas) return;
        currentValue = value;
        const angle = (value / max) * Math.PI * 2;
        ctx.clearRect(0, 0, currentWidth, currentWidth);
        drawBackground();
        drawProgress(angle);
        drawMarkers();
        drawText();
    };

    const drawFrame = (timestamp) => {
        if (!ctx || !canvas) return;
        if (!startTime) { startTime = timestamp; requestAnimationFrame(drawFrame); return; }
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / animationDuration);
        currentValue = progress * value;
        const angle = (currentValue / max) * Math.PI * 2;
        ctx.clearRect(0, 0, currentWidth, currentWidth);
        drawBackground();
        drawProgress(angle);
        drawMarkers();
        drawText();
        if (progress < 1 && animate) {
            animationId = requestAnimationFrame(drawFrame);
        } else {
            currentValue = value;
            if (onComplete) onComplete();
            animationId = null;
        }
    };

    const startAnimation = () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (!ctx || !canvas) return;
        if (animate) {
            startTime = null;
            currentValue = 0;
            animationId = requestAnimationFrame(drawFrame);
        } else drawStatic();
    };

    const resizeCanvas = () => {
        if (!canvas) return;
        updateCanvasSize();
        if (animationId) cancelAnimationFrame(animationId);
        startAnimation();
    };

    const setupEvents = () => {
        if (!canvas) return;
        if (onClick) canvas.addEventListener('click', (e) => onClick({ value: currentValue, max, percent: (currentValue/max)*100 }));
        if (onHover) {
            canvas.addEventListener('mouseenter', () => { isHovering = true; onHover(true, { value: currentValue, max }); });
            canvas.addEventListener('mouseleave', () => { isHovering = false; onHover(false); });
        }
        if (tooltip) canvas.title = tooltip;
    };

    const initWidget = () => {
        container = WidgetFactory({
            tag: 'div',
            style: {
                display: isFixedSize ? 'inline-block' : 'block',
                width: isFixedSize ? `${fixedSize}px` : '100%',
                height: isFixedSize ? `${fixedSize}px` : 'auto',
                ...rest.style
            },
            ...rest
        });
        canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.aspectRatio = '1 / 1';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
        updateCanvasSize();
        if (!isFixedSize && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => resizeCanvas());
            resizeObserver.observe(container);
        } else if (!isFixedSize) window.addEventListener('resize', resizeCanvas);
        startAnimation();
        setupEvents();
        if (ref && typeof ref === 'function') ref(canvas);
    };

    initWidget();

    const originalCleanup = container._cleanup;
    container._cleanup = () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (resizeObserver) resizeObserver?.disconnect();
        else window.removeEventListener('resize', resizeCanvas);
        if (originalCleanup) originalCleanup();
    };

    container.updateValue = (newValue, newMax = null) => {
        if (newMax !== null) max = newMax;
        value = Math.min(newValue, max);
        startAnimation();
    };

    return container;
};

export default CircularBar;
