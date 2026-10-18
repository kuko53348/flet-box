only_modules = {
    # =========================================================================
    # PAGE TEMPLATES (createPage)
    # =========================================================================
    'createPage.minimal': '''import { runApp, Container, Text } from 'flet-box';

const App = () => {
    return Container({
        child: Text({ text: "Hello World" })
    });
};

runApp(App, 'root');''',

    'createPage.container': '''import { runApp, Container, Text, colors } from 'flet-box';

const App = () => {
    return Container({
        padding: 20,
        bgColor: colors.background,
        borderRadius: 16,
        child: Text({ text: "My App", size: 24, weight: "bold" })
    });
};

runApp(App, 'root');''',

    # =========================================================================
    # SCAFFOLD TEMPLATES (createPageScaffold)
    # =========================================================================
    'createPageScaffold.basic': '''import { runApp, Scaffold, AppBar, Text, colors } from 'flet-box';

const App = () => {
    return Scaffold({
        appBar: AppBar({ title: "My App", centerTitle: true }),
        body: Text({ text: "Main content" }),
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    'createPageScaffold.drawer': '''import { runApp, Scaffold, AppBar, Drawer, DrawerItem, Text, Icon, colors, openDrawer } from 'flet-box';

const App = () => {
    return Scaffold({
        appBar: AppBar({
            title: "My App",
            centerTitle: true,
            leading: Icon({ name: "menu", onPress: () => openDrawer() })
        }),
        drawer: Drawer({
            header: Text({ text: "Menu", size: 20, weight: "bold", padding: 20 }),
            body: [
                DrawerItem({ icon: "home", label: "Home", route: "/" }),
                DrawerItem({ icon: "settings", label: "Settings", route: "/settings" })
            ]
        }),
        body: Text({ text: "Main content" }),
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    'createPageScaffold.tabs': '''import { runApp, Scaffold, AppBar, Tabs, Text, colors } from 'flet-box';

const App = () => {
    return Scaffold({
        appBar: AppBar({ title: "My App", centerTitle: true }),
        body: Tabs({
            tabs: ["Home", "Profile", "Settings"],
            children: [
                Text({ text: "Home screen" }),
                Text({ text: "User profile" }),
                Text({ text: "Settings" })
            ]
        }),
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    'createPageScaffold.bottomnav': '''import { runApp, Scaffold, AppBar, BottomNavigation, Text, colors } from 'flet-box';

const HomeScreen = () => Text({ text: "Home", size: 20 });
const SearchScreen = () => Text({ text: "Search", size: 20 });
const ProfileScreen = () => Text({ text: "Profile", size: 20 });

const routes = {
    "/": HomeScreen,
    "/search": SearchScreen,
    "/profile": ProfileScreen
};

const App = () => {
    return Scaffold({
        appBar: AppBar({ title: "My App", centerTitle: true }),
        bottomBar: BottomNavigation({
            items: [
                { icon: "home", label: "Home", route: "/" },
                { icon: "search", label: "Search", route: "/search" },
                { icon: "person", label: "Profile", route: "/profile" }
            ],
            useRouter: true
        }),
        body: routes,
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    'createPageScaffold.router': '''import { runApp, Scaffold, AppBar, Text, colors } from 'flet-box';

const HomeScreen = () => Text({ text: "Home", size: 20 });
const AboutScreen = () => Text({ text: "About", size: 20 });
const ProfileScreen = () => Text({ text: "Profile", size: 20 });

const routes = {
    "/": HomeScreen,
    "/about": AboutScreen,
    "/profile": ProfileScreen
};

const App = () => {
    return Scaffold({
        appBar: AppBar({ title: "Router App", centerTitle: true }),
        body: routes,
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    'createPageScaffold.full': '''import { runApp, Scaffold, AppBar, Drawer, DrawerItem, BottomNavigation, Text, colors, Icon, openDrawer } from 'flet-box';

const HomeScreen = () => Text({ text: "Home", size: 20 });
const SearchScreen = () => Text({ text: "Search", size: 20 });
const ProfileScreen = () => Text({ text: "Profile", size: 20 });

const routes = {
    "/": HomeScreen,
    "/search": SearchScreen,
    "/profile": ProfileScreen
};

const App = () => {
    return Scaffold({
        appBar: AppBar({
            title: "Full App",
            centerTitle: true,
            leading: Icon({ name: "menu", onPress: () => openDrawer() })
        }),
        drawer: Drawer({
            header: Text({ text: "Menu", size: 20, weight: "bold", padding: 20 }),
            body: [
                DrawerItem({ icon: "home", label: "Home", route: "/" }),
                DrawerItem({ icon: "search", label: "Search", route: "/search" }),
                DrawerItem({ icon: "person", label: "Profile", route: "/profile" })
            ]
        }),
        bottomBar: BottomNavigation({
            items: [
                { icon: "home", label: "Home", route: "/" },
                { icon: "search", label: "Search", route: "/search" },
                { icon: "person", label: "Profile", route: "/profile" }
            ],
            useRouter: true
        }),
        body: routes,
        backgroundColor: colors.background
    });
};

runApp(App, 'root');''',

    # =========================================================================
    # COMPONENT TEMPLATES (createComponent)
    # =========================================================================
    'createComponent.basic': '''import { Container, Text, colors } from 'flet-box';

export const MyComponent = ({ title, onPress }) => {
    return Container({
        padding: 16,
        bgColor: colors.surface,
        borderRadius: 12,
        child: Text({ text: title || "My Component", onPress })
    });
};''',

    'createComponent.listview': '''import { ListView, ListTile, Avatar, Text, createList, random } from 'flet-box';

// Generate sample data using createList and random
const generateData = () => {
    return createList({
        id: () => random.id(),
        title: () => random.fullName(),
        subtitle: () => random.email(),
        avatar: () => random.firstName().charAt(0)
    }, 20);
};

export const MyList = ({ data = generateData(), onSelect }) => {
    return ListView({
        data: data,
        renderItem: (item, index) => ListTile({
            leftItem: Avatar({ name: item.avatar, size: 40 }),
            title: item.title,
            subtitle: item.subtitle,
            onPress: () => onSelect(item)
        })
    });
};''',

    'createComponent.gridview': '''import { GridView, Card, Image, Column, Text, createList, random } from 'flet-box';

// Generate sample image data
const generateImages = () => {
    return createList({
        id: () => random.id(),
        title: () => random.fullName(),
        image: () => `https://picsum.photos/id/${random.number(1, 100)}/300/200`
    }, 10);
};

export const MyGallery = ({ items = generateImages(), onPress }) => {
    return GridView({
        data: items,
        columns: 2,
        spacing: 12,
        renderItem: (item, index) => Card({
            onPress: () => onPress(item),
            child: Column({
                children: [
                    Image({ src: item.image, height: 150, fit: "cover" }),
                    Text({ text: item.title, size: 14, weight: "bold", padding: 8 })
                ]
            })
        })
    });
};''',

    # =========================================================================
    # MODULE TEMPLATES (una plantilla por familia de API)
    #
    # Cada bloque es un módulo completo: sólo importa nombres que el paquete
    # exporta de verdad, así que `npm test` falla si la API cambia.
    # =========================================================================

    'createModule.state': '''import { useState, useWatchState, Column, Text, Button } from 'flet-box';

// useState() guarda la clave en RamStore, así que sobrevive a los re-render.
const [count, setCount, onCount] = useState('counter', 0);
const label = Text({ text: '0' });

// Pasando el widget y el nombre del prop, el label se actualiza solo.
useState('counter', 0, label, 'text');
onCount((value) => console.log('counter ->', value));

const stop = useWatchState('counter', (value) => console.log('watched', value));

export const Counter = () => Column({
    gap: 12,
    alignItems: 'center',
    children: [label, Button({ text: '+1', onPress: () => setCount(count + 1) })]
});''',

    'createModule.router': '''import { initRouter, goTo, buildUrl, useParams, useQueryParams, getCurrentPath, getBasePath, subscribe } from 'flet-box';

const routes = {
    '/': HomeScreen,
    '/users/:id': UserScreen
};

// `base` fija el prefijo de despliegue cuando la app se sirve desde un subpath.
initRouter(routes, window.location.pathname, { base: '/my-app' });

const off = subscribe((route) => console.log('now on', route));

export const goUser = (id) => goTo(buildUrl('/users/:id', { id }, { tab: 'posts' }));
export const currentId = () => useParams().id;
export const currentTab = () => useQueryParams().tab;
export const path = () => getCurrentPath();
export const base = () => getBasePath();''',

    'createModule.storage': '''import { Storage, Session, RamStore, subscribeRam } from 'flet-box';

export const saveSettings = (settings) => Storage.saveData('settings', settings);
export const loadSettings = () => Storage.getDataSync('settings') || { theme: 'light' };

// Session dura lo que la pestaña; RamStore sólo mientras la app está viva.
Session.saveSession('draft', { title: 'Untitled' });
RamStore.saveRam('scrollY', 0);

const off = subscribeRam((key, newValue, oldValue) => console.log(key, newValue, oldValue));

export const usage = () => ({
    local: Storage.getStorageSize(),
    session: Session.getSessionSize(),
    ram: RamStore.getRamItemCount()
});''',

    'createModule.theme': '''import { ThemeProvider, useTheme, setTheme, getTheme, toggleTheme, subscribeTheme, applySystemTheme, watchSystemTheme, palettes, colors, Container, Text } from 'flet-box';

export const ThemedApp = () => ThemeProvider({
    theme: 'dark',
    children: Container({ child: Text({ text: 'Themed' }) })
});

const { colors: liveColors, getColor } = useTheme();

subscribeTheme((name) => console.log('theme is now', name));
setTheme(getTheme() === 'light' ? 'dark' : 'light');
applySystemTheme();
watchSystemTheme();

export const accent = palettes.light.primary;
export const surface = colors.surface;''',

    'createModule.http': '''import { httpRequest, httpGet, httpPost, httpPut, httpPatch, httpDelete, buildUrl, retry, withMinDelay } from 'flet-box';

const API = 'https://api.example.com';

export const fetchUsers = () => httpGet(`${API}/users`, { params: { page: 1 }, timeout: 5000 });
export const createUser = (user) => httpPost(`${API}/users`, { body: user, headers: { Authorization: 'Bearer token' } });
export const updateUser = (id, user) => httpPut(buildUrl(`${API}/users/:id`, { id }), { body: user });
export const patchUser = (id, data) => httpPatch(buildUrl(`${API}/users/:id`, { id }), { body: data });
export const removeUser = (id) => httpDelete(buildUrl(`${API}/users/:id`, { id }));

// httpRequest() es la forma explícita cuando el verbo no es un helper.
export const search = (q) => httpRequest('GET', `${API}/search`, { params: { q } });

export const fetchWithRetry = () => retry(() => withMinDelay(httpGet(`${API}/users`), 300), 3, 200);''',

    'createModule.animations': '''import { animate, animateAsync, fadeIn, fadeOut, pulse, stopAnimation, injectKeyframes, AnimatedBox, Container, Text, colors } from 'flet-box';

const box = Container({ width: 120, height: 120, bgColor: colors.primary });

animate(box, 'opacity', 1, 0.2, 400, 'ease-out');
fadeIn(box, 300);
fadeOut(box, 300);
pulse(box, 600);

export const grow = async () => {
    await animateAsync(box, 'width', 120, 240, 500, 'ease-in');
    stopAnimation(box, 'opacity');
};

// El keyframe se inyecta una vez y después se referencia por nombre.
injectKeyframes('float', '0% { transform: translateY(0); } 100% { transform: translateY(-8px); }');

export const Loader = () => AnimatedBox({
    child: Text({ text: 'Loading' }),
    animations: [{ effect: 'scale', from: 1, to: 1.2, duration: 500 }]
});''',

    'createModule.device': '''import { device, os, dimensions, clipboard, random } from 'flet-box';

export const describe = () => ({
    mobile: device.isMobile(),
    tablet: device.isTablet(),
    desktop: device.isDesktop(),
    touch: device.isTouch(),
    orientation: device.orientation(),
    system: os.name(),
    release: os.version(),
    viewport: `${dimensions.getWidth()}x${dimensions.getHeight()}`
});

device.onOrientationChange((next) => console.log('rotated to', next));
dimensions.addListener((size) => console.log(size.width, size.height));

export const copyToken = async (token) => {
    await clipboard.copy(token);
    return clipboard.read();
};

export const sampleUser = () => ({
    id: random.id(),
    name: random.fullName(),
    email: random.email(),
    color: random.hexColor()
});''',

    'createModule.markdown': '''import { Markdown, CodeViewer, markdownToWidgets, tokenize, generateHighlightedHtml, highlightColors, escapeHtml, colors } from 'flet-box';

export const Article = ({ source }) => Markdown({
    text: source,
    linkColor: colors.primary,
    allowDangerousHtml: false
});

export const Snippet = ({ code }) => CodeViewer({ code, title: 'example.js', showLineNumbers: true });

// tokenize() es el lexer que usa CodeViewer; highlightColors mapea tipo de token a color.
export const tokens = (code) => tokenize(code);
export const html = (code) => generateHighlightedHtml(code);
export const keywordColor = highlightColors.keyword;
export const safeText = (raw) => escapeHtml(raw);
export const blocks = () => markdownToWidgets('# Title\\n\\nBody text');''',

    'createModule.pwa': '''import { InstallButton, Button, Column, Text, isPWAInstalled, installPWA, updatePWA, removePWA } from 'flet-box';

if (isPWAInstalled()) console.log('running as an installed app');

export const PwaRow = () => Column({
    gap: 8,
    children: [
        Text({ text: 'Keep the app up to date' }),
        InstallButton({ text: 'Install' }),
        Button({ text: 'Update', onPress: updatePWA }),
        Button({ text: 'Uninstall', onPress: () => installPWA() || removePWA() })
    ]
});''',

    'createModule.customWidget': '''import { WidgetFactory, useState, Column, Text, Button, colors } from 'flet-box';

// La fábrica es el único renderizador: props dentro, HTMLElement fuera.
export const Panel = (props) => WidgetFactory('section', {
    widgetName: 'Panel',
    padding: 16,
    borderRadius: 12,
    bgColor: colors.surface,
    ...props
});

export const Counter = () => {
    const [count, setCount] = useState('custom-counter', 0);
    return Column({
        gap: 8,
        children: [
            Text({ text: `${count}` }),
            Button({ text: '+1', onPress: () => setCount((prev) => prev + 1) })
        ]
    });
};''',

    'createModule.ads': '''import { AdMob, AdSense, Column, Text } from 'flet-box';

// AdMob habla con el plugin de Capacitor; sin él, muestra el placeholder.
export const Banner = () => AdMob({
    adId: 'ca-app-pub-3940256099942544/6300978111',
    isTesting: true,
    position: 'bottom',
    size: 'ADAPTIVE_BANNER'
});

export const WebUnit = () => AdSense({
    client: 'ca-pub-1234567890123456',
    slot: '1234567890',
    format: 'fluid',
    test: true
});

export const AdRow = () => Column({
    gap: 16,
    children: [Text({ text: 'Sponsored' }), WebUnit(), Banner()]
});''',

    'createModule.dataTools': '''import { createList, mapList, dict, unique, chunk, sort, shuffle, memo, random } from 'flet-box';

export const users = createList({
    id: () => random.id(),
    name: () => random.fullName(),
    age: () => random.number(18, 80),
    active: () => random.boolean()
}, 20);

export const names = mapList(users, (user) => user.name);
export const uniqueNames = unique(names);
export const pages = chunk(uniqueNames, 5);
export const ranked = sort(users, 'name', 'asc');
export const mixed = shuffle(users);

// dict() envuelve un objeto plano con sus helpers.
export const index = dict({ total: users.length, active: users.filter((u) => u.active).length });

const square = memo((n) => n * n);
export const expensive = () => square(12);''',
}