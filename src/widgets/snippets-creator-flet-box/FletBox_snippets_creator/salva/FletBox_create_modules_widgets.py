# // ============================================
# // 📁 FletBox_create_modules_widgets.py
# // ============================================
# ============================================
# 📁 layouts_simples.py
# VARIANTES DE LAYOUT (complementa CLASE 3)
# NO reemplaza, solo amplía
# ============================================

only_modules = {
'nav.stack.screenOptions':'''
  screenOptions={{
    // HEADER (compartido con otros)
    headerShown: true,
    headerStyle: { backgroundColor: '#f4511e' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerBackTitle: 'Atrás',
    
    // ANIMACIONES (exclusivas de Stack)
    animation: 'slide_from_right',
    presentation: 'card',
    gestureEnabled: true,
  }}
''',
'nav.tabs.screenOptions':'''
screenOptions={({ route }) => ({
    // tabBarIcon: ({ focused, color, size }) => {
    //   const icons = {
    //     home: focused ? 'home' : 'home-outline',
    //     settings: focused ? 'settings' : 'settings-outline',
    //   }
    //   return <Icon name={icons[route.name]} size={size} color={color} />;
    // },
    // HEADER (compartido)
    headerShown: true,
    headerStyle: { backgroundColor: '#f4511e' },

    // TAB BAR (exclusivas de Tabs)
    tabBarStyle: { backgroundColor: '#fff', height: 60 },
    tabBarActiveTintColor: '#f4511e',
    tabBarInactiveTintColor: '#999',
    tabBarLabelStyle: { fontSize: 12 },
    tabBarShowLabel: true,

  }}
)>
''',
'nav.TabsTop.material.screenOptions':'''
screenOptions={{
    // HEADER (compartido)
    headerShown: true,
    
    // TAB BAR (exclusivas de Top Tabs)
    tabBarStyle: { backgroundColor: '#fff' },
    tabBarActiveTintColor: '#f4511e',
    tabBarInactiveTintColor: '#999',
    tabBarIndicatorStyle: { backgroundColor: '#f4511e', height: 3 },
    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
    
    // SWIPE (exclusivas)
    swipeEnabled: true,
    animationEnabled: true,
  }}
>
''',
'nav.drawer.screenOptions':'''
screenOptions={{
    // HEADER (compartido)
    headerShown: true,
    headerStyle: { backgroundColor: '#f4511e' },
    
    // DRAWER (exclusivas)
    drawerStyle: { width: 280, backgroundColor: '#fff' },
    drawerActiveTintColor: '#f4511e',
    drawerInactiveTintColor: '#999',
    drawerActiveBackgroundColor: '#f0f0f0',
    drawerLabelStyle: { fontSize: 16 },
  }}
''',

# // ============================================
# // 📦 MAKE SIMPLES COMPONENTS
# // ============================================
'rn.function.simple':'''
function CustomWidget({ params }}) {
  return (
   {/* widget */} 
  );
}
''',
'rn.function.components':'''
export function CustomWidget() {
  return (
   {/* widget */} 
  );
}
''',
'rn.style.empty':'''
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
''',

'rn.widget.components':'''
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CustomWidget() {
  return (
    <View style={ styles.container }>
      <Text style={ styles.text }>Hello world</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CustomWidget
''',

'rn.page.simple':'''
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CustomPage() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={ styles.text }>Hello world</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CustomPage
''',

# // ============================================
# // 📄 PÁGINA QUE RECIBE PARÁMETROS
# // ============================================

'rn.page.with.params':'''
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function CustomPage({ navigation, route }) {
  // 📥 get data by params
  const { userId, nombre } = route.params || {};

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Perfil de {nombre}</Text>
      <Text>ID: {userId}</Text>

      <TouchableOpacity 
        style={{ marginTop: 20, backgroundColor: '#f4511e', padding: 10 }}
        // send params between screens 
        // onPress={() => navigation.navigate('Profile', { id: 1 })}  // Volver
        onPress={() => navigation.goBack()}  // Volver
        >
        <Text style={{ color: '#fff' }}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
''',

# // ============================================
# // STACK NAVIGATOR
# // ============================================

'nav.stack.init':'''
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// local pages imports
// import HomeScreen from "./pages/HomeScreen";
// import ProfileScreen from "./pages/ProfileScreen";

const Stack = createNativeStackNavigator();

function MyApp() {
  return (
    <NavigationContainer> {/* it's only for root page */}
      <Stack.Navigator>
        {/* initialRouteName="Home"  */}
        {/* screenOptions={{}}  // object: opciones globales para todas las pantallas */}
        {/* style={{}}  // object: estilos para el contenedor */}
        <Stack.Screen 
            name="Home"
            // component={HomeScreen}
            options={{ 
              // hide header
              headerShown: false, 
              title: 'Home Screen',
            }}
        />
        <Stack.Screen
            name="Profile" 
            // component={ProfileScreen} 
            options={{ 
              // hide header
              headerShown: false,
              title: 'Profile Screen', 
            }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
''',
'nav.stackNavigator.simple.ScreenOptions':'''
screenOptions={{
    title: ' Flet-box', 
    headerTitleStyle: {fontWeight : 'bold', fontSize: 24}, 
    headerStyle: { backgroundColor: '#fff'}, 
    headerTintColor: '#ffff',
    headerLeft: () => (
        <TouchableOpacity onPress={
            () => alert('Menu Left')
        }>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
    ),
    headerRight: () => (
        <TouchableOpacity onPress={
            () => alert('Menu Right')
        }>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
    ),
    tabBarStyle: { backgroundColor: '#fff', },
}}
''',
'nav.stackNavigator.full.ScreenOptions':'''
screenOptions={{ // object: opciones globales para todas las pantallas */}
    title: ' welcome to tab page', 
    headerTitleStyle: {fontWeight : 'bold', fontSize: 24}, 
    headerStyle: { 
        backgroundColor: '#fff',
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Elevación para Android
        elevation: 4,
    }, 
    headerTintColor: '#ffff',  // object | function | string
     headerLeft: () => (
        <TouchableOpacity onPress={() => alert('Menu pressed')}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => alert('Menu pressed')}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    // ✅ AGREGAR SOMBRA Y ELEVACIÓN
    tabBarStyle: {
      backgroundColor: '#fff',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
      // Sombra para iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },  // sombra hacia arriba
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Elevación para Android
      elevation: 8,
      // Borde superior opcional
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
}}
''',
'nav.stackNavigator.full.properties':'''
<Stack.Navigator
  initialRouteName="Home"  // string: nombre de la primera pantalla
  presentation="card"  // 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal'
  animation="default"  // 'default' | 'fade' | 'flip' | 'none' | 'slide_from_bottom' | 'slide_from_right' | 'simple_push'
  animationDuration={300}  // number: duración en ms
  gestureDirection="horizontal"  // 'horizontal' | 'vertical' | 'horizontal-inverted' | 'vertical-inverted'
  gestureEnabled={true}  // boolean: habilita gestos de deslizamiento
  gestureResponseDistance={50}  // number: píxeles desde el borde para activar gesto
  keyboardHandlingEnabled={true}  // boolean: maneja teclado al navegar
  id="mi-stack"  // string: identificador del navigator
  gestureHandlerProps={{}}  // object: props personalizados para el gesto
  detachInactiveScreens={true}  // boolean: optimización de memoria
  style={{}}  // object: estilos para el contenedor
  screenOptions={{}}  // object: opciones globales para todas las pantallas
  >
  <Stack.Screen name="Home" component={HomeScreen} />
</Stack.Navigator>
''',
'nav.stack.simple.options.default':'''
options={{ 
    title: ' Flet-box', 
    headerTitleStyle: {fontWeight : 'bold', fontSize: 24}, 
    headerStyle: { backgroundColor: '#fff'}, 
    headerTintColor: '#ffff',
    headerLeft: () => (
        <TouchableOpacity onPress={
            () => alert('Menu Left')
        }>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
    ),
    headerRight: () => (
        <TouchableOpacity onPress={
            () => alert('Menu Right')
        }>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
    ),
    tabBarStyle: { backgroundColor: '#fff', },
}}
''',
'nav.stack.medium.options':'''
options={{ 
    title: ' welcome to tab page', 
    headerTitleStyle: {fontWeight : 'bold', fontSize: 24}, 
    headerStyle: { 
        backgroundColor: '#fff',
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Elevación para Android
        elevation: 4,
    }, 
    headerTitleAlign: 'center',  // string | element | 'center' | 'left'
    headerTintColor: '#ffff',  // object | function | string
     headerLeft: () => (
        <TouchableOpacity onPress={() => alert('Menu pressed')}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => alert('Menu pressed')}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      // ✅ AGREGAR SOMBRA Y ELEVACIÓN
    tabBarStyle: {
      backgroundColor: '#fff',
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
      // Sombra para iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },  // sombra hacia arriba
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Elevación para Android
      elevation: 8,
      // Borde superior opcional
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
}}
''',
'nav.stack.full.options.full':'''
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    title: 'welcome to tab page', 
    headerShown: false 
    // HEADER OPTIONS
    headerShown: true, header: (props) => <Header />, 
    headerMode: 'float',  // boolean | function | 'float' | 'screen'
    title: 'Título',
    headerTitle: 'Título', 
    headerTitleAlign: 'center',  // string | element | 'center' | 'left'
    headerTitleStyle: {}, 
    headerTitleAllowFontScaling: true, 
    headerTitleContainerStyle: {},  // object | boolean | object
    headerStyle: {}, 
    headerStyleInterpolator: () => {}, 
    headerTintColor: '#000',  // object | function | string
    headerTransparent: false, 
    headerBackground: () => <View />, 
    headerBackgroundContainerStyle: {},  // boolean | element | object
    headerShadowVisible: true, 
    headerStatusBarHeight: 44,  // boolean | number
    headerLeft: () => <Button />, 
    headerLeftContainerStyle: {}, 
    headerLeftLabelVisible: true,  // function | object | boolean
    headerRight: () => <Button />, 
    headerRightContainerStyle: {},  // function | object
    headerBackVisible: true, 
    headerBackTitle: 'Atrás', 
    headerBackTitleStyle: {},  // boolean | string | object
    headerBackTitleVisible: true,
    headerBackAllowFontScaling: true,  // boolean | boolean
    headerBackImage: () => <Icon />,
    headerBackImageStyle: {},
    headerBackAccessibilityLabel: 'Volver',  // function | object | string
    headerCloseButton: true,  // boolean: botón cerrar en modales
    // ANIMATION OPTIONS
    animation: 'slide_from_right',
    animationDuration: 300,
    animationTypeForReplace: 'push',  // string | number | 'push' | 'pop'
    cardStyleInterpolator: () => {}, cardStyle: {}, 
    cardOverlay: () => <View />,  // function | object | element
    cardOverlayEnabled: false,
    cardShadowEnabled: true,  // boolean | boolean
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    gestureResponseDistance: {},  // boolean | string | object
    gestureVelocityImpact: 0.3,  // number
    // PRESENTATION OPTIONS
    presentation: 'card', fullScreenGestureEnabled: false, freezeOnBlur: false,  // string | boolean | boolean
    // STATUS BAR OPTIONS
    statusBarStyle: 'dark', statusBarHidden: false, statusBarAnimation: 'fade',  // 'light'|'dark' | boolean | 'fade'|'slide'
    // KEYBOARD OPTIONS
    keyboardHandlingEnabled: true,  // boolean
  }}
  initialParams={{ userId: 42 }}  // object: parámetros iniciales
  getId={({ params }) => params.userId}  // function: identificador único
  listeners={{ focus: () => {}, blur: () => {}, state: () => {}, beforeRemove: () => {} }}  // object: event listeners
>
''',

# // ============================================
# // BOTTOM TAB NAVIGATOR
# // ============================================
'nav.button.navigate':'''
// import navigation from react
import { useNavigation } from '@react-navigation/native';

// set navigation
const navigation = useNavigation();

<TouchableOpacity 
  style={styles.button} 
  onPress={() => {
    navigation.navigate('HomePage',{'setParams':'paramas'})
    }
  }
>
    <Text style={ styles.text }>Continue</Text>
</TouchableOpacity>
''',

'nav.tabs.fuction.simple.init':'''
function MyTabs() {
  return (
    <Tab.Navigator
      // screenOptions={({ route }) => ({
      //   tabBarIcon: ({ focused, color, size }) => {
      //     const icons = {
      //       home: focused ? 'home' : 'home-outline',
      //       settings: focused ? 'settings' : 'settings-outline',
      //     }
      //     return <Icon name={icons[route.name]} size={size} color={color} />;
      //   },
      //   headerShown: false
      //   tabBarActiveTintColor: '#f4511e',
      //   tabBarInactiveTintColor: '#999',
      //   tabBarStyle: { backgroundColor: '#ffff'},
      //   tabBarLabelStyle: { fontSize: 12, fontWeight: '500', color: '#ffff'
      //   },
      // })}
    >
      <Tab.Screen 
            name="Home" 
            component={LobbyPage} 
            options={{
                title: 'Bienvenida',
                headerShown: true
                tabBarIcon: (size, color)=>{
                    <Icon name={'home'} size={size} color={color} />;
                }
            }}
        />
      <Tab.Screen 
            name="Settings"
            component={SettingsPage}
            options={{
                title: 'Bienvenida',
                headerShown: true
                tabBarIcon: (size, color)=>{
                    <Icon name={'settings'} size={size} color={color} />;
                }
            }}
        />
    </Tab.Navigator>
  );
}
''',
'nav.tabs.simple.init':'''
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { Ionicons } from '@expo/vector-icons';  // Expo
import Icon from 'react-native-vector-icons/Ionicons';  // CLI

import LobbyPage from "./pages/LobbyPage";
import SettingsPage from "./pages/SettingsPage";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      // screenOptions={({ route }) => ({
      //   tabBarIcon: ({ focused, color, size }) => {
      //     const icons = {
      //       home: focused ? 'home' : 'home-outline',
      //       settings: focused ? 'settings' : 'settings-outline',
      //     }
      //     return <Icon name={icons[route.name]} size={size} color={color} />;
      //   },
      //   headerShown: false
      //   tabBarActiveTintColor: '#f4511e',
      //   tabBarInactiveTintColor: '#999',
      //   tabBarStyle: { backgroundColor: '#ffff'},
      //   tabBarLabelStyle: { fontSize: 12, fontWeight: '500', color: '#ffff'
      //   },
      // })}
    >
      <Tab.Screen 
            name="Home" 
            component={LobbyPage} 
            options={{
                title: 'Bienvenida',
                headerShown: true
                tabBarIcon: (size, color)=>{
                    <Icon name={'home'} size={size} color={color} />;
                }
            }}
        />
      <Tab.Screen 
            name="Settings"
            component={SettingsPage}
            options={{
                title: 'Bienvenida',
                headerShown: true
                tabBarIcon: (size, color)=>{
                    <Icon name={'settings'} size={size} color={color} />;
                }
            }}
        />
    </Tab.Navigator>
  );
}
''',
'nav.tabs.medium.init':'''
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { Ionicons } from '@expo/vector-icons';  // Expo
import Icon from 'react-native-vector-icons/Ionicons';  // CLI

import LobbyPage from "./pages/LobbyPage";
import SettingsPage from "./pages/SettingsPage";

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            {/* name it's key to screen icon */}
            home: focused ? 'home' : 'home-outline',
            settings: focused ? 'settings' : 'settings-outline',
          }
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        
        tabBarStyle: {
          // bgcolor
          backgroundColor: '#ffff',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          // Sombra sutil
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          color: '#ffff'
        },
      })}

    >
      {/* name it's key to screen icon */}
      <Tab.Screen name="Home" component={LobbyPage} options={{ title: 'Bienvenida', headerShown: true  }}/>
      <Tab.Screen name="Settings" component={SettingsPage} options={{ title: 'Bienvenida', headerShown: true  }}/>
    </Tab.Navigator>
  );
}
''',
'nav.tabs.navigator.style':'''
tabBarStyle: {
  // bgcolor
  backgroundColor: '#ffff',
  height: 70,
  paddingBottom: 12,
  paddingTop: 8,
  // Sombra sutil
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 8,
  borderTopWidth: 0,
},
''',
'nav.tabs.icon.options':'''
  screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      const icons = {
        home: focused ? 'home' : 'home-outline',
        settings: focused ? 'settings' : 'settings-outline',
      }
      return <Icon name={icons[route.name]} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#f4511e',
    tabBarInactiveTintColor: '#999',
  })}
''',
'nav.tabs.properties':'''
  initialRouteName="Home"  // string: primera pantalla
  backBehavior="history"  // 'history' | 'initialRoute' | 'order' | 'none' | 'firstRoute'
  tabBarPosition="bottom"  // 'bottom' | 'top': posición de las tabs
  keyboardHidesTabBar={false}  // boolean: ocultar tabs al abrir teclado (Android)
  id="mi-tabs"  // string: identificador
  // screenOptions={{}}  // object: opciones globales
  tabBar={(props) => <MiTabBar {...props} />}  // function: componente personalizado
  tabBarOptions={{  // object (DEPRECATED): activeTintColor, inactiveTintColor, showLabel, showIcon, style, etc.
      tabBarOptions={{  // object (DEPRECATED): activeTintColor, inactiveTintColor, showLabel, showIcon, style, etc.
      activeTintColor: '#e91e63', 
      inactiveTintColor: '#999', 
      activeBackgroundColor: '#fff',
      inactiveBackgroundColor: '#f0f0f0', 
      showLabel: true, 
      showIcon: true, 
      // labelStyle: {},
      // tabStyle: {}, 
      // style: {}, 
      // safeAreaInsets: {}, 
      allowFontScaling: true, 
      adaptive: true,
      pressColor: 'rgba(0,0,0,0.1)', 
      pressOpacity: 0.8, 
      keyboardHidesTabBar: false
  }}
  initialParams={{}}
  listeners={{}}
''',

'nav.tabs.screen.children.options':'''
  options={{
    // TAB BAR OPTIONS
    tabBarIcon: ({ focused, color, size }) => <Icon />,  // function: ícono de la tab
    tabBarLabel: 'Inicio',  // string | function: etiqueta de la tab
    tabBarBadge: 3,  // number | string: badge/notificación
    tabBarBadgeStyle: {},  // object: estilos del badge
    tabBarAccessibilityLabel: 'Inicio',  // string: accesibilidad
    tabBarButton: (props) => <TouchableOpacity {...props} />,  // function: botón personalizado
    tabBarButtonTestID: 'home-tab',  // string: test ID
    tabBarShowLabel: true,  // boolean: mostrar etiqueta
    tabBarLabelStyle: {},  // object: estilos de la etiqueta
    tabBarLabelPosition: 'below-icon',  // 'below-icon' | 'beside-icon': posición de la etiqueta
    tabBarAllowFontScaling: true,  // boolean: escalar fuente
    tabBarInactiveTintColor: '#999',  // string: color inactivo
    tabBarActiveTintColor: '#e91e63',  // string: color activo
    tabBarInactiveBackgroundColor: '#f0f0f0',  // string: fondo inactivo
    tabBarActiveBackgroundColor: '#fff',  // string: fondo activo
    tabBarItemStyle: {},  // object: estilos del item
    tabBarIconStyle: {},  // object: estilos del ícono
    tabBarHideOnKeyboard: false,  // boolean: ocultar al abrir teclado
    
    // HEADER OPTIONS (mismas que stack)
    headerShown: true, title: 'Título', headerStyle: {}, headerTintColor: '#000',
    
    // UNMOUNT OPTIONS
    unmountOnBlur: false,  // boolean: desmontar al perder foco
  }}
>
''',

# // ============================================
# // DRAWER NAVIGATOR
# // ============================================

'nav.drawer.init':'''
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();
function MyDrawer() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
    </Drawer.Navigator>
  );
}
''',

'nav.drawer.properties':'''
<Drawer.Navigator
  initialRouteName="Home"  // string: primera pantalla
  backBehavior="history"  // 'history' | 'initialRoute' | 'none'
  drawerPosition="left"  // 'left' | 'right': posición del drawer
  drawerType="front"  // 'front' | 'back' | 'slide' | 'permanent': comportamiento
  openByDefault={false}  // boolean: abierto por defecto
  gestureEnabled={true}  // boolean: habilitar gestos
  gestureHandlerProps={{}}  // object: props para el gesto
  edgeWidth={100}  // number: píxeles desde borde para abrir
  minSwipeDistance={10}  // number: distancia mínima de deslizamiento
  overlayColor="rgba(0,0,0,0.5)"  // string: color del overlay
  drawerStyle={{ backgroundColor: '#fff', width: 280 }}  // object: estilos del drawer
  drawerContent={(props) => <MiDrawer {...props} />}  // function: contenido personalizado
  sceneContainerStyle={{}}  // object: estilos de la escena
  detachInactiveScreens={true}  // boolean: optimización
  useLegacyImplementation={false}  // boolean: usar implementación legacy
  id="mi-drawer"  // string: identificador
  screenOptions={{}}  // object: opciones globales
  drawerContentOptions={{  // object: opciones del contenido
    activeTintColor: '#e91e63', activeBackgroundColor: 'rgba(0,0,0,0.04)',
    inactiveTintColor: '#333', inactiveBackgroundColor: 'transparent',
    itemsContainerStyle: {}, itemStyle: {}, labelStyle: {}, iconContainerStyle: {},
    allowFontScaling: true
  }}
>
  <Drawer.Screen name="Feed" component={FeedScreen} />
</Drawer.Navigator>
''',

'nav.drawer.options':'''
<Drawer.Screen
  name="Feed"
  component={FeedScreen}
  options={{
    // DRAWER OPTIONS
    drawerIcon: ({ focused, color, size }) => <Icon />,  // function: ícono en drawer
    drawerLabel: 'Feed',  // string | function: etiqueta en drawer
    drawerLabelStyle: {},  // object: estilos de la etiqueta
    drawerAllowFontScaling: true,  // boolean: escalar fuente
    drawerActiveTintColor: '#e91e63',  // string: color activo
    drawerInactiveTintColor: '#333',  // string: color inactivo
    drawerActiveBackgroundColor: 'rgba(0,0,0,0.04)',  // string: fondo activo
    drawerInactiveBackgroundColor: 'transparent',  // string: fondo inactivo
    drawerItemStyle: {},  // object: estilos del item
    drawerLabelPosition: 'beside-icon',  // 'beside-icon' | 'below-icon'
    swipeEnabled: true,  // boolean: permitir swipe en esta pantalla
    
    // TITLE OPTIONS
    title: 'Feed',  // string: título en header
    
    // HEADER OPTIONS (mismas que stack)
    headerShown: true, 
    headerStyle: {},
    headerTintColor: '#000',
    
    // UNMOUNT OPTIONS
    unmountOnBlur: false,  // boolean: desmontar al perder foco
  }}
  initialParams={{}}
  listeners={{}}
>
''',

# // ============================================
# // NATIVE STACK NAVIGATOR
# // ============================================

'nav.nativestack.init':'''
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const NativeStack = createNativeStackNavigator();
function MyNativeStack() {
  return (
    <NativeStack.Navigator>
      <NativeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
      <NativeStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
    </NativeStack.Navigator>
  );
}
''',

'nav.nativestack.properties':'''
<NativeStack.Navigator
  initialRouteName="Home"  // string: primera pantalla
  presentation="card"  // 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'formSheet'
  animation="default"  // 'default' | 'fade' | 'flip' | 'none' | 'slide_from_bottom' | 'simple_push'
  animationTypeForReplace="push"  // 'push' | 'pop': animación al reemplazar
  autoHideHomeIndicator={true}  // boolean: ocultar indicador home (iOS)
  enableFreeze={true}  // boolean: congelar pantallas no visibles
  fullScreenGestureEnabled={true}  // boolean: gesto pantalla completa
  gestureEnabled={true}  // boolean: habilitar gestos
  gestureDirection="horizontal"  // 'horizontal' | 'vertical'
  statusBarAnimation="fade"  // 'fade' | 'slide' | 'none': animación status bar
  statusBarStyle="light"  // 'light' | 'dark' | 'inverted': estilo status bar
  statusBarHidden={false}  // boolean: ocultar status bar
  id="mi-native-stack"  // string: identificador
  screenOptions={{}}  // object: opciones globales
>
  <NativeStack.Screen name="Home" component={HomeScreen} />
</NativeStack.Navigator>
''',

'nav.nativestack.options':'''
<NativeStack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    // HEADER OPTIONS (nativas)
    headerShown: true, header: () => <Header />, headerLargeTitle: false,  // boolean | function | boolean
    headerLargeTitleStyle: {}, headerLargeTitleHideShadow: false,  // object | boolean
    headerTitle: 'Título', headerTitleStyle: {}, headerTitleAlign: 'center',  // string | object | 'center'|'left'
    headerStyle: {}, headerTintColor: '#000', headerTransparent: false,  // object | string | boolean
    headerShadowVisible: true, headerBackVisible: true, headerBackTitle: 'Atrás',  // boolean | boolean | string
    headerBackTitleStyle: {}, headerBackTitleVisible: true,  // object | boolean
    headerBackImage: () => <Icon />, headerLeft: () => <Button />,  // function | function
    headerRight: () => <Button />, headerPressColor: 'rgba(0,0,0,0.1)',  // function | string
    headerPressOpacity: 0.8,  // number
    
    // ANIMATION OPTIONS (nativas)
    animation: 'slide_from_right', animationDuration: 300,  // string | number
    fullScreenGestureEnabled: false, gestureEnabled: true,  // boolean | boolean
    
    // STATUS BAR OPTIONS
    statusBarStyle: 'dark', statusBarHidden: false, statusBarAnimation: 'fade',  // string | boolean | string
    autoHideHomeIndicator: true,  // boolean
    
    // CONTENT OPTIONS
    contentStyle: {},  // object: estilos del contenido
    
    // FREEZE OPTIONS
    freezeOnBlur: false,  // boolean: congelar al perder foco
  }}
  initialParams={{}}
  listeners={{}}
>
''',

# // ============================================
# // MATERIAL TOP TABS NAVIGATOR
# // ============================================

'nav.materialtoptabs.init':'''
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const TabTop = createMaterialTopTabNavigator();

function MyTopTabs() {
  return (
    <TabTop.Navigator>
      <TapTop.Screen name="Home" component={HomeScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
      <TapTop.Screen name="Profile" component={ProfileScreen} options={{ title: 'Bienvenida', headerShown: true  }}/>
    </TapTop.Navigator>
  );
}
''',

'nav.materialtoptabs.properties':'''
  // initialRouteName="Chats"  // string: primera pantalla
  // backBehavior="history"  // 'history' | 'initialRoute' | 'order' | 'none'
  // swipeEnabled={true}  // boolean: permitir deslizamiento
  // animationEnabled={true}  // boolean: animaciones
  // lazy={false}  // boolean: carga perezosa
  // lazyPreloadDistance={0}  // number: distancia para precarga
  // lazyPlaceholder={() => <View />}  // function: placeholder mientras carga
  // direction="ltr"  // 'ltr' | 'rtl': dirección
  // orientation="horizontal"  // 'horizontal' | 'vertical': orientación
  // tabBar={(props) => <MiTabBar {...props} />}  // function: tab bar personalizado
  tabBarOptions={{  // object: opciones del tab bar
    activeTintColor: '#e91e63',
      inactiveTintColor: '#999',
      pressColor: 'rgba(0,0,0,0.1)',
      // pressOpacity: 0.8,
      // showLabel: true, 
      // showIcon: false, 
      // upperCaseLabel: true,
      // labelStyle: {}, 
      // tabStyle: {}, 
      // style: {}, 
      // indicatorStyle: {},
      // indicatorContainerStyle: {},
      // scrollEnabled: false,
      // allowFontScaling: true
  }}
''',

'nav.materialtoptabs.options':'''
<MaterialTopTab.Screen
  name="Chats"
  component={ChatsScreen}
  options={{
    // TAB OPTIONS
    tabBarIcon: ({ focused, color }) => <Icon />,  // function: ícono
    tabBarLabel: 'Chats',  // string | function: etiqueta
    tabBarLabelStyle: {},  // object: estilos etiqueta
    tabBarAllowFontScaling: true,  // boolean: escalar fuente
    tabBarAccessibilityLabel: 'Chats',  // string: accesibilidad
    tabBarButton: (props) => <TouchableOpacity {...props} />,  // function: botón
    tabBarButtonTestID: 'chats-tab',  // string: test ID
    tabBarShowLabel: true,  // boolean: mostrar etiqueta
    tabBarActiveTintColor: '#e91e63',  // string: color activo
    tabBarInactiveTintColor: '#999',  // string: color inactivo
    tabBarIndicatorStyle: {},  // object: estilo del indicador
    
    // SWIPE OPTIONS
    swipeEnabled: true,  // boolean: permitir swipe
    
    // LAZY OPTIONS
    lazy: false,  // boolean: carga perezosa
    
    // TITLE OPTIONS
    title: 'Chats',  // string: título
    
    // UNMOUNT OPTIONS
    unmountOnBlur: false,  // boolean: desmontar al perder foco
  }}
  initialParams={{}}
  listeners={{}}
>
''',

'nav.drawer.custom.init':'''
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

// ============================================
// CUSTOM DRAWER CONTENT
// ============================================
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Header del Drawer */}
      <View style={{ padding: 20, backgroundColor: '#f4511e' }}>
        {/* ✅ Comentario correcto */}
        {/* <Image 
          source={{ uri: 'https://tu-imagen.com/avatar.jpg' }}
          style={{ width: 60, height: 60, borderRadius: 30 }}
        /> */}
        <Text style={{ color: '#fff', fontSize: 18, marginTop: 10 }}>
          Bienvenido Usuario
        </Text>
        <Text style={{ color: '#fff', fontSize: 14 }}>
          usuario@email.com
        </Text>
      </View>

      {/* Items del Drawer */}
      <DrawerItem
        label="Inicio"
        icon={({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate('Home')}
      />
      
      <DrawerItem
        label="Perfil"
        icon={({ color, size }) => (
          <Icon name="person" size={size} color={color} />
        )}
        onPress={() => props.navigation.navigate('Profile')}
      />

      {/* Separador */}
      <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }} />

      <DrawerItem
        label="Cerrar Sesión"
        icon={({ color, size }) => (
          <Icon name="log-out" size={size} color={color} />
        )}
        onPress={() => console.log('Cerrar sesión')}  // ✅ temporal
      />
    </DrawerContentScrollView>
  );
}

// ============================================
// DRAWER NAVIGATOR
// ============================================

function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen 
        name="Home" 
        component={LobbyPage} 
        options={{ 
          title: 'Inicio',
          drawerLabel: 'Inicio',
        }}
      />
    </Drawer.Navigator>
  );
}
''',

'nav.screens.help.params.function':'''
// Pantalla que ENVÍA (HomeScreen)
function HomeScreen({ navigation }) {
  return (
    <Button 
      title="Ir a Perfil"
      onPress={() => navigation.navigate('Profile', { 
        userId: 123, 
        name: 'Juan' 
      })}
    />
  );
}

// Pantalla que RECIBE (ProfileScreen)
function ProfileScreen({ route }) {
  const { userId, name } = route.params;
  return (
    <View>
      <Text>ID: {userId}</Text>
      <Text>Nombre: {name}</Text>
    </View>
  );
}
''',

'nav.navigation.help.parameters':'''
// Navegar
navigation.navigate('Profile');
navigation.navigate('Profile', { id: 1 });

// Volver
navigation.goBack();

// Reemplazar (sin historial)
navigation.replace('Login');

// Abrir/Cerrar Drawer
navigation.openDrawer();
navigation.closeDrawer();
navigation.toggleDrawer();
''',

# // ============================================
# // STACK NAVIGATOR - COMÚN
# // ============================================

'nav.stack.common.init':'''
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Atrás',
        gestureEnabled: true,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}
''',

# // ============================================
# // BOTTOM TABS NAVIGATOR - COMÚN
# // ============================================

'nav.tabs.common.init':'''
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: true,
        headerShown: true,
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
          tabBarBadge: 3,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
''',

# // ============================================
# // DRAWER NAVIGATOR - COMÚN
# // ============================================

'nav.drawer.common.init':'''
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: '#f4511e',
        drawerInactiveTintColor: '#333',
        drawerActiveBackgroundColor: 'rgba(244,81,30,0.1)',
        drawerStyle: { width: 280, backgroundColor: '#fff' },
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
      })}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
          drawerLabel: 'Inicio',
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
          drawerLabel: 'Mi Perfil',
        }}
      />
    </Drawer.Navigator>
  );
}
''',

# // ============================================
# // NATIVE STACK NAVIGATOR - COMÚN
# // ============================================

'nav.stack.common.init':'''
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function MyNativeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#f4511e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerLargeTitle: false,
        animation: 'slide_from_right',
        presentation: 'card',
        gestureEnabled: true,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Inicio',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
          headerBackTitle: 'Volver',
        }}
      />
    </Stack.Navigator>
  );
}
''',

# // ============================================
# // MATERIAL TOP TABS NAVIGATOR - COMÚN
# // ============================================

'nav.materialtoptabs.common.init':'''
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TapTop = createMaterialTopTabNavigator();

function MyTopTabs() {
  return (
    <TapTop.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: '#999',
        tabBarIndicatorStyle: { backgroundColor: '#f4511e' },
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#fff' },
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
      }}
    >
      <TapTop.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />
      <TapTop.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
    </TapTop.Navigator>
  );
}
''',

# // ============================================
# // AUTH FLOW - STACK CON DRAWER/TABS
# // ============================================

'nav.auth.flow.init':'''
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          // App Stack (con Tabs o Drawer)
          <Stack.Screen name="MainApp" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Ejemplo con Tabs
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
''',

    # ============================================
    # ROW - variantes prácticas
    # ============================================
    
    # Row con espacio entre elementos (como Flet con alignment)
    "rn.row.between": """
<View style={styles.rowBetween}>
    {children}
</View>

const styles = StyleSheet.create({
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
""",

    # Row centrado (horizontal y vertical)
    "rn.row.center": """
<View style={styles.rowCenter}>
    {children}
</View>

const styles = StyleSheet.create({
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
""",

    # Row con wrap (que se envuelve)
    "rn.row.wrap": """
<View style={styles.rowWrap}>
    {children}
</View>

const styles = StyleSheet.create({
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
});
""",

    # ============================================
    # COLUMN - variantes prácticas
    # ============================================
    
    # Column con espacio entre elementos
    "rn.column.between": """
<View style={styles.columnBetween}>
    {children}
</View>

const styles = StyleSheet.create({
    columnBetween: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
    },
});
""",

    # Column centrado
    "rn.column.center": """
<View style={styles.columnCenter}>
    {children}
</View>

const styles = StyleSheet.create({
    columnCenter: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
});
""",

    # ============================================
    # CONTAINER - como en Flet
    # ============================================
    
    # Container básico (con padding y fondo)
    "rn.container": """
<View style={[styles.container, style]}>
    {children}
</View>

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
});
""",

    # Container centrado (como Flet con alignment.center)
    "rn.container.center": """
<View style={styles.containerCenter}>
    {children}
</View>

const styles = StyleSheet.create({
    containerCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
""",

    # Container con sombra (como Flet con elevation)
    "rn.container.card": """
<View style={styles.containerCard}>
    {children}
</View>

const styles = StyleSheet.create({
    containerCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
""",

    # ============================================
    # EXPANDED (como Flet, ocupa espacio restante)
    # ============================================
    
    "rn.expanded": """
<View style={{ flex: 1 }}>
    {children}
</View>
""",

    # ============================================
    # GAP (espacio entre hijos)
    # ============================================
    
    "rn.gap": """
<View style={{ gap: size }}>
    {children}
</View>
// size: número (ej: 8, 16)
""",
}
