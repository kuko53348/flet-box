// src/index.js - Main entry point

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
} from './core/runApp.js';

export { createWidget } from './widget-builder/index.js';
// src/index.js
export { initHMR, getHMR } from './core/hmr-client.js';
// ========== TOOLS ==========
export {
    mapList, repeat, range,
    shuffle, reverse, sort, unique, chunk,
    capitalize, capitalizeWords, lowerCase, upperCase, reverseString, truncate,
    animation,
    border, gradient, margin, padding, rgba, shadow,
    transform, transition, filter, flex, grid,
    color,
    clipboard,
    createList, random,
    delay, withMinDelay, retry, sleep, now, formatDate, relativeTime,
    device, os,
    dimensions, width, height,
    useState, useWatchState,
    memo, memoWithKey, clearMemo,
    uuid, shortId, numericId, timestampId,
    dict, emptyDict, fromJSON, fromEntries
} from './tools/index.js';

// ========== UTILS ==========
export {
    colors, setTheme, getTheme, toggleTheme, subscribeTheme,
    applySystemTheme, watchSystemTheme, getColor, palettes,
    getWidgetProps, getWidgetProp, stringifyWidgetProps,
    tokenize, generateHighlightedHtml, highlightColors,
    parseMarkdown, parseInlineMarkdown, escapeHtml,
    applyStripes, removeStripes, applyShimmer, applyGlow,
    applyIndeterminate, applyPulse, injectKeyframes,
    stackPosition,
    toREM, setBaseFontSize, toPX, getBaseFontSize,
    addNavigation,
    TextInputValidator
} from './utils/index.js';

// ========== WIDGETS ==========
export {
    Container, Row, Column, Stack, ListView, GridView,
    Text, Button, Icon, Image, Avatar, Card, ListTile,
    ProgressBar, Rating, Chip, Badge, Divider, Accordion,
    Input, Radio, Switch, Checkbox, Dropdown,
    Slider, SnackBar, Modal, BottomSheet, AlertDialog,
    FloatingActionButton, Stepper, Skeleton,
    CodeViewer, Inspector, Pagination, TreeView, Chart, QRCode,
    DraggBox, DroppBox, DataTable, Carousel, Tooltip, 
} from './widgets/index.js';
// Markdown
// ========== NAVIGATIONS ==========
export {
    Scaffold, AppBar, Drawer, BottomNavigation, Tabs, DrawerItem,
    openDrawer, closeDrawer, toggleDrawer, destroyDrawer,
    initRouter, goTo, goBack, goForward, replace,
    getCurrentPath, getCurrentRoute, getCurrentRouteConfig,
    getRoute, isActive, subscribe, useParams, useQueryParams,
    buildUrl, clearRouter
} from './navigations/index.js';

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
} from './services/index.js';

// ========== ANIMATIONS ==========
export { AnimatedBox, AnimatedText ,animate } from './animations/index.js';
