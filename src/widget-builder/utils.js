/**
 * UTILS - Helper functions for widget-builder
 * @module widget-builder/utils
 */

// utils.js
export const toREM = (value) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number') return `${value / 16}rem`;
    return value;
};

export const remProps = [
    'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'top', 'right', 'bottom', 'left', 'inset',
    'fontSize', 'letterSpacing', 'wordSpacing', 'lineHeight', 'textIndent',
    'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomLeftRadius', 'borderBottomRightRadius',
    'borderWidth', 'gap', 'rowGap', 'columnGap',
    'boxShadow', 'textShadow'
];

export default { toREM, remProps };
