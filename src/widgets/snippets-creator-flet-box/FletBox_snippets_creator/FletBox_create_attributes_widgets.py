attrs_all_placeholders_complete = {
    # =========================================================================
    # 1. UTILIDADES (funciones) – terminan en _fn para no chocar con props
    # =========================================================================
    
    # ---------- ANIMATION ----------
    'animation_fn': 'animation("fadeIn", 0.3, "ease", "infinite"),',
    
    # ---------- ARRAY ----------
    'shuffle': 'shuffle([1, 2, 3, 4, 5]),',
    'reverse_fn': 'reverse([1, 2, 3, 4]),',
    'sort': 'sort(users, "name", "asc"),',
    'unique': 'unique([1, 2, 2, 3, 4, 4]),',
    'chunk': 'chunk([1, 2, 3, 4, 5], 2),',
    
    # ---------- BORDER ----------
    'border_fn': 'border(1, "solid", "#ccc"),',
    
    # ---------- CLIPBOARD ----------
    'clipboard.copy': 'clipboard.copy("flet-box")',
    'clipboard.copyWithFeedback': 'clipboard.copyWithFeedback("flet-box", button)',
    'clipboard.read': 'await clipboard.read()',
    
    # ---------- COLOR ----------
    'color_fn': 'color("#6366f1")',
    'color.lighten': 'color("#6366f1").lighten(20)',
    'color.darken': 'color("#6366f1").darken(10)',
    'color.alpha': 'color("#6366f1").alpha(0.8)',
    'color.hex': 'color("#6366f1").hex()',
    'color.rgb': 'color("#6366f1").rgb()',
    'color.rgba': 'color("#6366f1").rgba()',
    'color.isDark': 'color("#6366f1").isDark()',
    'color.isLight': 'color("#6366f1").isLight()',
    'color.contrast': 'color("#6366f1").contrast()',
    'color.complement': 'color("#6366f1").complement()',
    
    # ---------- CREATE LIST ----------
    'createList': 'createList({ id: () => random.id(), name: random.fullName() }, 10)',
    'createList.fromData': 'createList.fromData(apiData, { id: (item) => item.userId })',
    'createList.range': 'createList.range(1, 10)',
    'createList.repeat': 'createList.repeat({ active: true }, 5)',
    'createList.paginate': 'createList.paginate(users, 2, 20)',
    'createList.search': 'createList.search(users, "flet-box", ["name", "description"])',
    'createList.sort': 'createList.sort(users, "age", "desc")',
    'createList.groupBy': 'createList.groupBy(users, "status")',
    
    # ---------- DELAY ----------
    'delay_fn': 'await delay(1000)',
    'withMinDelay': 'await withMinDelay(fetchData(), 800)',
    'retry': 'await retry(fetchData, 3, 1000)',
    
    # ---------- DEVICE ----------
    'device.isMobile': 'device.isMobile()',
    'device.isTablet': 'device.isTablet()',
    'device.isDesktop': 'device.isDesktop()',
    'device.orientation': 'device.orientation()',
    'device.isTouch': 'device.isTouch()',
    'device.hasGesture': 'device.hasGesture()',
    'device.onOrientationChange': 'device.onOrientationChange((orient) => console.log(orient))',
    'device.onResize': 'device.onResize((size) => console.log(size.width, size.height))',
    
    # ---------- DIMENSIONS ----------
    'dimensions.width': 'dimensions.width',
    'dimensions.height': 'dimensions.height',
    'dimensions.get': 'dimensions.get()',
    'dimensions.addListener': 'dimensions.addListener(({ width, height }) => console.log(width, height))',
    'dimensions.removeListener': 'dimensions.removeListener(callback)',
    
    # ---------- DICT ----------
    'dict': 'dict({ a: 1, b: 2 })',
    'emptyDict': 'emptyDict()',
    'fromJSON': 'fromJSON(\'{"key": "value"}\')',
    'fromEntries': 'fromEntries([["a", 1], ["b", 2]])',
    'Dict': 'new Dict({ name: "flet-box" })',
    
    # ---------- FILTER ----------
    'filter_fn': 'filter({ blur: 5, brightness: 0.8, contrast: 1.2 })',
    
    # ---------- FLEX ----------
    'flex_fn': 'flex(1, 0, "auto")',
    
    # ---------- GRADIENT ----------
    'gradient_fn': 'gradient("linear", ["#6366f1", "#8b5cf6"], 135)',
    
    # ---------- GRID ----------
    'grid_fn': 'grid({ columns: 3, gap: 16 })',
    
    # ---------- MAP LIST ----------
    'mapList': 'mapList([1, 2, 3], (item, i) => Text({ text: item }))',
    'repeat': 'repeat(5, (i) => Button({ text: f"Item {i}" }))',
    'range': 'range(0, 10, 2)',
    
    # ---------- MEMO ----------
    'memo': 'memo(expensiveFunction)',
    'memoWithKey': 'memoWithKey(expensiveFunction, (a, b) => f"{a}-{b}")',
    'clearMemo': 'clearMemo(memoizedFn)',
    
    # ---------- OS ----------
    'os.name': 'os.name()',
    'os.version': 'os.version()',
    'os.isMobile': 'os.isMobile()',
    'os.isDesktop': 'os.isDesktop()',
    
    # ---------- RANDOM ----------
    'random.number': 'random.number(1, 100)',
    'random.string': 'random.string(8)',
    'random.firstName': 'random.firstName()',
    'random.lastName': 'random.lastName()',
    'random.fullName': 'random.fullName()',
    'random.email': 'random.email("flet-box")',
    'random.date': 'random.date("2024-01-01", "2025-01-01")',
    'random.dateString': 'random.dateString("2024-01-01", "2025-01-01")',
    'random.time': 'random.time()',
    'random.timeAmPm': 'random.timeAmPm()',
    'random.datetime': 'random.datetime()',
    'random.timestamp': 'random.timestamp()',
    'random.dayOfWeek': 'random.dayOfWeek()',
    'random.month': 'random.month()',
    'random.age': 'random.age()',
    'random.boolean': 'random.boolean()',
    'random.choice': 'random.choice(["flet-box", "light", "weight"])',
    'random.id': 'random.id()',
    'random.hexColor': 'random.hexColor()',
    'random.rgbColor': 'random.rgbColor()',
    
    # ---------- REF ----------
    'ref_fn': 'const myWidgetRef = ref()',
    
    # ---------- RGBA ----------
    'rgba': 'rgba(99, 102, 241, 0.8)',
    
    # ---------- SHADOW ----------
    'shadow_fn': 'shadow(0, 4, 8, 0, rgba(0,0,0,0.1))',
    
    # ---------- STRING ----------
    'capitalize': 'capitalize("flet-box")',
    'capitalizeWords': 'capitalizeWords("flet-box light weight")',
    'lowerCase': 'lowerCase("FLET-BOX")',
    'upperCase': 'upperCase("flet-box")',
    'reverseString': 'reverseString("flet-box")',
    'truncate': 'truncate("flet-box is awesome", 10, "...")',
    
    # ---------- TIME ----------
    'formatDate': 'formatDate(new Date(), "YYYY-MM-DD")',
    'relativeTime': 'relativeTime("2024-01-01")',
    'sleep': 'await sleep(500)',
    'now': 'now()',
    
    # ---------- TRANSFORM ----------
    'transform_fn': 'transform({ translate: [10, 20], rotate: 45, scale: 1.2 })',
    
    # ---------- TRANSITION ----------
    'transition_fn': 'transition({ property: "all", duration: 0.3, timing: "ease" })',
    
    # ---------- useState ----------
    'useState': 'const [count, setCount] = useState("counter", 0)',
    'useWatchState': 'useWatchState("counter", (newVal, oldVal) => console.log(newVal))',
    
    # ---------- UUID ----------
    'uuid': 'uuid()',
    'shortId': 'shortId()',
    'numericId': 'numericId(6)',
    'timestampId': 'timestampId()',

    # ---------- THEMES ----------
    'colors': 'colors.primary',
    'setTheme': 'setTheme("dark")',
    'getTheme': 'getTheme()',
    'toggleTheme': 'toggleTheme()',
    'subscribeTheme': 'subscribeTheme((colors) => console.log(colors.primary))',
    'applySystemTheme': 'applySystemTheme()',
    'watchSystemTheme': 'watchSystemTheme()',
    'getColor': 'getColor("primary", 0.8)',
    
    # ---------- HTTP ----------
    'httpGet': 'const data = await httpGet("https://api.example.com/users")',
    'httpPost': 'const newUser = await httpPost("https://api.example.com/users", { body: { name: "flet-box" } })',
    'httpPut': 'const updated = await httpPut("https://api.example.com/users/1", { body: { name: "flet-box" } })',
    'httpPatch': 'const patched = await httpPatch("https://api.example.com/users/1", { body: { name: "flet-box" } })',
    'httpDelete': 'await httpDelete("https://api.example.com/users/1")',
    
    # ---------- RAM STORE ----------
    'saveRam': 'saveRam("user", { name: "flet-box" })',
    'getRam': 'const user = getRam("user")',
    'hasRam': 'hasRam("user")',
    'updateRam': 'updateRam("user", { name: "flet-box v2" })',
    'deleteRam': 'deleteRam("user")',
    'clearAllRam': 'clearAllRam()',
    'subscribeRam': 'subscribeRam((key, newValue, oldValue) => console.log(key, newValue))',
    'getAllRam': 'getAllRam()',
    'getAllRamKeys': 'getAllRamKeys()',
    'getRamItemCount': 'getRamItemCount()',
    'isRamAvailable': 'isRamAvailable()',
    
    # ---------- SESSION ----------
    'saveSession': 'saveSession("token", "abc123")',
    'getSession': 'const token = getSession("token")',
    'getSessionSync': 'getSessionSync("token")',
    'hasSession': 'hasSession("token")',
    'updateSession': 'updateSession("token", "newToken")',
    'deleteSession': 'deleteSession("token")',
    'clearAllSession': 'clearAllSession()',
    'getAllSessionKeys': 'getAllSessionKeys()',
    'getAllSessionData': 'getAllSessionData()',
    'getSessionSize': 'getSessionSize()',
    'deleteSessionByPrefix': 'deleteSessionByPrefix("user_")',
    'deleteSessionBySuffix': 'deleteSessionBySuffix("_temp")',
    'getSessionItemCount': 'getSessionItemCount()',
    'isSessionAvailable': 'isSessionAvailable()',
    
    # ---------- STORAGE ----------
    'saveData': 'saveData("settings", { theme: "dark" })',
    'getData': 'const settings = getData("settings")',
    'getDataSync': 'getDataSync("settings")',
    'hasData': 'hasData("settings")',
    'updateData': 'updateData("settings", { theme: "light" })',
    'deleteData': 'deleteData("settings")',
    'clearAllData': 'clearAllData()',
    'getAllKeys': 'getAllKeys()',
    'getAllData': 'getAllData()',
    'getStorageSize': 'getStorageSize()',
    'deleteDataByPrefix': 'deleteDataByPrefix("user_")',
    'deleteDataBySuffix': 'deleteDataBySuffix("_cache")',
    'getItemCount': 'getItemCount()',
    'isStorageAvailable': 'isStorageAvailable()',

    # ---------- getWidgetProps utils ----------
    'getWidgetProps': 'getWidgetProps(myButton)',
    'getWidgetProp': 'getWidgetProp(myButton, "text")',
    'stringifyWidgetProps': 'stringifyWidgetProps(myButton)',

    # ---------- markdownParser utils ----------
    'markdownToWidgets': 'markdownToWidgets("# Hello\\n\\nThis is **bold**")',
    'parseMarkdownToWidgets': 'parseMarkdownToWidgets(markdownText)',
    'parseInlineToWidgets': 'parseInlineToWidgets("text with **bold**")',

    # ---------- mediaTime utils ----------
    'formatMediaTime': 'formatMediaTime(125)',
    'formatMediaTimeLong': 'formatMediaTimeLong(3665)',
    'getProgressPercent': 'getProgressPercent(30, 100)',
    'percentToSeconds': 'percentToSeconds(50, 120)',
    'formatMediaProgress': 'formatMediaProgress(75, 120)',

    # ---------- stopWebRefresh ----------
    'stopWebRefresh': 'stopWebRefresh()',

    # ---------- syntaxHighlight ----------
    'generateHighlightedHtml': 'generateHighlightedHtml(codeString)',

    # ---------- TextInputValidator ----------
    'TextInputValidator.onlyLetters': 'TextInputValidator.onlyLetters("Hola123")',
    'TextInputValidator.onlyNumbers': 'TextInputValidator.onlyNumbers("abc123")',
    'TextInputValidator.isEmail': 'TextInputValidator.isEmail("test@example.com")',
    'TextInputValidator.onlyAlphanumeric': 'TextInputValidator.onlyAlphanumeric("Hola 123!")',
    'TextInputValidator.sanitize': 'TextInputValidator.sanitize("<script>alert(1)</script>")',
    'TextInputValidator.escapeHtml': 'TextInputValidator.escapeHtml("<div>Hola</div>")',
    'TextInputValidator.safeText': 'TextInputValidator.safeText(userInput)',
    'TextInputValidator.isSafe': 'TextInputValidator.isSafe(userInput)',
    'TextInputValidator.filter': 'TextInputValidator.filter("abc123", "a-z")',
    'TextInputValidator.limitLength': 'TextInputValidator.limitLength("Hello world", 5)',
    'TextInputValidator.isOnlyLetters': 'TextInputValidator.isOnlyLetters("Hola")',
    'TextInputValidator.isOnlyNumbers': 'TextInputValidator.isOnlyNumbers("123")',
    'TextInputValidator.filterEmail': 'TextInputValidator.filterEmail("user@domain.com")',

    # ---------- units ----------
    'setBaseFontSize': 'setBaseFontSize(16)',
    'toREM': 'toREM(16)',
    'toPX': 'toPX(1.5)',
    'getBaseFontSize': 'getBaseFontSize()',

    # ---------- animate.js ----------
    'animate_fn': 'animate(widget, "opacity", 0, 1, 300, "easeOut")',
    'animateAsync': 'await animateAsync(widget, "width", 100, 200, 500)',
    'fadeOut': 'fadeOut(widget, 300)',
    'fadeIn': 'fadeIn(widget, 300)',
    'pulse': 'pulse(widget, 300)',
    'fadeOutAsync': 'await fadeOutAsync(widget, 300)',
    'fadeInAsync': 'await fadeInAsync(widget, 300)',
    'pulseAsync': 'await pulseAsync(widget, 300)',

    # =========================================================================
    # 2. PROPS GENÉRICAS (válidas para casi cualquier widget)
    # =========================================================================
    
    # ---------- Identificación y atributos DOM ----------
    'id': 'id: "myId",',
    'className': 'className: "my-class",',
    'style': 'style: { marginTop: 10 },',
    'key': 'key: item.id,',
    'ref': 'ref: (el) => myRef = el,',
    
    # ---------- Contenido y composición ----------
    'children': 'children: [Text("A"), Text("B")],',
    'child': 'child: Text("Hello"),',
    
    # ---------- Espaciado (mejorado con padding() y margin()) ----------
    'padding': 'padding: padding(16),',
    'padding.only': 'padding: padding: { top: 20, right: 50, bottom: 50, left: 50 },',
    'padding.all': 'padding: padding({ all: 20 }),',
    'padding.horizontal': 'padding: padding({ horizontal: 16, vertical: 8 }),',
    'padding.vertical': 'padding: padding({ vertical: 12, horizontal: 24 }),',

    'margin': 'margin: margin(16),',
    'margin.all': 'margin: margin({ all: 20 }),',
    'margin.only': 'margin: margin: { top: 20, right: 50, bottom: 50, left: 50 },',
    'margin.horizontal': 'margin: margin({ horizontal: 16, vertical: 8 }),',
    'margin.vertical': 'margin: margin({ vertical: 12, horizontal: 24 }),',
    'gap': 'gap: 8,',
    
    # ---------- Dimensiones ----------
    'width': 'width: "100%",',
    'height': 'height: "auto", // "100vh"',
    'minWidth': 'minWidth: 300,',
    'maxWidth': 'maxWidth: "90%",',
    'maxHeight': 'maxHeight: "80vh",',
    'flex': 'flex: 1,',
    'expand': 'expand: true,',
    
    # ---------- Colores y fondos ----------
    'bgColor': 'bgColor: colors.surface,',
    'backgroundColor': 'backgroundColor: colors.surface,',
    'color': 'color: colors.text,',
    'textColor': 'textColor: colors.primary,',
    'gradient': 'gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",',
    'opacity': 'opacity: 0.8,',
    
    # ---------- Bordes y sombras ----------
    'border': 'border: border(1, "solid" ,"#ccc"),',
    'borderRadius': 'borderRadius: 12,',
    'borderWidth': 'borderWidth: 2,',
    'borderColor': 'borderColor: colors.border,',
    'borderStyle': 'borderStyle: "solid",',
    'elevation': 'elevation: 2,',
    'shadow': 'shadow: shadow(0, 4, 8, 0, rgba(0,0,0,0.1),',
    'boxShadow': 'boxShadow: shadow(0, 4, 8, 0, rgba(0,0,0,0.1),',
    
    # ---------- Posición ----------
    'position': 'position: "absolute",',
    'top': 'top: 20,',
    'right': 'right: 20,',
    'bottom': 'bottom: 20,',
    'left': 'left: 20,',
    'zIndex': 'zIndex: 9998,',
    
    # ---------- Flexbox / alineación ----------
    'alignItems': 'alignItems: "center",',
    'justifyContent': 'justifyContent: "center",',
    'flexDirection': 'flexDirection: "row",',
    'flexWrap': 'flexWrap: "wrap",',
    
    # ---------- Texto ----------
    'text': 'text: "Hello World",',
    'size': 'size: 16,',
    'weight': 'weight: "bold",',
    'align': 'align: "center",',
    'lineHeight': 'lineHeight: 1.5,',
    'letterSpacing': 'letterSpacing: 0.5,',
    
    # ---------- Efectos ----------
    'transform': 'transform: "scale(1.05)",',
    'transition': 'transition: "all 0.2s ease",',
    'overflow': 'overflow: "auto",',
    'cursor': 'cursor: "pointer",',
    
    # ---------- Eventos genéricos ----------
    'onPress': 'onPress: () => console.log("clicked"),',
    'onClick': 'onClick: () => console.log("clicked"),',
    'onDoublePress': 'onDoublePress: () => console.log("double click"),',
    'onRightClick': 'onRightClick: () => console.log("right click"),',
    'onMouseEnter': 'onMouseEnter: () => console.log("enter"),',
    'onMouseLeave': 'onMouseLeave: () => console.log("leave"),',
    'onScroll': 'onScroll: (e) => console.log(e.target.scrollTop),',
    'onWheel': 'onWheel: (e) => console.log(e.deltaY),',
    'onChange': 'onChange: (val) => console.log(val),',
    'onInput': 'onInput: (val) => console.log(val),',
    'onFocus': 'onFocus: (e) => console.log("focus"),',
    'onBlur': 'onBlur: (e) => console.log("blur"),',
    'onHover': 'onHover: () => console.log("hover"),',
    
    # ---------- Estado ----------
    'disabled': 'disabled: true,',
    'readonly': 'readonly: true,',
    'required': 'required: true,',
    'checked': 'checked: true,',
    'selected': 'selected: true,',
    'expanded': 'expanded: true,',
    'value': 'value: "",',
    'placeholder': 'placeholder: "Enter text...",',
    'label': 'label: "Username",',
    'error': 'error: true,',
    
    # ---------- Iconos ----------
    'icon': 'icon: "star",',
    'iconLeft': 'iconLeft: "favorite",',
    'iconRight': 'iconRight: "arrow_forward",',
    'iconTop': 'iconTop: "upload",',
    'iconBottom': 'iconBottom: "download",',
    'iconPosition': 'iconPosition: "left",',
    'iconSize': 'iconSize: 20,',
    'iconColor': 'iconColor: colors.textSecondary,',
    
    # ---------- Variantes ----------
    'variant': 'variant: "filled",',
    'fullWidth': 'fullWidth: true,',
    'size': 'size: "medium",',  # small, medium, large
    
    # ---------- Validación (Input) ----------
    'validation': 'validation: "email",',
    'maxLength': 'maxLength: 50,',
    'customPattern': 'customPattern: "^[A-Za-z]+$",',
    'showValidationMessage': 'showValidationMessage: true,',
    'showValidationIcon': 'showValidationIcon: true,',
    'onValidated': 'onValidated: (isValid, msg) => console.log(isValid, msg),',
    'type': 'type: "text",',           # text, password, email, number, etc.
    'inputmode': 'inputmode: "text",', # numeric, email, tel, etc.
    'autocomplete': 'autocomplete: "off",',
    'pattern': 'pattern: "[A-Za-z]{3}",',
    'name': 'name: "username",',
    
    # ---------- Slider ----------
    'min': 'min: 0,',
    'max': 'max: 100,',
    'step': 'step: 1,',
    'onChanged': 'onChanged: (val) => console.log(val),',
    'onChangeEnd': 'onChangeEnd: (val) => console.log("final", val),',
    'showValue': 'showValue: true,',
    'valuePrefix': 'valuePrefix: "$",',
    'valueSuffix': 'valueSuffix: " €",',
    'inverted': 'inverted: true,',
    'orientation': 'orientation: "horizontal",',
    
    # ---------- Dropdown ----------
    'options': 'options: [{ label: "Option 1", value: 1 }],',
    'clearable': 'clearable: true,',
    'portal': 'portal: true,',
    'optionHoverColor': 'optionHoverColor: colors.gray100,',
    
    # ---------- Rating ----------
    'allowHalf': 'allowHalf: true,',
    'iconActive': 'iconActive: "star",',
    'iconInactive': 'iconInactive: "star_border",',
    'iconHalf': 'iconHalf: "star_half",',
    'maxRating': 'max: 5,',
    'activeColor': 'activeColor: colors.warning,',
    'inactiveColor': 'inactiveColor: colors.border,',
    
    # ---------- Progress Bar ----------
    'progress': 'progress: 50,',
    'indeterminate': 'indeterminate: true,',
    'striped': 'striped: true,',
    'animatedStripes': 'animatedStripes: true,',
    'stripeColor': 'stripeColor: rgba(255,255,255,0.3),',
    'glow': 'glow: true,',
    'valueProgress': 'value: 50,',
    'maxProgress': 'max: 100,',
    'heightProgress': 'height: 8,',
    'colorProgress': 'color: colors.primary,',
    'backgroundColorProgress': 'backgroundColor: colors.border,',
    'borderRadiusProgress': 'borderRadius: 4,',
    
    # ---------- Chip ----------
    'onDelete': 'onDelete: () => console.log("deleted"),',
    'labelChip': 'label: "Chip label",',
    'iconChip': 'icon: "star",',
    
    # ---------- List Tile ----------
    'title': 'title: "hello guy!!!",',
    'subtitle': 'subtitle: "Secondary text",',
    'description': 'description: "More details",',
    'leftItem': 'leftItem: Icon({ name: "person" }),',
    'rightItem': 'rightItem: Icon({ name: "chevron_right" }),',
    'divider': 'divider: true,',
    'hoverColor': 'hoverColor: colors.gray100,',
    'selectedBgColor': 'selectedBgColor: `${colors.primary}20`,',
    
    # ---------- Card ----------
    'elevationCard': 'elevation: 2,',
    
    # ---------- Avatar ----------
    'shape': 'shape: "circle",',  # circle, rounded, square
    'src': 'src: "https://example.com/avatar.jpg",',
    'alt': 'alt: "avatar",',
    'fit': 'fit: "cover",',
    
    # ---------- Image ----------
    'poster': 'poster: "thumbnail.jpg",',
    
    # ---------- Button ----------
    'buttonText': 'text: "Click me",',  # alias
    'onLongPress': 'onLongPress: () => console.log("long press"),',
    
    # ---------- Switch ----------
    'onToggle': 'onToggle: (val) => console.log(val),',
    
    # ---------- Checkbox / Radio ----------
    'onCheck': 'onCheck: (val) => console.log(val),',
    'onSelect': 'onSelect: (val) => console.log(val),',
    
    # ---------- Snackbar ----------
    'message': 'message: "Are you sure?",',
    'action': 'action: "Undo",',
    'onAction': 'onAction: () => console.log("action"),',
    'duration': 'duration: 3000,',
    'typeSnackbar': 'type: "success",',   # renombrada para evitar conflicto con type genérica
    'dismissible': 'dismissible: true,',
    'positionSnackbar': 'position: "bottom",',  # renombrada para evitar conflicto con position genérica
    'onShow': 'onShow: () => console.log("snackbar shown"),',
    
    # ---------- Modal / BottomSheet / AlertDialog ----------
    'content': 'content: Text({ text: "Modal content" }),',
    'actions': 'actions: [Button({ text: "Close", onPress: () => modal.close() })],',
    'closeOnOverlayClick': 'closeOnOverlayClick: true,',
    'closeOnEsc': 'closeOnEsc: true,',
    'showCloseButton': 'showCloseButton: true,',
    'overlayColor': 'overlayColor: rgba(0,0,0,0.5),',
    'contentBgColor': 'contentBgColor: colors.surface,',
    'headerBgColor': 'headerBgColor: colors.primary,',
    'headerTextColor': 'headerTextColor: "#fff",',
    'headerBorder': 'headerBorder: false,',
    'headerPadding': 'headerPadding: "16px 20px",',
    'footerBgColor': 'footerBgColor: colors.gray100,',
    'footerBorder': 'footerBorder: false,',
    'footerPadding': 'footerPadding: "12px 20px",',
    'onOpen': 'onOpen: () => console.log("opened"),',
    'onClose': 'onClose: () => console.log("closed"),',
    'confirmText': 'confirmText: "OK",',
    'cancelText': 'cancelText: "Cancel",',
    'onConfirm': 'onConfirm: () => console.log("confirmed"),',
    'onCancel': 'onCancel: () => console.log("cancelled"),',
    'variantDialog': 'variant: "danger",',
    'showDragHandle': 'showDragHandle: true,',
    'closeOnDragDown': 'closeOnDragDown: true,',
    'modalContentElevation': 'contentElevation: 0,',
    'modalHeaderElevation': 'headerElevation: 0,',
    'modalFooterElevation': 'footerElevation: 0,',
    
    # ---------- BottomSheet específico ----------
    'bottomSheetDragHandleColor': 'dragHandleColor: colors.border,',
    'bottomSheetHeaderBorderColor': 'headerBorderColor: colors.border,',
    'bottomSheetActionBorderColor': 'actionBorderColor: colors.border,',
    'bottomSheetHeaderPadding': 'headerPadding: "0 16px 8px 16px",',
    'bottomSheetContentPadding': 'contentPadding: "0 16px",',
    'bottomSheetActionPadding': 'actionPadding: "12px 16px",',
    'bottomSheetDragHandlePadding': 'dragHandlePadding: "12px 0 8px 0",',
    'bottomSheetDragHandleWidth': 'dragHandleWidth: 40,',
    'bottomSheetDragHandleHeight': 'dragHandleHeight: 4,',
    'bottomSheetOverlayZIndex': 'overlayZIndex: 9998,',
    
    # ---------- Accordion ----------
    'onToggleAccordion': 'onToggle: (expanded) => console.log(expanded),',
    'variantAccordion': 'variant: "contained",',
    'animate': 'animate: true,',
    'animationDuration': 'animationDuration: 300,',
    'iconCollapsed': 'iconCollapsed: "chevron_right",',
    'iconExpanded': 'iconExpanded: "expand_more",',
    'iconColorAccordion': 'iconColor: colors.textSecondary,',
    'iconSizeAccordion': 'iconSize: 20,',
    'titlePadding': 'titlePadding: "12px 16px",',
    'contentPadding': 'contentPadding: "16px",',
    'childrenAccordion': 'children: Text("Content"),',
    'expandedColor': 'expandedColor: colors.primary,',
    
    # ---------- Stepper ----------
    'steps': 'steps: [{ label: "Step 1", content: Text("Step 1 content") }],',
    'activeStep': 'activeStep: 0,',
    'onStepChange': 'onStepChange: (index) => console.log(index),',
    'orientationStepper': 'orientation: "horizontal",',
    'variantStepper': 'variant: "circles",',
    'showLabelsStepper': 'showLabels: true,',
    'showNavigation': 'showNavigation: true,',
    'nextLabel': 'nextLabel: "Next",',
    'backLabel': 'backLabel: "Back",',
    'finishLabel': 'finishLabel: "Finish",',
    'onFinish': 'onFinish: () => console.log("finished"),',
    
    # ---------- Pagination ----------
    'totalItems': 'totalItems: 100,',
    'pageSize': 'pageSize: 10,',
    'currentPage': 'currentPage: 1,',
    'onPageChange': 'onPageChange: (page) => console.log(page),',
    'showFirstLast': 'showFirstLast: true,',
    'showPrevNext': 'showPrevNext: true,',
    'maxButtons': 'maxButtons: 5,',
    'showTotal': 'showTotal: true,',
    
    # ---------- Tree View ----------
    'nodes': 'nodes: [{ id: "1", label: "Root", children: [] }],',
    'onToggleTree': 'onToggle: (nodeId, isExpanded) => console.log(nodeId, isExpanded),',
    'expandedNodes': 'expandedNodes: ["1"],',
    'indent': 'indent: 20,',
    'showIcons': 'showIcons: true,',
    'folderIcon': 'folderIcon: "folder",',
    'folderOpenIcon': 'folderOpenIcon: "folder_open",',
    'fileIcon': 'fileIcon: "insert_drive_file",',
    'expandIcon': 'expandIcon: "chevron_right",',
    'collapseIcon': 'collapseIcon: "expand_more",',
    'defaultExpanded': 'defaultExpanded: true,',
    'selectable': 'selectable: true,',
    'selectedNodeId': 'selectedNodeId: "1",',
    'nodePadding': 'nodePadding: "6px 4px",',
    'nodeGap': 'nodeGap: 4,',
    'childrenGap': 'childrenGap: 2,',
    'iconSizeTree': 'iconSize: 18,',
    'treeHoverBgColor': 'hoverBgColor: colors.gray100,',
    'treeSelectedBgColor': 'selectedBgColor: `${colors.primary}20`,',
    'treeTextColor': 'textColor: colors.text,',
    'treeSelectedTextColor': 'selectedTextColor: colors.primary,',
    'treeIconColor': 'iconColor: colors.textSecondary,',
    'treeFolderIconColor': 'folderIconColor: colors.warning,',
    
    # ---------- Chart ----------
    'typeChart': 'type: "line",',  # line, bar, area, candle
    'labels': 'labels: ["Jan", "Feb", "Mar"],',
    'data': 'data: [10, 20, 30],',
    'barColor': 'barColor: colors.primary,',
    'lineColor': 'lineColor: colors.primary,',
    'areaColor': 'areaColor: `${colors.primary}40`,',
    'candleUpColor': 'candleUpColor: colors.success,',
    'candleDownColor': 'candleDownColor: colors.danger,',
    'axisColor': 'axisColor: colors.border,',
    'textColorChart': 'textColor: colors.textSecondary,',
    'yAxisColor': 'yAxisColor: colors.primary,',
    'showGrid': 'showGrid: true,',
    'showLabelsChart': 'showLabels: true,',
    'showValues': 'showValues: false,',
    'smooth': 'smooth: true,',
    'areaGradient': 'areaGradient: true,',
    'areaGradientColors': 'areaGradientColors: ["#ff0000", "#00ff00"],',
    'candleWidth': 'candleWidth: 8,',
    'candleSpacing': 'candleSpacing: 2,',
    'chartPadding': 'padding: { top: 20, right: 50, bottom: 50, left: 50 },',
    'chartBgColor': 'bgColor: colors.surface,',
    
    # ---------- QR Code ----------
    'valueQR': 'value: "https://flet-box.dev",',
    'sizeQR': 'size: 200,',
    'bgColorQR': 'bgColor: "#ffffff",',
    'fgColorQR': 'fgColor: "#000000",',
    'errorCorrection': 'errorCorrection: "M",',
    
    # ---------- Circular Bar ----------
    'strokeWidth': 'strokeWidth: 12,',
    'trackColor': 'trackColor: colors.border,',
    'thumbColor': 'thumbColor: "#fff",',
    'valueColorCircular': 'valueColor: colors.text,',
    'valueSizeCircular': 'valueSize: 24,',
    'labelCircular': 'label: "Progress",',
    'labelColor': 'labelColor: colors.text,',
    'lineCap': 'lineCap: "round",',
    'valueFormat': 'valueFormat: "percent",',
    'valueDecimals': 'valueDecimals: 0,',
    'subtitle': 'subtitle: "Completed",',
    'onComplete': 'onComplete: () => console.log("animation complete"),',
    'gradientCircular': 'gradient: ["red", "yellow", "green"],',
    'shadowBlur': 'shadowBlur: 4,',
    'shadowColor': 'shadowColor: rgba(0,0,0,0.5),',
    'glowCircular': 'glow: true,',
    'glowColor': 'glowColor: "#ff0000",',
    'markers': 'markers: [{ value: 25, color: "red", size: 6, label: "A" }],',
    'innerStrokeWidth': 'innerStrokeWidth: 4,',
    'innerColor': 'innerColor: colors.gray300,',
    'onClickCircular': 'onClick: ({ value, percent }) => console.log(value),',
    'onHoverCircular': 'onHover: (isHovering) => console.log(isHovering),',
    'subtitleColor': 'subtitleColor: colors.textSecondary,',
    'subtitleSize': 'subtitleSize: 10,',
    'tooltipCircular': 'tooltip: "Progress: 75%",',
    'animateCircular': 'animate: true,',
    'animationDurationCircular': 'animationDuration: 1000,',
    'valueCircular': 'value: 75,',
    'maxCircular': 'max: 100,',
    'colorCircular': 'color: colors.primary,',
    'backgroundColorCircular': 'backgroundColor: colors.gray200,',
    'sizeCircular': 'size: 200,',
    
    # ---------- Carousel ----------
    'items': 'items: [image1, image2, image3],',
    'autoPlay': 'autoPlay: true,',
    'interval': 'interval: 3000,',
    'showArrows': 'showArrows: true,',
    'showDots': 'showDots: true,',
    'infinite': 'infinite: true,',
    'dotColor': 'dotColor: colors.gray300,',
    'dotActiveColor': 'dotActiveColor: colors.primary,',
    'dotSize': 'dotSize: 8,',
    'dotActiveSize': 'dotActiveSize: 20,',
    'buttonBgColorCarousel': 'buttonBgColor: colors.surface,',
    'buttonIconColor': 'buttonIconColor: colors.secondary,',
    'buttonSizeCarousel': 'buttonSize: 36,',
    'buttonIconSizeCarousel': 'buttonIconSize: 24,',
    'onIndexChange': 'onIndexChange: (index) => console.log(index),',
    
    # ---------- Video / Audio ----------
    'autoplay': 'autoplay: true,',
    'controls': 'controls: true,',
    'loopMedia': 'loop: true,',
    'muted': 'muted: true,',
    'volume': 'volume: 0.8,',
    'onPlay': 'onPlay: () => console.log("playing"),',
    'onPause': 'onPause: () => console.log("paused"),',
    'onEnd': 'onEnd: () => console.log("ended"),',
    'onTimeUpdate': 'onTimeUpdate: (sec, dur, percent) => console.log(sec, dur, percent),',
    'onProgress': 'onProgress: (percent) => console.log(percent),',
    'onLoad': 'onLoad: (duration) => console.log(duration),',
    
    # ---------- Drag & Drop ----------
    'onDragStart': 'onDragStart: (e, data) => console.log(data),',
    'onDragEnd': 'onDragEnd: (e, data) => console.log(data),',
    'onDrop': 'onDrop: (data, group, e) => console.log(data),',
    'onDragEnter': 'onDragEnter: (e) => console.log("enter"),',
    'onDragLeave': 'onDragLeave: (e) => console.log("leave"),',
    'onDragOver': 'onDragOver: (e) => console.log("over"),',
    'acceptGroups': 'acceptGroups: ["default"],',
    'group': 'group: "default",',
    'cloneOnDrag': 'cloneOnDrag: true,',
    'dragImage': 'dragImage: customImage,',
    'dragData': 'data: { id: 1, name: "item" },',
    'dragOpacity': 'opacity: 0.5,',
    'dragOverlayColor': 'dragOverlayColor: `${colors.primary}20`,',
    'dragBorderColor': 'dragBorderColor: colors.primary,',
    
    # ---------- DroppBox ----------
    'droppBoxActiveBgColor': 'activeBgColor: `${colors.primary}20`,',
    'droppBoxActiveBorderColor': 'activeBorderColor: colors.primary,',
    'droppBoxActiveBorderWidth': 'activeBorderWidth: 2,',
    'droppBoxActiveBorderStyle': 'activeBorderStyle: "dashed",',
    'droppBoxActiveShadow': 'activeShadow: `0 4px 12px ${colors.primary}40`,',
    'droppBoxValidBgColor': 'validBgColor: `${colors.success}20`,',
    'droppBoxValidBorderColor': 'validBorderColor: colors.success,',
    'droppBoxInvalidBgColor': 'invalidBgColor: `${colors.danger}20`,',
    'droppBoxInvalidBorderColor': 'invalidBorderColor: colors.danger,',
    'droppBoxTransitionDuration': 'transitionDuration: "0.2s",',
    'droppBoxTransitionTiming': 'transitionTiming: "ease",',
    'droppBoxShowFeedback': 'showFeedback: true,',
    
    # ---------- Tooltip ----------
    'tooltipText': 'text: "Tooltip text",',
    'tooltipPosition': 'position: "top",',
    'delay': 'delay: 300,',
    'showArrow': 'showArrow: true,',
    'offset': 'offset: 8,',
    
    # ---------- Skeleton ----------
    'skeletonVariant': 'variant: "text",',  # text, circular, avatar, image, card, listTile, button
    'skeletonCount': 'count: 3,',
    'skeletonGap': 'gap: 8,',
    'skeletonAnimation': 'animation: "pulse",',  # pulse, wave, none
    'pulseDuration': 'pulseDuration: "1.5s",',
    'skeletonHighlightColor': 'highlightColor: colors.gray100,',
    'skeletonShimmerColor': 'shimmerColor: colors.gray300,',
    'skeletonWaveDuration': 'waveDuration: "1.5s",',
    
    # ---------- Code Viewer ----------
    'code': 'code: "console.log(\\"hello\\"),",',
    'codeTitle': 'title: "example.js",',
    'codeMaxHeight': 'maxHeight: 400,',
    'codeFontSize': 'fontSize: 12,',
    'showLineNumbers': 'showLineNumbers: true,',
    'startingLineNumber': 'startingLineNumber: 1,',
    'lineNumberWidth': 'lineNumberWidth: 40,',
    'lineNumberColor': 'lineNumberColor: colors.secondary,',
    'showHeader': 'showHeader: true,',
    'codeBorderRadius': 'borderRadius: 8,',
    
    # ---------- Inspector ----------
    'inspect': 'Inspector(widget),',
    'printWidgetCode': 'printWidgetCode(widget),',
    'inspectWidget': 'inspectWidget(widget),',
    
    # ---------- Markdown ----------
    'markdownText': 'text: "# Hello\\n\\nThis is **bold**",',
    'linkColor': 'linkColor: colors.primary,',
    'codeBgColor': 'codeBgColor: colors.gray100,',
    'codeColor': 'codeColor: colors.danger,',
    'preBgColor': 'preBgColor: colors.gray100,',
    'blockquoteBorderColor': 'blockquoteBorderColor: colors.primary,',
    'allowDangerousHtml': 'allowDangerousHtml: false,',
    
    # ---------- Install Button ----------
    'installText': 'text: "📲 Install",',
    'onInstalled': 'onInstalled: () => console.log("installed"),',
    
    # =========================================================================
    # 3. PROPS ESPECÍFICAS DE WIDGETS DE NAVEGACIÓN Y ESTRUCTURA
    # =========================================================================
    
    # ---------- App Bar ----------
    'leading': 'leading: Icon({ name: "menu" }),',
    'actionsAppBar': 'actions: [Icon({ name: "search" }), Icon({ name: "more_vert" })],',
    'showBackButton': 'showBackButton: true,',
    'backButtonRoute': 'backButtonRoute: "/home",',
    'onBackPress': 'onBackPress: () => console.log("back"),',
    'centerTitle': 'centerTitle: true,',
    'sticky': 'sticky: true,',
    'hideOnScroll': 'hideOnScroll: true,',
    'scrollThreshold': 'scrollThreshold: 100,',
    
    # ---------- Bottom Navigation ----------
    'itemsBottomNav': 'items: [{ icon: "home", label: "Home", route: "/" }],',
    'currentIndex': 'currentIndex: 0,',
    'onTabChange': 'onTabChange: (index) => console.log(index),',
    'selectedColor': 'selectedColor: colors.primary,',
    'unselectedColor': 'unselectedColor: colors.textSecondary,',
    'showLabels': 'showLabels: true,',
    'useRouter': 'useRouter: true,',
    
    # ---------- Tabs ----------
    'tabs': 'tabs: ["Tab1", "Tab2"],',
    'childrenTabs': 'children: [Text("Content 1"), Text("Content 2")],',
    'activeIndex': 'activeIndex: 0,',
    'onChangeTabs': 'onChange: (index) => console.log(index),',
    'variantTabs': 'variant: "underline",',  # underline, pills, slider
    'showDivider': 'showDivider: true,',
    'dividerColorTabs': 'dividerColor: colors.border,',
    'showIconTabs': 'showIcon: true,',
    'iconPositionTabs': 'iconPosition: "left",',
    'iconSizeTabs': 'iconSize: 18,',
    'badges': 'badges: [5, 10, 0],',
    
    # ---------- Drawer ----------
    'drawerHeader': 'header: Text("Menu"),',
    'drawerBody': 'body: [DrawerItem({ label: "Home", route: "/" })],',
    'drawerFooter': 'footer: Text("v1.0"),',
    'drawerWidth': 'width: 280,',
    'drawerPosition': 'position: "left",',
    'blur': 'blur: true,',
    'blurIntensity': 'blurIntensity: 4,',
    'closeOnOverlayClickDrawer': 'closeOnOverlayClick: true,',
    'closeOnEscDrawer': 'closeOnEsc: true,',
    'elevationDrawer': 'elevation: 4,',
    'drawerBorderRadius': 'borderRadius: 24,',
    
    # ---------- Collapsible Sidebar ----------
    'expandedSidebar': 'expanded: true,',
    'widthExpanded': 'widthExpanded: 260,',
    'widthCollapsed': 'widthCollapsed: 60,',
    'onToggleSidebar': 'onToggle: (expanded) => console.log(expanded),',
    'borderRight': 'borderRight: `1px solid ${colors.border}`,',
    'showTooltip': 'showTooltip: false,',
    'tooltipDelay': 'tooltipDelay: 500,',
    
    # ---------- Drawer Item ----------
    'route': 'route: "/home",',
    'trailingIcon': 'trailingIcon: "chevron_right",',
    'hintColor': 'hintColor: colors.gray100,',
    'disableTransform': 'disableTransform: true,',
    'closeOnPress': 'closeOnPress: true,',
    
    # ---------- Scaffold ----------
    'appBar': 'appBar: AppBar({ title: "Home" }),',
    'body': 'body: Text("Content"),',
    'bottomBar': 'bottomBar: BottomNavigation({ items }),',
    'fab': 'fab: FloatingActionButton({ icon: "add" }),',
    'drawer': 'drawer: Drawer({ header, body }),',
    'leftNavBar': 'leftNavBar: CollapsibleSideBar({ children }),',
    'rightNavBar': 'rightNavBar: CollapsibleSideBar({ children }),',
    'leftNavBarWidth': 'leftNavBarWidth: 260,',
    'rightNavBarWidth': 'rightNavBarWidth: 260,',
    'navSideBar': 'navSideBar: CollapsibleSideBar({ children }),',
    'navSideBarWidth': 'navSideBarWidth: 260,',
    'navSideBarPosition': 'navSideBarPosition: "left",',
    'routes': 'routes: { "/": HomeScreen, "/about": AboutScreen },',
    'closeDrawerOnNavigate': 'closeDrawerOnNavigate: false,',
    
    # ---------- List View / Grid View ----------
    'renderItem': 'renderItem: (item, index) => Text({ text: item }),',
    'itemSize': 'itemSize: 60,',
    'bufferSize': 'bufferSize: 5,',
    'showsScrollIndicator': 'showsScrollIndicator: true,',
    'wrapItems': 'wrapItems: true,',
    'crossAxisCount': 'crossAxisCount: 2,',
    'onEndReached': 'onEndReached: () => fetchMore(),',
    'onEndReachedThreshold': 'onEndReachedThreshold: 0.5,',
    'onRefresh': 'onRefresh: (done) => { refresh(), done(), },',
    'ListHeaderComponent': 'ListHeaderComponent: () => Text("Header"),',
    'ListFooterComponent': 'ListFooterComponent: () => Text("Footer"),',
    'ListEmptyComponent': 'ListEmptyComponent: () => Text("No data"),',
    
    # ---------- Data Table ----------
    'columns': 'columns: [{ key: "id", label: "ID" }],',
    'rows': 'rows: [{ id: 1, name: "John" }],',
    'striped': 'striped: true,',
    'hoverable': 'hoverable: true,',
    'bordered': 'bordered: true,',
    'onRowClick': 'onRowClick: (row, index) => console.log(row),',
    'headerBgColorTable': 'headerBgColor: colors.gray100,',
    'headerTextColorTable': 'headerTextColor: colors.text,',
    'headerFontWeight': 'headerFontWeight: "bold",',
    'headerFontSize': 'headerFontSize: 14,',
    'rowBgColor': 'rowBgColor: "transparent",',
    'rowTextColor': 'rowTextColor: colors.text,',
    'rowFontSize': 'rowFontSize: 13,',
    'stripedRowBgColor': 'stripedRowBgColor: colors.gray50,',
    'hoverRowBgColor': 'hoverRowBgColor: `${colors.primary}10`,',
    'borderColorTable': 'borderColor: colors.border,',
    'borderWidthTable': 'borderWidth: 1,',
    'cellPadding': 'cellPadding: "10px 12px",',
    'headerCellPadding': 'headerCellPadding: "12px",',
    
    # ---------- Floating Action Button ----------
    'mini': 'mini: false,',
    'extended': 'extended: false,',
    'elevationFAB': 'elevation: 6,',
    
    # ---------- Matrix Rain ----------
    'chars': 'chars: "01アイウエオ",',
    'fontSize': 'fontSize: 16,',
    'speed': 'speed: 0.5,',
    'fadeAmount': 'fadeAmount: 0.05,',
    'resetProbability': 'resetProbability: 0.975,',
    'useDynamicColor': 'useDynamicColor: true,',
    'positionMatrix': 'position: "fixed",',
    
    # ---------- Parallax Box ----------
    'typeParallax': 'type: "scroll",',
    'speedParallax': 'speed: 0.5,',
    'directionParallax': 'direction: "vertical",',
    'maxOffset': 'maxOffset: 100,',
    'reverse': 'reverse: false,',
    'onParallaxMove': 'onParallaxMove: ({ x, y }) => console.log(x, y),',
    'durationParallax': 'duration: 300,',
    'easing': 'easing: "easeOut",',
    
    # ---------- Animated Text ----------
    'animations': 'animations: [{ effect: "scale", from: 1, to: 1.2, duration: 500 }],',
    'sameTime': 'sameTime: false,',
    'delayBetween': 'delayBetween: 0.1,',
    'orientationAnimatedText': 'orientation: "row",',
    
    # ---------- Animated Box ----------
    'timing': 'timing: "ease",',
    'fillMode': 'fillMode: "forwards",',
}
