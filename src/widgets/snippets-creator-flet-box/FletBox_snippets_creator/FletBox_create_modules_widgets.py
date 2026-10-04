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
            leading: Icon({ name: "menu", onclick: () => openDrawer() })
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
            leading: Icon({ name: "menu", onclick: () => openDrawer() })
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
    'createComponent.basic': '''import { Container, Text } from 'flet-box';

export const MyComponent = ({ title, onPress }) => {
    return Container({
        padding: 16,
        bgColor: colors.surface,
        borderRadius: 12,
        child: Text({ text: title || "My Component", onPress })
    });
};''',

    'createComponent.listview': '''import { ListView, ListTile, Text, createList, random } from 'flet-box';

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
            leading: Avatar({ name: item.avatar, size: 40 }),
            title: item.title,
            subtitle: item.subtitle,
            onPress: () => onSelect(item)
        })
    });
};''',

    'createComponent.gridview': '''import { GridView, Card, Image, Text, createList, random } from 'flet-box';

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
}
