// tools/grid.js

/**
 * Generate CSS grid template string
 * @param {Object} options - Grid options
 * @returns {string} CSS grid value
 * 
 * @example
 * grid({ columns: 3, gap: 16 })
 * // "repeat(3, 1fr) / auto"
 * 
 * @example
 * grid({ columns: '200px 1fr', rows: 'auto 100px', gap: { row: 16, column: 8 } })
 * // "200px 1fr / auto 100px"
 */
export const grid = (options = {}) => {
    let columns = '';
    let rows = '';
    
    // Handle columns
    if (options.columns) {
        if (typeof options.columns === 'number') {
            columns = `repeat(${options.columns}, 1fr)`;
        } else {
            columns = options.columns;
        }
    } else {
        columns = '1fr';
    }
    
    // Handle rows
    if (options.rows) {
        if (typeof options.rows === 'number') {
            rows = `repeat(${options.rows}, auto)`;
        } else {
            rows = options.rows;
        }
    } else {
        rows = 'auto';
    }
    
    // Handle gap
    let gap = '';
    if (options.gap) {
        if (typeof options.gap === 'number') {
            gap = ` ${options.gap}px`;
        } else if (typeof options.gap === 'object') {
            gap = ` ${options.gap.row || 0}px ${options.gap.column || 0}px`;
        } else {
            gap = ` ${options.gap}`;
        }
    }
    
    return `${columns} / ${rows}${gap}`;
};

export default grid;
