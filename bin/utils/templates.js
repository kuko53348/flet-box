// bin/utils/templates.js

export const indexHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/src/assets/fonts/icons.css">
    <title>FletBox App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
        #root { width: 100%; height: 100vh; }
    </style>
    <script type="importmap">
        {
            "imports": {
                "flet-box": "./node_modules/flet-box/src/index.js"
            }
        }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/app.js"></script>
</body>
</html>`;

export const appJs = () => `// app.js
import { runApp, Scaffold, AppBar, colors, Icon, goTo, openDrawer } from 'flet-box';
import { RootScreen } from './screens/RootScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';
import { DrawerMenu } from './components/DrawerMenu.js';

// AppBar personalizado para Home
const HomeAppBar = () => {
    return AppBar({
        title: 'Dashboard',
        backgroundColor: colors.primary,
        titleColor: '#ffffff',
        centerTitle: true,
        showBackButton: false,
        leading: Icon({ 
            name: 'menu', 
            size: 24, 
            color: '#ffffff',
            onclick: () => openDrawer()
        })
    });
};

// AppBar personalizado para About (con back)
const AboutAppBar = () => {
    return AppBar({
        title: 'About',
        backgroundColor: colors.primary,
        titleColor: '#ffffff',
        centerTitle: true,
        showBackButton: true,
        leading: Icon({ 
            name: 'arrow_back', 
            size: 24, 
            color: '#ffffff',
            onclick: () => goTo('/home')
        })
    });
};

const routes = {
    '/': { body: RootScreen, appBar: false },
    '/home': { body: HomeScreen, appBar: HomeAppBar() },
    '/about': { body: AboutScreen, appBar: AboutAppBar() }
};

const MyApp = () => {
    return Scaffold({
        routes: routes,
        drawer: DrawerMenu(),
        routerMode: 'hash',
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

export const rootScreenJs = () => `// screens/RootScreen.js
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const RootScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        child: Column({
            gap: 28,
            alignItems: 'center',
            children: [
                Container({
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 48, color: colors.primary })
                }),
                Text({ 
                    text: 'FletBox', 
                    size: 36, 
                    weight: 'bold', 
                    color: colors.primary, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'Ultra-lightweight UI framework for vanilla JavaScript', 
                    size: 14, 
                    color: colors.textSecondary, 
                    align: 'center' 
                }),
                Button({ 
                    text: 'Get Started →', 
                    iconRight: 'arrow_forward',
                    bgColor: colors.primary, 
                    color: '#ffffff', 
                    padding: '10px 28px',
                    onPress: () => goTo('/home') 
                })
            ]
        })
    });
};

export default RootScreen;
`;

export const homeScreenJs = () => `// screens/HomeScreen.js
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const HomeScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 32,
            alignItems: 'center',
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    backgroundColor: colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 56, color: colors.primary })
                }),
                Text({ 
                    text: 'Welcome to FletBox', 
                    size: 32, 
                    weight: 'bold', 
                    color: colors.text, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'A lightweight UI framework for building modern web apps with pure JavaScript.', 
                    size: 16, 
                    color: colors.textSecondary, 
                    align: 'center',
                    style: { maxWidth: 400 }
                }),
                Button({ 
                    text: 'Get Started', 
                    iconRight: 'arrow_forward',
                    bgColor: colors.primary, 
                    color: '#ffffff',
                    padding: '12px 32px',
                    size: 'large',
                    onPress: () => goTo('/about') 
                })
            ]
        })
    });
};

export default HomeScreen;
`;

export const aboutScreenJs = () => `// screens/AboutScreen.js
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const AboutScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        child: Column({
            gap: 28,
            alignItems: 'center',
            children: [
                Container({
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: colors.info + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'info', size: 48, color: colors.info })
                }),
                Text({ 
                    text: 'About FletBox', 
                    size: 32, 
                    weight: 'bold', 
                    color: colors.info, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'Zero dependencies · 40+ widgets · Built-in router', 
                    size: 14, 
                    color: colors.textSecondary, 
                    align: 'center' 
                }),
                Column({
                    gap: 12,
                    alignItems: 'flex-start',
                    children: [
                        Container({ flexDirection: 'row', gap: 12, alignItems: 'center', children: [
                            Icon({ name: 'check_circle', size: 18, color: colors.success }),
                            Text({ text: 'Zero external dependencies', size: 14 })
                        ] }),
                        Container({ flexDirection: 'row', gap: 12, alignItems: 'center', children: [
                            Icon({ name: 'check_circle', size: 18, color: colors.success }),
                            Text({ text: '40+ ready-to-use widgets', size: 14 })
                        ] }),
                        Container({ flexDirection: 'row', gap: 12, alignItems: 'center', children: [
                            Icon({ name: 'check_circle', size: 18, color: colors.success }),
                            Text({ text: 'Built-in router', size: 14 })
                        ] }),
                        Container({ flexDirection: 'row', gap: 12, alignItems: 'center', children: [
                            Icon({ name: 'check_circle', size: 18, color: colors.success }),
                            Text({ text: 'Dark/Light theme system', size: 14 })
                        ] }),
                        Container({ flexDirection: 'row', gap: 12, alignItems: 'center', children: [
                            Icon({ name: 'check_circle', size: 18, color: colors.success }),
                            Text({ text: 'Hot reload support', size: 14 })
                        ] })
                    ]
                }),
                Button({ 
                    text: 'Back to Root', 
                    iconLeft: 'arrow_back',
                    variant: 'outlined',
                    bgColor: colors.info, 
                    color: colors.info, 
                    onPress: () => goTo('/') 
                })
            ]
        })
    });
};

export default AboutScreen;
`;

export const drawerMenuJs = () => `// components/DrawerMenu.js
import { Drawer, DrawerItem, Container, Column, Text, Icon, colors, closeDrawer } from 'flet-box';

export const DrawerMenu = () => {
    return Drawer({
        header: Container({
            padding: 28,
            backgroundColor: colors.primary,
            child: Column({
                gap: 12,
                alignItems: 'center',
                children: [
                    Container({
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#ffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                        child: Icon({ name: 'rocket_launch', size: 32, color: colors.primary })
                    }),
                    Text({ text: 'FletBox', size: 18, weight: 'bold', color: '#ffffff' }),
                    Text({ text: 'UI Framework', size: 12, color: 'rgba(255,255,255,0.8)' })
                ]
            })
        }),
        body: [
            DrawerItem({ 
                icon: 'dashboard', 
                label: 'Dashboard', 
                route: '/home',
                onPress: () => closeDrawer()
            }),
            DrawerItem({ 
                icon: 'info', 
                label: 'About', 
                route: '/about',
                onPress: () => closeDrawer()
            }),
            DrawerItem({ 
                icon: 'home', 
                label: 'Root', 
                route: '/',
                onPress: () => closeDrawer()
            })
        ],
        footer: Container({
            padding: 20,
            borderTop: \`1px solid \${colors.border}\`,
            child: Text({ 
                text: 'Version 1.0.0', 
                size: 12, 
                color: colors.textSecondary,
                align: 'center'
            })
        })
    });
};

export default DrawerMenu;
`;

export const themesJs = () => `// database/themes.js
export let colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    border: '#e2e8f0',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)'
};

export const darkColors = {
    primary: '#818cf8',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    border: '#334155',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.3)'
};

let currentTheme = 'light';
const listeners = [];

export const setTheme = (themeName) => {
    const theme = themeName === 'dark' ? darkColors : colors;
    currentTheme = themeName;
    Object.keys(theme).forEach(key => { 
        if (colors.hasOwnProperty(key)) {
            colors[key] = theme[key];
        }
    });
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
        root.style.setProperty(\`--color-\${key}\`, colors[key]);
    });
    listeners.forEach(cb => cb(colors, themeName));
};

export const getTheme = () => currentTheme;
export const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
};
export const subscribeTheme = (callback) => {
    listeners.push(callback);
    return () => { const i = listeners.indexOf(callback); if(i > -1) listeners.splice(i, 1); };
};

const initTheme = () => {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => root.style.setProperty(\`--color-\${key}\`, colors[key]));
};
initTheme();
`;

export const runSh = () => `#!/bin/bash
PORT=8000
BIND="localhost"
echo "🚀 Starting FletBox development server..."
echo "📡 http://$BIND:$PORT"
echo ""
echo "Press Ctrl+C to stop"
python3 -m http.server $PORT --bind $BIND
`;

export const createBundleSh = () => `#!/bin/bash
echo "📦 Building FletBox project..."

if ! command -v esbuild &> /dev/null && ! npx esbuild --version &> /dev/null; then
    echo "esbuild not installed. Run: npm install --save-dev esbuild"
    exit 1
fi

rm -rf dist && mkdir -p dist

mkdir -p dist/src/assets/fonts

if [ -d "src/assets" ]; then
    cp -r src/assets/* dist/src/assets/ 2>/dev/null
fi

if [ -f "src/assets/fonts/icons.css" ]; then
    cp src/assets/fonts/icons.css dist/src/assets/fonts/
fi
if [ -f "src/assets/fonts/MaterialIcons-Regular.woff2" ]; then
    cp src/assets/fonts/MaterialIcons-Regular.woff2 dist/src/assets/fonts/
fi

[ -f "run.sh" ] && cp run.sh dist/
[ -f "index.html" ] && cp index.html dist/

echo "📦 Bundling app.js..."
npx esbuild src/app.js \
    --bundle \
    --outfile=dist/src/app.js \
    --format=esm \
    --minify \
    --target=es2020 \
    --external:*.css \
    --external:*.woff2

if [ -f "src/lazyConfig.js" ]; then
    npx esbuild src/lazyConfig.js --bundle --outfile=dist/lazyConfig.js --format=esm --minify
fi

[ -f "service-worker.js" ] && cp service-worker.js dist/
`;

export const serviceWorkerJs = () => `// service-worker.js - PWA offline support
const CACHE_NAME = 'fletbox-app-v1';
const urlsToCache = ['/', '/index.html', '/src/app.js'];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        })
    );
});
`;

export const packageJson = (name) => `{
  "name": "${name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bash run.sh",
    "build": "bash createBundle.sh",
    "start": "npm run dev"
  },
  "dependencies": {
    "flet-box": "^1.0.0"
  }
}`;

export const gitignore = () => `node_modules/
dist/
package-lock.json
.DS_Store
*.log
`;

export const readme = (name) => `# ${name}

FletBox app with 3 screens: Root, Home and About, plus Drawer menu.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Welcome screen with rocket icon
- Dashboard screen with welcome message
- About screen with framework info
- Drawer menu for navigation
- Dark/Light theme support

## Project Structure

\`\`\`
├── src/
│   ├── app.js
│   ├── components/
│   │   └── DrawerMenu.js
│   ├── screens/
│   │   ├── RootScreen.js
│   │   ├── HomeScreen.js
│   │   └── AboutScreen.js
│   └── database/
│       └── themes.js
├── index.html
├── package.json
└── run.sh
\`\`\`

## License
MIT
`;
