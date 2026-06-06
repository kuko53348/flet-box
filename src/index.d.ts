// index.d.ts
/**
 * FletBox - Declaraciones de tipos para el framework UI
 * @module flet-box
 */

declare module 'flet-box' {
    // =========================================================================
    // Tipos base
    // =========================================================================
    type Widget = HTMLElement;
    type Color = string;
    type Size = number | string;
    type Padding = number | string;
    type Margin = number | string;

    // =========================================================================
    // Props comunes (heredadas por todos los widgets)
    // =========================================================================
    interface CommonProps {
        width?: Size;
        height?: Size;
        size?: number;
        padding?: Padding;
        margin?: Margin;
        bgColor?: Color;
        color?: Color;
        borderRadius?: number | string;
        elevation?: number;
        shadow?: string;
        opacity?: number;
        visible?: boolean;
        disabled?: boolean;
        onPress?: (widget: Widget) => void;
        onClick?: (widget: Widget) => void;
        id?: string;
        className?: string;
        style?: Partial<CSSStyleDeclaration>;
    }

    // =========================================================================
    // useState Hook (persistente con RamStore)
    // =========================================================================
    export function useState<T>(key: string, initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];

    // =========================================================================
    // Layouts
    // =========================================================================
    interface ContainerProps extends CommonProps {
        direction?: 'row' | 'column';
        gap?: number | string;
        justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
        alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
        wrap?: boolean;
        child?: Widget;
        children?: Widget[];
        expand?: boolean;
    }
    export function Container(props: ContainerProps): Widget;

    interface RowProps extends CommonProps {
        gap?: number | string;
        justifyContent?: ContainerProps['justifyContent'];
        alignItems?: ContainerProps['alignItems'];
        wrap?: boolean;
        children?: Widget[];
        onPress?: (widget: Widget) => void;
    }
    export function Row(props: RowProps): Widget;

    interface ColumnProps extends CommonProps {
        gap?: number | string;
        justifyContent?: ContainerProps['justifyContent'];
        alignItems?: ContainerProps['alignItems'];
        children?: Widget[];
        onPress?: (widget: Widget) => void;
    }
    export function Column(props: ColumnProps): Widget;

    interface StackProps extends CommonProps {
        children?: Widget[];
        position?: 'relative' | 'absolute';
    }
    export function Stack(props: StackProps): Widget;

    interface ListViewProps {
        data: any[];
        renderItem: (item: any, index: number) => Widget;
        height?: number | string;
        width?: number | string;
        itemSize?: number;
        gap?: number;
        orientation?: 'vertical' | 'horizontal';
        wrapItems?: boolean;
        crossAxisCount?: number;
        onEndReached?: () => void;
        onRefresh?: (done: () => void) => void;
        refreshing?: boolean;
        ListHeaderComponent?: (() => Widget) | Widget;
        ListFooterComponent?: (() => Widget) | Widget;
        ListEmptyComponent?: (() => Widget) | Widget;
        showsScrollIndicator?: boolean;
    }
    export function ListView(props: ListViewProps): Widget;

    interface GridViewProps extends Omit<ListViewProps, 'wrapItems' | 'crossAxisCount'> {
        columns?: number;
        spacing?: number;
        itemHeight?: number;
    }
    export function GridView(props: GridViewProps): Widget;

    // =========================================================================
    // Widgets básicos
    // =========================================================================
    interface TextProps extends CommonProps {
        text?: string;
        size?: number;
        color?: Color;
        weight?: 'normal' | 'bold' | number;
        align?: 'left' | 'center' | 'right' | 'justify';
        italic?: boolean;
        decoration?: 'underline' | 'line-through' | 'overline';
        lineHeight?: number | string;
        letterSpacing?: number | string;
        onPress?: (widget: Widget) => void;
    }
    export function Text(props: TextProps): Widget;

    interface ButtonProps extends CommonProps {
        text?: string;
        onPress?: () => void;
        variant?: 'filled' | 'outlined' | 'text';
        color?: Color;
        textColor?: Color;
        size?: 'small' | 'medium' | 'large';
        fullWidth?: boolean;
        borderRadius?: number | string;
        elevation?: number;
        icon?: string;
        iconLeft?: string;
        iconRight?: string;
        iconTop?: string;
        iconBottom?: string;
        iconPosition?: 'left' | 'right' | 'top' | 'bottom';
    }
    export function Button(props: ButtonProps): Widget;

    interface IconProps extends CommonProps {
        name: string;
        size?: number;
        color?: Color;
        onPress?: (widget: Widget) => void;
    }
    export function Icon(props: IconProps): Widget;

    interface ImageProps extends CommonProps {
        src: string;
        alt?: string;
        width?: Size;
        height?: Size;
        fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
        circular?: boolean;
        onLoad?: (widget: Widget) => void;
        onError?: (widget: Widget) => void;
        onPress?: (widget: Widget) => void;
    }
    export function Image(props: ImageProps): Widget;

    interface AvatarProps extends CommonProps {
        src?: string;
        name?: string;
        icon?: string;
        size?: number;
        bgColor?: Color;
        textColor?: Color;
        shape?: 'circle' | 'rounded' | 'square';
        online?: boolean;
        offline?: boolean;
        badge?: string | number;
        badgeColor?: Color;
        onPress?: (widget: Widget) => void;
    }
    export function Avatar(props: AvatarProps): Widget;

    interface CardProps extends CommonProps {
        child?: Widget;
        children?: Widget[];
        elevation?: number;
        padding?: Padding;
        borderRadius?: number | string;
        onPress?: (widget: Widget) => void;
    }
    export function Card(props: CardProps): Widget;

    interface ListTileProps {
        leading?: Widget;
        title?: string | Widget;
        subtitle?: string | Widget;
        trailing?: Widget;
        onPress?: (widget: Widget) => void;
        selected?: boolean;
        disabled?: boolean;
        divider?: boolean;
        paddingHorizontal?: number;
        paddingVertical?: number;
        bgColor?: Color;
        selectedBgColor?: Color;
        titleColor?: Color;
        subtitleColor?: Color;
    }
    export function ListTile(props: ListTileProps): Widget;

    interface ProgressBarProps {
        value?: number;
        max?: number;
        height?: number;
        width?: number | string;
        color?: Color;
        backgroundColor?: Color;
        borderRadius?: number;
        label?: string;
        showValue?: boolean;
        indeterminate?: boolean;
        striped?: boolean;
        animatedStripes?: boolean;
    }
    export function ProgressBar(props: ProgressBarProps): Widget;

    interface RatingProps {
        value?: number;
        max?: number;
        size?: number;
        allowHalf?: boolean;
        activeColor?: Color;
        inactiveColor?: Color;
        showValue?: boolean;
        readOnly?: boolean;
        onChange?: (value: number) => void;
    }
    export function Rating(props: RatingProps): Widget;

    interface ChipProps {
        label: string;
        icon?: string;
        onPress?: () => void;
        onDelete?: () => void;
        variant?: 'filled' | 'outlined';
        color?: Color;
        textColor?: Color;
        size?: 'small' | 'medium' | 'large';
        borderRadius?: number | string;
        elevation?: number;
    }
    export function Chip(props: ChipProps): Widget;

    interface BadgeProps {
        value: string | number;
        child: Widget;
        color?: Color;
        textColor?: Color;
        size?: number;
        position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
        offset?: number;
        borderWidth?: number;
        borderColor?: Color;
        showZero?: boolean;
        max?: number;
    }
    export function Badge(props: BadgeProps): Widget;

    interface SliderProps {
        value?: number;
        min?: number;
        max?: number;
        step?: number;
        disabled?: boolean;
        width?: number | string;
        height?: number;
        thumbSize?: number;
        color?: Color;
        trackColor?: Color;
        orientation?: 'horizontal' | 'vertical';
        showValue?: boolean;
        onChange?: (value: number) => void;
        onChangeEnd?: (value: number) => void;
    }
    export function Slider(props: SliderProps): Widget;

    interface AccordionProps {
        title: string | Widget;
        children: Widget;
        expanded?: boolean;
        onToggle?: (expanded: boolean) => void;
        variant?: 'contained' | 'outlined';
        borderRadius?: number;
        bgColor?: Color;
        expandedColor?: Color;
        titleColor?: Color;
        titleSize?: number;
        iconCollapsed?: string;
        iconExpanded?: string;
        divider?: boolean;
        disabled?: boolean;
        animate?: boolean;
    }
    export function Accordion(props: AccordionProps): Widget & {
        expanded: boolean;
        setExpanded: (exp: boolean, triggerCallback?: boolean) => void;
        toggle: () => void;
    };

    interface DividerProps {
        color?: Color;
        thickness?: number;
        margin?: number;
        orientation?: 'horizontal' | 'vertical';
        style?: Partial<CSSStyleDeclaration>;
    }
    export function Divider(props: DividerProps): Widget;

    // =========================================================================
    // Interacciones
    // =========================================================================
    interface InputProps extends CommonProps {
        value?: string;
        placeholder?: string;
        type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url';
        label?: string;
        error?: string;
        disabled?: boolean;
        readonly?: boolean;
        required?: boolean;
        validation?: 'none' | 'text' | 'email' | 'numbers' | 'alphanumeric' | 'safe' | 'custom';
        maxLength?: number;
        iconLeft?: string;
        iconRight?: string;
        clearable?: boolean;
        passwordToggle?: boolean;
        onChange?: (value: string, widget: Widget) => void;
        onInput?: (value: string, widget: Widget) => void;
        onFocus?: (value: string, widget: Widget) => void;
        onBlur?: (value: string, widget: Widget) => void;
        onEnter?: (value: string, widget: Widget) => void;
    }
    export function Input(props: InputProps): Widget & {
        getValue(): string;
        setValue(value: string): void;
        isValid(): boolean;
        validate(): { valid: boolean; message: string };
        reset(): void;
    };

    interface RadioProps {
        selected?: boolean;
        onSelect?: (selected: boolean) => void;
        disabled?: boolean;
        size?: number;
        activeColor?: Color;
        label?: string;
        name?: string;
    }
    export function Radio(props: RadioProps): Widget & {
        select(): void;
        unselect(): void;
        isSelected(): boolean;
    };

    interface SwitchProps {
        value?: boolean;
        onToggle?: (value: boolean) => void;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        activeColor?: Color;
        label?: string;
    }
    export function Switch(props: SwitchProps): Widget & {
        updateValue(value: boolean): void;
    };

    interface CheckboxProps {
        checked?: boolean;
        onCheck?: (checked: boolean) => void;
        disabled?: boolean;
        size?: number;
        activeColor?: Color;
        label?: string;
    }
    export function Checkbox(props: CheckboxProps): Widget & {
        setChecked(checked: boolean, triggerCallback?: boolean): void;
        getChecked(): boolean;
    };

    interface DropdownOption {
        label: string;
        value: any;
        icon?: string;
    }
    interface DropdownProps {
        options: (string | DropdownOption)[];
        value?: any;
        placeholder?: string;
        disabled?: boolean;
        label?: string;
        error?: boolean;
        variant?: 'outlined' | 'filled';
        size?: 'small' | 'medium' | 'large';
        borderRadius?: number;
        color?: Color;
        bgColor?: Color;
        clearable?: boolean;
        width?: number | string;
        onChange?: (value: any, label: string) => void;
    }
    export function Dropdown(props: DropdownProps): Widget & {
        value: any;
        open(): void;
        close(): void;
    };

    // =========================================================================
    // Alert dialogs
    // =========================================================================
    interface SnackBarOptions {
        message: string;
        action?: { label: string; onPress: () => void };
        duration?: number;
        type?: 'normal' | 'success' | 'error' | 'warning';
        position?: 'bottom' | 'top';
        backgroundColor?: string;
        textColor?: string;
        dismissible?: boolean;
    }
    export function SnackBar(options: SnackBarOptions): { close(): void };
    export function showSnackBar(message: string, options?: Partial<SnackBarOptions>): void;

    interface ModalProps {
        title?: string;
        content?: Widget | string;
        actions?: Widget[];
        closeOnOverlayClick?: boolean;
        closeOnEsc?: boolean;
        width?: number | string;
        maxWidth?: number | string;
        backgroundColor?: Color;
        borderRadius?: number | string;
        showCloseButton?: boolean;
        onOpen?: () => void;
        onClose?: () => void;
        visible?: boolean;
    }
    export function Modal(props: ModalProps): {
        open(): void;
        close(): void;
        toggle(): void;
        destroy(): void;
        update(props: Partial<ModalProps>): void;
    };

    interface BottomSheetProps {
        content: Widget;
        title?: string;
        actions?: Widget[];
        height?: number | string;
        maxHeight?: number | string;
        showDragHandle?: boolean;
        closeOnOverlayClick?: boolean;
        closeOnDragDown?: boolean;
        backgroundColor?: Color;
        borderRadius?: number;
        onOpen?: () => void;
        onClose?: () => void;
    }
    export function BottomSheet(props: BottomSheetProps): {
        open(): void;
        close(): void;
        toggle(): void;
        destroy(): void;
    };

    interface AlertDialogProps {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        variant?: 'normal' | 'danger' | 'warning' | 'success';
        showCancel?: boolean;
        width?: number;
        borderRadius?: number;
    }
    export function AlertDialog(props: AlertDialogProps): {
        open(): void;
        close(): void;
        modal: ReturnType<typeof Modal>;
    };

    // =========================================================================
    // Navegación
    // =========================================================================
    interface ScaffoldProps {
        appBar?: Widget | boolean;
        body?: Widget | Record<string, any>;
        bottomBar?: Widget | boolean;
        drawer?: Widget;
        floatingActionButton?: Widget;
        backgroundColor?: Color;
        routes?: Record<string, any>;
        resizeToAvoidBottomInset?: boolean;
    }
    export function Scaffold(props: ScaffoldProps): Widget;

    interface AppBarProps {
        title?: string | Widget;
        leading?: Widget;
        actions?: Widget[];
        backgroundColor?: Color;
        titleColor?: Color;
        elevation?: number;
        centerTitle?: boolean;
        showBackButton?: boolean;
        backButtonRoute?: string;
        onBackPress?: () => void;
        sticky?: boolean;
        hideOnScroll?: boolean;
    }
    export function AppBar(props: AppBarProps): Widget & {
        setTitle(title: string): void;
        setBackgroundColor(color: string): void;
        show(): void;
        hide(): void;
    };

    interface DrawerItemProps {
        icon?: string;
        label: string;
        route?: string;
        onPress?: () => void;
        trailingIcon?: string;
        selected?: boolean;
        selectedColor?: Color;
        closeOnPress?: boolean;
    }
    export function DrawerItem(props: DrawerItemProps): Widget;

    interface DrawerInstance {
        open(): void;
        close(): void;
        toggle(): void;
        destroy(): void;
        element: HTMLElement;
    }
    export function Drawer(props: {
        header?: Widget;
        body?: Widget[];
        footer?: Widget;
        position?: 'left' | 'right';
        width?: number;
        onClose?: () => void;
        onOpen?: () => void;
        blur?: boolean;
        bgColor?: Color;
        elevation?: number;
        closeOnOverlayClick?: boolean;
        borderRadius?: number;
    }): DrawerInstance;

    export function openDrawer(): void;
    export function closeDrawer(): void;
    export function toggleDrawer(): void;
    export function destroyDrawer(): void;

    interface BottomNavigationProps {
        tabs: Record<string, { icon: string; label?: string }>;
        currentIndex?: number;
        onTabChange?: (route: string) => void;
        backgroundColor?: Color;
        selectedColor?: Color;
        unselectedColor?: Color;
        showLabels?: boolean;
        iconSize?: number;
        height?: number;
        elevation?: number;
        useRouter?: boolean;
    }
    export function BottomNavigation(props: BottomNavigationProps): Widget & {
        setActiveIndex(index: number): void;
        getActiveIndex(): number;
        getCurrentRoute(): string | null;
    };

    interface FloatingActionButtonProps {
        icon?: string | Widget;
        label?: string;
        onPress?: () => void;
        backgroundColor?: Color;
        foregroundColor?: Color;
        elevation?: number;
        mini?: boolean;
        extended?: boolean;
        disabled?: boolean;
        position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
        margin?: number;
    }
    export function FloatingActionButton(props: FloatingActionButtonProps): Widget;

    interface TabsProps {
        tabs: (string | { label: string; icon?: string })[];
        children: Widget[];
        selectedIndex?: number;
        onChange?: (index: number) => void;
        variant?: 'underline' | 'filled' | 'slider';
        size?: 'small' | 'medium' | 'large';
        color?: Color;
        textColor?: Color;
        activeTextColor?: Color;
        bgColor?: Color;
        buttonColor?: Color;
        fullWidth?: boolean;
        showDivider?: boolean;
        showIcon?: boolean;
        iconPosition?: 'left' | 'right' | 'top' | 'bottom';
    }
    export function Tabs(props: TabsProps): Widget & {
        activeIndex: number;
        setActiveTab(index: number): void;
    };

    // =========================================================================
    // Router
    // =========================================================================
    export function initRouter(routes: Record<string, any>, initialPath?: string): void;
    export function goTo(path: string, params?: Record<string, any>): void;
    export function goBack(): void;
    export function goForward(): void;
    export function replace(path: string, params?: Record<string, any>): void;
    export function getCurrentPath(): string;
    export function getCurrentRoute(): any;
    export function getCurrentRouteConfig(): { route: any; params: Record<string, any>; query: Record<string, any>; path: string };
    export function getRoute(path: string): any;
    export function isActive(path: string, exact?: boolean): boolean;
    export function subscribe(callback: (route: any, params: any, query: any) => void): () => void;
    export function useParams(): Record<string, any>;
    export function useQueryParams(): Record<string, any>;
    export function buildUrl(pattern: string, params?: Record<string, any>, query?: Record<string, any>): string;
    export function clearRouter(): void;

    // =========================================================================
    // Animations
    // =========================================================================
    interface AnimatedBoxProps {
        animations: Array<{
            effect: string;
            from: any;
            to: any;
            duration?: number;
            reverse?: boolean;
            loop?: boolean;
            delay?: string;
        }>;
        child: Widget;
        timing?: string;
        delay?: string;
        fillMode?: string;
    }
    export function AnimatedBox(props: AnimatedBoxProps): Widget;

    interface AnimatedTextProps {
        child: Widget;
        animations: AnimatedBoxProps['animations'];
        sameTime?: boolean;
        delayBetween?: number;
    }
    export function AnimatedText(props: AnimatedTextProps): Widget;

    export function animate(
        widget: Widget,
        property: string,
        from: any,
        to: any,
        duration?: number,
        easing?: string,
        options?: { flip?: boolean; repeat?: number }
    ): Promise<Widget>;

    export function fadeOut(widget: Widget, duration?: number): Promise<Widget>;
    export function fadeIn(widget: Widget, duration?: number): Promise<Widget>;
    export function pulse(widget: Widget, duration?: number): Promise<Widget>;

    // =========================================================================
    // Utils (temas, dimensiones, aleatorios, etc.)
    // =========================================================================
    export const colors: Record<string, string>;
    export const palettes: Record<string, Record<string, string>>;
    export function setTheme(themeName: 'light' | 'dark'): Record<string, string>;
    export function getTheme(): string;
    export function toggleTheme(): string;
    export function getColor(colorName: string, opacity?: number): string;
    export function subscribeTheme(callback: (colors: Record<string, string>, theme: string) => void): () => void;
    export function applySystemTheme(): string;
    export function watchSystemTheme(): () => void;

    export const clipboard: {
        copy(text: string): void;
        read(): Promise<string>;
        copyWithFeedback(text: string, element: HTMLElement): void;
    };

    export const createList: {
        <T>(schema: Record<string, any>, count?: number): T[];
        fromData<T, R>(data: T[], mapper: Record<string, (item: T, index: number) => any>): R[];
        range(start: number, end: number, mapper?: (value: number, index: number) => any): any[];
        repeat<T>(value: T, count: number): T[];
        paginate<T>(list: T[], page?: number, pageSize?: number): {
            data: T[];
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
        search<T>(list: T[], query: string | ((item: T) => boolean), fields?: string[]): T[];
        sort<T>(list: T[], field: keyof T, order?: 'asc' | 'desc'): T[];
        groupBy<T>(list: T[], field: keyof T): Record<string, T[]>;
    };

    export function delay(ms: number): Promise<void>;
    export function withMinDelay<T>(promise: Promise<T>, minMs?: number): Promise<T>;
    export function retry<T>(fn: () => Promise<T>, retries?: number, delayMs?: number): Promise<T>;

    export const dimensions: {
        width: number;
        height: number;
        get(): { width: number; height: number };
        addListener(callback: (dim: { width: number; height: number }) => void): () => void;
        removeListener(callback: (dim: { width: number; height: number }) => void): void;
    };
    export const width: number;
    export const height: number;

    export function addNavigation<T extends Widget>(widget: T): T & {
        parent: Widget | null;
        children: Widget[];
        firstChild: Widget | null;
        lastChild: Widget | null;
        siblings: Widget[];
        nextSibling: Widget | null;
        prevSibling: Widget | null;
        index: number;
        root: Widget;
        path: Array<{ name: string; id: string | null; index: number }>;
        depth: number;
        findById(id: string): Widget | null;
        findAll(widgetName: string): Widget[];
        tree: string;
    };

    export const random: {
        number(min?: number, max?: number): number;
        string(length?: number): string;
        firstName(): string;
        lastName(): string;
        fullName(): string;
        email(name?: string): string;
        age(): number;
        boolean(): boolean;
        choice<T>(array: T[]): T;
        id(): string;
    };

    export const TextInputValidator: {
        onlyLetters(value: string): string;
        onlyNumbers(value: string): string;
        isEmail(value: string): boolean;
        filterEmail(value: string): string;
        onlyAlphanumeric(value: string): string;
        filter(value: string, pattern: string): string;
        limitLength(value: string, maxLength: number): string;
        isOnlyLetters(value: string): boolean;
        isOnlyNumbers(value: string): boolean;
        sanitize(value: string): string;
        escapeHtml(value: string): string;
        safeText(value: string): string;
        isSafe(value: string): boolean;
    };

    export function applyStripes(element: HTMLElement, options?: {
        color?: string;
        size?: number;
        angle?: number;
        animated?: boolean;
        duration?: string;
    }): void;
    export function removeStripes(element: HTMLElement): void;
    export function applyShimmer(element: HTMLElement, options?: {
        highlightColor?: string;
        baseColor?: string;
        duration?: string;
    }): void;
    export function applyGlow(element: HTMLElement, options?: {
        color?: string;
        intensity?: number;
        duration?: string;
    }): void;
    export function applyIndeterminate(element: HTMLElement, options?: {
        duration?: string;
        width?: string;
    }): void;
    export function applyPulse(element: HTMLElement, options?: {
        scale?: number;
        duration?: string;
    }): void;
    export function injectKeyframes(name: string, keyframes: string): void;

    // =========================================================================
    // Services
    // =========================================================================
    export function saveData(key: string, value: any): boolean;
    export function getData(key: string): any;
    export function getDataSync(key: string): any;
    export function updateData(key: string, newValue: any): boolean;
    export function deleteData(key: string): boolean;
    export function clearAllData(): boolean;
    export function hasData(key: string): boolean;
    export function getAllKeys(): string[];
    export function getAllData(): Record<string, any>;
    export function getStorageSize(): number;
    export function deleteDataByPrefix(prefix: string): number;
    export function deleteDataBySuffix(suffix: string): number;
    export function getItemCount(): number;
    export function isStorageAvailable(): boolean;

    export function saveSession(key: string, value: any): boolean;
    export function getSession(key: string): any;
    export function getSessionSync(key: string): any;
    export function updateSession(key: string, newValue: any): boolean;
    export function deleteSession(key: string): boolean;
    export function clearAllSession(): boolean;
    export function hasSession(key: string): boolean;
    export function getAllSessionKeys(): string[];
    export function getAllSessionData(): Record<string, any>;
    export function getSessionSize(): number;
    export function deleteSessionByPrefix(prefix: string): number;
    export function deleteSessionBySuffix(suffix: string): number;
    export function getSessionItemCount(): number;
    export function isSessionAvailable(): boolean;

    export function saveRam(key: string, value: any): boolean;
    export function getRam(key: string): any;
    export function getAllRam(): Record<string, any>;
    export function getAllRamKeys(): string[];
    export function hasRam(key: string): boolean;
    export function updateRam(key: string, newValue: any): boolean;
    export function deleteRam(key: string): boolean;
    export function clearAllRam(): boolean;
    export function subscribeRam(callback: (key: string, newValue: any, oldValue: any) => void): () => void;
    export function getRamItemCount(): number;
    export function isRamAvailable(): boolean;

    export function httpGet(url: string, options?: RequestInit & { params?: Record<string, string>; timeout?: number }): Promise<any>;
    export function httpPost(url: string, options?: RequestInit & { body?: any; params?: Record<string, string>; timeout?: number }): Promise<any>;
    export function httpPut(url: string, options?: RequestInit & { body?: any; params?: Record<string, string>; timeout?: number }): Promise<any>;
    export function httpPatch(url: string, options?: RequestInit & { body?: any; params?: Record<string, string>; timeout?: number }): Promise<any>;
    export function httpDelete(url: string, options?: RequestInit & { params?: Record<string, string>; timeout?: number }): Promise<any>;
    export function httpRequest(method: string, url: string, options?: any): Promise<any>;

    // =========================================================================
    // Core
    // =========================================================================
    export function runApp(App: () => Widget, rootId?: string, routes?: any): void;
    export function createApp(routes: any, options?: { rootId?: string; fallback?: Widget | (() => Widget) }): {
        start(): void;
        destroy(): void;
    };
    export function insertBy(widget: Widget, rootId?: string): Widget;
    export function prependBy(widget: Widget, rootId?: string): Widget;
    export function insertBefore(widget: Widget, targetId: string | HTMLElement): Widget;
    export function insertAfter(widget: Widget, targetId: string | HTMLElement): Widget;
    export function replaceBy(widget: Widget, targetId: string | HTMLElement): Widget;
    export function mountAll(widget: Widget, rootIds: string[]): Widget;

    // =========================================================================
    // Otros exports de utilidad
    // =========================================================================
    export function Gradient(type: 'linear' | 'circle' | 'conic', colors: string[], angle?: number): string;
    export function Shadow(x: number, y: number, blur: number, spread: number, color: string): string;
    export function rgba(r: number, g: number, b: number, a?: number): string;
    export function stackPosition(widget: Widget, props: { top?: any; right?: any; bottom?: any; left?: any }): Widget;
}
