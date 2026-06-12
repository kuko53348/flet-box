// index.d.ts - FletBox Type Declarations
// Versión completa con todos los widgets, animaciones, servicios y utilidades

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
    ref?: (widget: Widget) => void;
    disableTransform?: boolean;
  }

  // =========================================================================
  // useState Hook (persistente con RamStore)
  // =========================================================================
  export function useState<T>(
    key: string,
    initialState: T | (() => T),
    widget?: Widget,
    propName?: string
  ): [T, (value: T | ((prev: T) => T)) => void];

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
    flex?: number;
    minHeight?: Size;
    maxHeight?: Size;
    minWidth?: Size;
    maxWidth?: Size;
    overflow?: 'auto' | 'hidden' | 'visible' | 'scroll';
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
    alignment?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }
  export function Stack(props: StackProps): Widget;

  interface ListViewProps extends CommonProps {
    data?: any[];
    renderItem?: (item: any, index: number) => Widget;
    height?: number | string;
    width?: number | string;
    itemSize?: number;
    gap?: number;
    orientation?: 'vertical' | 'horizontal';
    wrapItems?: boolean;
    crossAxisCount?: number;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    onRefresh?: (done: () => void) => void;
    refreshing?: boolean;
    ListHeaderComponent?: (() => Widget) | Widget;
    ListFooterComponent?: (() => Widget) | Widget;
    ListEmptyComponent?: (() => Widget) | Widget;
    showsScrollIndicator?: boolean;
    bufferSize?: number;
    expand?: boolean;
  }
  export function ListView(props: ListViewProps): Widget & {
    data: any[];
    refreshing: boolean;
    updateData(newData: any[]): void;
    scrollToIndex(index: number, animated?: boolean): void;
    scrollToStart(animated?: boolean): void;
    scrollToEnd(animated?: boolean): void;
  };

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
    value?: string;
    children?: string;
    size?: number;
    color?: Color;
    weight?: 'normal' | 'bold' | number;
    align?: 'left' | 'center' | 'right' | 'justify';
    italic?: boolean;
    decoration?: 'underline' | 'line-through' | 'overline';
    lineHeight?: number | string;
    letterSpacing?: number | string;
    type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
    styles?: Array<'bold' | 'italic' | 'underline' | 'strikethrough' | 'mark' | 'small' | 'code'>;
    onPress?: (widget: Widget) => void;
  }
  export function Text(props: TextProps): Widget;

  interface ButtonProps extends CommonProps {
    text?: string;
    onPress?: () => void;
    variant?: 'filled' | 'outlined' | 'text';
    bgColor?: Color;
    gradient?: string;
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
    padding?: Padding;
    margin?: Margin;
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
  export function Avatar(props: AvatarProps): Widget & {
    updateContent(newProps: Partial<AvatarProps>): void;
  };

  interface CardProps extends CommonProps {
    child?: Widget;
    children?: Widget[];
    elevation?: number;
    padding?: Padding;
    borderRadius?: number | string;
    onPress?: (widget: Widget) => void;
  }
  export function Card(props: CardProps): Widget;

  interface ListTileProps extends CommonProps {
    leading?: Widget;
    title?: string | Widget;
    subtitle?: string | Widget;
    description?: string | Widget;
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
    hoverColor?: Color;
    elevation?: number;
    borderRadius?: number;
  }
  export function ListTile(props: ListTileProps): Widget;

  interface ProgressBarProps extends CommonProps {
    value?: number;
    max?: number;
    height?: number;
    width?: number | string;
    color?: Color;
    backgroundColor?: Color;
    borderRadius?: number;
    label?: string;
    showValue?: boolean;
    valuePosition?: 'left' | 'right' | 'top' | 'bottom';
    indeterminate?: boolean;
    striped?: boolean;
    animatedStripes?: boolean;
  }
  export function ProgressBar(props: ProgressBarProps): Widget & {
    value: number;
    updateProgress(value: number): void;
  };

  interface RatingProps extends CommonProps {
    value?: number;
    max?: number;
    size?: number;
    allowHalf?: boolean;
    activeColor?: Color;
    inactiveColor?: Color;
    showValue?: boolean;
    valueColor?: Color;
    valueSize?: number;
    readOnly?: boolean;
    gap?: number;
    iconActive?: string;
    iconInactive?: string;
    iconHalf?: string;
    onChange?: (value: number) => void;
  }
  export function Rating(props: RatingProps): Widget & {
    value: number;
    setValue(value: number): void;
    getValue(): number;
  };

  interface ChipProps extends CommonProps {
    label: string;
    icon?: string;
    onPress?: () => void;
    onDelete?: () => void;
    variant?: 'filled' | 'outlined';
    color?: Color;
    textColor?: Color;
    borderColor?: Color;
    size?: 'small' | 'medium' | 'large';
    borderRadius?: number | string;
    elevation?: number;
    gap?: number;
  }
  export function Chip(props: ChipProps): Widget;

  interface BadgeProps extends CommonProps {
    value: string | number;
    child: Widget;
    bgColor?: Color;
    color?: Color;
    size?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    offset?: number;
    borderWidth?: number;
    borderColor?: Color;
    showZero?: boolean;
    max?: number;
  }
  export function Badge(props: BadgeProps): Widget & {
    updateValue(newValue: string | number): void;
  };

  interface SliderProps extends CommonProps {
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
    inverted?: boolean;
    showValue?: boolean;
    valuePrefix?: string;
    valueSuffix?: string;
    showMarks?: boolean;
    marks?: Array<{ value: number; label?: string; color?: Color; size?: number }>;
    striped?: boolean;
    animatedStripes?: boolean;
    stripeColor?: string;
    glow?: boolean;
    onChange?: (value: number) => void;
    onChangeEnd?: (value: number) => void;
  }
  export function Slider(props: SliderProps): Widget & {
    value: number;
    min: number;
    max: number;
    step: number;
    setValue(value: number, triggerChange?: boolean, triggerEnd?: boolean): void;
    getValue(): number;
    update(props: Partial<SliderProps>): void;
  };

  interface AccordionProps extends CommonProps {
    title: string | Widget;
    children: Widget;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    variant?: 'contained' | 'outlined' | 'ghost';
    borderRadius?: number;
    bgColor?: Color;
    expandedColor?: Color;
    titleColor?: Color;
    titleSize?: number;
    titleWeight?: string;
    titlePadding?: string;
    contentPadding?: string;
    iconCollapsed?: string;
    iconExpanded?: string;
    iconColor?: Color;
    iconSize?: number;
    divider?: boolean;
    disabled?: boolean;
    animate?: boolean;
    animationDuration?: number;
    elevation?: number;
  }
  export function Accordion(props: AccordionProps): Widget & {
    expanded: boolean;
    setExpanded(exp: boolean, triggerCallback?: boolean): void;
    toggle(): void;
    update(props: Partial<AccordionProps>): void;
  };

  interface DividerProps extends CommonProps {
    color?: Color;
    thickness?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    orientation?: 'horizontal' | 'vertical';
  }
  export function Divider(props: DividerProps): Widget;

  // =========================================================================
  // Formularios e interacción
  // =========================================================================
  interface InputProps extends CommonProps {
    value?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url';
    label?: string;
    error?: boolean | string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'outlined' | 'filled' | 'underlined';
    fullWidth?: boolean;
    borderRadius?: number;
    validation?: 'none' | 'letters' | 'numbers' | 'email' | 'alphanumeric' | 'safe' | 'custom';
    maxLength?: number;
    iconLeft?: string;
    iconRight?: string;
    iconColor?: Color;
    iconSize?: number;
    onIconPress?: () => void;
    clearable?: boolean;
    passwordToggle?: boolean;
    showValidationMessage?: boolean;
    showValidationIcon?: boolean;
    customPattern?: string;
    onValidated?: (isValid: boolean, message: string) => void;
    onChange?: (value: string, event?: Event) => void;
    onInput?: (value: string, event?: Event) => void;
    onFocus?: (event: Event) => void;
    onBlur?: (event: Event) => void;
    onEnter?: (value: string, event: Event) => void;
  }
  export function Input(props: InputProps): Widget & {
    getValue(): string;
    setValue(value: string): void;
    isValid(): boolean;
    validate(): { valid: boolean; message: string };
    reset(): void;
    focus(): void;
    blur(): void;
  };

  interface RadioProps extends CommonProps {
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

  interface SwitchProps extends CommonProps {
    value?: boolean;
    onToggle?: (value: boolean) => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    activeColor?: Color;
    label?: string;
  }
  export function Switch(props: SwitchProps): Widget & {
    updateValue(value: boolean): void;
    getValue(): boolean;
  };

  interface CheckboxProps extends CommonProps {
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

  type DropdownOption = { label: string; value: any; icon?: string };
  interface DropdownProps extends CommonProps {
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
    textColor?: Color;
    optionHoverColor?: Color;
    clearable?: boolean;
    width?: number | string;
    portal?: boolean;
    onChange?: (value: any, label: string) => void;
  }
  export function Dropdown(props: DropdownProps): Widget & {
    value: any;
    options: DropdownOption[];
    disabled: boolean;
    error: boolean;
    open(): void;
    close(): void;
    update(props: Partial<DropdownProps>): void;
  };

  // =========================================================================
  // Alert dialogs y feedback
  // =========================================================================
  interface SnackBarOptions {
    message: string;
    action?: { label: string; onPress: () => void };
    duration?: number;
    type?: 'normal' | 'success' | 'error' | 'warning' | 'info';
    position?: 'bottom' | 'top';
    backgroundColor?: string;
    textColor?: string;
    actionColor?: string;
    dismissible?: boolean;
    borderRadius?: number;
    padding?: Padding;
    margin?: number;
    elevation?: number;
    animationDuration?: number;
    zIndex?: number;
    onShow?: () => void;
    onClose?: () => void;
  }
  export function SnackBar(options: SnackBarOptions): { close(): void; show(): void; getElement(): Widget };
  export function showSnackBar(message: string, options?: Partial<SnackBarOptions>): void;

  interface ModalProps {
    title?: string;
    content?: Widget | string;
    actions?: Widget[];
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number | string;
    maxHeight?: number | string;
    backgroundColor?: Color;
    borderRadius?: number | string;
    border?: string;
    borderColor?: Color;
    borderWidth?: number;
    shadow?: string;
    elevation?: number;
    padding?: Padding;
    contentBgColor?: Color;
    contentElevation?: number;
    headerBgColor?: Color;
    headerTextColor?: Color;
    headerBorder?: string | false;
    headerPadding?: Padding;
    headerElevation?: number;
    footerBgColor?: Color;
    footerBorder?: string | false;
    footerPadding?: Padding;
    footerElevation?: number;
    overlayColor?: Color;
    showCloseButton?: boolean;
    zIndex?: number;
    onOpen?: () => void;
    onClose?: () => void;
  }
  export function Modal(props: ModalProps): {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    isOpen: boolean;
    updateContent(content: Widget | string): void;
    updateTitle(title: string): void;
    updatePadding(padding: Padding): void;
    setLoading(loading: boolean, loadingText?: string): void;
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
    showCloseButton?: boolean;
    backgroundColor?: Color;
    overlayColor?: Color;
    dragHandleColor?: Color;
    headerTextColor?: Color;
    headerBorderColor?: Color;
    actionBorderColor?: Color;
    borderRadius?: number;
    shadow?: string;
    headerPadding?: Padding;
    contentPadding?: Padding;
    actionPadding?: Padding;
    dragHandlePadding?: Padding;
    dragHandleWidth?: number;
    dragHandleHeight?: number;
    animationDuration?: number;
    zIndex?: number;
    overlayZIndex?: number;
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
    onClose?: () => void;
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
  interface ScaffoldProps extends CommonProps {
    appBar?: Widget | boolean;
    body?: Widget | Record<string, any>;
    bottomBar?: Widget | boolean;
    fab?: Widget | boolean;
    drawer?: Widget;
    leftNavBar?: Widget;
    rightNavBar?: Widget;
    navSideBar?: Widget;
    navSideBarWidth?: number;
    navSideBarPosition?: 'left' | 'right';
    routes?: Record<string, any>;
    backgroundColor?: Color;
    closeDrawerOnNavigate?: boolean;
  }
  export function Scaffold(props: ScaffoldProps): Widget & {
    updateLeftNavBar(cfg: any): void;
    updateRightNavBar(cfg: any): void;
    setLeftNavBarWidth(width: number): void;
    setRightNavBarWidth(width: number): void;
    openDrawer?(): void;
    closeDrawer?(): void;
  };

  interface AppBarProps extends CommonProps {
    title?: string | Widget;
    leading?: Widget;
    actions?: Widget[];
    backgroundColor?: Color;
    gradient?: string;
    titleColor?: Color;
    iconColor?: Color;
    elevation?: number;
    centerTitle?: boolean;
    titleSize?: number;
    titleWeight?: string;
    showBackButton?: boolean;
    backButtonRoute?: string;
    onBackPress?: () => void;
    sticky?: boolean;
    hideOnScroll?: boolean;
    scrollThreshold?: number;
    margin?: Margin;
    padding?: Padding;
    borderRadius?: number;
    shadow?: boolean;
  }
  export function AppBar(props: AppBarProps): Widget & {
    setTitle(title: string): void;
    setBackgroundColor(color: string): void;
    show(): void;
    hide(): void;
  };

  interface DrawerItemProps extends CommonProps {
    icon?: string;
    label: string;
    route?: string;
    onPress?: () => void;
    onSelect?: () => void;
    trailingIcon?: string;
    hintColor?: Color;
    selectedColor?: Color;
    unselectedColor?: Color;
    iconColor?: Color;
    trailingIconColor?: Color;
    closeOnPress?: boolean;
    disableTransform?: boolean;
  }
  export function DrawerItem(props: DrawerItemProps): Widget;

  interface DrawerInstance {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    element: HTMLElement;
  }
  interface DrawerProps {
    header?: Widget;
    body?: Widget[];
    footer?: Widget;
    position?: 'left' | 'right';
    width?: number;
    onClose?: () => void;
    onOpen?: () => void;
    blur?: boolean;
    blurIntensity?: number;
    bgColor?: Color;
    elevation?: number;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    borderRadius?: number;
    margin?: number;
  }
  export function Drawer(props: DrawerProps): DrawerInstance;
  export function openDrawer(): void;
  export function closeDrawer(): void;
  export function toggleDrawer(): void;
  export function destroyDrawer(): void;

  interface BottomNavigationProps extends CommonProps {
    items: Array<{ icon: string; label?: string; route?: string; onPress?: () => void }>;
    currentIndex?: number;
    onTabChange?: (index: number) => void;
    backgroundColor?: Color;
    selectedColor?: Color;
    unselectedColor?: Color;
    showLabels?: boolean;
    iconSize?: number;
    height?: number;
    margin?: Margin;
    borderRadius?: number;
    padding?: Padding;
    shadow?: boolean;
    elevation?: number;
    useRouter?: boolean;
  }
  export function BottomNavigation(props: BottomNavigationProps): Widget & {
    setActiveIndex(index: number): void;
    getActiveIndex(): number;
    getCurrentRoute(): string | null;
  };

  interface FloatingActionButtonProps extends CommonProps {
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

  interface TabsProps extends CommonProps {
    tabs: (string | { label: string; icon?: string; badge?: number | string })[];
    children: Widget[];
    activeIndex?: number;
    onChange?: (index: number) => void;
    variant?: 'underline' | 'filled' | 'slider' | 'pills';
    size?: 'small' | 'medium' | 'large';
    color?: Color;
    textColor?: Color;
    activeTextColor?: Color;
    bgColor?: Color;
    buttonColor?: Color;
    fullWidth?: boolean;
    showDivider?: boolean;
    dividerColor?: Color;
    showIcon?: boolean;
    iconPosition?: 'left' | 'right' | 'top' | 'bottom';
    iconSize?: number;
    badges?: (number | string)[];
    alignment?: 'left' | 'center' | 'right';
  }
  export function Tabs(props: TabsProps): Widget & {
    activeIndex: number;
    setActiveTab(index: number): void;
  };

  interface CollapsibleSideBarProps extends CommonProps {
    children: Widget;
    expanded?: boolean;
    widthExpanded?: number;
    widthCollapsed?: number;
    iconSize?: number;
    onToggle?: (expanded: boolean) => void;
    bgColor?: Color;
    borderRight?: string;
    showTooltip?: boolean;
    tooltipDelay?: number;
  }
  export function CollapsibleSideBar(props: CollapsibleSideBarProps): Widget & {
    getCurrentWidth(): number;
    isExpanded(): boolean;
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
  interface AnimationStep {
    effect: string;
    from: any;
    to: any;
    duration?: number;
    reverse?: boolean;
    loop?: boolean;
    delay?: string;
  }
  interface AnimatedBoxProps extends CommonProps {
    animations: AnimationStep[];
    child: Widget;
    timing?: string;
    delay?: string;
    fillMode?: string;
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  }
  export function AnimatedBox(props: AnimatedBoxProps): Widget;

  interface AnimatedTextProps extends CommonProps {
    child: Widget;
    animations: AnimationStep[];
    sameTime?: boolean;
    delayBetween?: number;
    orientation?: 'row' | 'column';
  }
  export function AnimatedText(props: AnimatedTextProps): Widget;

  interface MatrixRainProps extends CommonProps {
    chars?: string;
    fontSize?: number;
    speed?: number;
    fadeAmount?: number;
    resetProbability?: number;
    useDynamicColor?: boolean;
    position?: 'fixed' | 'absolute';
    zIndex?: number;
  }
  export function MatrixRain(props?: MatrixRainProps): Widget;

  interface ParallaxBoxProps extends CommonProps {
    child: Widget;
    type?: 'scroll' | 'mouse' | 'hover';
    speed?: number;
    direction?: 'vertical' | 'horizontal' | 'both';
    maxOffset?: number;
    reverse?: boolean;
    disabled?: boolean;
    onParallaxMove?: (offset: { x: number; y: number }) => void;
    duration?: number;
    easing?: string;
  }
  export function ParallaxBox(props: ParallaxBoxProps): Widget & {
    updateSpeed(speed: number): void;
    updateDirection(direction: string): void;
    setPosition(x: number, y: number, animate?: boolean): void;
    reset(animate?: boolean): void;
  };

  export function animate(
    widget: Widget,
    property: string,
    from: any,
    to: any,
    duration?: number,
    easing?: string
  ): void;
  export function animateAsync(
    widget: Widget,
    property: string,
    from: any,
    to: any,
    duration?: number,
    easing?: string
  ): Promise<Widget>;
  export function fadeOut(widget: Widget, duration?: number): void;
  export function fadeIn(widget: Widget, duration?: number): void;
  export function pulse(widget: Widget, duration?: number): void;
  export function fadeOutAsync(widget: Widget, duration?: number): Promise<Widget>;
  export function fadeInAsync(widget: Widget, duration?: number): Promise<Widget>;
  export function pulseAsync(widget: Widget, duration?: number): Promise<Widget>;

  // =========================================================================
  // Widgets adicionales (Data, Media, Utils)
  // =========================================================================
  interface DataTableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    format?: (value: any, row: any) => string;
  }
  interface DataTableProps extends CommonProps {
    columns: (string | DataTableColumn)[];
    rows: Record<string, any>[];
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
    onRowClick?: (row: any, index: number) => void;
    headerBgColor?: Color;
    headerTextColor?: Color;
    headerFontWeight?: string;
    headerFontSize?: number;
    rowBgColor?: Color;
    rowTextColor?: Color;
    rowFontSize?: number;
    stripedRowBgColor?: Color;
    hoverRowBgColor?: Color;
    borderColor?: Color;
    borderWidth?: number;
    cellPadding?: Padding;
    headerCellPadding?: Padding;
  }
  export function DataTable(props: DataTableProps): Widget & {
    updateData(rows: any[]): void;
    updateColumns(columns: DataTableColumn[]): void;
  };

  interface ChartProps extends CommonProps {
    type?: 'bar' | 'line' | 'area' | 'candle';
    data: number[] | Array<{ open: number; high: number; low: number; close: number }>;
    labels?: string[];
    width?: number | string;
    height?: number;
    bgColor?: Color;
    padding?: number | { top: number; right: number; bottom: number; left: number };
    candleWidth?: number;
    candleSpacing?: number;
    barColor?: Color;
    lineColor?: Color;
    areaColor?: Color;
    smooth?: boolean;
    areaGradient?: boolean;
    areaGradientColors?: [string, string];
    candleUpColor?: Color;
    candleDownColor?: Color;
    axisColor?: Color;
    textColor?: Color;
    yAxisColor?: Color;
    showGrid?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
    borderRadius?: number;
  }
  export function Chart(props: ChartProps): Widget & {
    updateData(newData: any[], newLabels?: string[]): void;
    redraw(): void;
  };

  interface QRCodeProps extends CommonProps {
    value: string;
    size?: number;
    bgColor?: Color;
    fgColor?: Color;
    errorCorrection?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
  }
  export function QRCode(props: QRCodeProps): Widget & {
    updateValue(value: string): void;
    download(filename?: string): void;
    getDataURL(): string;
    getCanvas(): HTMLCanvasElement;
    getValue(): string;
  };

  interface CodeViewerProps extends CommonProps {
    code: string;
    title?: string;
    maxHeight?: number;
    fontSize?: number;
    backgroundColor?: Color;
    padding?: Padding;
    borderRadius?: number;
    showHeader?: boolean;
    showLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberWidth?: number;
    lineNumberColor?: Color;
  }
  export function CodeViewer(props: CodeViewerProps): Widget & {
    updateCode(code: string): void;
    updateTitle(title: string): void;
    scrollTo(x: number, y: number): void;
    scrollToStart(): void;
    scrollToEnd(): void;
  };

  interface InspectorProps {
    widget: Widget;
    indent?: number;
  }
  export function Inspector(widget: Widget, indent?: number): string;
  export function printWidgetCode(widget: Widget): void;
  export function inspectWidget(widget: Widget): Widget;

  interface DraggBoxProps extends CommonProps {
    child: Widget;
    data?: any;
    group?: string;
    disabled?: boolean;
    onDragStart?: (event: DragEvent, data: any) => void;
    onDragEnd?: (event: DragEvent, data: any) => void;
    dragImage?: HTMLElement;
    cloneOnDrag?: boolean;
    opacity?: number;
    dragOverlayColor?: Color;
    dragBorderColor?: Color;
  }
  export function DraggBox(props: DraggBoxProps): Widget;

  interface DroppBoxProps extends CommonProps {
    child: Widget;
    onDrop?: (data: any, group: string, event: DragEvent) => void;
    onDragEnter?: (event: DragEvent) => void;
    onDragLeave?: (event: DragEvent) => void;
    onDragOver?: (event: DragEvent) => void;
    acceptGroups?: string[];
    disabled?: boolean;
    bgColor?: Color;
    borderRadius?: number;
    borderWidth?: number;
    borderStyle?: string;
    borderColor?: Color;
    shadow?: string;
    padding?: Padding;
    activeBgColor?: Color;
    activeBorderColor?: Color;
    activeBorderWidth?: number;
    activeBorderStyle?: string;
    activeShadow?: string;
    validBgColor?: Color;
    validBorderColor?: Color;
    invalidBgColor?: Color;
    invalidBorderColor?: Color;
    transitionDuration?: string;
    transitionTiming?: string;
    showFeedback?: boolean;
  }
  export function DroppBox(props: DroppBoxProps): Widget;

  interface CarouselProps extends CommonProps {
    items: (Widget | string | { src: string; alt?: string })[];
    autoPlay?: boolean;
    interval?: number;
    showArrows?: boolean;
    showDots?: boolean;
    infinite?: boolean;
    height?: number | string;
    width?: number | string;
    borderRadius?: number;
    dotColor?: Color;
    dotActiveColor?: Color;
    dotSize?: number;
    dotActiveSize?: number;
    buttonBgColor?: Color;
    buttonIconColor?: Color;
    buttonSize?: number;
    buttonIconSize?: number;
    buttonTop?: number | string;
    onIndexChange?: (index: number) => void;
  }
  export function Carousel(props: CarouselProps): Widget & {
    next(): void;
    prev(): void;
    goTo(index: number): void;
    getCurrentIndex(): number;
  };

  interface TooltipProps extends CommonProps {
    text: string;
    child: Widget;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    bgColor?: Color;
    textColor?: Color;
    fontSize?: number;
    padding?: Padding;
    borderRadius?: number;
    offset?: number;
    showArrow?: boolean;
    disabled?: boolean;
    maxWidth?: number;
    textAlign?: 'left' | 'center' | 'right';
    zIndex?: number;
    animationDuration?: number;
    arrowSize?: number;
    borderColor?: Color;
    borderWidth?: number;
    shadow?: string;
  }
  export function Tooltip(props: TooltipProps): Widget & {
    showTooltip(): void;
    hideTooltip(): void;
    updateContent(newText: string): void;
    updatePosition(): void;
  };

  interface PaginationProps extends CommonProps {
    totalItems: number;
    pageSize?: number;
    currentPage?: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    maxButtons?: number;
    variant?: 'outlined' | 'filled' | 'text';
    color?: Color;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    showTotal?: boolean;
    label?: string;
  }
  export function Pagination(props: PaginationProps): Widget;

  interface TreeViewProps extends CommonProps {
    nodes: Array<{
      id: string;
      label: string;
      icon?: string;
      iconColor?: Color;
      children?: any[];
      badge?: string | number;
    }>;
    onSelect?: (node: any) => void;
    onToggle?: (nodeId: string, expanded: boolean) => void;
    expandedNodes?: string[];
    indent?: number;
    showIcons?: boolean;
    folderIcon?: string;
    folderOpenIcon?: string;
    fileIcon?: string;
    expandIcon?: string;
    collapseIcon?: string;
    defaultExpanded?: boolean;
    selectable?: boolean;
    selectedNodeId?: string | null;
    bgColor?: Color;
    hoverBgColor?: Color;
    selectedBgColor?: Color;
    textColor?: Color;
    selectedTextColor?: Color;
    iconColor?: Color;
    folderIconColor?: Color;
    borderColor?: Color;
    nodePadding?: Padding;
    nodeGap?: number;
    childrenGap?: number;
    borderRadius?: number;
    fontSize?: number;
    iconSize?: number;
    transitionDuration?: string;
  }
  export function TreeView(props: TreeViewProps): Widget & {
    updateNodes(nodes: any[], selectedId?: string | null): void;
    expandAll(): void;
    collapseAll(): void;
    expandTo(nodeId: string): void;
    collapseTo(nodeId: string): void;
    getExpanded(): string[];
    getSelected(): string | null;
    setSelected(nodeId: string): void;
  };

  interface StepperProps extends CommonProps {
    steps: Array<{ label: string; content: Widget; icon?: string }>;
    activeStep?: number;
    onStepChange?: (index: number) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'circles' | 'numbers' | 'icons';
    showLabels?: boolean;
    showNavigation?: boolean;
    nextLabel?: string;
    backLabel?: string;
    finishLabel?: string;
    onFinish?: () => void;
    bgColor?: Color;
    borderRadius?: number;
    border?: string;
    borderColor?: Color;
    borderWidth?: number;
    shadow?: string;
    padding?: Padding;
    margin?: Margin;
    width?: number | string;
  }
  export function Stepper(props: StepperProps): Widget & {
    goTo(index: number): void;
    next(): void;
    back(): void;
    getActiveStep(): number;
  };

  interface SkeletonProps extends CommonProps {
    variant?: 'text' | 'circular' | 'avatar' | 'image' | 'card' | 'listTile' | 'button';
    width?: number | string;
    height?: number | string;
    borderRadius?: number | string;
    animation?: 'pulse' | 'wave' | 'none';
    count?: number;
    gap?: number;
    bgColor?: Color;
    highlightColor?: Color;
    shimmerColor?: Color;
    pulseDuration?: string;
    waveDuration?: string;
  }
  export function Skeleton(props: SkeletonProps): Widget;

  interface InstallButtonProps extends CommonProps {
    text?: string;
    variant?: 'filled' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    borderRadius?: number;
    padding?: Padding;
    bottom?: number;
    onInstalled?: () => void;
    onClick?: () => void;
  }
  export function InstallButton(props: InstallButtonProps): Widget;

  interface VideoProps extends CommonProps {
    src: string;
    width?: number | string;
    height?: number | string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    poster?: string;
    ref?: (video: HTMLVideoElement) => void;
  }
  export function Video(props: VideoProps): HTMLVideoElement & {
    playVideo(): void;
    pauseVideo(): void;
    stop(): void;
    restart(): void;
    volumeUp(step?: number): void;
    volumeDown(step?: number): void;
    muteVideo(): void;
    unmuteVideo(): void;
  };

  interface AudioProps extends CommonProps {
    src: string;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    muted?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
    onTimeUpdate?: (current: number, duration: number, percent: number) => void;
    onProgress?: (percent: number) => void;
    onLoad?: (duration: number) => void;
    ref?: (audio: HTMLAudioElement) => void;
  }
  export function Audio(props: AudioProps): HTMLAudioElement & {
    playAudio(): void;
    pauseAudio(): void;
    stop(): void;
    seekTo(seconds: number): void;
    seekToPercent(percent: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    getProgressPercent(): number;
    volumeUp(step?: number): void;
    volumeDown(step?: number): void;
    muteAudio(): void;
    unmuteAudio(): void;
    isPlaying(): boolean;
  };

  interface CircularBarProps extends CommonProps {
    value?: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    color?: Color;
    backgroundColor?: Color;
    showValue?: boolean;
    valueColor?: Color;
    valueSize?: number;
    label?: string;
    labelColor?: Color;
    labelSize?: number;
    lineCap?: 'butt' | 'round' | 'square';
    animate?: boolean;
    animationDuration?: number;
    onComplete?: () => void;
    ref?: (canvas: HTMLCanvasElement) => void;
    // Nuevas props
    valueFormat?: 'percent' | 'value' | 'custom';
    valueSuffix?: string;
    valuePrefix?: string;
    valueDecimals?: number;
    customValueFormatter?: (value: number, max: number) => string;
    gradient?: string | string[];
    gradientAngle?: number;
    shadowBlur?: number;
    shadowColor?: string;
    glow?: boolean;
    glowColor?: string;
    markers?: Array<{ value: number; color?: Color; size?: number; label?: string }>;
    innerStrokeWidth?: number;
    innerColor?: Color;
    onClick?: (data: { value: number; max: number; percent: number }) => void;
    onHover?: (hovering: boolean, data: { value: number; max: number }) => void;
    subtitle?: string;
    subtitleColor?: Color;
    subtitleSize?: number;
    tooltip?: string;
  }
  export function CircularBar(props: CircularBarProps): Widget & {
    updateValue(newValue: number, newMax?: number): void;
  };

  interface MarkdownProps extends CommonProps {
    text?: string;
    source?: string;
    content?: string;
    children?: string;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    color?: Color;
    linkColor?: Color;
    linkHoverColor?: Color;
    linkUnderline?: boolean;
    codeBgColor?: Color;
    codeColor?: Color;
    codeFontSize?: number;
    codeFontFamily?: string;
    codeBorderRadius?: number;
    codePadding?: Padding;
    preBgColor?: Color;
    preBorderRadius?: number;
    prePadding?: Padding;
    preMargin?: Padding;
    blockquoteBorderColor?: Color;
    blockquoteBorderWidth?: number;
    blockquoteColor?: Color;
    blockquotePadding?: Padding;
    blockquoteMargin?: Padding;
    headingColor?: Color;
    headingMargin?: Padding;
    listMargin?: Padding;
    listPadding?: Padding;
    listItemMargin?: Padding;
    imageMaxWidth?: string;
    imageBorderRadius?: number;
    padding?: Padding;
    maxHeight?: number;
    overflow?: string;
    backgroundColor?: Color;
    borderRadius?: number;
    allowDangerousHtml?: boolean;
  }
  export function Markdown(props: MarkdownProps): Widget & {
    updateContent(newText: string): void;
    getContent(): string;
    getSource(): string;
  };

  // =========================================================================
  // Core
  // =========================================================================
  export function runApp(App: () => Widget, rootId?: string, preventRefresh?: boolean, routes?: any): void;
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
  // PWA & HMR
  // =========================================================================
  export function installPWA(): boolean;
  export function updatePWA(): boolean;
  export function removePWA(): void;
  export function isPWAInstalled(): boolean;
  export function initHMR(): void;
  export function getHMR(): WebSocket | null;

  // =========================================================================
  // Utils (temas, dimensiones, aleatorios, etc.)
  // =========================================================================
  export const colors: Record<string, string>;
  export const palettes: Record<string, Record<string, string>>;
  export function setTheme(themeName: 'light' | 'dark'): Record<string, string>;
  export function getTheme(): string;
  export function toggleTheme(): string;
  export function getColor(colorName: string, opacity?: number): string;
  export function subscribeTheme(callback: (colors: Record<string, string>) => void): () => void;
  export function applySystemTheme(): string;
  export function watchSystemTheme(): () => void;
  export const ThemeProvider: (props: { children: Widget; theme?: 'light' | 'dark' }) => Widget;
  export function useTheme(): {
    colors: Record<string, string>;
    setTheme: typeof setTheme;
    getTheme: typeof getTheme;
    toggleTheme: typeof toggleTheme;
    getColor: typeof getColor;
    applySystemTheme: typeof applySystemTheme;
  };

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
      startIndex: number;
      endIndex: number;
    };
    search<T>(list: T[], query: string | ((item: T) => boolean), fields?: string[]): T[];
    sort<T>(list: T[], field: keyof T, order?: 'asc' | 'desc'): T[];
    groupBy<T>(list: T[], field: keyof T): Record<string, T[]>;
  };

  export const mapList: {
    <T>(list: T[] | number | Record<string, any>, fn: (item: any, index: number | string, key?: string) => Widget): Widget[];
  };
  export const repeat: (count: number, widget: Widget | ((index: number) => Widget)) => Widget[];
  export const range: (start: number, end?: number, step?: number) => number[];

  export function delay(ms: number): Promise<void>;
  export function withMinDelay<T>(promise: Promise<T>, minMs?: number): Promise<T>;
  export function retry<T>(fn: () => Promise<T>, retries?: number, delayMs?: number): Promise<T>;
  export function sleep(ms: number): Promise<void>;
  export function now(): number;

  export const dimensions: {
    width: number;
    height: number;
    get(): { width: number; height: number };
    getWidth(): number;
    getHeight(): number;
    addListener(callback: (dim: { width: number; height: number }) => void): () => void;
    removeListener(callback: (dim: { width: number; height: number }) => void): void;
  };
  export const width: number;
  export const height: number;

  export const device: {
    isMobile(): boolean;
    isTablet(): boolean;
    isDesktop(): boolean;
    orientation(): 'portrait' | 'landscape';
    isTouch(): boolean;
    hasGesture(): boolean;
    onOrientationChange(callback: (orientation: string) => void): void;
    onResize(callback: (size: { width: number; height: number; orientation: string }) => void): void;
  };

  export const os: {
    name(): string;
    version(): string;
    isMobile(): boolean;
    isDesktop(): boolean;
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
    hexColor(): string;
    rgbColor(): string;
    date(start?: Date | string, end?: Date | string): Date;
    dateString(start?: Date | string, end?: Date | string): string;
    time(): string;
    timeAmPm(): string;
    datetime(): string;
    timestamp(): number;
    dayOfWeek(): string;
    month(): string;
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

  export function formatDate(date: Date | string | number, format?: string): string;
  export function relativeTime(date: Date | string | number): string;
  export function formatMediaTime(seconds: number): string;
  export function formatMediaTimeLong(seconds: number): string;
  export function getProgressPercent(current: number, total: number): number;
  export function percentToSeconds(percent: number, total: number): number;
  export function formatMediaProgress(current: number, total: number): string;

  export function stopWebRefresh(): void;

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

  export function border(width?: number | string, style?: string, color?: string): string;
  export function margin(value: number | string | { all?: number; horizontal?: number; vertical?: number; top?: number; right?: number; bottom?: number; left?: number }): string;
  export function padding(value: number | string | { all?: number; horizontal?: number; vertical?: number; top?: number; right?: number; bottom?: number; left?: number }): string;
  export function Gradient(type: 'linear' | 'circle' | 'conic', colors: string[], angle?: number): string;
  export function Shadow(x: number, y: number, blur: number, spread: number, color: string): string;
  export function rgba(r: number, g: number, b: number, a?: number): string;
  export function stackPosition(widget: Widget, props: { top?: any; right?: any; bottom?: any; left?: any }): Widget;
  export function flex(grow: number | { grow?: number; shrink?: number; basis?: string }, shrink?: number, basis?: string): string;
  export function grid(options: { columns?: number | string; rows?: number | string; gap?: number | string | { row?: number; column?: number } }): string;
  export function transition(options: { property?: string; duration?: number; timing?: string; delay?: number } | Array<{ property?: string; duration?: number; timing?: string; delay?: number }>): string;
  export function transform(options: {
    translate?: [number, number];
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotate?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    skew?: number;
    skewX?: number;
    skewY?: number;
    matrix?: number[];
    matrix3d?: number[];
    perspective?: number;
  }): string;
  export function filter(options: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    dropShadow?: [number, number, number, string];
    grayscale?: number;
    hueRotate?: number;
    invert?: number;
    opacity?: number;
    saturate?: number;
    sepia?: number;
    backdrop?: any;
  }): string;
  export function animation(name: string | { name: string; duration?: number; timing?: string; delay?: number; iteration?: number | string; direction?: string; fillMode?: string }, duration?: number, timing?: string, iteration?: string): string;

  export const Dict: {
    new (obj?: any): {
      get(key: string, defaultValue?: any): any;
      set(key: string, value: any): this;
      has(key: string): boolean;
      keys(): string[];
      values(): any[];
      items(): [string, any][];
      delete(key: string): this;
      readonly size: number;
      clear(): this;
      copy(): any;
      update(other: any): this;
      toObject(): any;
      toJSON(): string;
      toString(): string;
      getNested(path: string, defaultValue?: any): any;
      setNested(path: string, value: any): this;
      forEach(callback: (value: any, key: string) => void): void;
      map<R>(callback: (value: any, key: string) => R): R[];
      filter(callback: (value: any, key: string) => boolean): any;
    };
  };
  export function dict(obj?: any): any;
  export function emptyDict(): any;
  export function fromJSON(jsonStr: string): any;
  export function fromEntries(entries: [string, any][]): any;

  export function ref<T extends Widget = Widget>(): (widget: T) => T & { update(props: Partial<any>): void };
  export function uuid(): string;
  export function shortId(): string;
  export function numericId(length?: number): string;
  export function timestampId(): string;

  export function memo<T extends (...args: any[]) => any>(fn: T): T & { cache?: Map<string, ReturnType<T>> };
  export function memoWithKey<T extends (...args: any[]) => any>(fn: T, keyFn: (...args: Parameters<T>) => string): T;
  export function clearMemo(memoizedFn: any): void;

  export function setBaseFontSize(size: number): void;
  export function toREM(value: number | string): string | undefined;
  export function toPX(value: number | string): string | undefined;
  export function getBaseFontSize(): number;

  export function capitalize(str: string): string;
  export function capitalizeWords(str: string): string;
  export function lowerCase(str: string): string;
  export function upperCase(str: string): string;
  export function reverseString(str: string): string;
  export function truncate(str: string, length?: number, suffix?: string): string;

  export function shuffle<T>(arr: T[]): T[];
  export function reverse<T>(arr: T[]): T[];
  export function sort<T>(arr: T[], by?: string | ((a: T, b: T) => number), order?: 'asc' | 'desc'): T[];
  export function unique<T>(arr: T[], key?: string): T[];
  export function chunk<T>(arr: T[], size: number): T[][];

  export function getWidgetProps(widget: Widget): Record<string, any>;
  export function getWidgetProp(widget: Widget, propName: string): any;
  export function stringifyWidgetProps(widget: Widget): string;

  // =========================================================================
  // Markdown parser
  // =========================================================================
  export function parseMarkdown(text: string): string;
  export function parseInlineMarkdown(text: string): string;
  export function markdownToWidgets(text: string, options?: { codeMaxHeight?: number; codeFontSize?: number }): Widget[];
  export function parseMarkdownToWidgets(text: string, options?: { codeMaxHeight?: number; codeFontSize?: number }): Widget[];
  export function parseInlineToWidgets(text: string): Widget[];
  export function escapeHtml(text: string): string;

  // =========================================================================
  // Syntax highlight
  // =========================================================================
  export const highlightColors: Record<string, string>;
  export function tokenize(code: string): Array<{ type: string; value: string }>;
  export function generateHighlightedHtml(code: string): string;
}
