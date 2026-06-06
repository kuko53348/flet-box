// utils/Inspector.js
import { getWidgetProps } from '../utils/getWidgetProps.js';

/**
 * Converts a value to its code representation
 */
const stringifyValue = (value, indent = 0) => {
    const spaces = '  '.repeat(indent);
    
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (typeof value === 'function') {
        return '() => {}';
    }
    
    if (typeof value === 'string') {
        const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
    }
    
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    
    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const items = value.map(item => stringifyValue(item, indent + 1)).join(',\n' + spaces + '  ');
        return `[\n${spaces}  ${items}\n${spaces}]`;
    }
    
    if (typeof value === 'object' && value !== null) {
        // Si es un widget HTMLElement, mostrar su representación
        if (value.nodeType === 1 && value._widgetName) {
            return Inspector(value, indent);
        }
        
        const entries = Object.entries(value);
        if (entries.length === 0) return '{}';
        
        const props = entries.map(([k, v]) => {
            if (typeof v === 'number' || typeof v === 'boolean') {
                return `${k}: ${v}`;
            }
            if (typeof v === 'string') {
                return `${k}: '${v.replace(/'/g, "\\'")}'`;
            }
            if (v && v.nodeType === 1) {
                return `${k}: ${Inspector(v, indent + 1)}`;
            }
            return `${k}: ${stringifyValue(v, indent + 1)}`;
        }).join(',\n' + spaces + '  ');
        
        return `{\n${spaces}  ${props}\n${spaces}}`;
    }
    
    return String(value);
};

/**
 * Gets the real widget name
 */
const getWidgetName = (widget) => {
    if (widget._widgetName) return widget._widgetName;
    
    if (widget.classList?.contains('material-icons')) return 'Icon';
    if (widget.tagName === 'BUTTON') return 'Button';
    if (widget.tagName === 'INPUT') return 'Input';
    if (widget.tagName === 'IMG') return 'Image';
    if (widget.tagName === 'SPAN') return 'Text';
    if (widget.tagName === 'DIV') {
        if (widget.style.display === 'flex') {
            if (widget.style.flexDirection === 'row') return 'Row';
            if (widget.style.flexDirection === 'column') return 'Column';
        }
        return 'Container';
    }
    
    return widget.tagName?.toLowerCase() || 'unknown';
};

/**
 * Recursively collects all children of a widget
 */
const collectChildren = (widget) => {
    const children = [];
    
    // Check direct children via DOM
    for (const child of widget.children) {
        if (child.nodeType === 1) { // Element node
            children.push(child);
        }
    }
    
    // Also check _children array if exists (from widget-builder)
    if (widget._children && Array.isArray(widget._children)) {
        for (const child of widget._children) {
            if (child && child.nodeType === 1 && !children.includes(child)) {
                children.push(child);
            }
        }
    }
    
    return children;
};

/**
 * Converts a widget to its original source code (fully recursive)
 */
export const Inspector = (widget, indent = 0) => {
    if (!widget || widget.nodeType !== 1) {
        return String(widget);
    }
    
    const name = getWidgetName(widget);
    const props = getWidgetProps(widget);
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);
    
    // Separate child/children from other props
    const { child, children, ...otherProps } = props;
    
    // Build props as string
    const propsList = Object.entries(otherProps)
        .map(([key, value]) => {
            const formattedValue = stringifyValue(value, indent + 1);
            return `${key}: ${formattedValue}`;
        })
        .join(',\n' + nextSpaces);
    
    // Handle single child (from props)
    let childStr = '';
    if (child && child.nodeType === 1) {
        childStr = `\n${nextSpaces}child: ${Inspector(child, indent + 1)}`;
    }
    
    // Handle children array from props
    let childrenStr = '';
    if (children && Array.isArray(children) && children.length > 0) {
        const childrenItems = children
            .filter(c => c && c.nodeType === 1)
            .map(c => Inspector(c, indent + 1))
            .join(',\n' + nextSpaces + '  ');
        
        if (childrenItems) {
            childrenStr = `\n${nextSpaces}children: [\n${nextSpaces}  ${childrenItems}\n${nextSpaces}]`;
        }
    }
    
    // Handle DOM children (recursive)
    const domChildren = collectChildren(widget);
    let domChildrenStr = '';
    if (domChildren.length > 0 && !child && (!children || children.length === 0)) {
        const domChildrenItems = domChildren
            .map(c => Inspector(c, indent + 1))
            .join(',\n' + nextSpaces + '  ');
        
        if (domChildrenItems) {
            domChildrenStr = `\n${nextSpaces}children: [\n${nextSpaces}  ${domChildrenItems}\n${nextSpaces}]`;
        }
    }
    
    // Combine all content
    const allContent = [
        propsList && `${nextSpaces}${propsList}`,
        childStr,
        childrenStr,
        domChildrenStr
    ].filter(Boolean).join(',\n');
    
    if (allContent) {
        return `${name}({\n${allContent}\n${spaces}})`;
    }
    return `${name}()`;
};

/**
 * Console version with colors
 */
export const printWidgetCode = (widget) => {
    console.log('%c' + Inspector(widget), 'color: #4ade80; font-family: monospace;');
};

/**
 * Detailed widget inspection
 */
export const inspectWidget = (widget) => {
    console.group(`🔍 ${getWidgetName(widget)}`);
    console.log('📦 Props:', getWidgetProps(widget));
    console.log('📝 Code:\n', Inspector(widget));
    console.log('👪 Children:', collectChildren(widget).length);
    console.groupEnd();
    return widget;
};

export default { Inspector, printWidgetCode, inspectWidget };
