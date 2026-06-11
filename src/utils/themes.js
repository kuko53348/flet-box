// src/components/flet-box/utils/themes.js

// ========== COLORES POR DEFECTO (estáticos, seguros) ==========
const DEFAULT_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textDisabled: '#94a3b8',
  border: '#e2e8f0',
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
  divider: '#eeeeee',
  error: '#ff3b30',
  errorBg: '#ffe5e5',
  successBg: '#e5f5e5',
  warningBg: '#fff5e5',
  infoBg: '#e5f5ff',
};

// ========== EXPORTAR colors (siempre definido) ==========
export let colors = { ...DEFAULT_COLORS };

// ========== PALETAS ==========
export const palettes = {
  light: {
    primary: '#00A5FF',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    border: '#e2e8f0',
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
    primary: '#00AFBC',
    secondary: '#a78bfa',
    success: '#10b981',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    border: '#334155',
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

// ========== SUSCRIPTORES ==========
const themeSubscribers = [];

export const subscribeTheme = (callback) => {
  if (typeof callback === 'function') {
    themeSubscribers.push(callback);
  }
  return () => {
    const index = themeSubscribers.indexOf(callback);
    if (index > -1) themeSubscribers.splice(index, 1);
  };
};

const notifyThemeChange = () => {
  themeSubscribers.forEach(cb => {
    try {
      cb(colors);
    } catch (e) {
      console.warn('Theme subscriber error:', e);
    }
  });
};

// ========== FUNCIONES DE TEMA ==========
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
  try {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
      root.style.setProperty(`--color-${key}`, colors[key]);
    });
  } catch (e) {
    // Silently fail in non-browser environments
  }
  
  // Guardar preferencia
  try {
    localStorage.setItem('fletbox-theme', themeName);
  } catch (e) {
    // Silently fail
  }
  
  notifyThemeChange();
  return colors;
};

export const getTheme = () => {
  try {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
};

export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

export const applySystemTheme = () => {
  try {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (!savedTheme) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      return systemTheme;
    }
    return savedTheme;
  } catch (e) {
    return 'light';
  }
};

export const watchSystemTheme = () => {
  try {
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
  } catch (e) {
    return () => {};
  }
};

export const getColor = (colorName, opacity = 1) => {
  const color = colors[colorName] || colorName;
  if (opacity === 1) return color;
  
  if (typeof color === 'string' && color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// ========== COMPONENTES ==========
export const ThemeProvider = ({ children, theme = null }) => {
  if (theme) setTheme(theme);
  return children;
};

export const useTheme = () => {
  return { 
    colors, 
    setTheme, 
    getTheme, 
    toggleTheme, 
    getColor, 
    applySystemTheme 
  };
};

// ========== INICIALIZACIÓN (segura) ==========
const initTheme = () => {
  try {
    const savedTheme = localStorage.getItem('fletbox-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
    watchSystemTheme();
  } catch (e) {
    // Si falla, usar valores por defecto
    console.warn('Theme initialization failed, using defaults');
  }
};

// Inicializar solo en entorno browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initTheme();
}

export default { 
  colors, 
  palettes, 
  setTheme, 
  getTheme, 
  toggleTheme, 
  getColor, 
  subscribeTheme, 
  applySystemTheme, 
  watchSystemTheme, 
  ThemeProvider, 
  useTheme 
};
