// src/components/flet-box/utils/themes.js

// 🔥 Objeto colors - SIN DUPLICADOS
export let colors = {
  // Base colors (semánticos)
  primary: '#6366f1',      // Indigo (más profesional que azul)
// utils/themes.js
  secondary: '#8b5cf6',    // Violeta
  success: '#10b981',     // verde esmeralda (light)
  warning: '#f59e0b',      // Ámbar
  danger: '#ef4444',        // Rojo
  info: '#3b82f6',         // Azul
  
  background: '#ffffff',
  surface: '#f8fafc',      // Slate muy claro
  card: '#ffffff',
  
  text: '#0f172a',         // Slate oscuro
  textSecondary: '#64748b', // Slate medio
  textDisabled: '#94a3b8',
  
  border: '#e2e8f0',       // Slate claro
  
  // Grays
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Bordes
  divider: '#eeeeee',
  
  // Estados
  error: '#ff3b30',
  errorBg: '#ffe5e5',
  successBg: '#e5f5e5',
  warningBg: '#fff5e5',
  infoBg: '#e5f5ff',
  
};

// themes.js - Paleta profesional Light/Dark
export const palettes = {
    light: {
        primary: '#00A5FF',      // Indigo (más profesional que azul)
        secondary: '#8b5cf6',    // Violeta
        success: '#10b981',     // verde esmeralda (light)
        warning: '#f59e0b',      // Ámbar
        danger: '#ef4444',        // Rojo
        info: '#3b82f6',         // Azul
        
        background: '#ffffff',
        surface: '#f8fafc',      // Slate muy claro
        card: '#ffffff',
        
        text: '#ffff',         // Slate oscuro
        textSecondary: '#64748b', // Slate medio
        textDisabled: '#94a3b8',
        
        border: '#e2e8f0',       // Slate claro
        
        // Grays
        gray50: '#f8fafc',
        gray100: '#f1f5f9',
        gray200: '#e2e8f0',
        gray300: '#cbd5e1',
        gray400: '#94a3b8',
        gray500: '#64748b',
        gray600: '#475569',
        gray700: '#334155',
        gray800: '#1e293b',
        gray900: '#0f172a',
        
        overlay: 'rgba(0, 0, 0, 0.4)',
        shadow: 'rgba(0, 0, 0, 0.1)'
    },
    dark: {
        primary: '#00AFBC',      // Indigo más claro
        secondary: '#a78bfa',    // Violeta más claro
        success: '#10b981',     // azul claro (dark)
        warning: '#fbbf24',      // Ámbar más claro
        danger: '#f87171',       // Rojo más claro
        info: '#60a5fa',         // Azul más claro
        
        background: '#0f172a',   // Slate 900
        surface: '#1e293b',      // Slate 800
        card: '#1e293b',
        
        text: '#f1f5f9',         // Slate 100
        textSecondary: '#8EFFF', // Slate 400
        textDisabled: '#64748b',
        
        border: '#334155',        // Slate 700
        
        // Grays (tonalidad oscura)
        gray50: '#1e293b',
        gray100: '#334155',
        gray200: '#475569',
        gray300: '#64748b',
        gray400: '#94a3b8',
        gray500: '#cbd5e1',
        gray600: '#e2e8f0',
        gray700: '#f1f5f9',
        gray800: '#f8fafc',
        gray900: '#ffffff',
        
        overlay: 'rgba(0, 0, 0, 0.6)',
        shadow: 'rgba(0, 0, 0, 0.3)'
    }
};

// Suscriptores para cambios de tema
const themeSubscribers = [];

export const subscribeTheme = (callback) => {
    themeSubscribers.push(callback);
    return () => {
        const index = themeSubscribers.indexOf(callback);
        if (index > -1) themeSubscribers.splice(index, 1);
    };
};

const notifyThemeChange = () => {
    themeSubscribers.forEach(cb => cb(colors));
};

// 🔥 FUNCIÓN PRINCIPAL: Sobrescribe colors con los valores de la paleta
export const setTheme = (themeName) => {
  const palette = palettes[themeName];
  if (palette) {
    Object.keys(palette).forEach(key => {
      if (colors.hasOwnProperty(key)) {
        colors[key] = palette[key];
      }
    });
  }
  
  // Actualizar CSS variables
  const root = document.documentElement;
  Object.keys(colors).forEach(key => {
      root.style.setProperty(`--color-${key}`, colors[key]);
  });
  
  // Guardar preferencia
  localStorage.setItem('fletbox-theme', themeName);
  notifyThemeChange();
  return colors;
};

// 🔥 Obtener tema actual (sistema o guardado)
export const getTheme = () => {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 🔥 Alternar entre light y dark
export const toggleTheme = () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
};

// 🔥 Aplicar tema según sistema (sin sobrescribir preferencia guardada)
export const applySystemTheme = () => {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (!savedTheme) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
        return systemTheme;
    }
    return savedTheme;
};

// 🔥 Escuchar cambios del sistema
export const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
        const savedTheme = localStorage.getItem('fletbox-theme');
        if (!savedTheme) {
            const theme = e.matches ? 'dark' : 'light';
            setTheme(theme);
        }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
};

// 🔥 Inicializar tema
const initTheme = () => {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
    } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
    }
    watchSystemTheme();
};

initTheme();

export const getColor = (colorName, opacity = 1) => {
    const color = colors[colorName] || colorName;
    if (opacity === 1) return color;
    
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
};

// ThemeProvider (componente ficticio, útil para React)
export const ThemeProvider = ({ children, theme = null }) => {
    if (theme) setTheme(theme);
    return children;
};

export const useTheme = () => {
    return { colors, setTheme, getTheme, toggleTheme, getColor, applySystemTheme };
};

export default { colors, palettes, setTheme, getTheme, toggleTheme, getColor, subscribeTheme, applySystemTheme, watchSystemTheme, ThemeProvider, useTheme };
