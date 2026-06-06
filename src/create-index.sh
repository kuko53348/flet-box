#!/bin/bash
# create-indexes.sh - Creates all index.js files for FletBox
# CORREGIDO: Inspector está en widgets/, NO en utils/

echo "🚀 Creating index.js files for FletBox..."
echo ""

# ========== ROOT INDEX ==========
cat > index.js << 'EOF'
// index.js - Main entry point for FletBox
// Automatically generated - DO NOT EDIT MANUALLY

// ========== CORE ==========
export { 
    runApp, 
    createApp,
    insertBy, 
    prependBy, 
    insertBefore, 
    insertAfter, 
    replaceBy,
    mountAll
} from './src/core/runApp.js';

export { createWidget } from './src/widget-builder/index.js';

// ========== UTILS ==========
export {
    colors, setTheme, getTheme, toggleTheme, subscribeTheme,
    applySystemTheme, watchSystemTheme, getColor, palettes,
    getWidgetProps, getWidgetProp, stringifyWidgetProps,
    useState, useWatchState,
    tokenize, generateHighlightedHtml, highlightColors,
    parseMarkdown, parseInlineMarkdown, escapeHtml, wrapListItems,
    animate, fadeOut, fadeIn, pulse,
    applyStripes, removeStripes, applyShimmer, applyGlow,
    applyIndeterminate, applyPulse, injectKeyframes,
    Gradient, Shadow, rgba, stackPosition,
    toREM, setBaseFontSize, toPX, getBaseFontSize,
    clipboard, createList, delay, withMinDelay, retry,
    dimensions, width, height, addNavigation, random,
    TextInputValidator,
    stringifyWidget, printWidgetCode
} from './src/utils/index.js';

// ========== WIDGETS ==========
export {
    Container, Row, Column, Stack, ListView, GridView,
    Text, Button, Icon, Image, Avatar, Card, ListTile,
    ProgressBar, Rating, Chip, Badge, Divider, Accordion,
    Input, Radio, Switch, Checkbox, Dropdown,
    SnackBar, Modal, BottomSheet, AlertDialog,
    FloatingActionButton,
    CodeViewer, Markdown, Inspector, inspect, inspectWidget,
    DraggBox, DroppBox
} from './src/widgets/index.js';

// ========== NAVIGATIONS ==========
export {
    Scaffold, AppBar, Drawer, BottomNavigation, Tabs, DrawerItem,
    openDrawer, closeDrawer, toggleDrawer, destroyDrawer,
    initRouter, goTo, goBack, goForward, replace,
    getCurrentPath, getCurrentRoute, getCurrentRouteConfig,
    getRoute, isActive, subscribe, useParams, useQueryParams,
    buildUrl, clearRouter
} from './src/navigations/index.js';

// ========== SERVICES ==========
export {
    RamStore,
    saveRam, getRam, getAllRam, getAllRamKeys, hasRam,
    updateRam, deleteRam, clearAllRam, subscribeRam,
    getRamItemCount, isRamAvailable,
    Session,
    saveSession, getSession, getSessionSync, updateSession,
    deleteSession, clearAllSession, hasSession, getAllSessionKeys,
    getAllSessionData, getSessionSize, deleteSessionByPrefix,
    deleteSessionBySuffix, getSessionItemCount, isSessionAvailable,
    Storage,
    saveData, getData, getDataSync, updateData, deleteData,
    clearAllData, hasData, getAllKeys, getAllData, getStorageSize,
    deleteDataByPrefix, deleteDataBySuffix, getItemCount, isStorageAvailable,
    httpGet, httpPost, httpPut, httpPatch, httpDelete, httpRequest
} from './src/services/index.js';

// ========== ANIMATIONS ==========
export {
    AnimatedBox, AnimatedText
} from './src/animations/index.js';
EOF

echo "✅ Created: index.js"

# ========== SRC/CORE INDEX ==========
mkdir -p src/core
cat > src/core/index.js << 'EOF'
// src/core/index.js
export { runApp, createApp, insertBy, prependBy, insertBefore, insertAfter, replaceBy, mountAll } from './runApp.js';
EOF
echo "✅ Created: src/core/index.js"

# ========== SRC/UTILS INDEX ==========
mkdir -p src/utils
cat > src/utils/index.js << 'EOF'
// src/utils/index.js
// NOTA: Inspector está en widgets/, NO aquí
export { colors, setTheme, getTheme, toggleTheme, subscribeTheme, applySystemTheme, watchSystemTheme, getColor, palettes } from './themes.js';
export { getWidgetProps, getWidgetProp, stringifyWidgetProps } from './getWidgetProps.js';
export { useState, useWatchState } from './useState.js';
export { tokenize, generateHighlightedHtml, highlightColors } from './syntaxHighlight.js';
export { parseMarkdown, parseInlineMarkdown, escapeHtml, wrapListItems } from './markdownParser.js';
export { animate, fadeOut, fadeIn, pulse } from './animate.js';
export { applyStripes, removeStripes, applyShimmer, applyGlow, applyIndeterminate, applyPulse, injectKeyframes } from './visualEffects.js';
export { default as Gradient } from './Gradient.js';
export { default as Shadow } from './Shadow.js';
export { default as rgba } from './rgba.js';
export { default as stackPosition } from './stackPosition.js';
export { toREM, setBaseFontSize, toPX, getBaseFontSize } from './units.js';
export { clipboard } from './clipboard.js';
export { createList } from './createList.js';
export { delay, withMinDelay, retry } from './delay.js';
export { dimensions, width, height } from './dimensions.js';
export { addNavigation } from './navigation.js';
export { random } from './random.js';
export { TextInputValidator } from './TextInputValidator.js';
export { stringifyWidget, printWidgetCode } from './stringifyWidget.js';
EOF
echo "✅ Created: src/utils/index.js"

# ========== SRC/WIDGETS INDEX ==========
mkdir -p src/widgets
cat > src/widgets/index.js << 'EOF'
// src/widgets/index.js
export { Container } from './Container.js';
export { Row } from './Row.js';
export { Column } from './Column.js';
export { Stack } from './Stack.js';
export { ListView } from './ListView.js';
export { GridView } from './GridView.js';
export { Text } from './Text.js';
export { Button } from './Button.js';
export { Icon } from './Icon.js';
export { Image } from './Image.js';
export { Avatar } from './Avatar.js';
export { Card } from './Card.js';
export { ListTile } from './ListTile.js';
export { ProgressBar } from './ProgressBar.js';
export { Rating } from './Rating.js';
export { Chip } from './Chip.js';
export { Badge } from './Badge.js';
export { Divider } from './Divider.js';
export { Accordion } from './Accordion.js';
export { Input } from './Input.js';
export { Radio } from './Radio.js';
export { Switch } from './Switch.js';
export { Checkbox } from './Checkbox.js';
export { Dropdown } from './Dropdown.js';
export { SnackBar } from './SnackBar.js';
export { Modal } from './Modal.js';
export { BottomSheet } from './BottomSheet.js';
export { AlertDialog } from './AlertDialog.js';
export { FloatingActionButton } from './FloatingActionButton.js';
export { CodeViewer } from './CodeViewer.js';
export { Markdown } from './Markdown.js';
export { Inspector, inspect, inspectWidget } from './Inspector.js';
export { DraggBox } from './DraggBox.js';
export { DroppBox } from './DroppBox.js';
EOF
echo "✅ Created: src/widgets/index.js"

# ========== SRC/NAVIGATIONS INDEX ==========
mkdir -p src/navigations
cat > src/navigations/index.js << 'EOF'
// src/navigations/index.js
export { Scaffold } from './Scaffold.js';
export { AppBar } from './AppBar.js';
export { Drawer, openDrawer, closeDrawer, toggleDrawer, destroyDrawer } from './Drawer.js';
export { BottomNavigation } from './BottomNavigation.js';
export { Tabs } from './Tabs.js';
export { DrawerItem } from './DrawerItem.js';
export { initRouter, goTo, goBack, goForward, replace, getCurrentPath, getCurrentRoute, getCurrentRouteConfig, getRoute, isActive, subscribe, useParams, useQueryParams, buildUrl, clearRouter } from './Router.js';
EOF
echo "✅ Created: src/navigations/index.js"

# ========== SRC/SERVICES INDEX ==========
mkdir -p src/services
cat > src/services/index.js << 'EOF'
// src/services/index.js
export { default as RamStore, saveRam, getRam, getAllRam, getAllRamKeys, hasRam, updateRam, deleteRam, clearAllRam, subscribeRam, getRamItemCount, isRamAvailable } from './RamStore.js';
export { default as Session, saveSession, getSession, getSessionSync, updateSession, deleteSession, clearAllSession, hasSession, getAllSessionKeys, getAllSessionData, getSessionSize, deleteSessionByPrefix, deleteSessionBySuffix, getSessionItemCount, isSessionAvailable } from './Session.js';
export { default as Storage, saveData, getData, getDataSync, updateData, deleteData, clearAllData, hasData, getAllKeys, getAllData, getStorageSize, deleteDataByPrefix, deleteDataBySuffix, getItemCount, isStorageAvailable } from './Storage.js';
export { httpGet, httpPost, httpPut, httpPatch, httpDelete, httpRequest } from './http.js';
EOF
echo "✅ Created: src/services/index.js"

# ========== SRC/ANIMATIONS INDEX ==========
mkdir -p src/animations
cat > src/animations/index.js << 'EOF'
// src/animations/index.js
export { AnimatedBox } from './AnimatedBox.js';
export { AnimatedText } from './AnimatedText.js';
export { animate, fadeOut, fadeIn, pulse } from './animate.js';
EOF
echo "✅ Created: src/animations/index.js"

# ========== SRC/WIDGET-BUILDER INDEX ==========
mkdir -p src/widget-builder
cat > src/widget-builder/index.js << 'EOF'
// src/widget-builder/index.js
export { createWidget } from './createWidget.js';
export { assignProps } from './assignProps.js';
export { translateProps, createTranslator } from './translateProps.js';
export { makeParentable } from './parentable.js';
export { addChildren } from './children.js';
export { applyEffects } from './effects.js';
export { toREM, remProps } from './utils.js';
export { makeReactive } from './reactivity.js';
export { setupEvents } from './events.js';
export { addLifecycle } from './lifecycle.js';
EOF
echo "✅ Created: src/widget-builder/index.js"

echo ""
echo "🎉 All index.js files created successfully!"
echo ""
echo "📂 Structure:"
echo "   ├── index.js"
echo "   ├── src/"
echo "   │   ├── core/index.js"
echo "   │   ├── utils/index.js      (NO incluye Inspector)"
echo "   │   ├── widgets/index.js    (incluye Inspector)"
echo "   │   ├── navigations/index.js"
echo "   │   ├── services/index.js"
echo "   │   ├── animations/index.js"
echo "   │   └── widget-builder/index.js"
echo ""
echo "✅ Inspector está en widgets/, NO en utils/"
