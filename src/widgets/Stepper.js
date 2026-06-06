// widgets/Stepper.js
import { WidgetFactory } from '../widget-factory/index.js';
import { Container } from './Container.js';
import { Row } from './Row.js';
import { Column } from './Column.js';
import { Text } from './Text.js';
import { Icon } from './Icon.js';
import { Button } from './Button.js';
import { colors } from '../utils/themes.js';

export const Stepper = (props) => {
    const {
        steps = [],
        activeStep = 0,
        onStepChange,
        orientation = 'horizontal',
        variant = 'circles',
        showLabels = true,
        showNavigation = true,
        nextLabel = 'Next',
        backLabel = 'Back',
        finishLabel = 'Finish',
        onFinish,
        
        // Styling props
        bgColor = colors.surface,
        borderRadius = 16,
        border,
        borderColor = colors.border,
        borderWidth = 1,
        shadow,
        padding = 20,
        margin = 0,
        width = '100%',
        ...rest
    } = props;

    let currentStep = Math.min(Math.max(activeStep, 0), steps.length - 1);
    let stepsContainer = null;
    let contentContainer = null;
    let navContainer = null;

    const goToStep = (index) => {
        if (index < 0 || index >= steps.length) return;
        currentStep = index;
        if (onStepChange) onStepChange(currentStep);
        updateUI();
    };

    const next = () => goToStep(currentStep + 1);
    const back = () => goToStep(currentStep - 1);
    const finish = () => onFinish?.();

    const updateUI = () => {
        if (!stepsContainer) return;

        // Clear steps container
        while (stepsContainer.firstChild) {
            stepsContainer.removeChild(stepsContainer.firstChild);
        }

        // Calculate if we need to wrap or scroll
        const stepWidth = 80;
        const totalSteps = steps.length;
        const availableWidth = stepsContainer.parentElement?.offsetWidth || 800;
        const needsWrap = orientation === 'horizontal' && (totalSteps * stepWidth) > availableWidth;

        // Draw each step
        steps.forEach((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            const isLast = idx === steps.length - 1;

            // Step indicator
            let indicator;
            if (variant === 'circles') {
                indicator = Container({
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    bgColor: isActive ? colors.primary : (isCompleted ? colors.success : colors.gray300),
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: isCompleted
                        ? Icon({ name: 'check', size: 18, color: '#fff' })
                        : Text({ text: String(idx + 1), size: 14, weight: 'bold', color: isActive ? '#fff' : colors.textSecondary })
                });
            } else if (variant === 'numbers') {
                indicator = Text({
                    text: String(idx + 1),
                    size: 16,
                    weight: 'bold',
                    color: isActive ? colors.primary : colors.textSecondary
                });
            } else {
                indicator = Icon({
                    name: step.icon || 'circle',
                    size: 24,
                    color: isActive ? colors.primary : colors.gray300
                });
            }

            // Label
            const label = showLabels
                ? Text({
                    text: step.label,
                    size: 12,
                    color: isActive ? colors.primary : colors.textSecondary,
                    marginTop: 4,
                    align: 'center'
                })
                : null;

            const stepColumn = Column({
                alignItems: 'center',
                style: { 
                    flex: needsWrap ? 'auto' : 1, 
                    minWidth: needsWrap ? '80px' : '0',
                    cursor: 'pointer' 
                },
                onclick: () => goToStep(idx),
                children: [indicator, label].filter(Boolean)
            });

            if (orientation === 'horizontal') {
                stepsContainer.appendChild(stepColumn);
                if (!isLast && !needsWrap) {
                    const connector = Container({
                        style: { 
                            flex: 1, 
                            height: '2px', 
                            minWidth: '10px', 
                            backgroundColor: idx < currentStep ? colors.success : colors.gray300 
                        }
                    });
                    stepsContainer.appendChild(connector);
                } else if (!isLast && needsWrap) {
                    const spacer = Container({ style: { width: '8px' } });
                    stepsContainer.appendChild(spacer);
                }
            } else {
                const verticalStep = Row({
                    gap: 12,
                    alignItems: 'center',
                    children: [stepColumn, Text({ text: step.label, size: 14 })]
                });
                stepsContainer.appendChild(verticalStep);
            }
        });

        // Update content
        if (contentContainer) {
            while (contentContainer.firstChild) {
                contentContainer.removeChild(contentContainer.firstChild);
            }
            const stepContent = steps[currentStep]?.content;
            if (stepContent) {
                contentContainer.appendChild(stepContent);
            }
        }

        // Update navigation buttons
        if (navContainer) {
            while (navContainer.firstChild) {
                navContainer.removeChild(navContainer.firstChild);
            }

            const buttons = [];
            if (currentStep > 0) {
                buttons.push(Button({
                    text: backLabel,
                    variant: 'outlined',
                    onPress: back
                }));
            }
            if (currentStep === steps.length - 1) {
                buttons.push(Button({
                    text: finishLabel,
                    variant: 'filled',
                    bgColor: colors.success,
                    onPress: finish
                }));
            } else {
                buttons.push(Button({
                    text: nextLabel,
                    variant: 'filled',
                    onPress: next
                }));
            }

            const navRow = Row({
                justifyContent: 'flex-end',
                gap: 12,
                children: buttons
            });
            navContainer.appendChild(navRow);
        }
    };

    // Build style for main container using WidgetFactory
    let style = {
        width: typeof width === 'number' ? `${width}px` : width,
        backgroundColor: bgColor,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        margin: typeof margin === 'number' ? `${margin}px` : margin,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
    };

    if (border) {
        style.border = border;
    } else if (borderWidth !== undefined) {
        style.borderWidth = `${borderWidth}px`;
        style.borderStyle = 'solid';
        style.borderColor = borderColor;
    }

    if (shadow) {
        style.boxShadow = shadow;
    }

    const container = WidgetFactory({
        style: { ...style, ...rest.style },
        ...rest
    });

    // Steps wrapper with horizontal scroll
    const stepsWrapper = WidgetFactory({
        tag: 'div',
        style: {
            overflowX: 'auto',
            overflowY: 'visible',
            width: '100%'
        }
    });

    stepsContainer = orientation === 'horizontal'
        ? Row({ 
            alignItems: 'center', 
            style: { 
                display: 'flex',
                flexDirection: 'row',
                minWidth: 'min-content',
                width: '100%'
            } 
        })
        : Column({ gap: 16 });

    stepsWrapper.appendChild(stepsContainer);
    
    // Content container
    contentContainer = Container({ 
        child: steps[currentStep]?.content || null,
        style: { width: '100%', overflow: 'auto' }
    });
    
    // Navigation container
    navContainer = Container({ style: { width: '100%' } });

    container.appendChild(stepsWrapper);
    container.appendChild(contentContainer);
    container.appendChild(navContainer);
    
    // Initial render
    updateUI();

    // Public methods
    container.goTo = goToStep;
    container.next = next;
    container.back = back;
    container.getActiveStep = () => currentStep;

    return container;
};

export default Stepper;
