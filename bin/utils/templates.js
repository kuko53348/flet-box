// bin/utils/templates.js

import * as skills from "./skills.js";

/**
 * The plate behind everything a reader sees before the app paints: the PWA
 * splash (`manifest.json`), the Android and iOS launch screens, the adaptive
 * icon background, and the static `<meta name="theme-color">`.
 *
 * It is the dark palette's `surface` — the zinc scale the 2026-10 design rebuild
 * moved to, replacing the indigo shell color that stayed in the scaffold and kept
 * showing on installed PWAs long after the app itself had changed color. One
 * value because a native splash cannot follow a theme; `applyPalette()` writes
 * the live palette onto `<meta name="theme-color">` at runtime, so the bars do.
 */
export const SHELL_BRAND = "#18181b";

/** `SHELL_BRAND` as the channels the icon and splash scripts composite with. */
export const SHELL_BRAND_RGB = { r: 24, g: 24, b: 27 };

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

    <meta name="theme-color" content="${SHELL_BRAND}">

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
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.log('Service Worker registration error', err));
        }
    </script>
    <script type="module" src="src/app.js"></script>
</body>
</html>`;


export const rootScreenJs = () => `// screens/RootScreen.js
// This screen is a reference implementation of the app's own design contract:
// colors only from the tokens, spacing/radius/type only from the scale, one
// filled action per screen. The gate that enforces it is 'npm run ui'.
import { Container, Column, Text, Button, Icon, colors, goTo } from 'flet-box';

export const RootScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            alignItems: 'center',
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 16,
                    backgroundColor: colors.primaryBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 48, color: colors.primary })
                }),
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'FletBox', size: 40, weight: 'bold', color: colors.text }),
                        // A lead is a sentence, not a paragraph: at desktop width this
                        // line would sit on 120 characters and no eye can track it.
                        Text({
                            text: 'A screen, in plain JavaScript.',
                            size: 16,
                            color: colors.textSecondary,
                            align: 'center'
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    alignItems: 'stretch',
                    maxWidth: 280,
                    children: [
                        // A filled Button defaults to colors.surface, not to the brand:
                        // the primary action has to name the fill it wants.
                        Button({
                            text: 'See the design system',
                            iconRight: 'arrow_forward',
                            bgColor: colors.primary,
                            color: colors.onPrimary,
                            fullWidth: true,
                            onPress: () => goTo('/home')
                        }),
                        // One accent per screen: everything that is not the ask is quiet.
                        Button({
                            text: 'Preferences',
                            variant: 'text',
                            color: colors.text,
                            fullWidth: true,
                            onPress: () => goTo('/about')
                        })
                    ]
                })
            ]
        })
    });
};

export default RootScreen;
`;

export const homeScreenJs = () => `// screens/HomeScreen.js
// The screen that shows what the app is built on. Every number on this page is a
// member of the framework's own scale, so the page documents the system it uses:
// change one to an off-scale value and 'npm run ui' reports it.
import { Container, Column, Row, Text, Icon, Chip, colors } from 'flet-box';

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

const SPACING_STEPS = [4, 8, 12, 16, 24, 32, 48, 64];

const TYPE_STEPS = [
    { size: 12, label: 'Caption' },
    { size: 14, label: 'Body' },
    { size: 18, label: 'Title' },
    { size: 24, label: 'Headline' },
    { size: 32, label: 'Display' }
];

// Three roles, and each one says when it is allowed on the page. A fourth would
// be decoration looking for a reason.
const COLOR_ROLES = [
    { token: 'primary', text: 'Brand', note: 'the one action this screen asks for' },
    { token: 'successStrong', text: 'Feedback', note: 'status, never ornament' },
    { token: 'dangerStrong', text: 'Danger', note: 'the red that carries words' }
];

export const HomeScreen = () => {
    return Container({
        flex: 1,
        padding: 24,
        overflow: 'auto',
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            // A reading column, not a full-width one: at 1400px a line of body
            // text becomes unreadable, so the measure is capped and centred.
            maxWidth: 640,
            margin: '0 auto',
            children: [
                Column({
                    gap: 8,
                    children: [
                        Text({ text: 'The system this app is built on', size: 32, weight: 'bold', color: colors.text }),
                        Text({
                            text: 'Three roles, one rhythm, one type scale. Nothing here is typed by hand.',
                            size: 16,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Spacing', size: 18, weight: 'bold', color: colors.text }),
                        Row({
                            gap: 12,
                            alignItems: 'end',
                            // Eight squares plus their labels need ~300 units. Without
                            // wrapping they overflow a narrow column — a sidebar on a
                            // small window, or this same screen beside a desktop nav.
                            wrap: true,
                            children: SPACING_STEPS.map((step) =>
                                Column({
                                    // Column is a 100%-wide block by default — the
                                    // right answer for a page, the wrong one for eight
                                    // cells in a row, where it makes them share the
                                    // width out and the squares drift apart.
                                    width: 'auto',
                                    gap: 8,
                                    alignItems: 'center',
                                    children: [
                                        Container({
                                            width: step,
                                            height: step,
                                            borderRadius: 4,
                                            backgroundColor: colors.primaryBg,
                                            border: '1px solid ' + colors.border
                                        }),
                                        Text({ text: String(step), size: 12, color: colors.textSecondary })
                                    ]
                                })
                            )
                        }),
                        Text({
                            text: 'These are framework units, not pixels: raise the browser font size and every square, gap and corner grows with the text.',
                            size: 14,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Type', size: 18, weight: 'bold', color: colors.text }),
                        Column({
                            gap: 8,
                            children: TYPE_STEPS.map((step) =>
                                Row({
                                    gap: 12,
                                    alignItems: 'center',
                                    children: [
                                        Text({ text: step.label, size: step.size, weight: 'bold', color: colors.text }),
                                        Text({ text: String(step.size), size: 12, color: colors.textSecondary })
                                    ]
                                })
                            )
                        })
                    ]
                }),
                Column({
                    gap: 12,
                    children: [
                        Text({ text: 'Color roles', size: 18, weight: 'bold', color: colors.text }),
                        Column({
                            gap: 8,
                            children: COLOR_ROLES.map((role) =>
                                Row({
                                    gap: 12,
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 12,
                                    backgroundColor: colors.surface,
                                    children: [
                                        Icon({ name: 'palette', size: 24, color: colors[role.token] }),
                                        Column({
                                            gap: 4,
                                            flex: 1,
                                            children: [
                                                Text({ text: role.text, size: 16, weight: 'bold', color: colors.text }),
                                                Text({ text: role.note, size: 14, color: colors.textSecondary })
                                            ]
                                        }),
                                        // The token name is the lesson; a Chip is how a
                                        // framework value gets shown without becoming a
                                        // colour of its own.
                                        Chip({ label: role.token, variant: 'outlined', color: colors.textSecondary, size: 12 })
                                    ]
                                })
                            )
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
// Preferences, written the way the rest of the app should be written: state that
// survives a re-render, a control that names itself, validation that speaks
// instead of disabling, and one filled button per screen.
import {
    Container,
    Column,
    Row,
    Text,
    Button,
    Input,
    Dropdown,
    Switch,
    Slider,
    Divider,
    Tooltip,
    Icon,
    SnackBar,
    AlertDialog,
    Storage,
    colors,
    useState,
    setTheme,
    getTheme,
    setBaseFontSize,
    getBaseFontSize
} from 'flet-box';

// Key-based RAM keeps a value across re-renders and hot reloads; localStorage is
// what keeps a choice across sessions. A preferences screen that writes neither
// is a form that lies, so the size is read back at boot — before the first
// render, and before the draft below seeds itself from the live value.
const storedSize = Storage.getData('baseFontSize');
if (storedSize) setBaseFontSize(storedSize);

const [draftSize, setDraftSize] = useState('prefFontSize', getBaseFontSize());

// The destructive action is built once, at module scope. The dialog puts Cancel
// first on its own: the way out is the first thing the eye lands on.
const resetDialog = AlertDialog({
    title: 'Reset the text size?',
    message: 'It goes back to 16, the size this browser asks for.',
    variant: 'danger',
    confirmText: 'Reset',
    cancelText: 'Keep it',
    onConfirm: () => {
        setDraftSize(16);
        setBaseFontSize(16);
        // Resetting is the absence of a preference, not a new one: the key goes
        // away, so the next boot answers to the browser again.
        Storage.deleteData('baseFontSize');
        SnackBar({ message: 'Text size reset', type: 'success' }).show();
    }
});

// Validation runs before the action, so the error is a message and never a
// disabled button the user has to discover.
const save = (name, region) => {
    if (name.length === 0) {
        return SnackBar({ message: 'Give the profile a name first', type: 'error' }).show();
    }
    const size = draftSize.valueOf();
    setBaseFontSize(size);
    Storage.saveData('baseFontSize', size);
    Storage.saveData('displayName', name);
    Storage.saveData('region', region.valueOf());
    SnackBar({ message: 'Preferences saved', type: 'success' }).show();
};

export const AboutScreen = () => {
    const [name, setName] = useState('prefName', Storage.getData('displayName') || '');
    const [region, setRegion] = useState('prefRegion', Storage.getData('region') || '');
    const isDark = getTheme() === 'dark';
    const size = draftSize.valueOf();

    return Container({
        flex: 1,
        padding: 24,
        overflow: 'auto',
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            maxWidth: 480,
            margin: '0 auto',
            children: [
                Column({
                    gap: 8,
                    children: [
                        Text({ text: 'Preferences', size: 32, weight: 'bold', color: colors.text }),
                        Text({
                            text: 'Every control writes a real framework value: the slider moves the base font, the whole app rescales, and Save remembers it for the next visit.',
                            size: 16,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Input({
                    label: 'Display name',
                    placeholder: 'How the app should greet you',
                    value: name.valueOf(),
                    required: true,
                    onChange: (value) => setName(value)
                }),
                Dropdown({
                    label: 'Region',
                    options: [
                        { value: 'cl', label: 'Chile' },
                        { value: 'es', label: 'Spain' },
                        { value: 'mx', label: 'Mexico' }
                    ],
                    placeholder: 'Where you are',
                    value: region.valueOf(),
                    onChange: (value) => setRegion(value)
                }),
                Divider(),
                // A toggle that never says what it switches is a mystery control: the
                // label is part of the Switch, and the row is the tap target.
                Switch({
                    label: 'Dark theme',
                    value: isDark,
                    activeColor: colors.primary,
                    onPress: (value) => setTheme(value ? 'dark' : 'light')
                }),
                Column({
                    gap: 8,
                    children: [
                        Row({
                            gap: 12,
                            alignItems: 'center',
                            children: [
                                Text({ text: 'Text size', size: 16, weight: 'bold', color: colors.text }),
                                Text({ text: size + 'px', size: 14, color: colors.textSecondary })
                            ]
                        }),
                        Slider({
                            min: 14,
                            max: 22,
                            step: 1,
                            value: size,
                            color: colors.primary,
                            onPress: (value) => setDraftSize(value)
                        }),
                        Text({
                            text: '16 is what the browser asks for. Anything larger is the reader asking to be readable.',
                            size: 14,
                            color: colors.textSecondary
                        })
                    ]
                }),
                Divider(),
                Column({
                    gap: 12,
                    children: [
                        // One filled button per screen: it is the thing this screen asks
                        // for, and it is the only control on the page that stretches —
                        // a full-width target is a decision, not a layout default.
                        Button({
                            text: 'Save preferences',
                            iconLeft: 'check',
                            bgColor: colors.primary,
                            color: colors.onPrimary,
                            fullWidth: true,
                            onPress: () => save(name.valueOf(), region.valueOf())
                        }),
                        Row({
                            gap: 12,
                            alignItems: 'center',
                            children: [
                                // A second, quieter action: text variant, danger token,
                                // and it asks before it destroys.
                                Button({
                                    text: 'Reset the size',
                                    iconLeft: 'restart_alt',
                                    variant: 'text',
                                    color: colors.dangerStrong,
                                    onPress: () => resetDialog.open()
                                }),
                                // An icon alone says nothing; the Tooltip is its name.
                                Tooltip({
                                    text: 'Resetting the size is not undoable from this screen',
                                    position: 'right',
                                    child: Icon({ name: 'help_outline', size: 24, color: colors.textSecondary })
                                })
                            ]
                        })
                    ]
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
            padding: 24,
            backgroundColor: colors.surface,
            borderBottom: \`1px solid \${colors.border}\`,
            child: Column({
                gap: 12,
                alignItems: 'center',
                children: [
                    Container({
                        width: 60,
                        height: 60,
                        borderRadius: 999,
                        backgroundColor: colors.primaryBg,
                        justifyContent: 'center',
                        alignItems: 'center',
                        child: Icon({ name: 'rocket_launch', size: 32, color: colors.primary })
                    }),
                    Text({ text: 'FletBox', size: 18, weight: 'bold', color: colors.text }),
                    Text({ text: 'Starter app', size: 12, color: colors.textSecondary })
                ]
            })
        }),
        body: [
            DrawerItem({ 
                icon: 'palette', 
                label: 'Design system', 
                route: '/home',
                onPress: () => closeDrawer()
            }),
            DrawerItem({ 
                icon: 'tune', 
                label: 'Preferences', 
                route: '/about',
                onPress: () => closeDrawer()
            }),
            DrawerItem({ 
                icon: 'home', 
                label: 'Start here', 
                route: '/',
                onPress: () => closeDrawer()
            })
        ],
        footer: Container({
            padding: 16,
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
// The app's whole design system lives here. Every value is measured with the
// framework's own \`color().contrastRatio()\` against the surface it is written on:
// the number sits next to the pair that needs it, because a token that cannot
// carry AA text is decoration, not a color.
import { registerPalette } from 'flet-box';

export const lightColors = {
    // #6366f1 put white on 4.47:1 — a hair under AA. Two units darker measures
    // 4.55:1, the same indigo, and every brand button passes.
    primary: '#6165ef',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    // The error signal: a badge, a border, an icon. 3.76:1 as words on this page,
    // so it is never the label of a button.
    danger: '#ef4444',
    // The readable red, both ways: 6.47:1 as words on white, 6.47:1 with white
    // written on it, 5.42:1 inside \`errorBg\`. Use it for the words and the plate.
    dangerStrong: '#b91c1c',
    // The readable green and amber: 5.48:1 and 5.02:1, in both directions, so
    // they may be a label, an icon that carries meaning, or a plate.
    successStrong: '#047857',
    warningStrong: '#b45309',
    // \`*Plate\` is the fill white words sit on. On this page it is the same tone
    // as the matching Strong, and it is a separate name because on a dark page the
    // two part ways: the readable red goes light, the plate goes dark.
    dangerPlate: '#b91c1c',
    successPlate: '#047857',
    warningPlate: '#b45309',
    // \`info\` (#3b82f6) carries white at 3.68:1, so a filled chip or a tooltip in
    // the info hue needs this one: 6.70:1 in both directions.
    infoStrong: '#1d4ed8',
    infoPlate: '#1d4ed8',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    border: '#e2e8f0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    // What to write on a brand fill, and the soft tints that replace
    // \`colors.primary + '15'\`.
    onPrimary: '#ffffff',
    primaryBg: '#eef2ff',
    // The translucent surface for a card with \`backdropFilter\`. A token, so the
    // app never hand-writes an \`rgba()\` the clean-UI gate would reject.
    glass: 'rgba(255, 255, 255, 0.66)',
    glassBorder: 'rgba(255, 255, 255, 0.75)',
    error: '#ff3b30',
    errorBg: '#ffe5e5',
    successBg: '#e5f5e5',
    warningBg: '#fff5e5',
    infoBg: '#e5f5ff',
    divider: '#eeeeee',
    card: '#ffffff'
};

export const darkColors = {
    primary: '#818cf8',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    // On a dark page the light red is the readable one: 6.45:1 against the
    // background. The plate a person presses goes the other way.
    danger: '#f87171',
    // \`*Strong\` is the answer to "what may I write words in?" and on this page
    // that is the light end of the ladder: 9.41:1, 11.71:1, 12.38:1 on the
    // background — all AA, and a step clearer than the signal tone above.
    dangerStrong: '#fca5a5',
    successStrong: '#6ee7b7',
    warningStrong: '#fcd34d',
    // \`*Plate\` is the fill with white words on it, and that has to go dark here:
    // 10.02:1, 9.11:1, 9.07:1. These are the tones that used to hide inside
    // \`*Strong\`, which is why a delete written in \`dangerStrong\` was invisible.
    dangerPlate: '#7f1d1d',
    successPlate: '#14532d',
    warningPlate: '#78350f',
    infoStrong: '#93c5fd',
    infoPlate: '#1e40af',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    border: '#334155',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    // #818cf8 is a light fill: white on it is 2.98:1, the page's own ink is 5.98:1.
    onPrimary: '#0f172a',
    primaryBg: '#1e1b4b',
    glass: 'rgba(30, 41, 59, 0.66)',
    glassBorder: 'rgba(226, 232, 240, 0.22)',
    error: '#f87171',
    errorBg: '#3b1113',
    successBg: '#0c2f22',
    warningBg: '#33230a',
    infoBg: '#12263c',
    divider: '#1e293b',
    card: '#1e293b'
};

// Declaring a palette paints nothing by itself: every widget reads the
// framework's live \`colors\`, so the tokens have to be registered into it.
// Registration deliberately does not pick a theme — whether the app is dark is
// the reader's answer (\`setTheme\`, \`toggleTheme\`), not the designer's.
registerPalette('light', lightColors);
registerPalette('dark', darkColors);
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

      // A page load that neither the host nor the cache can answer must still
      // boot the app: the router takes the URL from there. Asset requests keep
      // their own failure, because replacing a missing image with a document is
      // how a broken site becomes an undebuggable one.
      const shell = async () => {
        if (req.mode !== 'navigate') return null;
        const cached = await cache.match(BASE + 'index.html');
        if (cached) return cached;
        try {
          const fresh = await fetch(BASE + 'index.html', { cache: 'no-store' });
          return fresh.ok ? fresh : null;
        } catch (err) {
          return null;
        }
      };

      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh.ok) {
          cache.put(req, fresh.clone());
          return fresh;
        }
        // A host without SPA rewrites (GitHub Pages, a plain bucket) answers an
        // unknown path with its own 404 page. That is a response, not an error,
        // so a fallback living in the catch below never runs and every reload of
        // a deep link shows "Page not found" while the app is perfectly healthy.
        const fallback = await shell();
        return fallback || fresh;
      } catch (err) {
        const cached = await cache.match(req);
        if (cached) return cached;
        const fallback = await shell();
        if (fallback) return fallback;
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
    "ui": "node scripts/check-ui.mjs",
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
    backgroundColor: SHELL_BRAND,
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
const background = { r: ${SHELL_BRAND_RGB.r}, g: ${SHELL_BRAND_RGB.g}, b: ${SHELL_BRAND_RGB.b} };

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
await writeFile(backgroundPath, xml.replace(backgroundColor, "$1${SHELL_BRAND}$2"));

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

// Brand background, the same value as theme-color in index.html and manifest.json.
const background = { r: ${SHELL_BRAND_RGB.r}, g: ${SHELL_BRAND_RGB.g}, b: ${SHELL_BRAND_RGB.b} };
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
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "theme_color": "${SHELL_BRAND}",
  "background_color": "${SHELL_BRAND}",
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

// GitHub Actions workflow that builds and publishes the WEB. Two jobs, the way
// the docs site does it: `build` checks and bundles `www/` and only *uploads* it,
// `deploy` is the sole job that can touch Pages — so a build that fails leaves
// the live site alone. The native builds are a second file (build-native.yml)
// that only runs when started by hand.
// NOTE: every GitHub `${{ }}` expression is escaped as `\${{ }}` because this is
// a JS template literal — an unescaped `${` would be parsed as interpolation.
//
// `siteUrl` is the Pages address `flet-box create` derived from `--repo`. It is
// written into the file as text, at the top, the way the docs repo states its
// own: whoever opens build.yml on GitHub reads where this app lives before
// reading a single step. Anything that is not an http(s) URL is refused, so a
// caller that passes the wrong thing gets the placeholder rather than a lie —
// and the placeholder keeps `TU-USUARIO` visible, because that is the one string
// the developer must edit.
export const githubWorkflow = (appName = "FletBox App", siteUrl = null) => {
  const slug = String(appName)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "fletbox-app";
  const site = /^https?:\/\//i.test(String(siteUrl || ""))
    ? String(siteUrl).replace(/\/?$/, "/")
    : `https://TU-USUARIO.github.io/${slug}/`;
  // Only when the owner is still a guess: the address lives in two files, and a
  // developer who edits one and not the other ships an app that polls a site
  // that is not where the bundle is.
  const todo = site.includes("TU-USUARIO")
    ? `# The owner above is a placeholder: this project was created without \`--repo\`,
# so the folder name is only a guess at the repo name. Write the real address in
# both files that state it — this header, and fletbox.config.json (update.url),
# which is the URL an installed app polls for an update.
`
    : "";
  return `name: Deploy ${appName}

# This app goes live at:
#   ${site}
${todo}#
# Web: AUTOMATIC. Every push to main (and every manual run) builds a fresh site;
# only the deploy job can touch Pages, so a broken bundle never replaces the
# live one. Enable the destination once: Settings -> Pages -> Build and
# deployment -> Source: GitHub Actions. Until you do, runs are green and no site
# exists — the "Where this lives" step below says so in the log.
#
# Android and iOS are NOT here: they live in build-native.yml and run only when
# you start them, because a macOS runner is not free.
#
# One consequence to know about: this Pages site is also what an installed app
# polls for an OTA update (www/config.json), and the app compares the bundle
# hash, not the version. So the manifest is left out of every build whose commit
# carries no \`v*\` tag (see "Ship the update feed only when this commit is a
# release" below): the site is live on every push, while installed apps keep
# running the last \`flet-box release\`.
#
# Publishing a release: push main, then \`git tag -a v1.2.3 && git push origin
# v1.2.3\`, then Actions -> this workflow -> Run workflow. The manual run deploys
# the tagged commit, and it is the run that puts config.json on the site. The tag
# itself cannot deploy: GitHub refuses Pages deployments that start from a tag.

on:
  push:
    branches: [ main ]
    # Deliberately NO tags: trigger. The github-pages environment only accepts
    # deployments from the default branch, so a run that starts from a tag fails
    # at the deploy job with "Tag v1.0.0 is not allowed to deploy to github-pages
    # due to environment protection rules". A release is therefore made by
    # pushing main and then running this workflow again, by hand, once the tag
    # exists: that run is on main, and it sees the tag on HEAD.
  workflow_dispatch:

# The deploy job needs Pages write access; it is declared once, for the file.
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run
# in-progress and the latest queued. Do NOT cancel in-progress: a production
# deployment is allowed to finish, because the site that is live while it runs is
# the previous one, and a cancelled deploy leaves Pages holding a half-written
# artifact.
concurrency:
  group: pages
  cancel-in-progress: false

# The generated app depends on the public \`flet-box\` npm package. If you
# develop against a local copy, publish it (or vendor it) before these jobs can
# \`npm install\` it. package-lock.json is gitignored, so we use npm install.

jobs:
  # ---------- BUILD: check, bundle, upload. Nothing here reaches Pages. ----------
  build:
    name: Build site
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          # The release decision below reads the tags pointing at this commit, and
          # a shallow checkout of one commit does not fetch them by itself.
          fetch-tags: true

      # Registers the Pages integration for this run and reports the site's base
      # path, which is /<repo>/ for a project site and empty on a custom domain.
      # It belongs in the build job, before the artifact is uploaded.
      - name: Setup Pages
        uses: actions/configure-pages@v5

      - uses: actions/setup-node@v5
        with:
          # 22 is the current LTS. 20 is EOL, and the runner says so on every
          # build of a generated app.
          node-version: 22

      - name: Install dependencies
        run: npm install

      # Fails the build on an invented widget/prop, a positional widget call or a
      # foreign-framework import. See AGENTS.md section 4.
      - name: Check app API usage (npm run check)
        run: npm run check

      - name: Build site (flet-box createBundle www)
        run: npm run build

      # Printed before the deploy, because this is the address the whole workflow
      # is about, and because a missing Pages setting otherwise shows up as a
      # green run with no site: Pages lower-cases the owner, hence the tr.
      # The file header names one address too; this is the authority, because it
      # reads the repo the run actually belongs to — they disagree when the repo
      # was created with a different name than the folder, or never pushed.
      - name: Where this lives
        run: |
          owner=$(printf '%s' "$GITHUB_REPOSITORY_OWNER" | tr '[:upper:]' '[:lower:]')
          repo=\${GITHUB_REPOSITORY#*/}
          echo "  site:    https://$owner.github.io/$repo/"
          echo "  header:  ${site}"
          echo "  version: $(node -p "require('./package.json').version")"
          echo "  If a green run leaves that 404, the source is wrong:"
          echo "  Settings -> Pages -> Build and deployment -> Source: GitHub Actions"

      # www/config.json is the OTA manifest: an installed app fetches it and
      # compares its \`hash\` with the bundle it is running, so publishing it from
      # an ordinary push would offer that unfinished build to every device that
      # checks for updates. Dropping the file makes the poll fail as "not
      # deployed yet" (see bin/ota/loader.js), which is the behaviour wanted:
      # the site is live for reading, the release feed stays on tagged builds.
      #
      # The decision reads the commit, not the ref: a tag push cannot deploy (the
      # environment refuses it), so \`github.ref\` is always a branch here. To
      # publish a release, push main, tag that commit, then run this workflow by
      # hand from Actions - the manual run is on main and sees the tag.
      - name: Ship the update feed only when this commit is a release
        run: |
          tag=$(git tag --points-at HEAD --list 'v*' | sort -V | tail -1)
          if [ -n "$tag" ]; then
            echo "  ota:     $tag is on this commit: config.json ships, installed apps may update"
          else
            rm -f www/config.json
            echo "  ota:     web-only: no v* tag on $(git rev-parse --short HEAD), manifest left out"
          fi

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: www

  # ---------- DEPLOY: the only job with a path to Pages ----------
  deploy:
    name: Deploy to Pages
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5

      # The address in the job log and as a run annotation, so it is readable
      # from the workflow list without opening anything.
      - name: Published
        run: |
          echo "  live at: \${{ steps.deployment.outputs.page_url }}"
          echo "::notice title=Site published to GitHub Pages::\${{ steps.deployment.outputs.page_url }}"
`;
};

// Native builds: the same two jobs, but they run ONLY when started by hand from
// Actions -> Run workflow, with a choice of platform. A push never pays for a
// macOS runner, and `flet-box build android|ios` already covers a local build.
export const nativeWorkflow = (appName = "FletBox App") => {
  const slug = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "fletbox-app";
  return `name: Build ${appName} — native (manual)

# Nothing in here runs on a push. Start it by hand: Actions -> "${appName} —
# native (manual)" -> Run workflow, then pick the platform. Each job bundles the
# web first, because that bundle is what Capacitor copies into the app.

on:
  workflow_dispatch:
    inputs:
      platform:
        description: "What to build"
        type: choice
        options:
          - android
          - ios
          - both
        default: android

permissions:
  contents: read

jobs:
  # ---------- ANDROID: debug APK ----------
  android:
    name: Android (APK)
    if: inputs.platform == 'android' || inputs.platform == 'both'
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

      # An artifact has no public URL: it is on the run page, and this prints
      # which run. The debug APK installs as it is; a release one would have to be
      # signed with your own keystore first.
      - name: Where the APK is
        run: |
          echo "  artifact: ${slug}-android-debug"
          echo "  download: $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
          echo "::notice title=APK ready::${slug}-android-debug, on this run page"

  # ---------- iOS: simulator build ----------
  ios:
    name: iOS (simulator)
    if: inputs.platform == 'ios' || inputs.platform == 'both'
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

      - name: Where the build is
        run: |
          echo "  artifact: ${slug}-ios-simulator"
          echo "  download: $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
          echo "::notice title=Simulator build ready::${slug}-ios-simulator, on this run page"
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

FletBox app with 3 screens: Root, Home (the design system) and About
(preferences), plus Drawer menu. Read \`src/screens/HomeScreen.js\` first: it is
the contract this app is built on, and \`npm run ui\` enforces it.
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
- \`skills/\` — four files, one per subject, mirrored into \`.claude/skills/\`,
  \`.qoder/skills/\` and \`.cursor/rules/\` so any assistant reads the same contract:
  \`fletbox-rules\` (FletBox only, look an API up before using it, the rem contract),
  \`fletbox-design\` (the numbered design rules — tokens, the scale, hierarchy, the
  four states, measured contrast, the dated tells), \`fletbox-motion\` (when a screen
  may move and through which widget) and \`fletbox-memory\` (the journal that hands
  progress from one AI to the next). \`AGENTS.md\` §0 is the index.
- \`.claude/CLAUDE.md\`, \`.cursor/rules/fletbox.mdc\` — short pointers to \`AGENTS.md\` for
  Claude Code and Cursor.
- \`.fletbox/api/cheatsheet.md\` — every widget and its real props, generated from the
  installed package. This is the lookup an agent reads instead of the framework.
- \`.fletbox/api/api.json\` — the same surface as data: per prop its engine target,
  default, aliases and a \`sample\` value the types prove works. Write calls from this.
- \`.fletbox/memory/\` — notes the agent keeps between sessions, so it does not
  rediscover the same thing twice.
- \`scripts/check-app.mjs\` — the gate that catches hallucinated APIs.
- \`scripts/check-ui.mjs\` — the gate that catches an unclean screen.

\`\`\`bash
npm run check                      # scan src/ for invented widgets, props, imports
npm run check -- --props Button    # print the real props of one widget
npm run check -- --list            # print every public export
npm run ui                         # clean-UI gate: tokens, scale, tap targets, labels,
                                   # contrast — each finding cites the rule it broke
npm run ui -- --tokens             # measured contrast of every token, on both surfaces
npm run ui -- --strict             # warnings (a one-off tint, an image with no alt) fail too
npm run fix                        # rewrite typos it can prove (imports, prop keys)
npm run api                        # regenerate .fletbox/api/api.json and api.md
flet-box unpack Button             # each prop, where it really goes, and what is dead
flet-box unpack Button --example   # a paste-ready call using only verified props
flet-box unpack Modal --diff       # where types, engine, docs and code disagree
\`\`\`

\`npm run check\` and \`npm run ui\` exit non-zero on a real error and also run in CI. If
you upgrade \`flet-box\`, regenerate the cheatsheet with \`flet-box check-api --emit-api\`
and the machine-readable surface with \`npm run api\`.

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
launch background is the app brand color \`${SHELL_BRAND}\`, which lives in
\`scripts/sync-ios-assets.mjs\`.

Capacitor uses a local HTTPS origin (\`https://localhost\`) in the Android and
iOS WebViews. If the app calls a remote API, allow that origin in the API's
CORS configuration and use HTTPS for the remote service.

## Continuous Integration (GitHub Actions)

Two workflow files ship with the project, and they answer to different triggers:

- \`.github/workflows/build.yml\` — **the web, automatic**. Every push to \`main\`
  (and a manual run) builds \`www/\` and publishes it to **GitHub Pages**, in two
  jobs: **Build site** checks the app, bundles it and uploads the result; **Deploy
  to Pages** is the only job that can replace the live site, so a bundle that
  fails to build leaves the current one running. A \`v*\` tag is deliberately not
  a trigger: the Pages environment refuses a run that starts from a tag, so the
  release is deployed by running this workflow again after tagging.
- \`.github/workflows/build-native.yml\` — **Android and iOS, manual only**. Nothing
  runs on a push. Open **Actions → "… — native (manual)" → Run workflow** and pick
  \`android\`, \`ios\` or \`both\`. Each job uploads its build as a run artifact and
  prints the artifact name and the run URL in its own log.

### Publish the web (one-time setup)

1. Push this project to a GitHub repository.
2. Open **Settings → Pages** in that repo.
3. Set **Source** to **GitHub Actions** (not "Deploy from a branch"). Skip this
   and the deploy step fails on every push.
4. Push. The **Where this lives** step prints the address before the deploy runs,
   and the **Published** step prints it again as a run annotation, so you do not
   have to hunt for the environment box under the job.

The address this project publishes to is written at the top of
\`.github/workflows/build.yml\`. \`flet-box create <name> --repo <user>/<repo>\`
fills it in from the repo; without \`--repo\` it stays
\`https://TU-USUARIO.github.io/<name>/\`, and the header says which two files to
edit. That is a sub-path, so \`index.html\` uses relative asset paths and works
without changes.

**Why a push does not update anyone's app:** this same address is the OTA feed
installed apps poll, and the update check compares bundle **hashes**, not version
numbers. So the workflow leaves \`www/config.json\` out of every artifact that is
not a \`v*\` tag: the site is live for reading, while a device keeps running the
last \`flet-box release\` until a tag publishes a manifest. The **Where this
lives** step prints which of the two a given run was. Cut a release with
\`flet-box release --patch --push\` when the app is worth updating.

### Download the mobile artifacts

Start it by hand — **Actions → "… — native (manual)" → Run workflow**, pick a
platform — and open that run: the Android APK and the iOS \`.app\` are listed
under **Artifacts** at the bottom of the run summary, and the job's own log prints
the artifact name plus the URL of the run it belongs to.

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
- Enable GitHub Pages: **Settings → Pages → Source: GitHub Actions**. Without
  that the deploy step is green and no site exists.
- Cut a release with \`flet-box release --push\` (bumps the version, rebuilds
  \`www/\`, commits and tags \`vX.Y.Z\`). CI then deploys \`www/\` and installed
  apps self-update the next time they open.
- A plain \`git push\` also deploys \`www/\` — that is the preview, and the job
  prints the address. It never publishes \`www/config.json\`, because that file
  is the update feed and the app compares bundle **hashes**: without it an
  installed app finds no manifest and stays on the last release. Do not "fix"
  that gate; the release tag is the only thing that should reach users.
- Android and iOS are not built on a push. Start
  \`.github/workflows/build-native.yml\` from **Actions → Run workflow** and pick
  \`android\`, \`ios\` or \`both\`.
- The update URL is also reflected in \`www/config.json\` after \`flet-box
  createBundle www\`; it is baked into Android/iOS builds at \`cap sync\` time.
- Only web files are updated OTA. Native changes (plugins, permissions,
  manifest/Info.plist edits) still require a new store submission.

## Features

- Root screen: one filled action, one quiet one
- Home screen: the spacing rhythm, the type scale and the three color roles,
  drawn from the framework's own scale
- About screen: \`useState\`, an \`Input\`, a \`Dropdown\`, a labelled \`Switch\`,
  a \`Slider\` that moves the base font size, a \`SnackBar\` reply and an
  \`AlertDialog\` before the destructive action
- Neutral app bar with a theme toggle that carries a \`Tooltip\` name
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
import { Container, Column, Row, Text, Icon, Divider, colors, Storage, goTo } from 'flet-box';

// Two words, from whatever the reader typed on the Preferences screen.
const initials = (name) =>
    name.trim().split(/\\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();

const linkRow = (icon, label, note, route) => Container({
    padding: 16,
    cursor: 'pointer',
    child: Row({
        gap: 12,
        alignItems: 'center',
        children: [
            Icon({ name: icon, size: 20, color: colors.textSecondary }),
            Column({
                flex: 1,
                gap: 4,
                alignItems: 'stretch',
                children: [
                    Text({ text: label, size: 16, color: colors.text }),
                    Text({ text: note, size: 12, color: colors.textSecondary })
                ]
            }),
            Icon({ name: 'chevron_right', size: 20, color: colors.textSecondary })
        ]
    }),
    onclick: () => goTo(route)
});

export const ProfileScreen = () => {
    const name = Storage.getData('displayName') || '';

    return Container({
        flex: 1,
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 24,
            alignItems: 'stretch',
            maxWidth: 480,
            margin: '0 auto',
            children: [
                Row({
                    gap: 16,
                    alignItems: 'center',
                    children: [
                        Container({
                            width: 64,
                            height: 64,
                            borderRadius: 999,
                            backgroundColor: colors.primaryBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            child: Text({
                                text: initials(name) || 'P',
                                size: 24,
                                weight: 'bold',
                                color: colors.primary
                            })
                        }),
                        Column({
                            flex: 1,
                            gap: 4,
                            alignItems: 'stretch',
                            children: [
                                Text({ text: name || 'No name yet', size: 18, weight: 'bold', color: colors.text }),
                                Text({
                                    text: name ? 'Saved on this device' : 'Add one under Preferences',
                                    size: 14,
                                    color: colors.textSecondary
                                })
                            ]
                        })
                    ]
                }),
                Divider(),
                Column({
                    gap: 4,
                    alignItems: 'stretch',
                    children: [
                        linkRow('tune', 'Preferences', 'name, region, theme and text size', '/about'),
                        linkRow('palette', 'Design system', 'the spacing, type and color scales', '/home')
                    ]
                })
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
import { AppBar, Icon, Tooltip, colors, openDrawer, toggleTheme, getTheme } from 'flet-box';

// The bar is neutral — the surface token, not the brand — because a coloured strip
// on every screen competes with the one action the screen is asking for. One
// elevation step is enough to keep it off the page.
//
// It reads the theme instead of subscribing to it: setTheme() re-renders the app,
// so a component that subscribed would add a listener on every render and never
// remove it.
export const AppBarComponent = ({ title, isMobile = false, showBack = false, onBack }) => {
    const isDark = getTheme() === 'dark';

    return AppBar({
        title: title,
        backgroundColor: colors.surface,
        titleColor: colors.text,
        iconColor: colors.text,
        centerTitle: false,
        showBackButton: showBack,
        leading: isMobile ? Tooltip({
            text: 'Open the menu',
            position: 'bottom',
            child: Icon({
                name: 'menu',
                size: 24,
                height: 40,
                color: colors.text,
                onclick: () => openDrawer()
            })
        }) : null,
        // An icon-only control still needs a name: the Tooltip is what says so.
        actions: [
            Tooltip({
                text: isDark ? 'Switch to light' : 'Switch to dark',
                position: 'bottom',
                child: Icon({
                    name: isDark ? 'light_mode' : 'dark_mode',
                    size: 24,
                    height: 40,
                    color: colors.text,
                    onclick: () => toggleTheme()
                })
            })
        ],
        onBackPress: onBack,
        elevation: 1
    });
};
`;

export const bottomNavJs = () => `// components/layouts/BottomNav.js
import { BottomNavigation, colors, goTo, getCurrentPath } from 'flet-box';

// Scaffold re-runs this on every route change, which is why the current path is
// read here rather than passed in by the app.
export const BottomNav = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start', route: '/' },
        { icon: 'palette', label: 'System', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const navItems = items.length ? items : defaultItems;
    // BottomNavigation selects a tab by index, not by route.
    const currentIndex = Math.max(0, navItems.findIndex((item) => item.route === getCurrentPath()));
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
import { Container, Column, Row, Text, Icon, colors, goTo, getCurrentPath } from 'flet-box';

// Scaffold re-runs this on every route change, so the active item can read the
// route itself instead of being rebuilt by the app.
export const Sidebar = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start here', route: '/' },
        { icon: 'palette', label: 'Design system', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const menuItems = items.length ? items : defaultItems;
    const currentRoute = getCurrentPath();
    // Scaffold puts this in a flex row *below* the app bar and sizes it with
    // leftNavBarWidth, so the sidebar has to stay in flow. A position: fixed
    // panel escapes that box: its header ends up hidden behind the bar and the
    // width prop stops meaning anything.
    return Column({
        height: '100%',
        backgroundColor: colors.surface,
        borderRight: \`1px solid \${colors.border}\`,
        children: [
            Container({
                padding: 24,
                borderBottom: \`1px solid \${colors.border}\`,
                child: Column({
                    alignItems: 'center',
                    children: [
                        Icon({ name: 'rocket_launch', size: 40, color: colors.primary }),
                        Text({ text: 'FletBox', size: 18, weight: 'bold', color: colors.text, marginTop: 12 })
                    ]
                })
            }),
            ...menuItems.map(item => Container({
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: currentRoute === item.route ? colors.primaryBg : 'transparent',
                borderLeft: currentRoute === item.route ? \`3px solid \${colors.primary}\` : 'none',
                child: Row({
                    gap: 12,
                    alignItems: 'center',
                    children: [
                        Icon({ name: item.icon, size: 20, color: currentRoute === item.route ? colors.primary : colors.textSecondary }),
                        Text({ text: item.label, size: 14, weight: currentRoute === item.route ? 'bold' : 'normal', color: colors.text })
                    ]
                }),
                onclick: () => goTo(item.route)
            }))
        ]
    });
};
`;

// Modular drawer menu (accepts items) – keep original drawerMenuJs as is, this is new
export const drawerMenuModularJs = () => `// components/layouts/DrawerMenu.js
import { Drawer, DrawerItem, Container, Column, Text, Icon, colors, closeDrawer } from 'flet-box';

export const DrawerMenu = ({ items = [] } = {}) => {
    const defaultItems = [
        { icon: 'home', label: 'Start here', route: '/' },
        { icon: 'palette', label: 'Design system', route: '/home' },
        { icon: 'tune', label: 'Preferences', route: '/about' }
    ];
    const menuItems = items.length ? items : defaultItems;
    return Drawer({
        header: Container({
            padding: 24,
            backgroundColor: colors.surface,
            borderBottom: \`1px solid \${colors.border}\`,
            child: Column({
                alignItems: 'center',
                children: [
                    Icon({ name: 'rocket_launch', size: 40, color: colors.primary }),
                    Text({ text: 'FletBox', size: 18, weight: 'bold', color: colors.text, marginTop: 12 }),
                    Text({ text: 'Starter app', size: 12, color: colors.textSecondary })
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
            padding: 16,
            borderTop: \`1px solid \${colors.border}\`,
            child: Text({ text: 'Version 1.0.0', size: 12, color: colors.textSecondary, align: 'center' })
        })
    });
};
`;

// App templates (blank, basic, full, sidebar, adaptive)
export const blankAppJs = () => `// app.js - Blank template
import { runApp, Container, Text, colors } from 'flet-box';
// Registers this app's design tokens. Without it every screen paints
// with the framework's own palette, and the file that looks like the design
// system is decoration.
import './database/themes.js';

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
import { runApp, Scaffold, colors, useState, atLeast, onBreakpointChange } from 'flet-box';
// Registers this app's design tokens. Without it every screen paints
// with the framework's own palette, and the file that looks like the design
// system is decoration.
import './database/themes.js';
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

// The drawer is only reachable through the AppBar's menu button, so the shell has
// to know whether it is on a phone. Key-based state keeps the answer across
// re-renders; the subscription is registered once, at module scope, and only
// fires when the viewport crosses a breakpoint, not on every pixel of a resize.
const [isWide, setIsWide] = useState('isWide', atLeast('md'));
onBreakpointChange(() => setIsWide(atLeast('md')));

const MyApp = () => {
    const isMobile = !isWide.valueOf();
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: DrawerMenu(),
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

export const fullAppJs =
  () => `// app.js - Full template (AppBar + Drawer + BottomNav)
import { runApp, Scaffold, colors, useState, atLeast, onBreakpointChange } from 'flet-box';
// Registers this app's design tokens. Without it every screen paints
// with the framework's own palette, and the file that looks like the design
// system is decoration.
import './database/themes.js';
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

// State is key-based, so the layout answer survives re-renders. One breakpoint
// subscription feeds it from module scope: registering it inside the component
// would add a listener on every render, and it only fires when a step is crossed.
const [isWide, setIsWide] = useState('isWide', atLeast('md'));
onBreakpointChange(() => setIsWide(atLeast('md')));

const MyApp = () => {
    // Structural read of the key, so crossing the breakpoint re-renders the shell.
    const isMobile = !isWide.valueOf();
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: DrawerMenu(),
        // A function, not an element: Scaffold re-runs it on each route change,
        // which is what keeps the active tab lit.
        bottomBar: isMobile ? () => BottomNav() : null,
        backgroundColor: colors.background
    });
};

runApp(MyApp, 'root');
`;

export const sidebarAppJs = () => `// app.js - Sidebar template (desktop only)
import { runApp, Scaffold, colors } from 'flet-box';
// Registers this app's design tokens. Without it every screen paints
// with the framework's own palette, and the file that looks like the design
// system is decoration.
import './database/themes.js';
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
    // A function, not an element: Scaffold re-runs it on each route change,
    // which is what keeps the active row lit.
    leftNavBar: () => Sidebar(),
    backgroundColor: colors.background
});

runApp(MyApp, 'root');
`;

export const adaptiveAppJs =
  () => `// app.js - Adaptive template (mobile + desktop)
import { runApp, Scaffold, colors, useState, atLeast, onBreakpointChange } from 'flet-box';
// Registers this app's design tokens. Without it every screen paints
// with the framework's own palette, and the file that looks like the design
// system is decoration.
import './database/themes.js';
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

// State is key-based, so the layout answer survives re-renders. The breakpoint
// subscription is registered once at module scope; doing it inside the component
// would add another listener on every render.
const [isWide, setIsWide] = useState('isWide', atLeast('md'));
onBreakpointChange(() => setIsWide(atLeast('md')));

// One menu, three surfaces: the drawer and the bottom bar on a phone, the
// sidebar on a desktop. The labels stay short because the bottom bar has to fit
// all four across a 360px screen.
const menu = [
    { icon: 'home', label: 'Start', route: '/' },
    { icon: 'palette', label: 'System', route: '/home' },
    { icon: 'tune', label: 'Preferences', route: '/about' },
    { icon: 'person', label: 'Profile', route: '/profile' }
];

const MyApp = () => {
    // Structural read of the keyed layout state, so crossing the breakpoint
    // re-renders the shell (drawer + bottom bar <-> sidebar).
    const isMobile = !isWide.valueOf();
    return Scaffold({
        routes,
        appBar: AppBarComponent({ title: 'FletBox', isMobile }),
        drawer: isMobile ? DrawerMenu({ items: menu }) : null,
        // Functions, not elements: Scaffold re-runs them on each route change,
        // which is what keeps the active item lit.
        bottomBar: isMobile ? () => BottomNav({ items: menu }) : null,
        leftNavBar: !isMobile ? () => Sidebar({ items: menu }) : null,
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
    '## 0. Start here — the skills folder',
    '',
    'Everything this framework knows about building a professional screen is grouped',
    'in four files under `skills/`, one per subject. They are copied byte-for-byte',
    'into `.claude/skills/` and `.qoder/skills/` so those assistants load them',
    'automatically, and into `.cursor/rules/` as pointer rules — `skills/` is the',
    'text, the rest are mirrors of it. Open the file your task touches before',
    'writing code, not after:',
    '',
    '| Skill | What it owns | Read it when |',
    '| --- | --- | --- |',
    '| [fletbox-rules](skills/fletbox-rules/SKILL.md) | FletBox syntax only: no widget or prop from React, Vue, Svelte or Flutter; look an API up before using it; the rem contract; aliases; cleanup; the two gates | always, first |',
    '| [fletbox-design](skills/fletbox-design/SKILL.md) | the numbered design rules — tokens, the scale, hierarchy, the four states, measured contrast, the framework traps, the dated tells, density | any screen, form, list, dialog or hero |',
    '| [fletbox-motion](skills/fletbox-motion/SKILL.md) | whether a thing may move at all, and through which of `AnimatedBox`, `AnimatedText`, `ParallaxBox` or `animate` | any transition, entrance, pulse or parallax |',
    '| [fletbox-memory](skills/fletbox-memory/SKILL.md) | the journal that hands progress from one AI to the next | at the start and at the end of every session |',
    '',
    'Sections 1 to 7 below are the short version of those files, kept here because a',
    'session that stops reading early still gets the rules that break the build. When',
    'a summary here and a skill disagree, the skill is the longer argument and wins.',
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
    '  // Functions, not elements: Scaffold re-runs a bar on every route change,',
    '  // which is how the active item learns where the reader is.',
    '  bottomBar: isMobile ? () => BottomNav() : null,',
    '  leftNavBar: !isMobile ? () => Sidebar() : null,   // NOT `sidebar:`',
    '  leftNavBarWidth: 240,',
    "  fab: isMobile ? ActionButton({ icon: 'add', onPress: open }) : null,",
    '  body: isMobile ? null : HomeScreen(),',
    '})',
    '```',
    '',
    'Real `Scaffold` props: `appBar body bottomBar fab drawer leftNavBar',
    'leftNavBarWidth rightNavBar rightNavBarWidth routes basePath backgroundColor',
    'closeDrawerOnNavigate`. (`--props Scaffold` is authoritative.)',
    'For a responsive app, branch in JS on the breakpoint table, not on CSS alone:',
    '`useState` seeded from `atLeast("md")` plus one `onBreakpointChange()` at',
    'module scope — it fires when the viewport crosses a step, not on every pixel',
    'of a resize. `md` is 768, the same line `AdaptiveScaffold` crosses, so a',
    'screen and its shell cannot disagree. A number that really wants to be',
    'different at 400px and 1400px comes from `pick({ xs: 16, md: 24 })`.',
    'See `src/app.js` in this project.',
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
    '- The package exports 66 helpers next to the widgets and they are the short',
    '  form of the code you would otherwise write: `mapList` (an array, a number or',
    "  an object), `createList`, `range`, `repeat`, `sort`, `unique`, `chunk`,",
    '  `shadow`, `gradient`, `rgba`, `transform`, `transition`, `filter` (a CSS',
    '  filter, not a list filter), `color(hex).darken(12).hex()`, `random.*`,',
    '  `shortId`, `uuid`, `formatDate`, `relativeTime`, `delay`, `withMinDelay`,',
    '  `retry`, `memo`, `dict`, `print`, `ref`, `atLeast`, `pick`,',
    '  `onBreakpointChange`, `loadFont`, `clipboard`. Hand-write the long version',
    '  only when it is genuinely shorter or clearer.',
    '  The trap: a routed prop already IS the short form. `padding: 16` reaches the',
    '  rem contract; `padding(16)` returns a pixel string. Use the helpers for a',
    '  CSS value a prop cannot express, never instead of a number.',
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
    '| Feedback | `colors.success` / `colors.warning` / `colors.danger` / `colors.dangerStrong` | status only — never as decoration; the last one is the red you may write words in |',
    '',
    'Everything else is neutral: `colors.background`, `colors.surface`,',
    '`colors.card`, `colors.text`, `colors.textSecondary`, `colors.textDisabled`,',
    '`colors.border`, `colors.divider`, plus the `gray50`…`gray900` ramp. Rules:',
    '',
    '- A screen uses **one** brand color. Two accent colors competing on one view',
    '  means one of them is wrong.',
    '- Never type a hex or `rgb()` literal. If a token is missing, add it to a',
    '  `theme.js` in this app that re-exports `colors` — do not scatter the value.',
    '- A frosted surface is `colors.glass` with `colors.glassBorder` plus a',
    '  `backdropFilter`. It reads through to whatever is behind it, so there',
    '  should be imagery or a gradient there, never body copy.',
    '- Text on a dark or brand fill is white, and it stays white: hierarchy comes',
    '  from size and weight, not from fading the ink to `rgba(255,255,255,.72)` —',
    '  faded white on `colors.primary` measures 3.16:1 and stops being body text.',
    '- `error` ≡ `danger`, and `*Bg` variants exist for alert fills. As **words**,',
    '  `colors.danger` is 3.76:1 on white and fails AA: write `colors.dangerStrong`',
    '  for the label of a delete or an inline error (6.47:1 on white, 5.42:1 inside',
    '  `colors.errorBg`), and keep `colors.danger` for the dot, the border, the icon.',
    '  Same reason `colors.warning` and `colors.success` are plates, never sentences.',
    '  Measure any pair before arguing about it: `npm run ui -- --tokens`.',
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
    '         24  ·  between sections, page gutter',
    '         32  ·  between page blocks',
    '         40  ·  the smallest tap target, a roomy control',
    '         48  ·  hero spacing',
    '         64 / 96  ·  a full-bleed section, a landing hero',
    'radius     4 / 8 / 12 / 16 / 20 / 24 / 999 (pill)',
    'type      12 caption · 14 body-small · 16 body · 18 subtitle · 24 title',
    '          32 headline · 40 / 48 display (a hero, a big number)',
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
    'npm run ui             # clean-UI gate: the tokens and the scale above, 40px',
    '                       # targets, labels, contrast — every finding cites the',
    '                       # rule number it broke',
    'npm run dev            # serve on :8000 — check the UI actually renders',
    '```',
    '',
    'Both gates read the installed package, so they are always in sync with what',
    'runs. They exit non-zero on a real error: fix the code, not the checker. A',
    'warning is allowed to stay only when you can justify it in one sentence.',
    '',
    '`npm run ui` proves what is *written*; the rules it cites are the numbered ones',
    'in [skills/fletbox-design/SKILL.md](skills/fletbox-design/SKILL.md),',
    'and that file is the part a checker cannot do — hierarchy, copy, whether the',
    'screen solves the problem. Read it before writing a screen, not after.',
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
    'The full format lives in [skills/fletbox-memory/SKILL.md](skills/fletbox-memory/SKILL.md).',
    'The short version: at the start of every session read',
    '`.fletbox/memory/MEMORY.md` and the entries it points at, including',
    '`notes/current-status.md`. That is how this agent remembers the app between',
    'chats — and between models — instead of rediscovering it each time.',
    '',
    '- When you learn something non-obvious about this app or the framework, write',
    '  `.fletbox/memory/notes/<kebab-case-topic>.md` with: what (fact or rule), **Why:**',
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
    'The rules for this project live in [AGENTS.md](../AGENTS.md). Read it first and',
    'follow it exactly — FletBox syntax only, real props only.',
    '',
    'Two shortcuts replace guessing:',
    '',
    '- `flet-box unpack <Widget>` prints every prop the widget really honors, with',
    '  its type, default and engine target. `--example` gives a call you can paste,',
    '  `--diff` lists the props that are documented but dead or used but undeclared.',
    '  `.fletbox/api/api.json` is the same surface for all widgets, as data.',
    '- Design is not improvised. The rules are a file: read',
    '  [skills/fletbox-design/SKILL.md](skills/fletbox-design/SKILL.md) before writing',
    '  a screen (the same text is mirrored to `.claude/skills/` and `.qoder/skills/`,',
    '  so those loaders find it by themselves). The set is four files: `fletbox-rules`',
    '  for the API contract, `fletbox-design` for the screen, `fletbox-motion` before',
    '  anything moves, `fletbox-memory` for the journal.',
    '  `npm run ui` proves the part a checker can prove (tokens,',
    '  the scale, 40px targets, labels, contrast) and cites the rule number it',
    '  broke; AGENTS.md §4 has the tables. Scale: 4 · 8 · 12 · 16 · 18 · 24 · 32 ·',
    '  40 · 48 · 64 · 96 spacing, radii 4/8/12/16/999, type 12 · 14 · 16 · 18 · 24',
    '  · 32 · 40 · 48.',
    '',
    'After every edit: `npm run check` (does it exist), `npm run ui` (is it clean),',
    'then look at the screen — the checker has no eyes.',
    '',
    'Memory: read `.fletbox/memory/MEMORY.md` and `notes/current-status.md` before',
    'working, and write what you learn there — `fletbox-memory` is the format — when',
    'the next session should not have to rediscover it.',
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
    '- Design rules: read [fletbox-design.mdc](./fletbox-design.mdc) in this',
    '  folder — the numbered design rules the agent is expected to follow. One',
    '  brand color per screen, taken from the `colors` tokens — never a hex literal.',
    '  Sizes come from the scale only: 4 · 8 · 12 · 16 · 18 · 24 · 32 · 40 · 48 · 64',
    '  · 96 spacing, radii 4/8/12/16/999, type 12 · 14 · 16 · 18 · 24 · 32 · 40 · 48.',
    '  See AGENTS.md §4.',
    '- Run `npm run check` after every change (does this API exist) and `npm run ui`',
    '  (is this screen clean: tokens, scale, 40px targets, labels, contrast). Fix',
    '  what they report; a warning stays only with a one-sentence reason.',
    '- Check `.fletbox/memory/MEMORY.md` at session start; record new non-obvious',
    '  findings there instead of re-deriving them.',
    '',
  ].join('\n');

/**
 * The handover note every session rewrites instead of appending to. It ships
 * filled with the scaffold's own state, so the first real session has the shape
 * to copy, and `fletbox-memory` owns the rules for keeping it honest.
 *
 * @param {string} appName
 * @param {string} template
 * @returns {string}
 */
export const memoryStatusMd = (appName, template) => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    '# Status',
    '',
    'The handover file. Rewrite these lines as you work; do not append to them.',
    'Whoever opens this next may be a different model with no memory of this',
    'session, so "done" has to mean "verified" and "next" has to be a sentence,',
    'not a mood.',
    '',
    `**Doing:** nothing yet. This is the fresh \`${template}\` scaffold of \`${appName}\`.`,
    '',
    '**Done and verified:** the app boots and both gates pass on the template as',
    'created — `npm run check` (only real APIs) and `npm run ui` (tokens, the scale,',
    'tap targets, labels, contrast). That is the baseline; anything under it is',
    "whatever the next session changed.",
    '',
    '**Not done / half-done:** the screens and copy are the demo the template ships',
    'with. They are placeholders until a real screen replaces them.',
    '',
    '**Next:** write one sentence about what this app is for, then delete the demo',
    'screens it does not need.',
    '',
    '**Blocked:** none. Put the question to ask here the moment one exists.',
    '',
    `**Updated:** ${today} · scaffold.`,
    '',
  ].join('\n');
};

export const memoryIndexMd = (appName) =>
  [
    '# Memory index',
    '',
    `Persistent notes for the AI agent working on \`${appName}\`. One line per entry.`,
    'Read this at the start of every session; open the files it points at.',
    '',
    '- [Current status](notes/current-status.md) — what is built now, what is verified, what is next: the handover between AIs',
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

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
// The text lives in the package-root skills/ folder, one kebab-case directory per
// subject (rules, design, motion, memory) with a SKILL.md inside. A real file keeps
// the contract editable, diffable, and checkable by scripts/check-skills.mjs, which
// proves every widget and prop a skill names actually exists. The design rules come
// from Angelene Wallis, "No bullshit guide to UX" (2022), and "The UI/UX Playbook"
// (uxpeak), measured against this framework: every number is read off the installed
// palette or src/tools/scale.js, and they are numbered so `flet-box check-ui` can
// cite the one it broke.

/**
 * Cursor has no skills folder, so every skill also ships as a pointer rule: its own
 * frontmatter description as the trigger, and the path an agent must open. One text,
 * three loaders, never three edits — and no summary that can drift from the skill.
 *
 * @param {string} name kebab-case skill folder name
 * @param {{alwaysApply?: boolean, globs?: string}} [options]
 * @returns {string}
 */
export const skillCursorRule = (name, options = {}) =>
  [
    "---",
    `description: ${skills.skillDescription(name).split(" - ")[0]}`,
    `globs: ${JSON.stringify(options.globs || "src/**/*.js")}`,
    `alwaysApply: ${options.alwaysApply ? "true" : "false"}`,
    "---",
    "",
    `Read [skills/${name}/SKILL.md](../../skills/${name}/SKILL.md) before the work it`,
    "describes. The same bytes sit at `.claude/skills/…` and `.qoder/skills/…` so the",
    "loaders find them automatically, and that mirror is generated — edit the file",
    "above and regenerate, never the copy.",
    "",
    "A summary of the skill here would only drift, so this rule is only a pointer.",
    "",
    "Never invent a widget or prop: `flet-box unpack <Widget>` prints the real ones.",
    "",
  ].join("\n");

/**
 * The app-side twin of scripts/check-app.mjs for the clean-UI gate. Same
 * resolution dance, because the package exports map only publishes "." and
 * "./package.json".
 *
 * @param {string} appName
 * @returns {string}
 */
export const checkUiScript = (appName) =>
  [
    '// scripts/check-ui.mjs',
    `// Clean-UI gate for ${appName}: tokens, the 8-based scale, tap targets, field`,
    '// labels and measured WCAG contrast, checked by the installed flet-box.',
    '//',
    '//   npm run ui              scan src/ and fail on a real finding',
    '//   npm run ui -- --tokens  print the measured contrast of every token',
    '//   npm run ui -- --strict  contrast warnings fail the run too',
    '//   npm run ui -- --json    machine-readable findings',
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
    "  const fs = require('fs');",
    '  for (const dir of candidates) {',
    "    if (fs.existsSync(path.join(dir, 'bin/commands/checkUi.js'))) return dir;",
    '  }',
    "  console.error('flet-box package not found. Run: npm install');",
    '  process.exit(1);',
    '}',
    '',
    "const checker = path.join(resolvePackage(), 'bin', 'commands', 'checkUi.js');",
    "const { checkUi } = await import(pathToFileURL(checker).href);",
    '',
    "const { exitCode } = await checkUi(process.argv.slice(2));",
    'process.exit(exitCode);',
    '',
  ].join('\n');
