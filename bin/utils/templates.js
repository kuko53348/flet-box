// bin/utils/templates.js

export const indexHtml = (appName = "FletBox App") => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

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
  "name": ${JSON.stringify(name)},
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bash run.sh",
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
)}
`;

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

console.log("Android launcher icons generated from assets/logo.png.");
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
const splashContents = await readContents(splashSet);
const splashSlots = splashContents.images.filter((image) => image.filename);

for (const slot of splashSlots) {
  const target = path.join(splashSet, slot.filename);
  const metadata = await sharp(target).metadata();
  const side = metadata.width && metadata.width === metadata.height ? metadata.width : 2732;
  const badge = await sharp(logo)
    .resize(Math.round(side * 0.3), Math.round(side * 0.3), { fit: "contain" })
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

// make sure to export all screens in screens/index.js for easier imports
import RootScreen from './screens/RootScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import AboutScreen from './screens/AboutScreen.js';

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
import { runApp, Scaffold, colors, useWindowSize } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';

// make sure to export all screens in screens/index.js for easier imports
import RootScreen from './screens/RootScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import AboutScreen from './screens/AboutScreen.js';

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

export const adaptiveAppJs =
  () => `// app.js - Adaptive template (mobile + desktop)
import { runApp, Scaffold, colors, useWindowSize } from 'flet-box';
import { AppBarComponent } from './components/layouts/AppBarComponent.js';
import { DrawerMenu } from './components/layouts/DrawerMenu.js';
import { BottomNav } from './components/layouts/BottomNav.js';
import { Sidebar } from './components/layouts/Sidebar.js';

// make sure to export all screens in screens/index.js for easier imports
import RootScreen from './screens/RootScreen.js';
import HomeScreen from './screens/HomeScreen.js';
import AboutScreen from './screens/AboutScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';

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
