// tools/color.js

/**
 * Color manipulation class
 */
class Color {
    constructor(color) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
        this.parse(color);
    }
    
    parse(color) {
        if (color.startsWith('#')) {
            this.parseHex(color);
        } else if (color.startsWith('rgb')) {
            this.parseRgb(color);
        } else if (color.startsWith('hsl')) {
            this.parseHsl(color);
        } else {
            this.parseNamed(color);
        }
        return this;
    }
    
    parseHex(hex) {
        hex = hex.slice(1);
        if (hex.length === 3) {
            this.r = parseInt(hex[0] + hex[0], 16);
            this.g = parseInt(hex[1] + hex[1], 16);
            this.b = parseInt(hex[2] + hex[2], 16);
        } else {
            this.r = parseInt(hex.slice(0, 2), 16);
            this.g = parseInt(hex.slice(2, 4), 16);
            this.b = parseInt(hex.slice(4, 6), 16);
        }
    }
    
    parseRgb(rgb) {
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            this.r = parseInt(match[1]);
            this.g = parseInt(match[2]);
            this.b = parseInt(match[3]);
            this.a = match[4] ? parseFloat(match[4]) : 1;
        }
    }
    
    parseHsl(hsl) {
        const match = hsl.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
        if (match) {
            const h = parseInt(match[1]) / 360;
            const s = parseInt(match[2]) / 100;
            const l = parseInt(match[3]) / 100;
            this.a = match[4] ? parseFloat(match[4]) : 1;
            
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            this.r = Math.round(r * 255);
            this.g = Math.round(g * 255);
            this.b = Math.round(b * 255);
        }
    }
    
    parseNamed(name) {
        const colors = {
            black: '#000000',
            white: '#ffffff',
            red: '#ff0000',
            green: '#00ff00',
            blue: '#0000ff',
            yellow: '#ffff00',
            cyan: '#00ffff',
            magenta: '#ff00ff',
            gray: '#808080',
            darkgray: '#a9a9a9',
            lightgray: '#d3d3d3'
        };
        if (colors[name]) {
            this.parseHex(colors[name]);
        }
    }
    
    hex() {
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }
    
    rgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
    
    rgba() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    
    lighten(percent) {
        const amount = percent / 100;
        this.r = Math.min(255, Math.round(this.r + (255 - this.r) * amount));
        this.g = Math.min(255, Math.round(this.g + (255 - this.g) * amount));
        this.b = Math.min(255, Math.round(this.b + (255 - this.b) * amount));
        return this;
    }
    
    darken(percent) {
        const amount = percent / 100;
        this.r = Math.max(0, Math.round(this.r * (1 - amount)));
        this.g = Math.max(0, Math.round(this.g * (1 - amount)));
        this.b = Math.max(0, Math.round(this.b * (1 - amount)));
        return this;
    }
    
    alpha(value) {
        this.a = Math.min(1, Math.max(0, value));
        return this;
    }
    
    isDark() {
        const brightness = (this.r * 299 + this.g * 587 + this.b * 114) / 1000;
        return brightness < 128;
    }
    
    isLight() {
        return !this.isDark();
    }
    
    contrast() {
        return this.isDark() ? '#ffffff' : '#000000';
    }
    
    complement() {
        this.r = 255 - this.r;
        this.g = 255 - this.g;
        this.b = 255 - this.b;
        return this;
    }
}

export const color = (value) => new Color(value);

export default color;
