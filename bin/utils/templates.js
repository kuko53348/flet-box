// bin/utils/templates.js

export const indexHtml = (appName = "FletBox App") => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./src/assets/fonts/icons.css">
    <link rel="manifest" href="./manifest.json">
    <link rel="icon" href="./src/assets/icon-192.png" sizes="192x192" type="image/png">

    <title>${appName}</title>
    <meta name="description" content="${appName} built with Flet-Box.">
    <meta name="keywords" content="fletbox, framework, ui, javascript, animations, gradients">
    <meta name="author" content="Your name">

    <meta property="og:title" content="${appName}">
    <meta property="og:description" content="${appName} built with Flet-Box.">
    <meta property="og:type" content="website">

    <meta name="theme-color" content="#1a1a2e">

    <!-- ============================================================
         GOOGLE ADSENSE (optional — disabled by default)

         To monetize this app:
           1. Get approved at https://www.google.com/adsense (you need a
              live domain with your own content first).
           2. Replace ca-pub-XXXXXXXXXXXXXXXX below with your publisher ID.
           3. Activate it: delete this whole comment block but KEEP the
              <script> tag below, so only the live <script> remains in <head>.
           4. Place an <ins class="adsbygoogle"> unit where you want the ad,
              or use the flet-box AdSense widget (see docs/widget/AdSense.md).

         NOTE: ads only work on an approved domain, not on localhost.

    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
            crossorigin="anonymous"></script>
    ============================================================ -->

    <style>
        * { -webkit-text-size-adjust: 100%; }
        body { margin: 0; padding: 0; font-family: system-ui, sans-serif}
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
import { DrawerMenu } from './components/layouts/DrawerMenu.js';

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

// ========== GOOGLE ADMOB (optional — disabled by default) ==========
// AdMob shows native ads in Android/iOS builds. To enable it:
//   1. Install the Capacitor plugin:
//        npm install @capacitor-community/admob
//   2. Add your real AdMob App ID to the native projects (see the README
//      "Ads (AdSense & AdMob)" section for the Android/iOS manifest keys),
//      then run: npm run android:sync && npm run ios:sync
//   3. Uncomment the AdMob import and the <AdMob .../> widget below.
// While developing, keep isTesting: true so you serve Google's sample ads
// (never click your own live ads — AdMob can ban the account).
//
// import { AdMob } from 'flet-box';
// =====================================================================

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

                // ===== ADMOB BANNER (optional — uncomment to enable) =====
                // Uses Google's sample unit id while isTesting is true.
                // Replace adId with your own banner unit id before going live.
                // AdMob({
                //     position: 'bottom',
                //     isTesting: true,
                //     // adId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
                // })
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

export const drawerMenuJs = () => `// components/layouts/DrawerMenu.js
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

export const createBundleSh = (target = "www") => `#!/bin/bash
# createBundle.sh — Bundle UNIFICADO a \${TARGET}/ (un solo app.js + PWA)
# Uso: bash createBundle.sh [target]
set -euo pipefail
cd "\$(dirname "\$0")"
TARGET="\${1:-${target}}"

if ! npx --no-install esbuild --version >/dev/null 2>&1; then
    echo "📦 Instalando esbuild (devDependency)…"
    npm install --save-dev esbuild >/dev/null
fi

rm -rf "\$TARGET"
mkdir -p "\$TARGET/src" "\$TARGET/assets"

# Root static files (PWA + preview)
for f in index.html manifest.json run.sh service-worker.js; do
    [ -f "\$f" ] && cp "\$f" "\$TARGET/"
done
[ -f "\$TARGET/run.sh" ] && chmod +x "\$TARGET/run.sh"

# Assets: iconos PWA + fuentes de iconos
if [ -d "src/assets" ]; then
    cp -R src/assets/. "\$TARGET/src/assets/"
    cp -R src/assets/. "\$TARGET/assets/"
fi

# CSS global (lo carga index.html)
if [ -f "src/styles/global.css" ]; then
    mkdir -p "\$TARGET/src/styles"
    cp src/styles/global.css "\$TARGET/src/styles/"
fi

# BUNDLE UNIFICADO: flet-box + widgets en UN solo app.js
echo "📦 Bundling (esbuild + tree-shaking)…"
npx esbuild src/app.js \\
    --bundle --outfile="\$TARGET/src/app.js" --format=esm --minify \\
    --tree-shaking=true --target=es2020 --define:FLETBOX_DEV=false \\
    --external:*.css --external:*.woff2 --resolve-extensions=.js,.json

# App source code (required by the "View code" button)
for d in modules screens database components; do
    [ -d "src/\$d" ] && cp -R "src/\$d" "\$TARGET/src/"
done

echo "✅ Bundle listo: \$TARGET/   Prueba: cd \$TARGET && bash run.sh"
`;

export const serviceWorkerJs = () => `// service-worker.js - PWA offline support
const CACHE_NAME = 'fletbox-v2';
// Deployment prefix: a worker's own URL always sits at the app root, so this
// is '/' at the host root and '/repo-name/' on a GitHub Pages project site.
// Hard-coded '/' entries would miss every file under a subpath.
const BASE = new URL('./', self.location).pathname;
// The shipped (baked-in) shell, precached so the app opens with no connection.
// loader.js owns a SEPARATE cache ('fletbox-ota') for downloaded bundles.
const PRECACHE = [BASE, BASE + 'index.html', BASE + 'loader.js', BASE + 'config.json', BASE + 'src/app.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const urls = PRECACHE;
        
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
          if (cacheName !== CACHE_NAME && cacheName !== 'fletbox-ota') {
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

// Hybrid caching:
//  - Static assets (fonts/icons/images/css): cache-first (they are immutable
//    per release and re-fetched only when missing).
//  - Updatable shell (html/js/json, incl. src/app.js + config.json):
//    network-first so a new release is picked up immediately, falling back to
//    the cache when offline. This is what keeps OTA correct: the service worker
//    must never hand back a stale app.js while online.
// Cross-origin requests (the remote OTA config/bundle) are left to the network.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isStatic = /\\.(png|jpe?g|svg|gif|webp|ico|woff2?|ttf|otf|css)$/i.test(url.pathname);

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      if (isStatic) {
        const hit = await cache.match(req);
        if (hit) return hit;
      }
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const shell = await cache.match(BASE + 'index.html');
          if (shell) return shell;
        }
        return Response.error();
      }
    })()
  );
});
`;

export const packageJson = (name) => `{
  "name": ${JSON.stringify(name)},
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bash run.sh",
    "check": "node scripts/check-app.mjs",
    "fix": "flet-box audit-fix",
    "api": "flet-box unpack --all --md",
    "build": "flet-box createBundle www",
    "start": "npm run dev",
    "android:init": "npm run build && cap add android",
    "android:sync": "npm run build && cap sync android && npm run android:icons",
    "android:icons": "node scripts/sync-android-icons.mjs",
    "android:open": "cap open android",
    "android:run": "cap run android",
    "ios:init": "npm run build && cap add ios",
    "ios:sync": "npm run build && cap sync ios && npm run ios:icons",
    "ios:icons": "node scripts/sync-ios-assets.mjs",
    "ios:open": "cap open ios",
    "ios:run": "cap run ios"
  },
  "dependencies": {
    "@capacitor/android": "^7.0.0",
    "@capacitor/core": "^7.0.0",
    "@capacitor/ios": "^7.0.0",
    "flet-box": "^1.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0",
    "sharp": "^0.35.5"
  },
  "engines": {
    "node": ">=20.9.0"
  }
}`;

export const capacitorConfig = (appName, appId) => `${JSON.stringify(
  {
    appId,
    appName,
    webDir: "www",
    backgroundColor: "#1a1a2e",
    server: { androidScheme: "https", iosScheme: "https" },
  },
  null,
  2,
)}\n`;

// Placeholder update URL used when `flet-box create` is run without --repo.
// The user replaces TU-USUARIO/TU-REPO with their real public GitHub names.
export const OTA_PLACEHOLDER_URL = "https://TU-USUARIO.github.io/TU-REPO/";

// OTA manifest written to every generated project. The loader (www/loader.js)
// reads `update.url` via www/config.json to know where to fetch updates.
export const fletboxConfig = (url = OTA_PLACEHOLDER_URL) => `${JSON.stringify(
  {
    update: {
      url,
      mode: "prompt",
      channel: "stable",
      mandatory: false,
      minNativeVersion: "0.0.0",
      notes: "",
    },
  },
  null,
  2,
)}\n`;

export const syncAndroidIconsScript = () => `import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidRes = path.join(projectRoot, "android", "app", "src", "main", "res");
const logoPath = path.join(projectRoot, "assets", "logo.png");
const backgroundPath = path.join(androidRes, "values", "ic_launcher_background.xml");

for (const requiredPath of [logoPath, backgroundPath]) {
  try {
    await readFile(requiredPath);
  } catch {
    throw new Error(
      \`Missing \${requiredPath}. Run npm run android:init before generating Android icons.\`,
    );
  }
}

const logo = await readFile(logoPath);
const densities = [
  ["mdpi", 48],
  ["hdpi", 72],
  ["xhdpi", 96],
  ["xxhdpi", 144],
  ["xxxhdpi", 192],
];
const background = { r: 26, g: 26, b: 46 };

for (const [density, size] of densities) {
  const directory = path.join(androidRes, \`mipmap-\${density}\`);
  await mkdir(directory, { recursive: true });
  const icon = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const foregroundLayer = await sharp(logo)
    .resize(Math.round(size * 0.66), Math.round(size * 0.66), { fit: "contain" })
    .png()
    .toBuffer();
  const foreground = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: foregroundLayer, gravity: "centre" }])
    .png()
    .toBuffer();

  await Promise.all([
    writeFile(path.join(directory, "ic_launcher.png"), icon),
    writeFile(path.join(directory, "ic_launcher_round.png"), icon),
    writeFile(path.join(directory, "ic_launcher_foreground.png"), foreground),
  ]);
}

const xml = await readFile(backgroundPath, "utf8");
const backgroundColor = /(<color name="ic_launcher_background">)#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})(<[/]color>)/;
if (!backgroundColor.test(xml)) {
  throw new Error(\`Invalid adaptive icon background resource: \${backgroundPath}\`);
}
await writeFile(backgroundPath, xml.replace(backgroundColor, "$1#1a1a2e$2"));

// SPLASH SCREENS
// The launch theme (AppTheme.NoActionBarLaunch) shows @drawable/splash while the
// WebView boots. Draw the app icon (the logo flattened on the brand color),
// centred and sized to ~30% of the shorter side, with rounded corners whose
// radius is 24dp at the mdpi baseline and scales with the device density.
const ICON_SCALE = 0.3;
const BORDER_RADIUS_DP = 24;

const roundedIcon = async (size, radius) => {
  const tile = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}"><rect width="\${size}" height="\${size}" rx="\${radius}" ry="\${radius}"/></svg>\`,
  );
  return sharp(tile).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
};

const splashScreens = [
  ["drawable", 480, 320, 1],
  ["drawable-port-mdpi", 320, 480, 1],
  ["drawable-port-hdpi", 480, 800, 1.5],
  ["drawable-port-xhdpi", 720, 1280, 2],
  ["drawable-port-xxhdpi", 960, 1600, 3],
  ["drawable-port-xxxhdpi", 1280, 1920, 4],
  ["drawable-land-mdpi", 480, 320, 1],
  ["drawable-land-hdpi", 800, 480, 1.5],
  ["drawable-land-xhdpi", 1280, 720, 2],
  ["drawable-land-xxhdpi", 1600, 960, 3],
  ["drawable-land-xxxhdpi", 1920, 1280, 4],
];

for (const [directory, width, height, scale] of splashScreens) {
  const target = path.join(androidRes, directory);
  await mkdir(target, { recursive: true });
  const iconSize = Math.round(ICON_SCALE * Math.min(width, height));
  const radius = Math.min(Math.round(BORDER_RADIUS_DP * scale), Math.floor(iconSize / 2));
  const icon = await roundedIcon(iconSize, radius);
  const splash = await sharp({
    create: { width, height, channels: 4, background },
  })
    .composite([{ input: icon, gravity: "centre" }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(path.join(target, "splash.png"), splash);
}

console.log("Android launcher icons and splash screens generated from assets/logo.png.");
`;

export const syncIOSAssetsScript = () => `import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeAppDir = path.join(projectRoot, "ios", "App", "App");
const appIconSet = path.join(nativeAppDir, "Assets.xcassets", "AppIcon.appiconset");
const splashSet = path.join(nativeAppDir, "Assets.xcassets", "Splash.imageset");
const infoPlistPath = path.join(nativeAppDir, "Info.plist");
const launchScreenPath = path.join(nativeAppDir, "Base.lproj", "LaunchScreen.storyboard");
const logoPath = path.join(projectRoot, "assets", "logo.png");

// Brand background, the same #1a1a2e as theme-color in index.html and manifest.json.
const background = { r: 26, g: 26, b: 46 };
const backgroundComponent = (value) => Number((value / 255).toFixed(6));

const requireExists = async (target) => {
  try {
    await access(target);
  } catch {
    throw new Error(
      "Missing " + target + ". Run \`npm run ios:init\` before generating iOS assets.",
    );
  }
};

for (const target of [logoPath, appIconSet, splashSet, infoPlistPath, launchScreenPath]) {
  await requireExists(target);
}

const logo = await readFile(logoPath);
const logoMetadata = await sharp(logo).metadata();
if ((logoMetadata.width ?? 0) < 512 || (logoMetadata.height ?? 0) < 512) {
  throw new Error(
    "assets/logo.png must be at least 512x512 pixels, found " +
      logoMetadata.width +
      "x" +
      logoMetadata.height +
      ".",
  );
}

const readContents = async (directory) =>
  JSON.parse(await readFile(path.join(directory, "Contents.json"), "utf8"));

// APP ICON
// The Capacitor template ships one universal 1024x1024 slot. Slot names and
// sizes come from Contents.json instead of being hardcoded, so a template with
// several slots keeps working. iOS rejects icons with an alpha channel, hence
// the flatten onto the brand color.
const iconContents = await readContents(appIconSet);
const iconSlots = iconContents.images.filter((image) => image.filename);
if (iconSlots.length === 0) {
  throw new Error("No icon slots found in " + path.join(appIconSet, "Contents.json"));
}

const slotPixels = (image) => {
  const base = Number(image.size ? image.size.split("x")[0] : 0);
  if (!base) return 1024;
  const scale = image.scale === "3x" ? 3 : image.scale === "2x" ? 2 : 1;
  return Math.round(base * scale);
};

for (const slot of iconSlots) {
  const size = slotPixels(slot);
  const icon = await sharp(logo)
    .resize(size, size, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  await writeFile(path.join(appIconSet, slot.filename), icon);
}

// LAUNCH IMAGES
// LaunchScreen.storyboard stretches the "Splash" image with scaleAspectFill, so
// a square brand image covers every screen. Each file keeps the dimensions the
// template ships with, which the asset catalog scales per device.
// The app icon (logo flattened on the brand color) is centred at ~30% of the
// side with rounded corners. The corner radius is 24dp at the mdpi baseline, so
// the ratio comes from a 96px icon: 24 / 96.
const splashContents = await readContents(splashSet);
const splashSlots = splashContents.images.filter((image) => image.filename);
const ICON_SCALE = 0.3;
const BORDER_RADIUS_RATIO = 24 / 96;

for (const slot of splashSlots) {
  const target = path.join(splashSet, slot.filename);
  const metadata = await sharp(target).metadata();
  const side = metadata.width && metadata.width === metadata.height ? metadata.width : 2732;
  const iconSize = Math.round(side * ICON_SCALE);
  const radius = Math.min(
    Math.round(iconSize * BORDER_RADIUS_RATIO),
    Math.floor(iconSize / 2),
  );
  const tile = await sharp(logo)
    .resize(iconSize, iconSize, { fit: "contain" })
    .flatten({ background })
    .png()
    .toBuffer();
  const mask = Buffer.from(
    \`<svg xmlns="http://www.w3.org/2000/svg" width="\${iconSize}" height="\${iconSize}"><rect width="\${iconSize}" height="\${iconSize}" rx="\${radius}" ry="\${radius}"/></svg>\`,
  );
  const badge = await sharp(tile)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const splash = await sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background,
    },
  })
    .composite([{ input: badge, gravity: "centre" }])
    .removeAlpha()
    .png()
    .toBuffer();
  await writeFile(target, splash);
}

// LAUNCH SCREEN BACKGROUND
// The splash image is laid out inside the safe area, so the notch strip and the
// home indicator keep the storyboard background color. Left as
// systemBackgroundColor it flashes white over the dark launch image.
const storyboard = await readFile(launchScreenPath, "utf8");
const brandedColor =
  '<color key="backgroundColor" red="' +
  backgroundComponent(background.r) +
  '" green="' +
  backgroundComponent(background.g) +
  '" blue="' +
  backgroundComponent(background.b) +
  '" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>';
const systemColor = '<color key="backgroundColor" systemColor="systemBackgroundColor"/>';
const brandedStoryboard = storyboard.split(systemColor).join(brandedColor);
if (brandedStoryboard !== storyboard) {
  await writeFile(launchScreenPath, brandedStoryboard);
}

// STATUS BAR
// FletBox apps paint a dark app bar, and the template Info.plist leaves
// UIViewControllerBasedStatusBarAppearance enabled, which makes the plist status
// bar style ignored. Disable it so the light content style actually applies.
const setPlistValue = (xml, key, value) => {
  const openTag = "<key>" + key + "</key>";
  const valueTag = value.startsWith("<") ? value : "<string>" + value + "</string>";
  const keyStart = xml.indexOf(openTag);
  if (keyStart !== -1) {
    // The value follows on the next indented line, so jump to its first tag.
    const valueStart = xml.indexOf("<", keyStart + openTag.length);
    if (xml.startsWith("<string>", valueStart)) {
      const valueEnd = xml.indexOf("</string>", valueStart) + "</string>".length;
      return xml.slice(0, valueStart) + valueTag + xml.slice(valueEnd);
    }
    if (xml.startsWith("<true", valueStart) || xml.startsWith("<false", valueStart)) {
      const valueEnd = xml.indexOf("/>", valueStart) + 2;
      return xml.slice(0, valueStart) + valueTag + xml.slice(valueEnd);
    }
  }
  const closing = xml.lastIndexOf("</dict>");
  return (
    xml.slice(0, closing) +
    "\\t" + openTag + "\\n\\t" + valueTag + "\\n" +
    xml.slice(closing)
  );
};

const plist = await readFile(infoPlistPath, "utf8");
const brandedPlist = setPlistValue(
  setPlistValue(plist, "UIStatusBarStyle", "UIStatusBarStyleLightContent"),
  "UIViewControllerBasedStatusBarAppearance",
  "<false />",
);
if (brandedPlist !== plist) {
  await writeFile(infoPlistPath, brandedPlist);
}

console.log(
  "iOS app icon, launch images and launch screen generated from assets/logo.png " +
    "(" + iconSlots.length + " icon slot(s), " + splashSlots.length + " launch image(s)).",
);`;

export const manifest = (appName = "FletBox App") => `{
  "name": ${JSON.stringify(appName)},
  "short_name": ${JSON.stringify(appName.slice(0, 12))},
  "description": ${JSON.stringify(`${appName} built with Flet-Box`)},
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "orientation": "any",
  "icons": [
    {
      "src": "./src/assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./src/assets/icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "./src/assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./src/assets/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "launch_handler": {
    "client_mode": "focus-existing"
  },
  "handle_links": "preferred"
}
`;

// GitHub Actions workflow that builds web + Android + iOS in ONE run.
// Placed at .github/workflows/ (the only location GitHub reads), NOT inside www/.
// NOTE: every GitHub `${{ }}` expression is escaped as `\${{ }}` because this is
// a JS template literal — an unescaped `${` would be parsed as interpolation.
export const githubWorkflow = (appName = "FletBox App", appId = "com.fletbox.app") => {
  const slug = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "fletbox-app";
  return `name: Build ${appName}

# One push (or manual trigger) fans out into three parallel jobs:
#   web     -> bundles the PWA; publishes to GitHub Pages ONLY on release
#              tags (v*), which is what triggers OTA self-updates
#   android -> compiles a debug APK and uploads it as an artifact
#   ios     -> compiles a simulator .app and uploads it as an artifact
# All three run at the same time on separate runners.
on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

# Cancel superseded runs on the same branch to save Actions minutes.
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

# The generated app depends on the public \`flet-box\` npm package. If you are
# developing against a local copy, publish it (or vendor it) before these jobs
# can \`npm install\` it. package-lock.json is gitignored, so we use npm install.

jobs:
  # ---------- WEB: bundle + GitHub Pages preview ----------
  web:
    name: Web (Pages)
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install

      # Fails the build on an invented widget/prop, a positional widget call or a
      # foreign-framework import. See AGENTS.md section 4.
      - name: Check app API usage (npm run check)
        run: npm run check

      - name: Bundle web app (flet-box createBundle www)
        run: npm run build

      # Pages is the OTA update source (www/config.json), so it is published
      # ONLY for release tags (v*) created by \`flet-box release\`. Ordinary
      # pushes still build (to catch breakage in CI) but never publish an
      # update, so test builds cannot reach installed apps.
      - name: Upload Pages artifact
        if: startsWith(github.ref, 'refs/tags/v')
        uses: actions/upload-pages-artifact@v5
        with:
          path: www

      # Enable Pages first: Settings -> Pages -> Source = "GitHub Actions".
      - name: Deploy to GitHub Pages
        id: deployment
        if: startsWith(github.ref, 'refs/tags/v')
        uses: actions/deploy-pages@v5

  # ---------- ANDROID: debug APK ----------
  android:
    name: Android (APK)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: 17

      # ubuntu runners ship the Android SDK; this step accepts licences and
      # installs any packages the Capacitor Gradle build asks for.
      - uses: android-actions/setup-android@v4

      - name: Install dependencies
        run: npm install

      - name: Bundle web app
        run: npm run build

      - name: Add Android platform
        run: npx cap add android

      - name: Sync web assets to Android
        run: npx cap sync android

      - name: Build debug APK
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon

      - name: Upload APK
        uses: actions/upload-artifact@v6
        with:
          name: ${slug}-android-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error

  # ---------- iOS: simulator build ----------
  ios:
    name: iOS (simulator)
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install

      - name: Bundle web app
        run: npm run build

      - name: Add iOS platform
        run: npx cap add ios

      - name: Sync web assets to iOS
        run: npx cap sync ios

      - name: Install CocoaPods
        run: |
          cd ios/App
          pod install --repo-update

      # Signed device/App Store builds need your Apple certificates; CI here
      # builds an unsigned simulator app so no secrets are required.
      - name: Build for simulator
        run: |
          cd ios/App
          xcodebuild \\
            -workspace App.xcworkspace \\
            -scheme App \\
            -configuration Debug \\
            -sdk iphonesimulator \\
            -destination 'generic/platform=iOS Simulator' \\
            -derivedDataPath build \\
            CODE_SIGNING_ALLOWED=NO \\
            build

      - name: Upload .app
        uses: actions/upload-artifact@v6
        with:
          name: ${slug}-ios-simulator
          path: ios/App/build/Build/Products/Debug-iphonesimulator/App.app
          if-no-files-found: error
`;
};

export const gitignore = () => `node_modules/
dist/
www/
ios/build/
ios/App/Pods/
ios/App/App/public/
ios/capacitor-cordova-ios-plugins/
android/.gradle/
android/.idea/
android/build/
android/app/build/
android/local.properties
android/capacitor-cordova-android-plugins/
package-lock.json
.DS_Store
*.log
`;

export const readme = (name, _template, appId) => `# ${name}

FletBox app with 3 screens: Root, Home and About, plus Drawer menu.
The generated Capacitor configuration uses package id \`${appId}\`.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Working with an AI assistant

This project ships an in-project agent contract, so an AI editing the app uses the
real FletBox API instead of inventing one and burning tokens relearning the
framework from scratch:

- \`AGENTS.md\` — the rules: FletBox syntax only, real widgets and props only, and the
  verification loop it must run after every edit.
- \`.claude/CLAUDE.md\`, \`.cursor/rules/fletbox.mdc\` — short pointers to \`AGENTS.md\` for
  Claude Code and Cursor.
- \`.fletbox/api/cheatsheet.md\` — every widget and its real props, generated from the
  installed package. This is the lookup an agent reads instead of the framework.
- \`.fletbox/api/api.json\` — the same surface as data: per prop its engine target,
  default, aliases and a \`sample\` value the types prove works. Write calls from this.
- \`.fletbox/memory/\` — notes the agent keeps between sessions, so it does not
  rediscover the same thing twice.
- \`scripts/check-app.mjs\` — the gate that catches hallucinated APIs.

\`\`\`bash
npm run check                      # scan src/ for invented widgets, props, imports
npm run check -- --props Button    # print the real props of one widget
npm run check -- --list            # print every public export
npm run fix                        # rewrite typos it can prove (imports, prop keys)
npm run api                        # regenerate .fletbox/api/api.json and api.md
flet-box unpack Button             # each prop, where it really goes, and what is dead
flet-box unpack Button --example   # a paste-ready call using only verified props
flet-box unpack Modal --diff       # where types, engine, docs and code disagree
\`\`\`

\`npm run check\` exits non-zero on a real error and also runs in CI. If you upgrade
\`flet-box\`, regenerate the cheatsheet with \`flet-box check-api --emit-api\` and the
machine-readable surface with \`npm run api\`.

## Android

This project is preconfigured for Capacitor. Install Node.js 20.9 or newer,
Android Studio, and the Android SDK. Then create the native Android project:

\`\`\`bash
npm install
flet-box build android
\`\`\`

The command initializes Android on first use, builds and synchronizes the web
app, generates launcher icons from \`assets/logo.png\`, and compiles a debug APK
at \`android/app/build/outputs/apk/debug/app-debug.apk\`. It installs missing
project npm dependencies and prints the absolute APK path when finished.
Android Studio, Java, and the Android SDK must already be installed. Replace
that image with your app logo before distributing. To open the native project
in Android Studio, run \`npm run android:open\`. For a signed release, use
**Build → Generate Signed Bundle / APK** in Android Studio. The PWA manifest
icons are in \`src/assets/\`.

## iOS

This project is preconfigured for Capacitor iOS. On macOS, install the full
Xcode app, its iOS simulator runtime, and CocoaPods
(\`sudo gem install cocoapods\` then \`pod setup\`). Node.js 20.9 or newer is
required. Then build the simulator app:

\`\`\`bash
npm install
flet-box build ios
\`\`\`

The command initializes iOS on first use, builds and synchronizes the web app,
generates the app icon, launch images and launch screen background from
\`assets/logo.png\`, and compiles
\`ios/build/Build/Products/Debug-iphonesimulator/App.app\`. It prints the
absolute path when finished. Install it on a running simulator with
\`xcrun simctl install booted <path>\`.

For a real device or the App Store, build the unsigned archive and sign it with
your Apple team:

\`\`\`bash
flet-box build ios --archive
\`\`\`

That writes \`ios/build/App.xcarchive\`. Open it in Xcode (Product → Archive) with
a signing team selected to export an IPA. To open the native project directly,
run \`npm run ios:open\`.

Replace \`assets/logo.png\` with a 1024×1024 logo before distributing; the icon,
the launch images and the launch background are all generated from it. The
launch background is the app brand color \`#1a1a2e\`, which lives in
\`scripts/sync-ios-assets.mjs\`.

Capacitor uses a local HTTPS origin (\`https://localhost\`) in the Android and
iOS WebViews. If the app calls a remote API, allow that origin in the API's
CORS configuration and use HTTPS for the remote service.

## Continuous Integration (GitHub Actions)

Every project ships with \`.github/workflows/build.yml\`. Once the repo is on
GitHub, each push to \`main\` (or a manual **Run workflow**) fans out into three
parallel jobs:

- **web** — bundles the app into \`www/\` and deploys it to **GitHub Pages** so you
  can view it in a browser.
- **android** — compiles a debug **APK** and uploads it as a run artifact.
- **ios** — compiles an unsigned **simulator .app** and uploads it as an artifact.

### Run it on the web (one-time setup)

1. Push this project to a GitHub repository.
2. Open **Settings → Pages** in that repo.
3. Set **Source** to **GitHub Actions** (not "Deploy from a branch").
4. Push to \`main\`, or open the **Actions** tab and click **Run workflow**.

The site goes live at \`https://<your-user>.github.io/<repo-name>/\`. That is a
sub-path, so \`index.html\` uses relative asset paths and works without changes.

### Download the mobile artifacts

Open the workflow run in the **Actions** tab; the Android APK and the iOS
\`.app\` are listed under **Artifacts** at the bottom of the run summary.

> The workflow installs dependencies with \`npm install\`, which resolves the
> \`flet-box\` package from npm. If you develop against a local copy of the
> framework, publish it first — or add a step that checks out the framework and
> runs \`npm pkg set dependencies.flet-box=file:<path>\` before \`npm install\`.

## Ads (AdSense & AdMob) — optional

Both ad integrations ship **disabled by default**, ready to switch on. Replace
every \`ca-pub-XXXXXXXXXXXXXXXX\` / \`ca-app-pub-XXXXXXXXXXXXXXXX\` placeholder
with your own IDs from the AdSense/AdMob console. While developing keep test
mode on and never click your own live ads — AdMob can ban the account.

### AdSense (web)

\`index.html\` has a commented-out AdSense \`<script>\` in the \`<head>\`. To
enable: get an approved domain at https://www.google.com/adsense, put your
publisher ID in the script, and delete the surrounding \`<!--\` / \`-->\` so the
tag goes live. Ads only render on an approved domain, not on localhost. You can
also drop the \`AdSense\` widget into any screen (see
https://github.com/kuko53348/flet-box/blob/refactory/docs/widget/AdSense.md).

### AdMob (Android / iOS)

1. Install the Capacitor plugin:

   \`\`\`bash
   npm install @capacitor-community/admob
   \`\`\`

2. Add your AdMob **App ID** to the native projects.

   Android — \`android/app/src/main/AndroidManifest.xml\`, inside \`<application>\`:

   \`\`\`xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   \`\`\`

   iOS — \`ios/App/App/Info.plist\`, inside the top-level \`<dict>\`:

   \`\`\`xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
   \`\`\`

3. Sync and rebuild:

   \`\`\`bash
   npm run android:sync && npm run ios:sync
   \`\`\`

4. Uncomment the \`AdMob\` import and the \`AdMob({...})\` widget in
   \`src/screens/HomeScreen.js\` (they are marked with ADMOB comments). Full
   props in
   https://github.com/kuko53348/flet-box/blob/refactory/docs/widget/AdMob.md.

## Over-the-air updates (OTA)

This app can update its web layer without a new store submission. The project
ships with \`fletbox.config.json\`, which tells the app where to check for
updates:

\`\`\`json
{
  "update": {
    "url": "https://TU-USUARIO.github.io/TU-REPO/",
    "mode": "prompt"
  }
}
\`\`\`

- The GitHub repository **must be public**.
- Replace \`TU-USUARIO\` with your GitHub username and \`TU-REPO\` with the
  repository name, or set \`update.url\` to any HTTPS host that serves your
  \`config.json\` + bundle.
- Enable GitHub Pages: **Settings → Pages → Source: GitHub Actions**.
- Cut a release with \`flet-box release --push\` (bumps the version, rebuilds
  \`www/\`, commits and tags \`vX.Y.Z\`). CI then deploys \`www/\` and installed
  apps self-update the next time they open.
- The update URL is also reflected in \`www/config.json\` after \`flet-box
  createBundle www\`; it is baked into Android/iOS builds at \`cap sync\` time.
- Only web files are updated OTA. Native changes (plugins, permissions,
  manifest/Info.plist edits) still require a new store submission.

## Features

- Welcome screen with rocket icon
- Dashboard screen with welcome message
- About screen with framework info
- Drawer menu for navigation
- PWA icons and Capacitor Android launcher/splash assets
- Capacitor iOS project, icon and launch screen assets
- Dark/Light theme support

## Project Structure

\`\`\`
├── src/
│   ├── app.js
│   ├── components/
│   │   └── layouts/
│   │       └── DrawerMenu.js
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

export default ProfileScreen;
`;

// Screens index for easier imports. ProfileScreen only exists in the adaptive
// template, so it is re-exported only when that screen file was actually written.
export const screensIndexJs = (template) => `// screens/index.js
export { RootScreen } from './RootScreen.js';
export { HomeScreen } from './HomeScreen.js';
export { AboutScreen } from './AboutScreen.js';${
  template === "adaptive" ? `\nexport { ProfileScreen } from './ProfileScreen.js';` : ""
}
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

export const BottomNav = ({ items = [], currentRoute } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Home', route: '/home' },
        { icon: 'info', label: 'About', route: '/about' }
    ];
    const navItems = items.length ? items : defaultItems;
    // BottomNavigation selects a tab by index, not by route.
    const currentIndex = Math.max(0, navItems.findIndex((item) => item.route === currentRoute));
    return BottomNavigation({
        items: navItems,
        currentIndex,
        onTabChange: (index) => goTo(navItems[index].route),
        backgroundColor: colors.surface,
        selectedColor: colors.primary
    });
};
`;

export const sidebarJs = () => `// components/layouts/Sidebar.js
import { Container, Column, Row, Text, Icon, colors, goTo } from 'flet-box';

export const Sidebar = ({ items = [], currentRoute } = {}) => {
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

export const DrawerMenu = ({ items = [] } = {}) => {
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

// make sure to export all screens in screens/index.js for easier imports
import { RootScreen } from './screens/RootScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';

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

export const fullAppJs =
  () => `// app.js - Full template (AppBar + Drawer + BottomNav)
import { runApp, Scaffold, colors, useState, dimensions } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';

// make sure to export all screens in screens/index.js for easier imports
import { RootScreen } from './screens/RootScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen
};

// State is key-based, so the viewport width survives re-renders. One resize
// subscription feeds it from module scope: registering it inside the component
// would add a listener on every render.
const [viewportWidth, setViewportWidth] = useState('viewportWidth', dimensions.getWidth());
dimensions.addListener(({ width }) => setViewportWidth(width));

const MyApp = () => {
    // Structural read of the key, so crossing the breakpoint re-renders the shell.
    const isMobile = viewportWidth.valueOf() < 768;
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
    leftNavBar: Sidebar(),
    backgroundColor: colors.background
});

runApp(MyApp, 'root');
`;

export const adaptiveAppJs =
  () => `// app.js - Adaptive template (mobile + desktop)
import { runApp, Scaffold, colors, useState, dimensions } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';
import { Sidebar } from './components/layouts/Sidebar.js';

// make sure to export all screens in screens/index.js for easier imports
import { RootScreen } from './screens/RootScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { AboutScreen } from './screens/AboutScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';

const routes = {
    '/': RootScreen,
    '/home': HomeScreen,
    '/about': AboutScreen,
    '/profile': ProfileScreen
};

// State is key-based, so the viewport width survives re-renders. The resize
// subscription is registered once at module scope; doing it inside the component
// would add another listener on every render.
const [viewportWidth, setViewportWidth] = useState('viewportWidth', dimensions.getWidth());
dimensions.addListener(({ width }) => setViewportWidth(width));

const MyApp = () => {
    // Structural read of the keyed viewport state, so crossing the breakpoint
    // re-renders the shell (drawer + bottom bar <-> sidebar).
    const isMobile = viewportWidth.valueOf() < 768;
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: isMobile ? DrawerMenu() : null,
        bottomBar: isMobile ? BottomNav() : null,
        leftNavBar: !isMobile ? Sidebar() : null,
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

// ---------------------------------------------------------------------------
// AI agent contract
// ---------------------------------------------------------------------------
// Every generated app ships an in-project agent guide so an AI editing the app
// uses real FletBox APIs instead of inventing them. These are built with
// array.join() and single-quoted lines: the content is markdown full of fenced
// code blocks and backticks, which would break an ordinary template literal.
// ---------------------------------------------------------------------------

export const agentsMd = (appName, template, version) =>
  [
    '# AGENTS.md',
    '',
    `**App:** \`${appName}\` · **Template:** \`${template}\` · **flet-box@${version}**`,
    'FletBox is a vanilla-JS UI framework: ESM only, zero runtime dependencies,',
    'fully offline. There is no build step to learn and no compiler to blame.',
    '',
    'This file is the contract. Read it before writing any code in this project.',
    'You do **not** need to read the whole framework to work here — sections 1 to 3',
    'tell you where the authoritative answers live, the design system in section 4',
    'fixes every size and color you may use, and the checker in section 5',
    'proves you right or wrong in seconds.',
    '',
    '## 1. The API is a fact, not a guess',
    '',
    'Never invent a widget, prop, hook or helper. Look it up:',
    '',
    '| I want to know… | Look here |',
    '| --- | --- |',
    '| Which widgets exist and which props each accepts | `.fletbox/api/cheatsheet.md` (generated, covers every widget) |',
    '| Everything for one widget | `npm run check -- --props <Widget>` |',
    '| Whether a prop actually reaches the DOM, or is typed but dead | `flet-box unpack <Widget>` |',
    '| A call that is safe to paste | `flet-box unpack <Widget> --example` |',
    '| Prose, types and a worked example | `node_modules/flet-box/docs/widget/<Widget>.md` |',
    '| Every public export of the package | `npm run check -- --list` |',
    '| The whole surface as data, to build calls from | `.fletbox/api/api.json` |',
    '',
    '**If a name is not in those files, it does not exist.** A prop that silently',
    'does nothing is worse than a compile error: it renders as a broken layout and',
    'nobody finds it for weeks.',
    '',
    '- Do not edit `node_modules/flet-box`. It is a dependency, not source.',
    '- The cheatsheet is generated output. Regenerate it with',
    '  `flet-box check-api --emit-api` after upgrading the package; never hand-edit it.',
    '- `.fletbox/api/api.json` and `api.md` are generated the same way:',
    '  `npm run api`. They carry one entry per prop with its engine target, default,',
    '  aliases and a `sample` value, so a call can be written from data instead of',
    '  memory.',
    '',
    '## 2. FletBox syntax only — no other framework',
    '',
    'A widget is a **function call that returns an HTMLElement**. That is the whole',
    'model. Do not mix in syntax from another ecosystem:',
    '',
    '```js',
    '// Correct',
    "Text({ text: 'Hello', size: 18, color: colors.primary })",
    "Button({ text: 'Save', onPress: save, bgColor: colors.primary })",
    'Box({ child: Text({ text: count }), padding: 12 })',
    '```',
    '',
    '```js',
    '// Wrong — never write any of these',
    '<Text>Hello</Text>                      // JSX',
    "h('div', ...)                            // hyperscript",
    'Text("Hello")                            // positional args',
    "Text('Hello', size: 18)                  // Dart / Flutter named args",
    'new Text(...)                            // classes',
    "t('div')                                 // Vue template",
    '```',
    '',
    '- No `react`, `vue`, `svelte`, `@angular/core`, `solid-js`, `lit`, `jquery`,',
    '  `tailwindcss` or `bootstrap` imports. This app is offline: nothing installs',
    '  at runtime and nothing fetches a CDN.',
    '- No `.jsx`, `.tsx`, `.vue` or `.svelte` files. Plain `.js`, ESM imports with a',
    '  explicit `.js` extension.',
    '- Styling is props (`bgColor`, `radius`, `padding`), not class strings or',
    '  `styled-components`.',
    '- `child` takes one widget; `children` takes an array or string. Swapping them',
    '  is the most common silent bug.',
    '- Prop aliases (`bgColor` ≡ `backgroundColor`, `onPress` ≡ `onClick`) are',
    '  intentional. Pick one per file and stay consistent; do not "dedupe" them.',
    '',
    '## 3. Architecture the framework expects',
    '',
    '```',
    'app.js                      -> runApp(App, \'root\')',
    'screens/                    -> one exported widget per route',
    'components/                 -> reusable, stateless unless they own state',
    'components/layouts/         -> appBar, drawer, sidebar, bottomBar',
    '```',
    '',
    'The app root is `Scaffold`, which owns navigation and chrome. Use it:',
    '',
    '```js',
    'Scaffold({',
    '  routes,',
    "  appBar: AppBarComponent({ title: 'FletBox', isMobile }),",
    '  drawer: isMobile ? DrawerMenu() : null,',
    '  bottomBar: isMobile ? BottomNav() : null,',
    '  leftNavBar: !isMobile ? Sidebar() : null,   // NOT `sidebar:`',
    '  leftNavBarWidth: 240,',
    "  fab: isMobile ? ActionButton({ icon: 'add', onPress: open }) : null,",
    '  body: isMobile ? null : HomeScreen(),',
    '})',
    '```',
    '',
    'Real `Scaffold` props: `appBar body bottomBar fab drawer leftNavBar',
    'leftNavBarWidth rightNavBar rightNavBarWidth routes basePath backgroundColor',
    'closeDrawerOnNavigate`. (`--props Scaffold` is authoritative.)',
    'For a responsive app, branch in JS on the keyed viewport state — `useState`',
    'seeded from `dimensions.getWidth()` plus one `dimensions.addListener()` at',
    'module scope — not on CSS alone. See `src/app.js` in this project.',
    '',
    'Custom widgets follow the same shape every framework widget uses',
    '(`QRCode.js` is the reference):',
    '',
    '```js',
    'export const MyWidget = (props = {}) => {',
    '  const widget = WidgetFactory("div", { ...props, widgetName: "MyWidget" });',
    '  // children, then composeUpdate(widget, ...), then return',
    '};',
    '```',
    '',
    '- Use `composeUpdate()`; never overwrite `container.update`.',
    '- Register resources (listeners, timers, RAF, observers) and release them in an',
    '  idempotent `onUnmount` disposer. Never monkey-patch `_cleanup`.',
    '- State is key-based: `useState("key", 0)` plus subscribers. There is no',
    '  component re-render tree to reason about.',
    '- Reuse the framework utilities (`colors`, `margin`, `padding`, `gradient',
    '  shadow`, `rgba`, `stackPosition`) instead of hand-writing CSS.',
    '',
    'One rendering engine exists: `src/widget-factory/`. Never add a second one, and',
    'never style by reaching around the factory. **If you believe the engine is',
    'broken, prove it with a minimal repro and record the finding in memory** — do',
    'not work around it silently.',
    '',
    '## 4. Design system — one scale, three colors',
    '',
    'A screen is designed, not decorated. Every size and every color on this app',
    'comes from the two lists below. A value outside them is a bug you have to',
    'justify, and `padding: 13` or `#4f46e5` written by hand is the usual sign a',
    'screen drifted away from the rest.',
    '',
    '**Color: three roles, no more.**',
    '',
    '| Role | Token | Where it may appear |',
    '| --- | --- | --- |',
    '| Brand | `colors.primary` | the one action the screen asks for: primary button, active tab, focus ring, links |',
    '| Emphasis | `colors.secondary` | a deliberate second voice: gradients, badges, a highlighted stat |',
    '| Feedback | `colors.success` / `colors.warning` / `colors.danger` | status only — never as decoration |',
    '',
    'Everything else is neutral: `colors.background`, `colors.surface`,',
    '`colors.card`, `colors.text`, `colors.textSecondary`, `colors.textDisabled`,',
    '`colors.border`, `colors.divider`, plus the `gray50`…`gray900` ramp. Rules:',
    '',
    '- A screen uses **one** brand color. Two accent colors competing on one view',
    '  means one of them is wrong.',
    '- Never type a hex or `rgb()` literal. If a token is missing, add it to a',
    '  `theme.js` in this app that re-exports `colors` — do not scatter the value.',
    '- Text on a dark fill is white; hierarchy comes from opacity',
    '  (`rgba(255,255,255,.72)`), not from a second color.',
    '- `error` ≡ `danger` and `*Bg` variants exist for alert fills; use the pair',
    '  (`colors.danger` + `colors.errorBg`), not a hand-mixed tint.',
    '',
    '**Space and type: an 8-based scale.** Use these numbers and nothing between',
    'them. They are plain props (`padding`, `gap`, `margin`, `width`, `height`,',
    '`size`, `radius`) — the factory takes the number, no unit and no `px` string.',
    '',
    '```',
    'spacing   4  ·  hairline, icon inset',
    '          8  ·  tight gaps, chip padding',
    '         12  ·  control padding (input/button height − text)',
    '         16  ·  default card padding, section gap, screen gutter',
    '         18  ·  card-to-card rhythm on a dense grid',
    '         24  ·  between sections',
    '         32  ·  between page blocks',
    '         48  ·  hero spacing',
    'radius     4 / 8 / 12 / 16 / 999 (pill)',
    'type      12 caption · 14 body-small · 16 body · 18 subtitle · 24 title · 32 headline',
    'weight    400 body · 500 label · 600 title · 700 headline',
    'line-height  1.5 body · 1.2 heading',
    '```',
    '',
    '- Padding inside a card is `16`; the gap between cards is `16` or `24`. Never',
    '  mix the two on the same list.',
    '- One text size per element, one weight per role. If a label and its value are',
    '  the same size, the hierarchy is carried by color, not by a fourth size.',
    '- Tap targets are at least `40` on a side; get there with `height`, not padding.',
    '- `useState` bindings, `flex` and `gap` do the layout. Reach for an absolute',
    '  offset only for overlays, and use `stackPosition` rather than raw coordinates.',
    '',
    '## 5. Verification loop (required)',
    '',
    'After every edit, before you say a task is done:',
    '',
    '```bash',
    'npm run check          # static gate: invented widgets/props, positional args,',
    '                       # foreign imports, and broken imports between your own',
    '                       # modules (a name a file never exports)',
    'npm run dev            # serve on :8000 — check the UI actually renders',
    '```',
    '',
    '`npm run check` exits non-zero on a real error. Fix the code, not the checker.',
    'It reads the installed package, so it is always in sync with what runs. A',
    'warning is allowed to stay only when you can justify it in one sentence.',
    '',
    'When the error is a mistyped name, `npm run fix` rewrites it for you — a',
    'relative path that does not resolve, a name the target module never exports,',
    'an identifier used without its `import`, and a prop key the API does not know',
    '(`chilldren` → `children`, `bgColr` → `bgColor`). It only rewrites when exactly',
    'one real name is close enough; anything ambiguous is printed untouched for you',
    'to decide. Run `npm run check` again after it, and read the diff.',
    '',
    '## 6. Memory — do not relearn the same thing',
    '',
    'At the start of every session read `.fletbox/memory/MEMORY.md` and any entry it',
    'points at. That is how this agent remembers the framework between chats instead',
    'of rediscovering it each time.',
    '',
    '- When you learn something non-obvious about this app or the framework, write',
    '  `.fletbox/memory/<kebab-case-topic>.md` with: what (fact or rule), **Why:**',
    '  (the incident or constraint behind it), **How to apply:** (when it kicks in),',
    '  and an absolute date for anything time-bound.',
    '- Add a one-line pointer to it in `MEMORY.md`. Keep the index short.',
    '- One entry per topic, under 10 lines. Update or delete an entry that turns out',
    '  to be wrong rather than appending a correction beside it.',
    '- Commit memory files with the code change they describe.',
    '',
    '## 7. Commands',
    '',
    '| Command | What it does |',
    '| --- | --- |',
    '| `npm run dev` | static dev server on port 8000 |',
    '| `npm run check` | anti-hallucination gate over `src/` |',
    '| `npm run fix` | rewrite mistyped imports and prop names it can prove |',
    '| `npm run check -- --props Button` | print the real props of a widget |',
    '| `flet-box unpack Button` | everything Button accepts **and that actually works** |',
    '| `flet-box unpack Button --example` | a paste-ready call using only live props |',
    '| `flet-box unpack Button --diff` | doc vs code gaps: dead, invented, undocumented |',
    '| `npm run api` | rebuild `.fletbox/api/api.json` + `api.md` for the whole surface |',
    '| `npm run build` | esbuild bundle into `dist/` |',
    '| `flet-box build android` / `ios` | Capacitor native build |',
    '| `flet-box run-native android` | compile and launch on device/emulator |',
    '',
    'Generated by `flet-box create`. To refresh the guide and cheatsheet after a',
    'framework upgrade: `flet-box check-api --emit-api`.',
    '',
  ].join('\n');

export const claudeMd = () =>
  [
    '# CLAUDE.md',
    '',
    'The rules for this project live in [AGENTS.md](./AGENTS.md). Read it first and',
    'follow it exactly — FletBox syntax only, real props only, `npm run check` after',
    'every edit.',
    '',
    'Two shortcuts replace guessing:',
    '',
    '- `flet-box unpack <Widget>` prints every prop the widget really honors, with',
    '  its type, default and engine target. `--example` gives a call you can paste,',
    '  `--diff` lists the props that are documented but dead or used but undeclared.',
    '  `.fletbox/api/api.json` is the same surface for all widgets, as data.',
    '- Design is fixed, not improvised: one brand color per screen from the `colors`',
    '  tokens (never a hex literal), and sizes only from the 8-based scale —',
    '  4 · 8 · 12 · 16 · 18 · 24 · 32 · 48. AGENTS.md §4 has the full table.',
    '',
    'Memory: read `.fletbox/memory/MEMORY.md` before working, and write new entries',
    'there when you learn something the next session should not rediscover.',
    '',
  ].join('\n');

export const cursorRules = () =>
  [
    '---',
    'description: FletBox app rules — real APIs only, no other framework',
    'globs: "**/*.js"',
    'alwaysApply: true',
    '---',
    '',
    'This is a FletBox app (vanilla JS, ESM, offline). The full contract is',
    '[AGENTS.md](../../AGENTS.md); read it before editing.',
    '',
    '- Widgets are function calls returning an element: `Text({ text: "Hi", size: 18 })`.',
    '  No JSX, no positional args, no Flutter/Vue/Svelte/React syntax or imports.',
    '- Before using a widget or prop you have not just seen in',
    '  `.fletbox/api/cheatsheet.md`, look it up: `flet-box unpack <Widget>` (or',
    '  `npm run check -- --props <Widget>`). If it is not listed, it does not exist —',
    '  do not invent it. `unpack --example` prints a call that is safe to paste.',
    '- Design rules: one brand color per screen, taken from the `colors` tokens —',
    '  never a hex literal. Sizes come from the 8-based scale only:',
    '  4 · 8 · 12 · 16 · 18 · 24 · 32 · 48 spacing, radii 4/8/12/16/999, type',
    '  12/14/16/18/24/32. See AGENTS.md §4.',
    '- Run `npm run check` after every change and fix what it reports.',
    '- Check `.fletbox/memory/MEMORY.md` at session start; record new non-obvious',
    '  findings there instead of re-deriving them.',
    '',
  ].join('\n');

export const memoryIndexMd = (appName) =>
  [
    '# Memory index',
    '',
    `Persistent notes for the AI agent working on \`${appName}\`. One line per entry.`,
    'Read this at the start of every session; open the files it points at.',
    '',
    '- [Project baseline](notes/baseline.md) — template, flet-box version, verified commands',
    '',
  ].join('\n');

export const memoryBaselineMd = (appName, template, version) =>
  [
    '---',
    'name: project-baseline',
    'description: What this app is, which FletBox version it runs, and the commands that are known to work',
    'metadata:',
    '  type: project',
    '---',
    '',
    `App \`${appName}\` created with \`flet-box create\` using the \`${template}\` template,`,
    `against \`flet-box@${version}\`. Vanilla JS, ESM, no runtime dependencies, offline.`,
    '',
    '**Why:** the agent needs the version and shape of the project up front; API names',
    'and templates shift between releases, and re-deriving them costs tokens every session.',
    '',
    '**How to apply:** trust this for the project layout. For props and widget names,',
    'trust `.fletbox/api/cheatsheet.md` and `npm run check`, not memory — that file is',
    'regenerated from the installed package and this one is not.',
    '',
    'Verified commands: `npm run dev` (:8000), `npm run check`, `npm run build`.',
    '',
  ].join('\n');

export const checkAppScript = (appName) =>
  [
    '// scripts/check-app.mjs',
    `// Anti-hallucination gate for ${appName}: every widget, prop and import in src/`,
    '// is checked against the flet-box package that is actually installed.',
    '//',
    '//   npm run check                    scan src/',
    '//   npm run check -- --props Button  print the real props of a widget',
    '//   npm run check -- --list          list every public export',
    '//   npm run check -- --json          machine-readable findings',
    '//',
    '// The package exports map only publishes "." and "./package.json", so the',
    "// checker's own file is imported by URL rather than by specifier.",
    '',
    "import path from 'node:path';",
    "import { createRequire } from 'node:module';",
    "import { pathToFileURL } from 'node:url';",
    '',
    "const require = createRequire(import.meta.url);",
    '',
    'function resolvePackage() {',
    "  const candidates = [path.resolve(process.cwd(), 'node_modules/flet-box')];",
    '  try {',
    "    candidates.push(path.dirname(require.resolve('flet-box/package.json')));",
    '  } catch {',
    '    /* not installed yet */',
    '  }',
    '  for (const dir of candidates) {',
    "    if (require('fs').existsSync(path.join(dir, 'bin/commands/checkApi.js'))) {",
    '      return dir;',
    '    }',
    '  }',
    "  console.error('flet-box package not found. Run: npm install');",
    '  process.exit(1);',
    '}',
    '',
    "const pkgDir = resolvePackage();",
    "const checker = path.join(pkgDir, 'bin', 'commands', 'checkApi.js');",
    "const { checkApi } = await import(pathToFileURL(checker).href);",
    '',
    "const { exitCode } = await checkApi(process.argv.slice(2));",
    'process.exit(exitCode);',
    '',
  ].join('\n');
