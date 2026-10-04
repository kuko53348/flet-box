only_controls = {
'rn.comment.line':'''
// ============================================
// COMENTARIO
// ============================================
''',
'rn.comentary':'''
{/* comentary */}
''',
'rn.import.components':'''
import {StyleSheet} from 'react-native';
''',
'rn.import.Icon':'''
// import { Ionicons } from '@expo/vector-icons';  // Expo
import Icon from 'react-native-vector-icons/Ionicons';  // CLI
''',
'rn.import.pages':'''
import LobbyPage from "./pages/LobbyPage";
import SettingsPage from "./pages/SettingsPage";
''',

# ============================================
# 📦 STACK NAVIGATOR - INSTALACIÓN
# ============================================

"rn.install.stack": """
# Stack Navigator - Instalación
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
cd ios && pod install && cd ..
""",

"rn.install.stack.expo": """
# Stack Navigator - Para Expo
npx expo install @react-navigation/native @react-navigation/native-stack
""",
# ============================================
# 📦 DRAWER NAVIGATOR - INSTALACIÓN MÍNIMA
# ============================================

"rn.install.drawer": """
# Drawer Navigator - Instalación mínima
npx expo install @react-navigation/drawer
npx expo install react-native-gesture-handler react-native-reanimated
cd ios && pod install && cd ..

# ADEMÁS, CONFIGURACIÓN OBLIGATORIA
# Editar babel.config.js
plugins: ['react-native-reanimated/plugin']
""",

"rn.install.drawer.expo": """
# Drawer Navigator - Para Expo
npx expo install @react-navigation/drawer
npx expo install react-native-gesture-handler react-native-reanimated
""",

"rn.config.drawer": """
# Configurar Reanimated (obligatorio)
# Editar babel.config.js y agregar:
plugins: ['react-native-reanimated/plugin']

# Limpiar caché después
npx react-native start --reset-cache
""",


# ============================================
# 📦 BOTTOM TABS NAVIGATOR - INSTALACIÓN MÍNIMA
# ============================================

"rn.install.tabs": """
# Bottom Tabs Navigator - Instalación mínima
npm install @react-navigation/bottom-tabs
cd ios && pod install && cd ..
""",

"rn.install.tabs.expo": """
# Bottom Tabs Navigator - Para Expo
npx expo install @react-navigation/bottom-tabs
""",

# ============================================
# 📦 MATERIAL TOP TABS NAVIGATOR - INSTALACIÓN MÍNIMA
# ============================================

"rn.install.toptabs": """
# Material Top Tabs Navigator - Instalación mínima
npm install @react-navigation/material-top-tabs
npm install react-native-tab-view react-native-pager-view
cd ios && pod install && cd ..
""",

"rn.install.toptabs.expo": """
# Material Top Tabs Navigator - Para Expo
npx expo install @react-navigation/material-top-tabs
npx expo install react-native-tab-view react-native-pager-view
""",
    # ============================================
    # CLASE 1: WIDGETS BÁSICOS (View, Text, Image, Iconos)
    # ============================================
    
    "rn.view": """
<View style={styles.view}>
    {/* Contenido aquí */}
</View>
""",
    "rn.view.attributes": """
//: [flex,position] ,[opacity,transform] ,[visible,pointerEvents]
// accessible={true}
// accessibilityLabel="View"
// collapsable={true}
// needsOffscreenAlphaCompositing={false}
// renderToHardwareTextureAndroid={false}
// shouldRasterizeIOS={false}
// elevation={4}
// hitSlop={{top:10,left:10,bottom:10,right:10}}
// nativeID="view1"
// testID="view-test"
<View style={styles.view}>
    {/* Contenido aquí */}
</View>
""",
    "rn.text": """
<Text style={styles.text}>
    {/* Texto aquí */}
</Text>
""",
    "rn.text.attributes": """
//: [fontSize,fontWeight] ,[color,textAlign] ,[numberOfLines,ellipsizeMode]
// selectable={true}
// selectionColor="#3498db"
// suppressHighlighting={false}
// allowFontScaling={true}
// maxFontSizeMultiplier={1.5}
// numberOfLines={2}
// ellipsizeMode="tail" // head, middle, tail, clip
// onPress={() => {}}
// onLongPress={() => {}}
<Text style={styles.text}>
    {/* Texto aquí */}
</Text>
""",
    "rn.textinput": """
<TextInput
    style={styles.input}
    value={value}
    onChangeText={setValue}
    placeholder="Escribe aquí"
/>
""",
    "rn.textinput.attributes": """
//: [placeholder,value] ,[keyboardType,secureTextEntry] ,[autoCapitalize,autoCorrect]
// editable={true}
// multiline={false}
// numberOfLines={1}
// maxLength={100}
// placeholderTextColor="#999"
// selectionColor="#3498db"
// cursorColor="#3498db"
// keyboardType="default" // default, email-address, numeric, phone-pad, etc.
// returnKeyType="done" // done, go, next, search, send, etc.
// secureTextEntry={false}
// autoCapitalize="none" // none, sentences, words, characters
// autoCorrect={true}
// autoComplete="off"
// textContentType="none"
// enablesReturnKeyAutomatically={true}
// clearButtonMode="never"
// clearTextOnFocus={false}
// selectTextOnFocus={false}
// spellCheck={true}
// blurOnSubmit={true}
// onFocus={() => {}}
// onBlur={() => {}}
// onSubmitEditing={() => {}}
// onKeyPress={() => {}}
<TextInput
    style={styles.input}
    value={value}
    onChangeText={setValue}
    placeholder="Escribe aquí"
/>
""",
    "rn.touchableopacity": """
<TouchableOpacity style={styles.button} onPress={() => {}}>
    {/* Contenido del botón */}
</TouchableOpacity>
""",
    "rn.touchableopacity.attributes": """
//: [activeOpacity,disabled] ,[onPress,onLongPress] ,[delayPressIn,delayPressOut]
// activeOpacity={0.7}
// disabled={false}
// hitSlop={{top:10,left:10,bottom:10,right:10}}
// pressRetentionOffset={{top:10,left:10,bottom:10,right:10}}
// onPress={() => {}}
// onLongPress={() => {}}
// onPressIn={() => {}}
// onPressOut={() => {}}
// onLayout={() => {}}
// delayPressIn={0}
// delayPressOut={0}
// delayLongPress={500}
<TouchableOpacity style={styles.button} onPress={() => {}}>
    {/* Contenido del botón */}
</TouchableOpacity>
""",
    "rn.pressable": """
<Pressable style={styles.pressable} onPress={() => {}}>
    <Text style={styles.pressableText}>{/* Texto aquí */}</Text>
</Pressable>
""",
    "rn.pressable.attributes": """
//: [onPress,onLongPress] ,[disabled,hitSlop] ,[delayLongPress,android_ripple]
// onPress={() => {}}
// onLongPress={() => {}}
// onPressIn={() => {}}
// onPressOut={() => {}}
// disabled={false}
// hitSlop={{top:10,left:10,bottom:10,right:10}}
// pressRetentionOffset={{top:10,left:10,bottom:10,right:10}}
// delayLongPress={500}
// android_ripple={{color: '#rgba(0,0,0,0.2)', borderless: false, radius: 150}}
<Pressable style={styles.pressable} onPress={() => {}}>
    <Text style={styles.pressableText}>{/* Texto aquí */}</Text>
</Pressable>
""",
    "rn.image": """
<Image
    style={styles.image}
    source={{uri: 'https://ejemplo.com/imagen.jpg'}}
    {/*source={require('./assets/logo.png')}*/}
    style={{ width: 60, height: 60, borderRadius: 30 }}
/>
""",
'rn.imageBackGround':'''
<ImageBackground
  source={require('./assets/background.jpg')}
  style={{ flex: 1 }}
  imageStyle={{ opacity: 0.5 }}  // opacidad de la imagen
>
    {/* set witdget */}
</ImageBackground>
''',
    "rn.image.attributes": """
//: [source,resizeMode] ,[width,height] ,[borderRadius,borderWidth]
// source={{uri: 'https://ejemplo.com/imagen.jpg'}}
// source={require('./assets/imagen.png')}
// resizeMode="cover" // cover, contain, stretch, repeat, center
// fadeDuration={300}
// blurRadius={0}
// progressiveRenderingEnabled={false}
// loadingIndicatorSource={require('./assets/loader.gif')}
// onLoad={() => {}}
// onLoadStart={() => {}}
// onLoadEnd={() => {}}
// onError={() => {}}
// onProgress={() => {}}
// defaultSource={require('./assets/placeholder.png')}
<Image
    style={styles.image}
    source={{uri: 'https://ejemplo.com/imagen.jpg'}}
/>
""",
    "rn.icon": """
<Icon name="home" size={24} color="#000" style={styles.icon} />
""",
    "rn.iconbutton": """
<TouchableOpacity style={styles.iconButton} onPress={() => {}}>
    <Icon name="home" size={24} color="#000" />
</TouchableOpacity>
""",
    
    # ============================================
    # CLASE 2: BOTONES (Elevated, Text, Outlined, Filled, Tonal)
    # ============================================
    
    "rn.button.elevated": """
<TouchableOpacity style={styles.elevatedButton} onPress={() => {}}>
    <Text style={styles.elevatedButtonText}>{/* Texto del botón */}</Text>
</TouchableOpacity>
""",
    "rn.button.text": """
<TouchableOpacity style={styles.textButton} onPress={() => {}}>
    <Text style={styles.textButtonText}>{/* Texto del botón */}</Text>
</TouchableOpacity>
""",
    "rn.button.outlined": """
<TouchableOpacity style={styles.outlinedButton} onPress={() => {}}>
    <Text style={styles.outlinedButtonText}>{/* Texto del botón */}</Text>
</TouchableOpacity>
""",
    "rn.button.filled": """
<TouchableOpacity style={styles.filledButton} onPress={() => {}}>
    <Text style={styles.filledButtonText}>{/* Texto del botón */}</Text>
</TouchableOpacity>
""",
    "rn.button.tonal": """
<TouchableOpacity style={styles.tonalButton} onPress={() => {}}>
    <Text style={styles.tonalButtonText}>{/* Texto del botón */}</Text>
</TouchableOpacity>
""",
    
    # ============================================
    # CLASE 3: LAYOUT (Contenedores, Row, Column, Stack, Card)
    # ============================================
    
    "rn.row": """
<View style={styles.row}>
    {/* Componentes en fila */}
</View>
""",
    "rn.column": """
<View style={styles.column}>
    {/* Componentes en columna */}
</View>
""",
    "rn.wrap": """
<View style={styles.wrap}>
    {/* Componentes con wrap */}
</View>
""",
    "rn.stack": """
<View style={styles.stack}>
    <View style={styles.stackAbsolute}>
        {/* Capa de fondo */}
    </View>
    <View style={styles.stackContent}>
        {/* Contenido principal */}
    </View>
</View>
""",
    "rn.center": """
<View style={styles.center}>
    {/* Contenido centrado */}
</View>
""",
    "rn.safearea": """
<SafeAreaView style={styles.safeArea}>
    {/* Contenido en área segura */}
</SafeAreaView>
""",
    "rn.keyboardavoidingview": """
<KeyboardAvoidingView 
    style={styles.keyboardAvoid}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
    {/* Contenido que evita teclado */}
</KeyboardAvoidingView>
""",
    "rn.scrollview": """
<ScrollView style={styles.scrollView}>
    {/* Contenido desplazable */}
</ScrollView>
""",
    "rn.divider": """
<View style={styles.divider} />
""",
    "rn.card": """
<View style={styles.card}>
    {/* Contenido de la tarjeta */}
</View>
""",
    "rn.listitem": """
<View style={styles.listItem}>
    {/* Contenido del item de lista */}
</View>
""",
    "rn.expansiontile": """
<View style={styles.expansionTile}>
    <TouchableOpacity style={styles.expansionHeader} onPress={() => {}}>
        <Text style={styles.expansionTitle}>{/* Título del panel */}</Text>
    </TouchableOpacity>
    {isExpanded && (
        <View style={styles.expansionContent}>
            {/* Contenido expandido */}
        </View>
    )}
</View>
""",
    
    # ============================================
    # CLASE 4: LISTAS (FlatList, SectionList, Grid)
    # ============================================
    
    "rn.flatlist": """
<FlatList
    style={styles.list}
    data={data}
    renderItem={({item}) => (
        <Text style={styles.item}>{/* {item} */}</Text>
    )}
    keyExtractor={(item, index) => index.toString()}
/>
""",
    "rn.flatlist.attributes": """
//: [data,renderItem] ,[horizontal,showsScrollIndicator] ,[numColumns,columnWrapperStyle]
// data={[]}
// renderItem={({item, index, separators}) => <Text>{item}</Text>}
// keyExtractor={(item, index) => index.toString()}
// ListHeaderComponent={<Text>Header</Text>}
// ListFooterComponent={<Text>Footer</Text>}
// ListEmptyComponent={<Text>No hay datos</Text>}
// ItemSeparatorComponent={() => <View style={{height:1,backgroundColor:'#ccc'}} />}
// horizontal={false}
// showsHorizontalScrollIndicator={true}
// showsVerticalScrollIndicator={true}
// numColumns={1}
// columnWrapperStyle={null}
// initialNumToRender={10}
// maxToRenderPerBatch={10}
// windowSize={21}
// removeClippedSubviews={true}
// getItemLayout={(data, index) => ({length: 50, offset: 50 * index, index})}
// onRefresh={() => {}}
// refreshing={false}
// onEndReached={() => {}}
// onEndReachedThreshold={0.5}
// onScroll={() => {}}
// scrollEventThrottle={50}
// pagingEnabled={false}
// snapToAlignment="start" // start, center, end
// snapToInterval={100}
<FlatList
    style={styles.list}
    data={data}
    renderItem={({item}) => (
        <Text style={styles.item}>{/* {item} */}</Text>
    )}
    keyExtractor={(item, index) => index.toString()}
/>
""",
    "rn.sectionlist": """
<SectionList
    style={styles.list}
    sections={sections}
    renderItem={({item}) => <Text style={styles.item}>{/* {item} */}</Text>}
    renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{/* {section.title} */}</Text>}
    keyExtractor={(item, index) => index.toString()}
/>
""",
    "rn.virtualizedlist": """
<VirtualizedList
    style={styles.list}
    data={data}
    getItem={(data, index) => data[index]}
    getItemCount={(data) => data.length}
    renderItem={({item}) => <Text style={styles.item}>{/* {item} */}</Text>}
    keyExtractor={(item, index) => index.toString()}
/>
""",
    "rn.gridview": """
<FlatList
    style={styles.grid}
    data={data}
    renderItem={({item}) => (
        <View style={styles.gridItem}>
            <Text style={styles.gridText}>{/* {item} */}</Text>
        </View>
    )}
    keyExtractor={(item, index) => index.toString()}
    numColumns={2}
    columnWrapperStyle={styles.gridRow}
/>
""",
    
    # ============================================
    # CLASE 5: FORMULARIOS (Inputs, Switch, Checkbox, Radio, Picker)
    # ============================================
    
    "rn.switch": """
<Switch
    style={styles.switch}
    value={value}
    onValueChange={setValue}
/>
""",
    "rn.switch.attributes": """
//: [value,onValueChange] ,[disabled,trackColor] ,[thumbColor,ios_backgroundColor]
// value={false}
// onValueChange={() => {}}
// disabled={false}
// trackColor={{false: '#767577', true: '#81b0ff'}}
// thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
// ios_backgroundColor="#3e3e3e"
<Switch
    style={styles.switch}
    value={value}
    onValueChange={setValue}
/>
""",
    "rn.checkbox": """
import { CheckBox } from '@react-native-community/checkbox';

<CheckBox
    style={styles.checkbox}
    value={isSelected}
    onValueChange={setIsSelected}
/>
""",
    "rn.radio": """
import { RadioButton } from 'react-native-paper';

<RadioButton
    value={value}
    status={checked === value ? 'checked' : 'unchecked'}
    onPress={() => setChecked(value)}
/>
""",
    "rn.radiogroup": """
import { RadioButton } from 'react-native-paper';

<View style={styles.radioGroup}>
    <RadioButton.Item label="Opción 1" value="option1" status={selected === 'option1' ? 'checked' : 'unchecked'} onPress={() => setSelected('option1')} />
    <RadioButton.Item label="Opción 2" value="option2" status={selected === 'option2' ? 'checked' : 'unchecked'} onPress={() => setSelected('option2')} />
    <RadioButton.Item label="Opción 3" value="option3" status={selected === 'option3' ? 'checked' : 'unchecked'} onPress={() => setSelected('option3')} />
</View>
""",
    "rn.slider": """
import Slider from '@react-native-community/slider';

<Slider
    style={styles.slider}
    minimumValue={0}
    maximumValue={100}
    value={value}
    onValueChange={setValue}
/>
""",
    "rn.datetimepicker": """
import DateTimePicker from '@react-native-community/datetimepicker';

<DateTimePicker
    style={styles.datePicker}
    value={date}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {}}
/>
""",
    "rn.picker": """
import { Picker } from '@react-native-picker/picker';

<Picker
    style={styles.picker}
    selectedValue={selectedValue}
    onValueChange={(itemValue) => setSelectedValue(itemValue)}
>
    <Picker.Item label="Opción 1" value="option1" />
    <Picker.Item label="Opción 2" value="option2" />
    <Picker.Item label="Opción 3" value="option3" />
</Picker>
""",
    "rn.autocomplete": """
import { Autocomplete } from 'react-native-autocomplete-input';

<Autocomplete
    style={styles.autocomplete}
    data={filteredData}
    defaultValue={query}
    onChangeText={(text) => setQuery(text)}
    flatListProps={{
        renderItem: ({item}) => <TouchableOpacity onPress={() => selectItem(item)}><Text>{/* {item} */}</Text></TouchableOpacity>,
        keyExtractor: (item) => item.id,
    }}
/>
""",
    
    # ============================================
    # CLASE 6: FEEDBACK (ActivityIndicator, Modal, Alert, Snackbar)
    # ============================================
    
    "rn.activityindicator": """
<ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
""",
    "rn.refreshcontrol": """
<RefreshControl
    style={styles.refresh}
    refreshing={refreshing}
    onRefresh={onRefresh}
    colors={["#9Bd35A", "#689F38"]}
/>
""",
    "rn.badge": """
<View style={styles.badge}>
    <Text style={styles.badgeText}>{/* Texto del badge */}</Text>
</View>
""",
    "rn.banner": """
<View style={styles.banner}>
    <Text style={styles.bannerText}>{/* Mensaje del banner */}</Text>
    <TouchableOpacity style={styles.bannerButton} onPress={() => {}}>
        <Text style={styles.bannerButtonText}>Cerrar</Text>
    </TouchableOpacity>
</View>
""",
    "rn.alert": """
import { Alert } from 'react-native';

Alert.alert(
    "Título",
    "Mensaje",
    [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        { text: "OK", onPress: () => {} }
    ]
);
""",
    "rn.modal": """
<Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {}}
>
    <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={styles.modalText}>{/* Contenido del modal */}</Text>
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </View>
    </View>
</Modal>
""",
    "rn.alertdialog": """
<Modal
    transparent={true}
    visible={dialogVisible}
    onRequestClose={() => {}}
>
    <View style={styles.dialogOverlay}>
        <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>{/* Título del diálogo */}</Text>
            <Text style={styles.dialogMessage}>{/* Mensaje del diálogo */}</Text>
            <View style={styles.dialogActions}>
                <TouchableOpacity style={styles.dialogButton} onPress={() => {}}>
                    <Text style={styles.dialogButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogButton} onPress={() => {}}>
                    <Text style={styles.dialogButtonText}>Aceptar</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
""",
    "rn.snackbar": """
import { Snackbar } from 'react-native-paper';

<Snackbar
    visible={snackbarVisible}
    onDismiss={() => setSnackbarVisible(false)}
    duration={3000}
    action={{
        label: 'Cerrar',
        onPress: () => {},
    }}>
    {/* Mensaje del snackbar */}
</Snackbar>
""",
    "rn.progress": """
import { ProgressBar } from 'react-native-paper';

<ProgressBar style={styles.progress} progress={0.5} color="#3498db" />
""",
    
    # ============================================
    # CLASE 7: NAVEGACIÓN (Stack, Tabs, Drawer)
    # ============================================
    
    "rn.navigation.container": """
import { NavigationContainer } from '@react-navigation/native';

<NavigationContainer>
    {/* Navegadores aquí */}
</NavigationContainer>
""",
    "rn.stack.navigator": """
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

<Stack.Navigator screenOptions={styles.stackOptions}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Details" component={DetailsScreen} />
</Stack.Navigator>
""",
    "rn.tab.navigator": """
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

<Tab.Navigator screenOptions={styles.tabOptions}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
""",
    "rn.drawer.navigator": """
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

<Drawer.Navigator screenOptions={styles.drawerOptions}>
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
</Drawer.Navigator>
""",
    "rn.bottomnavigation": """
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

<Tab.Navigator
    screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
            let iconName;
            if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
    })}
>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
</Tab.Navigator>
""",
    "rn.appbar": """
<View style={styles.appBar}>
    <TouchableOpacity style={styles.appBarLeft} onPress={() => {}}>
        <Icon name="menu" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.appBarTitle}>{/* Título de la barra */}</Text>
    <View style={styles.appBarRight}>
        <TouchableOpacity onPress={() => {}}>
            <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
            <Icon name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
    </View>
</View>
""",
    
    # ============================================
    # CLASE 8: TABS (Material Top Tabs, Segmented)
    # ============================================
    
    "rn.tabs": """
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

<Tab.Navigator
    screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.tabIndicator,
        tabBarLabelStyle: styles.tabLabel,
    }}
>
    <Tab.Screen name="Tab1" component={Tab1Screen} />
    <Tab.Screen name="Tab2" component={Tab2Screen} />
    <Tab.Screen name="Tab3" component={Tab3Screen} />
</Tab.Navigator>
""",
    "rn.segmentedbutton": """
import SegmentedControlTab from 'react-native-segmented-control-tab';

<SegmentedControlTab
    values={['Opción 1', 'Opción 2', 'Opción 3']}
    selectedIndex={selectedIndex}
    onTabPress={(index) => setSelectedIndex(index)}
    tabsContainerStyle={styles.segmentedContainer}
    tabStyle={styles.segmentedTab}
    activeTabStyle={styles.segmentedActiveTab}
    tabTextStyle={styles.segmentedText}
    activeTabTextStyle={styles.segmentedActiveText}
/>
""",
    
    # ============================================
    # CLASE 9: OTROS COMPONENTES (Markdown, Gestos, Cupertino)
    # ============================================
    
    "rn.markdown": """
import Markdown from 'react-native-markdown-display';

<Markdown style={styles.markdown}>
    {markdownContent}
</Markdown>
""",
    "rn.dismissible": """
import Swipeable from 'react-native-gesture-handler/Swipeable';

<Swipeable
    renderLeftActions={() => (
        <View style={styles.leftAction}>
            <Text style={styles.actionText}>Archivar</Text>
        </View>
    )}
    renderRightActions={() => (
        <View style={styles.rightAction}>
            <Text style={styles.actionText}>Eliminar</Text>
        </View>
    )}
    onSwipeableOpen={() => {}}
    onSwipeableClose={() => {}}
>
    <View style={styles.dismissibleContent}>
        <Text>{/* Contenido deslizable */}</Text>
    </View>
</Swipeable>
""",
    "rn.gesturedetector": """
import { PanGestureHandler, TapGestureHandler, LongPressGestureHandler } from 'react-native-gesture-handler';

<PanGestureHandler onGestureEvent={onPanEvent}>
    <View style={styles.gestureArea}>
        <Text>{/* Contenido con gestos */}</Text>
    </View>
</PanGestureHandler>
""",
    "rn.shakelistener": """
import React, { useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 2.5) { // Umbral de shake
            onShake();
        }
    });
    return () => subscription.remove();
}, []);
""",
    "rn.cupertino.button": """
import { TouchableOpacity } from 'react-native';

<TouchableOpacity style={styles.cupertinoButton} onPress={() => {}}>
    <Text style={styles.cupertinoButtonText}>{/* Texto del botón iOS */}</Text>
</TouchableOpacity>
""",
    "rn.cupertino.switch": """
import { Switch } from 'react-native';

<Switch
    style={styles.cupertinoSwitch}
    value={value}
    onValueChange={setValue}
    trackColor={{false: '#e9e9e9', true: '#34c759'}}
    thumbColor={'#ffffff'}
    ios_backgroundColor="#e9e9e9"
/>
""",
    "rn.cupertino.textfield": """
<TextInput
    style={styles.cupertinoInput}
    value={value}
    onChangeText={setValue}
    placeholder="Escribe aquí"
    placeholderTextColor="#c7c7c7"
/>
""",
    
    # ============================================
    # CLASE 10: HOOKS DE REACT
    # ============================================
    
    "rn.usestate": """
const [state, setState] = useState(initialValue);
""",
    "rn.useeffect": """
useEffect(() => {
    // Código aquí
    return () => {
        // Cleanup
    };
}, [dependencies]);
""",
    "rn.usecontext": """
const contextValue = useContext(ContextName);
""",
    "rn.useref": """
const ref = useRef(initialValue);
""",
    "rn.usememo": """
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
""",
    "rn.usecallback": """
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
""",
    
    # ============================================
    # CLASE 11: IMPORTS
    # ============================================
    
    "rn.import.states": """
import React, { useState, useEffect } from 'react';
""",
    "rn.import.basic": """
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    FlatList,
    SectionList,
    TextInput,
    Image,
    Switch,
    Modal,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
""",
    "rn.import.navigation": """
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
""",
    "rn.import.vectoricons": """
import Icon from 'react-native-vector-icons/MaterialIcons';
""",
    "rn.import.paper": """
import { Provider as PaperProvider, Button, Card, TextInput as PaperInput, RadioButton, Checkbox, Snackbar, ProgressBar } from 'react-native-paper';
""",

}

