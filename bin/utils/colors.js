// bin/utils/colors.js

export const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

export const c = (color, text) => {
    const colorCode = colors[color];
    if (!colorCode) return text;
    return `${colorCode}${text}${colors.reset}`;
};

// Global Ctrl+C handler
export const setupCtrlC = () => {
    process.on('SIGINT', () => {
        console.log(`\n\n${c('yellow', '👋 Bye!')}\n`);
        process.exit(0);
    });
};

// Show help message for Ctrl+C
export const showExitHint = () => {
    console.log(`${c('gray', 'Press Ctrl+C to exit')}`);
};
