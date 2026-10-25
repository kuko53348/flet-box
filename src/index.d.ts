// index.d.ts - FletBox Type Declarations
// Versión completa con todos los widgets, animaciones, servicios y utilidades

declare module 'flet-box' {
  // =========================================================================
  // Tipos base
  // =========================================================================
  export type Widget = HTMLElement;
  // A Scaffold slot: an element, a factory it re-runs on each route change (so a
  // nav can relight the active item), a boolean show/hide, or null for absent.
  export type Slot = Widget | (() => Widget) | boolean | null;
  export type Color = string;
  export type Size = number | string;
  export type Padding = number | string;
  export type Margin = number | string;
  /** How a single flex child answers its parent's cross-axis `alignItems`. */
  export type AlignSelf = 'auto' | 'flex-start' | 'center' | 'flex-end' | 'baseline' | 'stretch';

  /**
   * The element returned by `WidgetFactory()`. It is a real `HTMLElement` with
   * the factory's imperative API attached (see `src/widget-factory/`).
   */
  export interface WidgetFactoryInstance extends Widget {
    /** Merge new props and re-apply styles, attributes, children and effects. */
    update(props?: Record<string, any>): WidgetFactoryInstance;
    /** Shallow copy of the widget's currently stored props. */
    getProps(): Record<string, any>;
    /** Register a callback fired when the widget enters the live DOM. */
    onMount(fn: (widget: WidgetFactoryInstance) => void): void;
    /** Register a disposer fired on every teardown path. Must be idempotent. */
    onUnmount(fn: (widget: WidgetFactoryInstance) => void): void;
    /** Fire mount callbacks immediately when the widget is already connected. */
    triggerMount(): WidgetFactoryInstance;
    /** Release the widget's resources and remove it from the lifecycle registry. */
    _cleanup(): void;
  }

  // =========================================================================
  // Posicionamiento
  // =========================================================================
  /**
   * Positional props accepted by every widget.
   *
   * `position: 'stack'` takes the widget out of normal flow and places it
   * against its nearest positioned ancestor; the `center*` / `full*` shorthands
   * only take effect in that mode. Numeric offsets are framework units (pixels
   * on the 16px base, emitted as rem).
   *
   * A few widgets give `position` their own meaning — the toast/badge/tooltip
   * anchor — and therefore omit this declaration, as does `Maps` for `center`.
   */
  export interface StackPositionProps {
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | 'stack';
    /** Alias of `position`. */
    pos?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky' | 'stack';
    top?: Size;
    right?: Size;
    bottom?: Size;
    left?: Size;
    inset?: Size;
    /** Logical spelling of `left`. */
    start?: Size;
    /** Logical spelling of `right`. */
    end?: Size;
    /** Alias of `zIndex`. */
    z?: number;
    zIndex?: number;
    centerX?: boolean;
    centerY?: boolean;
    center?: boolean;
    fullWidth?: boolean;
    fullHeight?: boolean;
    full?: boolean;
  }

  // =========================================================================
  // Props comunes (heredadas by todos the widgets)
  // =========================================================================
  export interface CommonProps extends StackPositionProps {
    width?: Size;
    height?: Size;
    // `Size`, not `number`: for a Text this is a font size and for a Button it is
    // the `small | medium | large` preset — the widget decides which it reads.
    size?: Size;
    // The engine routes these as plain style on every widget, so declaring them
    // only on `Container` made `Column({ maxWidth: 720, flex: 1 })` — the layout
    // recipe the design skill teaches — a false error in a JS editor.
    flex?: number;
    minWidth?: Size;
    maxWidth?: Size;
    minHeight?: Size;
    maxHeight?: Size;
    border?: string;
    borderTop?: string;
    borderBottom?: string;
    borderLeft?: string;
    borderRight?: string;
    cursor?: string;
    // The engine routes `display` untouched; `Stack` sets it internally and an
    // app that overrides it is doing something the type must not forbid.
    display?: string;
    padding?: Padding;
    margin?: Margin;
    // The engine routes each margin side, and the `mt/mr/mb/ml` aliases, as rem
    // lengths on every widget: `Text({ marginTop: 4 })` is legal at runtime.
    marginTop?: Size;
    marginRight?: Size;
    marginBottom?: Size;
    marginLeft?: Size;
    mt?: Size;
    mr?: Size;
    mb?: Size;
    ml?: Size;
    bgColor?: Color;
    // Alias kept because the engine routes it and every generated template uses
    // it: `bgColor` is the Flet-style short name for the same style.
    backgroundColor?: Color;
    color?: Color;
    borderRadius?: number | string;
    elevation?: number;
    shadow?: string;
    // Glass and filters. A CSS value string, not an object: `backdropFilter` is
    // what makes a translucent card frosted rather than merely see-through, and
    // `maskImage` is what fades a list out at its end.
    filter?: string;
    backdropFilter?: string;
    maskImage?: string;
    opacity?: number;
    visible?: boolean;
    disabled?: boolean;
    onPress?: (widget: Widget) => void;
    onClick?: (widget: Widget) => void;
    // The lowercase alias the engine also routes (`{ prop: "onclick" }` in
    // translateProps); the generated AppBar reaches for it.
    onclick?: (widget: Widget) => void;
    // A child's own cross-axis answer to its parent's `alignItems`. It belongs on
    // `CommonProps` rather than on the layouts because the widget that needs it is
    // the *child* — a chip centred inside a row whose other children stretch.
    alignSelf?: AlignSelf;
    // Alias of `alignSelf`, matching the `justify` / `alignItems` shorthand style.
    selfAlign?: AlignSelf;
    id?: string;
    className?: string;
    ref?: (widget: Widget) => void;
    disableTransform?: boolean;
  }

  // =========================================================================
  // useState Hook (persistente with RamStore)
  // =========================================================================
  export function useState<T>(
    key: string,
    initialState: T | (() => T),
    widget?: Widget,
    propName?: string
  ): [
    T,
    (value: T | ((prev: T) => T)) => void,
    (callback: (newValue: T, oldValue: T) => void) => () => void
  ];

  export function useWatchState<T>(
    key: string,
    callback: (newValue: T, oldValue: T) => void
  ): () => void;

  // =========================================================================
  // Frontend services
  // =========================================================================
  export function saveRam<T>(key: string, value: T): boolean;
  export function getRam<T>(key: string): T | null;
  export function getAllRam(): Record<string, any>;
  export function getAllRamKeys(): string[];
  export function hasRam(key: string): boolean;
  export function updateRam<T>(key: string, value: T): boolean;
  export function deleteRam(key: string): boolean;
  export function clearAllRam(): boolean;
  export function subscribeRam<T>(
    callback: (key: string | null, newValue: T | null, oldValue: T | null) => void
  ): () => void;
  export function getRamItemCount(): number;
  export function isRamAvailable(): boolean;

  export function saveSession<T>(key: string, value: T): boolean;
  export function getSession<T>(key: string): T | null;
  export function getSessionSync<T>(key: string): T | null;
  export function updateSession<T>(key: string, value: T): boolean;
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

  export function saveData<T>(key: string, value: T): boolean;
  export function getData<T>(key: string): T | null;
  export function getDataSync<T>(key: string): T | null;
  export function updateData<T>(key: string, value: T): boolean;
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

  export interface HttpRequestOptions extends RequestInit {
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | null | undefined>;
    timeout?: number;
  }

  export function httpRequest<T = any>(
    method: string,
    url: string,
    options?: HttpRequestOptions
  ): Promise<T>;
  export function httpGet<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;
  export function httpPost<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;
  export function httpPut<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;
  export function httpPatch<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;
  export function httpDelete<T = any>(url: string, options?: HttpRequestOptions): Promise<T>;

  // =========================================================================
  // Service namespaces
  // =========================================================================
  // Each store is also exported as a namespace object whose members are exactly
  // the functions above, so both call styles are valid:
  //   saveRam("k", 1)   |   RamStore.saveRam("k", 1)
  // Members are typed through `typeof` so a namespace can never drift from the
  // individual declaration.
  export const RamStore: {
    saveRam: typeof saveRam;
    getRam: typeof getRam;
    getAllRam: typeof getAllRam;
    getAllRamKeys: typeof getAllRamKeys;
    hasRam: typeof hasRam;
    updateRam: typeof updateRam;
    deleteRam: typeof deleteRam;
    clearAllRam: typeof clearAllRam;
    subscribeRam: typeof subscribeRam;
    getRamItemCount: typeof getRamItemCount;
    isRamAvailable: typeof isRamAvailable;
  };

  export const Session: {
    saveSession: typeof saveSession;
    getSession: typeof getSession;
    getSessionSync: typeof getSessionSync;
    updateSession: typeof updateSession;
    deleteSession: typeof deleteSession;
    clearAllSession: typeof clearAllSession;
    hasSession: typeof hasSession;
    getAllSessionKeys: typeof getAllSessionKeys;
    getAllSessionData: typeof getAllSessionData;
    getSessionSize: typeof getSessionSize;
    deleteSessionByPrefix: typeof deleteSessionByPrefix;
    deleteSessionBySuffix: typeof deleteSessionBySuffix;
    getSessionItemCount: typeof getSessionItemCount;
    isSessionAvailable: typeof isSessionAvailable;
  };

  export const Storage: {
    saveData: typeof saveData;
    getData: typeof getData;
    getDataSync: typeof getDataSync;
    updateData: typeof updateData;
    deleteData: typeof deleteData;
    clearAllData: typeof clearAllData;
    hasData: typeof hasData;
    getAllKeys: typeof getAllKeys;
    getAllData: typeof getAllData;
    getStorageSize: typeof getStorageSize;
    deleteDataByPrefix: typeof deleteDataByPrefix;
    deleteDataBySuffix: typeof deleteDataBySuffix;
    getItemCount: typeof getItemCount;
    isStorageAvailable: typeof isStorageAvailable;
  };

  // =========================================================================
  // Layouts
  // =========================================================================
  export interface ContainerProps extends CommonProps {
    direction?: 'row' | 'column';
    gap?: number | string;
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    // `start`/`end`/`baseline` are CSS Box Alignment values the engine passes
    // through untouched, so the type has to admit them.
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'start' | 'end' | 'baseline' | 'stretch';
    wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
    child?: Widget;
    children?: Widget[];
    expand?: boolean | number;
    flex?: number;
    minHeight?: Size;
    maxHeight?: Size;
    minWidth?: Size;
    maxWidth?: Size;
    overflow?: 'auto' | 'hidden' | 'visible' | 'scroll';
  }
  export function Container(props: ContainerProps): Widget;

  export interface RowProps extends CommonProps {
    gap?: number | string;
    justifyContent?: ContainerProps['justifyContent'];
    alignItems?: ContainerProps['alignItems'];
    wrap?: boolean | 'wrap' | 'nowrap' | 'wrap-reverse';
    children?: Widget[];
    onPress?: (widget: Widget) => void;
  }
  export function Row(props: RowProps): Widget;

  export interface ColumnProps extends CommonProps {
    gap?: number | string;
    justifyContent?: ContainerProps['justifyContent'];
    alignItems?: ContainerProps['alignItems'];
    children?: Widget[];
    onPress?: (widget: Widget) => void;
  }
  export function Column(props: ColumnProps): Widget;

  export interface StackProps extends CommonProps {
    children?: Widget[];
    position?: 'relative' | 'absolute' | 'stack';
    alignment?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }
  export function Stack(props: StackProps): Widget;

  export interface ListViewProps extends CommonProps {
    data?: any[];
    renderItem?: (item: any, index: number) => Widget;
    height?: number | string;
    width?: number | string;
    itemSize?: number;
    gap?: number;
    wrapItems?: boolean;
    crossAxisCount?: number;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    onRefresh?: (done: () => void) => void;
    ListHeaderComponent?: (() => Widget) | Widget;
    ListFooterComponent?: (() => Widget) | Widget;
    ListEmptyComponent?: (() => Widget) | Widget;
    showsScrollIndicator?: boolean;
    bufferSize?: number;
    expand?: boolean | number;
  }
  export function ListView(props: ListViewProps): Widget & {
    data: any[];
    refreshing: boolean;
    updateData(newData: any[]): void;
    scrollToIndex(index: number, animated?: boolean): void;
    scrollToStart(animated?: boolean): void;
    scrollToEnd(animated?: boolean): void;
  };

  export interface GridViewProps extends Omit<ListViewProps, 'wrapItems' | 'crossAxisCount'> {
    columns?: number;
    spacing?: number;
    itemHeight?: number;
    /**
     * The cells themselves, laid out `columns` per row. This is the same contract
     * as `data` + `renderItem` read the other way round: pass the built widgets
     * here, or the items plus a builder. One of the two — `data` wins.
     */
    children?: Widget[] | Widget;
  }
  export function GridView(props: GridViewProps): Widget;

  // =========================================================================
  // Widgets básicos
  // =========================================================================
  export interface TextProps extends CommonProps {
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

  export interface ButtonProps extends CommonProps {
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

  export interface IconProps extends CommonProps {
    name: string;
    size?: number;
    color?: Color;
    onPress?: (widget: Widget) => void;
  }
  export function Icon(props: IconProps): Widget;

  export interface ImageProps extends CommonProps {
    src: string;
    alt?: string;
    width?: Size;
    height?: Size;
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    circular?: boolean;
    downloadable?: boolean;
    downloadFileName?: string;
    onLoad?: (widget: Widget) => void;
    onError?: (widget: Widget) => void;
    onPress?: (widget: Widget) => void;
  }
  export function Image(props: ImageProps): Widget;

  export interface AvatarProps extends CommonProps {
    src?: string;
    name?: string;
    icon?: string;
    size?: number;
    bgColor?: Color;
    textColor?: Color;
    shape?: 'circle' | 'rounded' | 'square';
    online?: boolean;
    badgeColor?: Color;
    onPress?: (widget: Widget) => void;
  }
  export function Avatar(props: AvatarProps): Widget & {
    updateContent(newProps: Partial<AvatarProps>): void;
  };

  export interface CardProps extends CommonProps {
    child?: Widget;
    children?: Widget[];
    elevation?: number;
    padding?: Padding;
    borderRadius?: number | string;
    showBorder?: boolean;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderColor?: Color;
    onPress?: (widget: Widget) => void;
  }
  export function Card(props: CardProps): Widget;

  export interface ListTileProps extends CommonProps {
    leftItem?: Widget;
    title?: string | Widget;
    subtitle?: string | Widget;
    description?: string | Widget;
    /** Text props merged into the title, e.g. `{ size: 16, weight: "700" }`. */
    titleProps?: Partial<TextProps>;
    /** Text props merged into the subtitle. */
    subtitleProps?: Partial<TextProps>;
    /** Text props merged into the description line. */
    descriptionProps?: Partial<TextProps>;
    rightItem?: Widget;
    onPress?: (widget: Widget) => void;
    selected?: boolean;
    disabled?: boolean;
    divider?: boolean;
    paddingHorizontal?: number;
    paddingVertical?: number;
    bgColor?: Color;
    selectedBgColor?: Color;
    hoverColor?: Color;
    elevation?: number;
    borderRadius?: number;
  }
  export function ListTile(props: ListTileProps): Widget;

  export interface ProgressBarProps extends CommonProps {
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
    getValue(): number;
    setValue(value: number): void;
  };

  export interface RatingProps extends CommonProps {
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

  export interface ChipProps extends CommonProps {
    label: string;
    icon?: string;
    onPress?: () => void;
    onDelete?: () => void;
    variant?: 'filled' | 'outlined';
    color?: Color;
    textColor?: Color;
    borderColor?: Color;
    // Chip reads `size` as a font size in pixels and scales its icons from it,
    // so the preset union was a type the implementation never accepted.
    size?: number;
    borderRadius?: number | string;
    elevation?: number;
    gap?: number;
  }
  export function Chip(props: ChipProps): Widget;

  export interface AdSenseProps extends CommonProps {
    client?: string;
    slot?: string;
    format?: string;
    responsive?: boolean;
    test?: boolean;
    width?: Size;
    height?: Size;
    placeholder?: boolean;
    label?: string;
    bgColor?: Color;
    color?: Color;
    borderColor?: Color;
    onLoad?: (widget: Widget) => void;
    onError?: (error: Error, widget: Widget) => void;
    children?: Widget[];
  }
  export function AdSense(props: AdSenseProps): Widget & {
    refresh(): Widget;
    load(): void;
    getElement(): Widget;
  };

  export interface AdMobProps extends Omit<CommonProps, 'position'> {
    adId?: string;
    isTesting?: boolean;
    position?: 'top' | 'bottom';
    size?: string;
    margin?: number;
    interstitialId?: string;
    rewardedId?: string;
    autoShow?: boolean;
    /** Opt in to native ads. Requires a configured AdMob App ID (GADApplicationIdentifier in Info.plist / APPLICATION_ID in AndroidManifest.xml); until set, mounting is placeholder-only so a misconfigured app never crashes. */
    autoInitialize?: boolean;
    width?: Size;
    height?: Size;
    placeholder?: boolean;
    label?: string;
    bgColor?: Color;
    color?: Color;
    borderColor?: Color;
    plugin?: object;
    onLoaded?: (widget: Widget) => void;
    onFailed?: (error: Error, widget: Widget) => void;
    onDismissed?: () => void;
  }
  export function AdMob(props: AdMobProps): Widget & {
    show(): Promise<unknown>;
    hide(): Promise<unknown>;
    showInterstitial(): Promise<unknown>;
    showRewarded(): Promise<unknown>;
    getPlugin(): object | null;
  };

  export interface BadgeProps extends Omit<CommonProps, 'position'> {
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

  export interface SliderProps extends Omit<CommonProps, 'onPress'> {
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
    /** Canonical press/change callback, like every other FletBox widget. */
    onPress?: (value: number) => void;
    /** @deprecated Alias of `onPress`. */
    onChanged?: (value: number) => void;
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

  export interface AccordionProps extends CommonProps {
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

  export interface DividerProps extends Omit<CommonProps, 'margin'> {
    color?: Color;
    thickness?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    orientation?: 'horizontal' | 'vertical';
  }
  export function Divider(props?: DividerProps): Widget;

  // =========================================================================
  // Formularios e interacción
  // =========================================================================
  export interface InputProps extends CommonProps {
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

  export interface RadioProps extends CommonProps {
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

  export interface SwitchProps extends CommonProps {
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

  export interface CheckboxProps extends CommonProps {
    checked?: boolean;
    onCheck?: (checked: boolean) => void;
    disabled?: boolean;
    size?: number;
    activeColor?: Color;
    label?: string;
    /**
     * How the checked state is painted. `outlined` (default) keeps the box hollow and
     * draws the tick in `activeColor`; `filled` turns the whole box into an
     * `activeColor` plate and takes the tick to whichever ink reads on it.
     */
    variant?: 'outlined' | 'filled';
  }
  export function Checkbox(props: CheckboxProps): Widget & {
    setChecked(checked: boolean, triggerCallback?: boolean): void;
    getChecked(): boolean;
  };

  export type DropdownOption = { label: string; value: any; icon?: string };
  export interface DropdownProps extends CommonProps {
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
  // Alert dialogs and feedback
  // =========================================================================
  export interface SnackBarOptions {
    message: string;
    action?: string;
    onAction?: () => void;
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

  export interface ModalProps {
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

  export interface BottomSheetProps {
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

  export interface AlertDialogProps {
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
  export interface ScaffoldProps extends CommonProps {
    appBar?: Slot;
    body?: Widget | Record<string, any>;
    bottomBar?: Slot;
    fab?: Slot;
    // `Drawer()` returns an instance, not an element, and Scaffold unwraps it.
    drawer?: Widget | DrawerInstance | null;
    leftNavBar?: Slot;
    leftNavBarWidth?: number;
    rightNavBar?: Slot;
    rightNavBarWidth?: number;
    navSideBar?: Slot;
    navSideBarWidth?: number;
    navSideBarPosition?: 'left' | 'right';
    routes?: Record<string, any>;
    basePath?: string;
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

  export interface AdaptiveScaffoldProps extends CommonProps {
    appBar?: Slot;
    body?: Widget | Record<string, any>;
    bottomBar?: Slot;
    fab?: Slot;
    drawer?: Widget | DrawerInstance | null;
    leftNavBar?: Slot;
    leftNavBarWidth?: number;
    rightNavBar?: Slot;
    rightNavBarWidth?: number;
    routes?: Record<string, any>;
    backgroundColor?: Color;
    forceMobile?: boolean;
    forceDesktop?: boolean;
  }
  export function AdaptiveScaffold(props: AdaptiveScaffoldProps): Widget & {
    updateLeftNavBar(cfg: any): void;
    updateRightNavBar(cfg: any): void;
    setLeftNavBarWidth(width: number): void;
    setRightNavBarWidth(width: number): void;
    openDrawer?(): void;
    closeDrawer?(): void;
  };

  export interface AppBarProps extends Omit<CommonProps, 'shadow'> {
    title?: string | Widget;
    leading?: Widget;
    actions?: Widget[];
    actionsGap?: number;
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
    shadow?: boolean | string;
  }
  export function AppBar(props: AppBarProps): Widget & {
    setTitle(title: string): void;
    setBackgroundColor(color: string): void;
    show(): void;
    hide(): void;
  };

  export interface DrawerItemProps extends CommonProps {
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

  export interface DrawerInstance {
    open(): void;
    close(): void;
    toggle(): void;
    destroy(): void;
    element: HTMLElement;
  }
  export interface DrawerProps {
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

  export interface BottomNavigationProps extends Omit<CommonProps, 'shadow'> {
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
    shadow?: boolean | string;
    elevation?: number;
    useRouter?: boolean;
  }
  export function BottomNavigation(props: BottomNavigationProps): Widget & {
    setActiveIndex(index: number): void;
    getActiveIndex(): number;
    getCurrentRoute(): string | null;
  };

  export interface FloatingActionButtonProps extends CommonProps {
    icon?: string | Widget;
    label?: string;
    onPress?: () => void;
    backgroundColor?: Color;
    foregroundColor?: Color;
    elevation?: number;
    mini?: boolean;
    extended?: boolean;
    disabled?: boolean;
    margin?: number;
  }
  export function FloatingActionButton(props: FloatingActionButtonProps): Widget;

  export interface TabsProps extends CommonProps {
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

  export interface CollapsibleSideBarProps extends CommonProps {
    children: Widget;
    expanded?: boolean;
    id?: string;
    widthExpanded?: number;
    widthCollapsed?: number;
    iconSize?: number;
    onToggle?: (expanded: boolean) => void;
    bgColor?: Color;
    borderRight?: string;
  }
  export function CollapsibleSideBar(props: CollapsibleSideBarProps): Widget & {
    updateWidth(width: number): void;
  };

  // =========================================================================
  // Router
  // =========================================================================
  export function initRouter(routes: Record<string, any>, initialPath?: string, options?: { base?: string }): void;
  export function goTo(path: string, params?: Record<string, any>): void;
  export function goBack(): void;
  export function goForward(): void;
  export function replace(path: string, params?: Record<string, any>): void;
  export function getCurrentPath(): string;
  export function getBasePath(): string;
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
  export interface AnimationStep {
    effect: string;
    from: any;
    to: any;
    /** Milliseconds as a number (`400`) or a CSS time as a string (`"0.4s"`). Defaults to 500. */
    duration?: number | string;
    reverse?: boolean;
    /** Repeats this step forever; a loop and a one-shot generate separate `@keyframes`. */
    loop?: boolean;
    /** Milliseconds as a number (`120`) or a CSS time as a string (`"0.12s"`). Defaults to the widget's `delay`. */
    delay?: number | string;
  }
  export interface AnimatedBoxProps extends CommonProps {
    animations: AnimationStep[];
    child: Widget;
    timing?: string;
    /** Default delay for the steps that do not name one: milliseconds or a CSS time. */
    delay?: number | string;
    fillMode?: string;
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  }
  export function AnimatedBox(props: AnimatedBoxProps): Widget;

  export interface AnimatedTextProps extends CommonProps {
    child: Widget;
    animations: AnimationStep[];
    sameTime?: boolean;
    /** Seconds between consecutive characters (`0.05` is a 50 ms stagger). */
    delayBetween?: number;
    orientation?: 'row' | 'column';
  }
  export function AnimatedText(props: AnimatedTextProps): Widget;

  export interface MatrixRainProps extends CommonProps {
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

  export interface ParallaxBoxProps extends CommonProps {
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
    easing?: Easing
  ): () => boolean;
  export function stopAnimation(widget: Widget, property?: string): boolean;
  export function animateAsync(
    widget: Widget,
    property: string,
    from: any,
    to: any,
    duration?: number,
    easing?: Easing
  ): Promise<Widget>;
  export function fadeOut(widget: Widget, duration?: number): () => boolean;
  export function fadeIn(widget: Widget, duration?: number): () => boolean;
  export function pulse(widget: Widget, duration?: number): () => boolean;
  export function fadeOutAsync(widget: Widget, duration?: number): Promise<Widget>;
  export function fadeInAsync(widget: Widget, duration?: number): Promise<Widget>;
  export function pulseAsync(widget: Widget, duration?: number): Promise<Widget>;

  // ----- Easings, springs and the motion preference -----
  /** A curve name the imperative engine knows. */
  export type EasingName =
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeInQuart'
    | 'easeOutQuart'
    | 'easeInOutQuart'
    | 'easeInExpo'
    | 'easeOutExpo'
    | 'easeInOutExpo'
    | 'easeInCirc'
    | 'easeOutCirc'
    | 'easeInOutCirc'
    | 'easeInBack'
    | 'easeOutBack'
    | 'easeInOutBack'
    | 'easeInElastic'
    | 'easeOutElastic'
    | 'easeOutBounce'
    | 'standard'
    | 'emphasized'
    | 'emphasizedDecelerate'
    | 'emphasizedAccelerate';
  /** A curve name, or a curve built by `cubicBezier()` / returned by `spring()`. */
  export type Easing = EasingName | ((progress: number) => number);
  /** Every `EasingName`, in the order they are documented. */
  export const EASING_NAMES: EasingName[];
  export interface SpringOptions {
    stiffness?: number;
    damping?: number;
    mass?: number;
    initialVelocity?: number;
    epsilon?: number;
    maxDuration?: number;
  }
  export interface SpringCurve {
    easing: (progress: number) => number;
    duration: number;
    overshoot: boolean;
  }
  /** The cubic-bezier timing function as a curve, for imperative animation. */
  export function cubicBezier(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): (progress: number) => number;
  /** A damped spring: the curve plus the duration it needs to settle. */
  export function spring(options?: SpringOptions): SpringCurve;
  export function animateSpring(
    widget: Widget,
    property: string,
    from: any,
    to: any,
    options?: SpringOptions
  ): () => boolean;
  export function animateSpringAsync(
    widget: Widget,
    property: string,
    from: any,
    to: any,
    options?: SpringOptions
  ): Promise<Widget>;

  export interface SlideInOptions {
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    duration?: number;
    easing?: Easing;
    fade?: boolean;
  }
  export interface PopInOptions {
    from?: number;
    to?: number;
    duration?: number;
    easing?: Easing;
    fade?: boolean;
  }
  export interface ShakeOptions {
    axis?: 'x' | 'y';
    distance?: number;
    cycles?: number;
    duration?: number;
  }
  export function slideIn(widget: Widget, options?: SlideInOptions): () => boolean;
  export function slideInAsync(widget: Widget, options?: SlideInOptions): Promise<Widget>;
  export function slideOut(widget: Widget, options?: SlideInOptions): () => boolean;
  export function slideOutAsync(widget: Widget, options?: SlideInOptions): Promise<Widget>;
  export function popIn(widget: Widget, options?: PopInOptions): () => boolean;
  export function popInAsync(widget: Widget, options?: PopInOptions): Promise<Widget>;
  export function shake(widget: Widget, options?: ShakeOptions): () => boolean;
  export function shakeAsync(widget: Widget, options?: ShakeOptions): Promise<Widget>;

  export type MotionMode = 'auto' | 'reduce' | 'full';
  export interface StaggerOptions {
    start?: number;
    step?: number;
    max?: number;
  }
  /** True when the app or the operating system asked for no movement. */
  export function prefersReducedMotion(): boolean;
  export function getMotionMode(): MotionMode;
  export function setMotionMode(mode: MotionMode): MotionMode;
  export function onMotionModeChange(
    listener: (reduced: boolean) => void
  ): () => void;
  /** The duration to actually run: 0 when motion is reduced. */
  export function motionDuration(duration: number): number;
  /** The capped delay of item `index` in an entrance. */
  export function stagger(index: number, options?: StaggerOptions): number;

  // =========================================================================
  // Widgets adicionales (Data, Media, Utils)
  // =========================================================================
  export interface DataTableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    format?: (value: any, row: any) => string;
  }
  export interface DataTableProps extends CommonProps {
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

  export interface ChartProps extends Omit<CommonProps, 'padding'> {
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

  export interface QRCodeProps extends CommonProps {
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

  export interface CodeViewerProps extends CommonProps {
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

  export interface InspectorProps {
    /** The widget whose call is reconstructed and painted. */
    widget: Widget;
    /** Starting indentation depth of the printout. */
    indent?: number;
  }
  /** Paints the reconstructed call of a widget tree. */
  export function Inspector(props: InspectorProps): Widget;
  /** Rebuilds the call that made a widget, as a string. */
  export function Inspector(widget: Widget, indent?: number): string;
  export function printWidgetCode(widget: Widget): void;
  export function inspectWidget(widget: Widget): Widget;

  export interface DraggBoxProps extends CommonProps {
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

  export interface DroppBoxProps extends CommonProps {
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

  export interface CarouselProps extends CommonProps {
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

  export interface TooltipProps extends Omit<CommonProps, 'position'> {
    text: string;
    child: Widget;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    /** @deprecated Alias of `delay`. */
    tooltipDelay?: number;
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

  export interface PaginationProps extends CommonProps {
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

  export interface TreeViewProps extends CommonProps {
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

  export interface StepperProps extends CommonProps {
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

  export interface SkeletonProps extends CommonProps {
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

  export interface InstallButtonProps extends CommonProps {
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

  export interface VideoProps extends Omit<CommonProps, 'ref'> {
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

  export interface AudioProps extends Omit<CommonProps, 'ref'> {
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

  export interface CircularBarProps extends Omit<CommonProps, 'onClick' | 'ref'> {
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

  export interface CircularChartSlice {
    value: number;
    label?: string;
    color?: Color;
  }

  export interface CircularChartProps extends Omit<CommonProps, 'onClick' | 'ref'> {
    data?: CircularChartSlice[];
    size?: number;
    strokeWidth?: number;
    innerRadius?: number;
    rounded?: boolean;
    cornerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    animate?: boolean;
    animationDuration?: number;
    onComplete?: () => void;
    centerContent?: string | Widget | null;
    showLabels?: boolean;
    labelSize?: number;
    labelColor?: Color;
    onClick?: (slice: CircularChartSlice, index: number) => void;
    onHover?: (slice: CircularChartSlice | null, index: number) => void;
    defaultColors?: Color[];
    ref?: (canvas: HTMLCanvasElement) => void;
    shadowBlur?: number;
    shadowColor?: string;
    glow?: boolean;
    glowColor?: string;
    semiCircle?: 'top' | 'bottom' | 'left' | 'right' | null;
    borderRadius?: number;
    borderColor?: Color;
    borderWidth?: number;
    sliceBorderWidth?: number;
    sliceBorderColor?: Color;
  }
  export function CircularChart(props: CircularChartProps): Widget & {
    updateData(data: CircularChartSlice[], animate?: boolean): void;
    redraw(): void;
    setCornerRadius(radius: number): void;
  };

  export interface MarkdownProps extends CommonProps {
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
    tableBorderColor?: Color;
    tableHeaderBgColor?: Color;
    tableCellPadding?: Padding;
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
  // Maps
  // =========================================================================

  /** A point on the map: `[lat, lng]`, `{lat, lng}` or `{latitude, longitude}`. */
  export type LatLng = [number, number] | { lat: number; lng: number } | { latitude: number; longitude: number };

  /** `[[south, west], [north, east]]`, a named box, or the points to enclose. */
  export type MapBounds = [[number, number], [number, number]] | { south: number; west: number; north: number; east: number } | LatLng[];

  /** A pin. A bare `LatLng` is also accepted wherever a marker is expected. */
  export interface MapMarker {
    position: LatLng;
    label?: string;
    color?: Color;
    /** Keeps the pooled pin node across updates; auto-generated when omitted. */
    id?: string | number;
    /** Degrees clockwise from north, the bearing a GPS fix reports. Turns the pin around its own tip. */
    rotation?: number;
    /** `false` lets a tap fall through to the map: a tracked vehicle must not block picking a point. */
    clickable?: boolean;
    data?: any;
  }

  /** Payload of `onMapClick`: the geographic point under the cursor. */
  export interface MapClick {
    lat: number;
    lng: number;
    zoom: number;
  }

  /** Payload of `onMoveEnd`: the view once it stops changing. */
  export interface MapState {
    center: { lat: number; lng: number };
    zoom: number;
    bounds: { south: number; west: number; north: number; east: number };
  }

  /**
   * A stroked path — a route, a track, a boundary. Needs at least two usable
   * points. A bare `LatLng[]` is also accepted wherever a polyline is expected.
   */
  export interface MapPolyline {
    points: LatLng[];
    /** Stroke colour. Defaults to `polylineColor`. */
    color?: Color;
    /** Stroke width in CSS pixels. Defaults to `4`. */
    width?: number;
    opacity?: number;
    dashed?: boolean;
    /** Identifies the line to `removePolyline()`; auto-generated when omitted. */
    id?: string | number;
  }

  /** Payload of `onUserUpdate`: one fix from the watcher, in degrees and metres. */
  export interface MapFix {
    lat: number;
    lng: number;
    /** Radius of 68% confidence in metres, or null when the browser hides it. */
    accuracy: number | null;
    /** Degrees clockwise from true north, or null when the device reports none. */
    heading: number | null;
  }

  export interface MapsProps extends Omit<CommonProps, 'center'> {
    /** Initial view centre. Defaults to `[20, 0]`. */
    center?: LatLng;
    /** Integer zoom level, 0 = the whole world. Defaults to `2`. */
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    /** Positions and/or `{position, label, color, id, data}` records. */
    markers?: Array<MapMarker | LatLng>;
    /** Colour of the pins that do not set their own. Defaults to `colors.primary`. */
    markerColor?: Color;
    /** Position lists and/or `{points, color, width, opacity, dashed, id}` records. */
    polylines?: Array<MapPolyline | LatLng[]>;
    /** Stroke of the lines that do not set their own. Defaults to `colors.primary`. */
    polylineColor?: Color;
    /** `{z}/{x}/{y}` tile template. Defaults to OpenStreetMap. */
    tileUrl?: string;
    /** Credit line; most providers require one. */
    attribution?: string;
    showAttribution?: boolean;
    showZoomControl?: boolean;
    /** When false the view only moves through the imperative API. */
    interactive?: boolean;
    scrollZoom?: boolean;
    doubleClickZoom?: boolean;
    /** Draws the browser position; asks for permission on the first map paint. */
    showUserLocation?: boolean;
    /**
     * Keeps the view centred on the browser position. Implies the dot and asks
     * the browser for fresh high-accuracy fixes instead of a cached one.
     */
    followUser?: boolean;
    onMapClick?: (point: MapClick, event: PointerEvent) => void;
    onMarkerClick?: (marker: MapMarker, event: MouseEvent) => void;
    onMoveEnd?: (state: MapState) => void;
    /** Fires on each watched fix, including the ones while `followUser` is off. */
    onUserUpdate?: (fix: MapFix) => void;
  }
  export function Maps(props: MapsProps): Widget & {
    setCenter(position: LatLng, zoom?: number): Widget;
    getCenter(): { lat: number; lng: number };
    getZoom(): number;
    zoomTo(zoom: number): Widget;
    panBy(dx: number, dy: number): Widget;
    fitBounds(bounds: MapBounds, padding?: number): Widget;
    getState(): MapState;
    addMarker(marker: MapMarker | LatLng): MapMarker | null;
    /** Replace the marker with the same id, or append it when that id is new. */
    setMarker(marker: MapMarker | LatLng): MapMarker | null;
    removeMarker(idOrMarker: string | number | MapMarker): Widget;
    clearMarkers(): Widget;
    getMarkers(): MapMarker[];
    addPolyline(line: MapPolyline | LatLng[]): MapPolyline | null;
    removePolyline(idOrLine: string | number | MapPolyline): Widget;
    clearPolylines(): Widget;
    getPolylines(): MapPolyline[];
    setFollowUser(on: boolean): Widget;
    locate(settings?: { setCenter?: boolean; zoom?: number; timeout?: number; maximumAge?: number; highAccuracy?: boolean }): Promise<{ lat: number; lng: number }> | null;
    setUserPosition(position: LatLng | number[] | null, settings?: { setCenter?: boolean; zoom?: number }): Widget;
    render(): Widget;
  };

  // =========================================================================
  // Core
  // =========================================================================
  export function runApp(
    App: (() => Widget) | Widget,
    rootId?: string,
    preventRefresh?: boolean,
    routes?: any
  ): { destroy(): void };

  /**
   * Mounts a single widget into `#root`, creating the container when it is
   * missing. Never clears `document.body`. Returns the root container.
   */
  export function App(widget: Widget): Widget;

  /**
   * The only rendering engine. Turns a tag (or config object) plus props into a
   * real `HTMLElement` with styles, events, children, lifecycle and reactivity.
   */
  export function WidgetFactory(
    tag: string | { tag?: string; [prop: string]: any },
    customProps?: Record<string, any>
  ): WidgetFactoryInstance;

  export function createApp(routes: any, options?: { rootId?: string; fallback?: Widget | (() => Widget) }): {
    start(): void;
    destroy(): void;
  };
  export function insertBy(widget: Widget, rootId?: string): Widget;
  export function prependBy(widget: Widget, rootId?: string): Widget;
  export function insertBefore(widget: Widget, targetId: string): Widget;
  export function insertAfter(widget: Widget, targetId: string): Widget;
  export function replaceBy(widget: Widget, targetId: string): Widget;
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
  export function registerPalette(
    themeName: string,
    palette: Record<string, string>
  ): Record<string, string>;
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
    // Both return the unsubscribe; the runtime always did, the type hid it.
    onOrientationChange(callback: (orientation: string) => void): () => void;
    onResize(callback: (size: { width: number; height: number; orientation: string }) => void): () => void;
  };

  /** The five viewport widths a screen answers to, in CSS pixels. */
  export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** `md` is 768 — the same switch `AdaptiveScaffold` uses for its drawer. */
  export const BREAKPOINTS: Record<Breakpoint, number>;
  export const BREAKPOINT_NAMES: Breakpoint[];

  /** Which breakpoint a given width answers to (pure, no DOM). */
  export function breakpointForWidth(px: number): Breakpoint;
  /** The breakpoint the live viewport is in; `xs` where there is no window. */
  export function currentBreakpoint(): Breakpoint;
  /** Whether the viewport has reached `name`. */
  export function atLeast(name: Breakpoint): boolean;

  /**
   * Value for the current breakpoint. Keys are breakpoint names and an unnamed
   * step inherits the nearest smaller one: `pick({ xs: 8, md: 16 })` is 8, 8, 16,
   * 16, 16.
   */
  export function pick<T>(values: Partial<Record<Breakpoint, T>>, fallback?: T): T;

  /**
   * Subscribe to breakpoint crossings — not to every pixel of a resize.
   * @returns The unsubscribe. Call it from `onUnmount`.
   */
  export function onBreakpointChange(listener: (breakpoint: Breakpoint) => void): () => void;

  export interface LoadFontOptions {
    /** Weights to fetch, e.g. `[400, 600]`. Google needs them or you get 400 only. */
    weights?: number[];
    /** A stylesheet to load instead of the provider URL — a self-hosted `@font-face`. */
    url?: string;
    /** CSS `font-display`, provider URLs only. Defaults to `"swap"`. */
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  }

  /**
   * Load a webfont family so a `fontFamily` prop has the bytes behind it. One
   * request per family, whoever asks first. Resolves `false` when the face could
   * not be had — a webfont is a network request, and the screen keeps its
   * fallback instead of failing.
   */
  export function loadFont(family: string, options?: LoadFontOptions): Promise<boolean>;

  /** Wait for the faces the document has already started, before a canvas paint. */
  export function fontsReady(): Promise<boolean>;

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

  /** Tokens `YYYY MM DD HH mm ss`; anything else passes through. Defaults to `YYYY-MM-DD`. */
  export function formatDate(date: DateInput, format?: string): string;
  export function relativeTime(date: DateInput): string;
  export function timeAgo(date: DateInput): string;
  export function timeAgoLocale(date: DateInput, locale?: "en" | "es"): string;

  /** Anything `new Date()` accepts. */
  export type DateInput = Date | string | number;

  /** Unit names accepted by {@link dateDiff}; a calendar month counts as 30 days and a year as 365. */
  export type DateDiffUnit =
    | "milliseconds"
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "months"
    | "years";

  /** Milliseconds in `n` seconds. */
  export function seconds(n: number): number;
  /** Milliseconds in `n` minutes. */
  export function minutes(n: number): number;
  /** Milliseconds in `n` hours. */
  export function hours(n: number): number;
  /** Milliseconds in `n` days. */
  export function days(n: number): number;
  /** Milliseconds in `n` weeks. */
  export function weeks(n: number): number;
  /** Milliseconds in `n` months, a month being 30 days. */
  export function months(n: number): number;
  /** Milliseconds in `n` years, a year being 365 days. */
  export function years(n: number): number;

  export function today(): string;
  export function yesterday(): string;
  export function tomorrow(): string;

  /** Full English weekday name, e.g. `"Monday"`. */
  export function dayOfWeek(date: DateInput): string;
  /** Full English month name, e.g. `"January"`. */
  export function monthName(date: DateInput): string;

  export function isToday(date: DateInput): boolean;
  export function isYesterday(date: DateInput): boolean;
  export function isTomorrow(date: DateInput): boolean;
  export function isWeekend(date: DateInput): boolean;
  export function isLeapYear(year: number): boolean;

  /** `"Monday, January 15, 2024"` — the Intl long date for `locale`. */
  export function formatDateLong(date: DateInput, locale?: string): string;
  export function formatDateShort(date: DateInput, locale?: string): string;  /** 24-hour `HH:mm:ss`. */
  export function formatTime(date: DateInput): string;
  /** 12-hour `hh:mm:ss AM`. */
  export function formatTimeAmPm(date: DateInput): string;

  /** Token-based parse; the separators of `format` are `-`, `/`, `:` or a space. */
  export function parseDate(str: string, format?: string): Date;

  /** Absolute difference, so the argument order does not matter. */
  export function dateDiff(date1: DateInput, date2: DateInput, unit?: DateDiffUnit): number;

  /** New `Date` — the input is never mutated. A negative `n` subtracts. */
  export function addDays(date: DateInput, n: number): Date;
  export function addHours(date: DateInput, n: number): Date;
  export function addMinutes(date: DateInput, n: number): Date;
  export function addSeconds(date: DateInput, n: number): Date;
  export function subtractDays(date: DateInput, n: number): Date;
  export function subtractHours(date: DateInput, n: number): Date;
  export function subtractMinutes(date: DateInput, n: number): Date;
  export function subtractSeconds(date: DateInput, n: number): Date;

  /** Alias of {@link sleep}. */
  export function waitFor(ms: number): Promise<void>;
  /** Alias of {@link sleep}. */
  export function wait(ms: number): Promise<void>;

  /**
   * Polls `condition` until it is truthy.
   * @throws when `timeout` elapses first.
   */
  export function waitUntil(
    condition: () => boolean,
    timeout?: number,
    interval?: number,
  ): Promise<true>;

  /**
   * Polls the DOM for `selector` until the element appears. Needs a document:
   * use it in a browser, never at module scope.
   * @throws when `timeout` elapses first.
   */
  export function waitForElement(
    selector: string,
    timeout?: number,
    interval?: number,
  ): Promise<Element>;

  /** One-shot performance clock. `stop()` logs and returns the ms; `elapsed()` reads without logging. */
  export function timer(label: string): { stop(): number; elapsed(): number };

  /** `setInterval` with the arguments in the order a reader expects. */
  export function every(ms: number, callback: () => void): number;
  export function everySecond(callback: () => void): number;
  export function everyMinute(callback: () => void): number;
  export function everyHour(callback: () => void): number;
  export function everyDay(callback: () => void): number;
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
  export function gradient(type: 'linear' | 'circle' | 'conic', colors: string[], angle?: number): string;
  export function shadow(x: number, y: number, blur: number, spread: number, color: string): string;
  /**
   * Fluent color instance returned by `color()`. The chained methods mutate this
   * very instance and return it, which is why their type is `this` and not a
   * fixed interface name.
   */
  export interface ColorInstance {
    hex(): string;
    rgb(): string;
    rgba(): string;
    lighten(percent: number): this;
    darken(percent: number): this;
    alpha(value: number): this;
    complement(): this;
    isDark(): boolean;
    isLight(): boolean;
    contrast(): string;
    luminance(): number;
    contrastRatio(other: string | ColorInstance): number;
    meetsContrast(other: string | ColorInstance, minimum?: number): boolean;
  }

  export const color: (value: string | ColorInstance) => ColorInstance;
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

  /**
   * Thin `console` wrapper that adds a level icon plus optional timestamp and
   * label. The second argument may also be the options object (legacy style).
   */
  export function print(
    message: any,
    type?:
      | "log"
      | "warn"
      | "error"
      | "info"
      | "success"
      | "debug"
      | { timestamp?: boolean; label?: string; prefix?: boolean },
    options?: { timestamp?: boolean; label?: string; prefix?: boolean }
  ): void;

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
  export function startsWith(str: string, prefix: string): boolean;
  export function endsWith(str: string, suffix: string): boolean;
  export function includes(str: string, substr: string): boolean;
  export function split(str: string, separator: string): string[];
  export function join(arr: readonly any[], separator?: string): string;
  export function trim(str: string): string;

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
  export function generateHighlightedHtml(code: string, palette?: Record<string, string>): string;
}