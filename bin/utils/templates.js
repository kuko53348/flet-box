// bin/utils/templates.js

export const indexHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./src/assets/fonts/icons.css">

    <title>FletBox - UI Framework</title>
    <meta name="description" content="FletBox: UI framework with powerful animations, gradients, and declarative components. Fast, lightweight, and easy to use.">
    <meta name="keywords" content="fletbox, framework, ui, javascript, animations, gradients">
    <meta name="author" content="Your name">

    <meta property="og:title" content="FletBox - UI Framework">
    <meta property="og:description" content="UI framework with powerful animations and gradients">
    <meta property="og:type" content="website">

    <meta name="theme-color" content="#1a1a2e">

    <style>
        * { -webkit-text-size-adjust: 100%; }
        body { margin: 0; padding: 0; font-family: system-ui, sans-serif}
    </style>
</head>
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
    <script>
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration error', err));
        }
    </script>
    <script type="module" src="src/app.js"></script>
</body>
</html>`;

export const appJs = () => `// app.js
import { runApp, Scaffold, AppBar, BottomNavigation, colors, Icon, goTo, openDrawer } from 'flet-box';
import { RootScreen } from './screens/RootScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';
import { DrawerMenu } from './components/DrawerMenu.js';

// ========== CUSTOM APPBAR (commented out) ==========
/*
const CustomAppBar = () => {
    return AppBar({
        title: 'My App',
        backgroundColor: colors.primary,
        titleColor: '#ffffff',
        centerTitle: true,
        showBackButton: false,
        leading: Icon({ 
            name: 'menu', 
            size: 24, 
            color: '#ffffff',
            onclick: () => openDrawer()
        }),
        actions: [
            Icon({ name: 'search', size: 22, color: '#ffffff', onclick: () => console.log('Search') }),
            Icon({ name: 'notifications', size: 22, color: '#ffffff', onclick: () => console.log('Notifications') })
        ]
    });
};
*/

// ========== BOTTOM NAVIGATION (commented out) ==========
/*
const BottomNav = () => {
    return BottomNavigation({
        items: [
            { icon: 'home', label: 'Home', route: '/home' },
            { icon: 'favorite', label: 'Favorites', route: '/favorites' },
            { icon: 'person', label: 'Profile', route: '/profile' }
        ],
        backgroundColor: colors.surface,
        selectedColor: colors.primary
    });
};
*/

// ========== APPBAR PER ROUTE ==========
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

// ========== ROUTES ==========
const routes = {
    '/': { body: RootScreen, appBar: false },
    '/home': { body: HomeScreen, appBar: HomeAppBar() },
    '/about': { body: AboutScreen, appBar: AboutAppBar() }
    // Example with BottomNavigation (uncomment)
    // '/favorites': { body: HomeScreen, appBar: HomeAppBar() },
    // '/profile': { body: AboutScreen, appBar: AboutAppBar() }
};

const MyApp = () => {
    return Scaffold({
        routes: routes,
        drawer: DrawerMenu(),
        // bottomBar: BottomNav(),  // ← Uncomment to enable BottomNavigation
        routerMode: 'hash',
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

// The rest of the templates (rootScreenJs, homeScreenJs, aboutScreenJs, drawerMenuJs, themesJs, etc.)
// remain the same as in your original file (they are already in English).
// For brevity, I include them below as you already have them, but ensure no Spanish comments.

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
                    text: 'Choose a section to explore:', 
                    size: 16, 
                    color: colors.textSecondary, 
                    align: 'center' 
                }),
                Column({
                    gap: 12,
                    alignItems: 'stretch',
                    style: { width: '100%', maxWidth: 280 },
                    children: [
                        Button({ 
                            text: '🏠 Home', 
                            iconRight: 'arrow_forward',
                            bgColor: colors.primary, 
                            color: '#ffffff',
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/home') 
                        }),
                        Button({ 
                            text: 'ℹ️ About', 
                            iconRight: 'arrow_forward',
                            variant: 'outlined',
                            color: colors.info,
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/about') 
                        }),
                        Button({ 
                            text: '← Back to Root', 
                            iconLeft: 'arrow_back',
                            variant: 'text',
                            color: colors.textSecondary,
                            padding: '12px 20px',
                            fullWidth: true,
                            onPress: () => goTo('/') 
                        })
                    ]
                })
            ]
        })
    });
};

export default HomeScreen;
`;

export const aboutScreenJs = () => `// screens/AboutScreen.js
import { Container, Column, Row, Text, Button, Icon, colors, goTo } from 'flet-box';

export const AboutScreen = () => {
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
                    text: 'A simple and fast UI framework for building web apps with pure JavaScript.', 
                    size: 16, 
                    color: colors.textSecondary, 
                    align: 'center',
                    style: { maxWidth: 400 }
                }),
                Container({
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    style: { width: '100%', maxWidth: 400 },
                    child: Column({
                        gap: 12,
                        children: [
                            Text({ text: '✨ What is FletBox?', size: 18, weight: 'bold', color: colors.primary }),
                            Text({ text: 'FletBox helps you create web apps easily. No complex tools. Just write JavaScript.', size: 14, color: colors.textSecondary }),
                            Container({ height: 1, backgroundColor: colors.border, marginVertical: 8 }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Zero dependencies - lightweight', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: '40+ ready-to-use widgets', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Built-in navigation (router)', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Dark / Light theme', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Hot reload for fast development', size: 14, color: colors.text })
                            ] })
                        ]
                    })
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
const CACHE_NAME = 'fletbox-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const urls = ['/', '/index.html'];
        
        for (const url of urls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.log('🔧 [INSTALL] ⚠️ Not cached: ' + url + ' - status: ' + response.status);
            }
          } catch (err) {
            console.log('🔧 [INSTALL] ❌ Error caching ' + url + ':', err.message);
          }
        }
        
        self.skipWaiting();
      } catch (error) {
        console.error('🔧 [INSTALL] ❌ Fatal error:', error);
      }
    })()
  );
});

self.addEventListener('activate', event => {
  console.log('🔧 [ACTIVATE] Activate event started');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName !== CACHE_NAME) {
            await caches.delete(cacheName);
          }
        }
        await self.clients.claim();
      } catch (error) {
        console.error('🔧 [ACTIVATE] ❌ Error:', error);
      }
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
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

export const manifest = () => `{
  "name": "FletBox - UI Framework",
  "short_name": "FletBox",
  "description": "UI framework with powerful animations and gradients",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "orientation": "any",
  "handle_links": "preferred",
  "icons": [
    {
      "src": "/src/assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/src/assets/icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/src/assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/src/assets/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/src/assets/icon-1024.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/src/assets/icon-1024-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "handle_links": "preferred",
  "launch_handler": {
    "client_mode": "focus-existing"
  },
  "protocol_handlers": [
    {
      "protocol": "web+fletbox",
      "url": "/?handler=%s"
    }
  ],
  "edge_side_panel": {
    "preferred_width": 400
  }
}
`;

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
// ============================================================
// ADDITIONS: MISSING SCREENS, COMPONENTS, AND APP TEMPLATES
// ============================================================

// Additional screen for adaptive template
export const profileScreenJs = () => `// screens/ProfileScreen.js
import { Container, Column, Text, Icon, colors } from 'flet-box';

export const ProfileScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 20,
            alignItems: 'center',
            children: [
                Icon({ name: 'person', size: 80, color: colors.primary }),
                Text({ text: 'User Profile', size: 28, weight: 'bold', color: colors.text }),
                Text({ text: 'This is your profile page.', size: 16, color: colors.textSecondary })
            ]
        })
    });
};
`;

// Screens index for easier imports
export const screensIndexJs = () => `// screens/index.js
export { RootScreen } from './RootScreen.js';
export { HomeScreen } from './HomeScreen.js';
export { AboutScreen } from './AboutScreen.js';
export { ProfileScreen } from './ProfileScreen.js';
`;

// Layout components
export const appBarComponentJs = () => `// components/layouts/AppBarComponent.js
import { AppBar, Icon, colors, openDrawer } from 'flet-box';

export const AppBarComponent = ({ title, isMobile = false, showBack = false, onBack }) => {
    return AppBar({
        title: title,
        backgroundColor: colors.primary,
        titleColor: '#ffffff',
        centerTitle: true,
        showBackButton: showBack,
        leading: isMobile ? Icon({
            name: 'menu',
            size: 24,
            color: '#ffffff',
            onclick: () => openDrawer()
        }) : null,
        onBackPress: onBack,
        elevation: 2
    });
};
`;

export const bottomNavJs = () => `// components/layouts/BottomNav.js
import { BottomNavigation, colors, goTo } from 'flet-box';

export const BottomNav = ({ items = [], currentRoute }) => {
    const defaultItems = [
        { icon: 'home', label: 'Home', route: '/home' },
        { icon: 'info', label: 'About', route: '/about' }
    ];
    const navItems = items.length ? items : defaultItems;
    return BottomNavigation({
        items: navItems,
        currentRoute: currentRoute,
        onTabChange: (route) => goTo(route),
        backgroundColor: colors.surface,
        selectedColor: colors.primary
    });
};
`;

export const sidebarJs = () => `// components/layouts/Sidebar.js
import { Container, Column, Row, Text, Icon, colors, goTo } from 'flet-box';

export const Sidebar = ({ items = [], currentRoute }) => {
    const defaultItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/home' },
        { icon: 'info', label: 'About', route: '/about' },
        { icon: 'home', label: 'Root', route: '/' }
    ];
    const menuItems = items.length ? items : defaultItems;
    return Container({
        width: 260,
        backgroundColor: colors.surface,
        borderRight: \`1px solid \${colors.border}\`,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        child: Column({
            children: [
                Container({
                    padding: 24,
                    backgroundColor: colors.primary,
                    child: Column({
                        alignItems: 'center',
                        children: [
                            Icon({ name: 'rocket_launch', size: 40, color: '#ffffff' }),
                            Text({ text: 'FletBox', size: 20, weight: 'bold', color: '#ffffff', marginTop: 12 })
                        ]
                    })
                }),
                ...menuItems.map(item => Container({
                    padding: '12px 20px',
                    cursor: 'pointer',
                    backgroundColor: currentRoute === item.route ? \`\${colors.primary}15\` : 'transparent',
                    borderLeft: currentRoute === item.route ? \`3px solid \${colors.primary}\` : 'none',
                    child: Row({
                        gap: 12,
                        alignItems: 'center',
                        children: [
                            Icon({ name: item.icon, size: 20, color: currentRoute === item.route ? colors.primary : colors.textSecondary }),
                            Text({ text: item.label, size: 14, color: currentRoute === item.route ? colors.primary : colors.text })
                        ]
                    }),
                    onclick: () => goTo(item.route)
                }))
            ]
        })
    });
};
`;

// Modular drawer menu (accepts items) – keep original drawerMenuJs as is, this is new
export const drawerMenuModularJs = () => `// components/layouts/DrawerMenu.js
import { Drawer, DrawerItem, Container, Column, Text, Icon, colors, closeDrawer } from 'flet-box';

export const DrawerMenu = ({ items = [] }) => {
    const defaultItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/home' },
        { icon: 'info', label: 'About', route: '/about' },
        { icon: 'home', label: 'Root', route: '/' }
    ];
    const menuItems = items.length ? items : defaultItems;
    return Drawer({
        header: Container({
            padding: 28,
            backgroundColor: colors.primary,
            child: Column({
                alignItems: 'center',
                children: [
                    Icon({ name: 'rocket_launch', size: 48, color: '#ffffff' }),
                    Text({ text: 'FletBox', size: 18, weight: 'bold', color: '#ffffff', marginTop: 12 }),
                    Text({ text: 'UI Framework', size: 12, color: 'rgba(255,255,255,0.8)' })
                ]
            })
        }),
        body: menuItems.map(item => DrawerItem({
            icon: item.icon,
            label: item.label,
            route: item.route,
            onPress: () => closeDrawer()
        })),
        footer: Container({
            padding: 20,
            borderTop: \`1px solid \${colors.border}\`,
            child: Text({ text: 'Version 1.0.0', size: 12, color: colors.textSecondary, align: 'center' })
        })
    });
};
`;

// App templates (blank, basic, full, sidebar, adaptive)
export const blankAppJs = () => `// app.js - Blank template
import { runApp, Container, Text, colors } from 'flet-box';

const App = () => Container({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    child: Text({ text: 'Hello FletBox!', size: 24, color: colors.primary })
});

runApp(App, 'root');
`;

export const basicAppJs = () => `// app.js - Basic template (AppBar + Drawer)
import { runApp, Scaffold, colors } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { RootScreen, HomeScreen, AboutScreen } from './screens/index.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen
};

const MyApp = () => Scaffold({
    routes,
    appBar: AppBarComponent({ title: 'FletBox', isMobile: false }),
    drawer: DrawerMenu(),
    backgroundColor: colors.background
});

runApp(MyApp, 'root');
`;

export const fullAppJs = () => `// app.js - Full template (AppBar + Drawer + BottomNav)
import { runApp, Scaffold, colors, useWindowSize } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';
import { RootScreen, HomeScreen, AboutScreen } from './screens/index.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen
};

const MyApp = () => {
    const { width } = useWindowSize();
    const isMobile = width < 768;
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: DrawerMenu(),
        bottomBar: isMobile ? BottomNav() : null,
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

export const sidebarAppJs = () => `// app.js - Sidebar template (desktop only)
import { runApp, Scaffold, colors } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { Sidebar } from './components/layouts/Sidebar.js';
import { RootScreen, HomeScreen, AboutScreen } from './screens/index.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen
};

const MyApp = () => Scaffold({
    routes,
    appBar: AppBarComponent({ title: 'FletBox', isMobile: false }),
    sidebar: Sidebar(),
    backgroundColor: colors.background
});

runApp(MyApp, 'root');
`;

export const adaptiveAppJs = () => `// app.js - Adaptive template (mobile + desktop)
import { runApp, Scaffold, colors, useWindowSize } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';
import { Sidebar } from './components/layouts/Sidebar.js';
import { RootScreen, HomeScreen, AboutScreen, ProfileScreen } from './screens/index.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen,
    '/profile': ProfileScreen
};

const MyApp = () => {
    const { width } = useWindowSize();
    const isMobile = width < 768;
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: isMobile ? DrawerMenu() : null,
        bottomBar: isMobile ? BottomNav() : null,
        sidebar: !isMobile ? Sidebar() : null,
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;
