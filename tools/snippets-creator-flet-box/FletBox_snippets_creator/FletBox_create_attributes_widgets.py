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
    'clipboard.copyWithFeedback': '// The element shows "✓" and flashes green for a second, then restores itself.\nconst button = Button({ text: "Copy token" });\nclipboard.copyWithFeedback("flet-box", button);',
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
    'createList.fromData': 'const apiData = [{ userId: 7, name: "Ada" }, { userId: 8, name: "Linus" }];\nconst rows = createList.fromData(apiData, { id: (item) => item.userId, label: (item) => item.name });',
    'createList.range': 'createList.range(1, 10)',
    'createList.repeat': 'createList.repeat({ active: true }, 5)',
    'createList.paginate': 'const users = ["Ada", "Linus", "Grace", "Alan", "Edsger"];\nconst page = createList.paginate(users, 2, 2);',
    'createList.search': 'const users = [{ name: "Ada Lovelace" }, { name: "Alan Turing" }];\nconst found = createList.search(users, "ada", ["name"]);',
    'createList.sort': 'const users = [{ name: "Ada", age: 36 }, { name: "Linus", age: 24 }];\nconst byAge = createList.sort(users, "age", "desc");',
    'createList.groupBy': 'const users = [{ name: "Ada", status: "open" }, { name: "Linus", status: "done" }];\nconst grouped = createList.groupBy(users, "status");',

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
    'repeat': 'repeat(5, (i) => Button({ text: `Item ${i}` }))',
    'range': 'range(0, 10, 2)',

    # ---------- MEMO ----------
    'memo': 'memo(expensiveFunction)',
    'memoWithKey': 'memoWithKey(expensiveFunction, (a, b) => `${a}-${b}`)',
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
    'startsWith': 'startsWith("flet-box", "flet")',
    'endsWith': 'endsWith("flet-box", "box")',
    'includes': 'includes("flet-box is awesome", "awesome")',
    'split': 'split("flet-box,light,weight", ",")',
    'join': 'join(["flet-box", "light", "weight"], " ")',
    'trim': 'trim("   flet-box   ")',

    # ---------- TIME ----------
    'formatDate': 'formatDate(new Date(), "YYYY-MM-DD")',
    'relativeTime': 'relativeTime("2024-01-01")',
    'sleep': 'await sleep(500)',
    'now': 'now()',
    'seconds': 'seconds(90)',
    'minutes': 'minutes(5)',
    'hours': 'hours(2)',
    'days': 'days(7)',
    'weeks': 'weeks(3)',
    'months': 'months(6)',
    'years': 'years(1)',
    'today': 'today()',
    'yesterday': 'yesterday()',
    'tomorrow': 'tomorrow()',
    'dayOfWeek': 'dayOfWeek(new Date())',
    'monthName': 'monthName(new Date())',
    'isToday': 'isToday("2024-01-15")',
    'isYesterday': 'isYesterday("2024-01-15")',
    'isTomorrow': 'isTomorrow("2024-01-15")',
    'isWeekend': 'isWeekend(new Date())',
    'isLeapYear': 'isLeapYear(2024)',
    'formatDateLong': 'formatDateLong(new Date())',
    'formatDateShort': 'formatDateShort(new Date(), "es-ES")',
    'formatTime': 'formatTime(new Date())',
    'formatTimeAmPm': 'formatTimeAmPm(new Date())',
    'parseDate': 'parseDate("15/01/2024", "DD/MM/YYYY")',
    'dateDiff': 'dateDiff("2024-01-01", "2024-01-15", "days")',
    'addDays': 'addDays(new Date(), 7)',
    'addHours': 'addHours(new Date(), 3)',
    'addMinutes': 'addMinutes(new Date(), 30)',
    'addSeconds': 'addSeconds(new Date(), 45)',
    'subtractDays': 'subtractDays(new Date(), 7)',
    'subtractHours': 'subtractHours(new Date(), 3)',
    'subtractMinutes': 'subtractMinutes(new Date(), 30)',
    'subtractSeconds': 'subtractSeconds(new Date(), 45)',
    'timeAgo': 'timeAgo(now() - minutes(5))',
    'timeAgoLocale': 'timeAgoLocale(now() - hours(1), "es")',
    'waitFor': 'await waitFor(seconds(1))',
    'wait': 'await wait(seconds(1))',
    'waitUntil': '// Resolves true as soon as the predicate holds; throws at the timeout.\nawait waitUntil(() => document.querySelector("#cart"), seconds(10), seconds(1))',
    'waitForElement': '// Needs a document: call it from a screen, never at module scope.\nconst node = await waitForElement("#cart", seconds(5), seconds(0.5))',
    'timer': 'const watch = timer("render");\nawait sleep(seconds(1));\nwatch.stop(); // logs the elapsed milliseconds',
    'every': 'const tick = every(seconds(1), () => console.log(now()));\nclearInterval(tick);',
    'everySecond': 'const tick = everySecond(() => console.log(now()));\nclearInterval(tick);',
    'everyMinute': 'const tick = everyMinute(() => console.log(now()));\nclearInterval(tick);',
    'everyHour': 'const tick = everyHour(() => console.log(now()));\nclearInterval(tick);',
    'everyDay': 'const tick = everyDay(() => console.log(now()));\nclearInterval(tick);',

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

    # ---------- ACCENTS ----------
    # An accent is a pair: the stop one hue wears in the light theme and the stop
    # it wears in the dark one. `null` gives the palette's own brand back.
    'setAccent': 'setAccent("teal")',
    'resetAccent': 'setAccent(null)',
    'getAccent': 'getAccent()',
    'listAccents': 'const options = listAccents()',
    'listAccentRamps': 'const ramps = listAccentRamps()',
    'registerAccent': 'registerAccent({ id: "brand", label: "Brand", light: "#1d4ed8", dark: "#60a5fa" })',
    'applyAccentPreference': 'applyAccentPreference("teal")',

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
    'parseMarkdownToWidgets': 'const nodes = parseMarkdownToWidgets("# Title\\n\\n- one\\n- two");',
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

    # ---------- easings.js (curves and springs) ----------
    'EASING_NAMES': 'EASING_NAMES.join(", ")',
    'cubicBezier': 'animate(widget, "translateY", 24, 0, 240, cubicBezier(0.2, 0, 0, 1))',
    'spring': 'const { duration, easing } = spring({ stiffness: 260, damping: 20 })',
    'animateSpring': 'animateSpring(widget, "scale", 0.94, 1, { stiffness: 260, damping: 20 })',
    'animateSpringAsync': 'await animateSpringAsync(widget, "translateY", 24, 0, { damping: 20 })',

    # ---------- transitions.js (the named entrances and feedback) ----------
    'slideIn': 'slideIn(card, { direction: "up", distance: 16, duration: 240 })',
    'slideInAsync': 'await slideInAsync(panel, { direction: "left", distance: 24 })',
    'slideOut': 'slideOut(card, { direction: "down", distance: 12 })',
    'slideOutAsync': 'await slideOutAsync(dialog)',
    'popIn': 'popIn(badge, { from: 0.94, duration: 180 })',
    'popInAsync': 'await popInAsync(toast, { fade: true })',
    'shake': 'shake(loginForm, { axis: "x", distance: 6, cycles: 3 })',
    'shakeAsync': 'await shakeAsync(field, { axis: "x" })',

    # ---------- motion.js (the app-wide motion preference) ----------
    'prefersReducedMotion': 'if (!prefersReducedMotion()) slideIn(card, { distance: 16 })',
    'setMotionMode': 'setMotionMode("reduce")',
    'getMotionMode': 'getMotionMode()',
    'onMotionModeChange': 'const stopListening = onMotionModeChange((reduced) => console.log(reduced))',
    'motionDuration': 'const ms = motionDuration(240)',
    'stagger': 'const delay = stagger(3, { start: 0, step: 60, max: 8 })',

    # =========================================================================
    # 2. PROPS GENÉRICAS (válidas para casi cualquier widget)
    # =========================================================================

    # ---------- Identificación y atributos DOM ----------
    'id': 'id: "myId",',
    'className': 'className: "my-class",',
    'ref': 'ref: (el) => myRef = el,',

    # ---------- Contenido y composición ----------
    'children': 'children: [Text({ text: "A" }), Text({ text: "B" })],',
    'child': 'child: Text({ text: "Hello" }),',

    # ---------- Espaciado (usando padding() / margin() helpers) ----------
    'padding': 'padding: padding(16),',
    'padding.only': 'padding: padding({ top: 20, right: 50, bottom: 50, left: 50 }),',
    'padding.all': 'padding: padding({ all: 20 }),',
    'padding.horizontal': 'padding: padding({ horizontal: 16, vertical: 8 }),',
    'padding.vertical': 'padding: padding({ vertical: 12, horizontal: 24 }),',
    'padding_fn': 'padding({ horizontal: 20, vertical: 10 })',

    'margin': 'margin: margin(16),',
    'margin.all': 'margin: margin({ all: 20 }),',
    'margin.only': 'margin: margin({ top: 20, right: 50, bottom: 50, left: 50 }),',
    'margin.horizontal': 'margin: margin({ horizontal: 16, vertical: 8 }),',
    'margin.vertical': 'margin: margin({ vertical: 12, horizontal: 24 }),',
    'margin_fn': 'margin({ top: 8, bottom: 8 })',
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
    'visible': 'visible: false,',

    # ---------- Bordes y sombras ----------
    'border': 'border: border(1, "solid", "#ccc"),',
    'borderRadius': 'borderRadius: 12,',
    'borderWidth': 'borderWidth: 2,',
    'borderColor': 'borderColor: colors.border,',
    'borderStyle': 'borderStyle: "solid",',
    'elevation': 'elevation: 2,',
    'shadow': 'shadow: shadow(0, 4, 8, 0, rgba(0,0,0,0.1)),',
    'boxShadow': 'boxShadow: shadow(0, 4, 8, 0, rgba(0,0,0,0.1)),',

    # ---------- Posición ----------
    'position': 'position: "absolute",',
    'top': 'top: 20,',
    'right': 'right: 20,',
    'bottom': 'bottom: 20,',
    'left': 'left: 20,',
    'zIndex': 'zIndex: 9998,',

    # ---------- Flexbox / alineación ----------
    'alignItems': 'alignItems: "center",',
    'alignSelf': 'alignSelf: "flex-end",',
    'selfAlign': 'selfAlign: "center",',
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
    'backdropFilter': 'backdropFilter: "blur(12px)",',
    'filter': 'filter: "blur(4px) brightness(0.9)",',
    'maskImage': 'maskImage: "linear-gradient(to bottom, #000 60%, transparent)",',

    # ---------- Eventos genéricos ----------
    'onPress': 'onPress: () => console.log("clicked"),',
    'onClick': 'onClick: () => console.log("clicked"),',
    'onDoublePress': 'onDoublePress: () => console.log("double click"),',
    'onRightClick': 'onRightClick: () => console.log("right click"),',
    'onHover': 'onHover: () => console.log("hover"),',
    'onHoverEnd': 'onHoverEnd: () => console.log("hover end"),',
    'onScroll': 'onScroll: (e) => console.log(e.target.scrollTop),',
    'onChange': 'onChange: (val) => console.log(val),',
    'onChanged': 'onChanged: (val) => console.log(val),',
    'onInput': 'onInput: (val) => console.log(val),',
    'onFocus': 'onFocus: (e) => console.log("focus"),',
    'onBlur': 'onBlur: (e) => console.log("blur"),',
    'onMouseEnter': 'onMouseEnter: () => console.log("enter"),',
    'onMouseLeave': 'onMouseLeave: () => console.log("leave"),',
    'onWheel': 'onWheel: (e) => console.log(e.deltaY),',

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
    'sizeMedium': 'size: "medium",',  # small, medium, large

    # ---------- Validación (Input) ----------
    'validation': 'validation: "email",',
    'maxLength': 'maxLength: 50,',
    'customPattern': 'customPattern: "^[A-Za-z]+$",',
    'showValidationMessage': 'showValidationMessage: true,',
    'showValidationIcon': 'showValidationIcon: true,',
    'onValidated': 'onValidated: (isValid, msg) => console.log(isValid, msg),',
    'type': 'type: "text",',
    'inputmode': 'inputmode: "text",',
    'autocomplete': 'autocomplete: "off",',
    'pattern': 'pattern: "[A-Za-z]{3}",',
    'name': 'name: "username",',

    # ---------- Slider ----------
    'min': 'min: 0,',
    'max': 'max: 100,',
    'step': 'step: 1,',
    'onChangeSlider': 'onChange: (val) => console.log(val),',
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
    'shape': 'shape: "circle",',
    'src': 'src: "https://example.com/avatar.jpg",',
    'alt': 'alt: "avatar",',
    'fit': 'fit: "cover",',

    # ---------- Image ----------
    'poster': 'poster: "thumbnail.jpg",',

    # ---------- Button ----------
    'buttonLabel': 'text: "Click me",',
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
    'typeSnackbar': 'type: "success",',
    'dismissible': 'dismissible: true,',
    'positionSnackbar': 'position: "bottom",',
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
    'childrenAccordion': 'children: Text({ text: "Content" }),',
    'expandedColor': 'expandedColor: colors.primary,',

    # ---------- Stepper ----------
    'steps': 'steps: [{ label: "Step 1", content: Text({ text: "Step 1 content" }) }],',
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
    'typeChart': 'type: "line",',
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
    'subtitleCircular': 'subtitle: "Completed",',
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
    'skeletonVariant': 'variant: "text",',
    'skeletonCount': 'count: 3,',
    'skeletonGap': 'gap: 8,',
    'skeletonAnimation': 'animation: "pulse",',
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
    'installText': 'text: "Install", icon: "get_app",',
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
    'childrenTabs': 'children: [Text({ text: "Content 1" }), Text({ text: "Content 2" })],',
    'activeIndex': 'activeIndex: 0,',
    'onChangeTabs': 'onChange: (index) => console.log(index),',
    'variantTabs': 'variant: "underline",',
    'showDivider': 'showDivider: true,',
    'dividerColorTabs': 'dividerColor: colors.border,',
    'showIconTabs': 'showIcon: true,',
    'iconPositionTabs': 'iconPosition: "left",',
    'iconSizeTabs': 'iconSize: 18,',
    'badges': 'badges: [5, 10, 0],',

    # ---------- Drawer ----------
    'drawerHeader': 'header: Text({ text: "Menu" }),',
    'drawerBody': 'body: [DrawerItem({ label: "Home", route: "/" })],',
    'drawerFooter': 'footer: Text({ text: "v1.0" }),',
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
    'body': 'body: Text({ text: "Content" }),',
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
    'onRefresh': 'onRefresh: (done) => { refresh(); done(); },',
    'ListHeaderComponent': 'ListHeaderComponent: () => Text({ text: "Header" }),',
    'ListFooterComponent': 'ListFooterComponent: () => Text({ text: "Footer" }),',
    'ListEmptyComponent': 'ListEmptyComponent: () => Text({ text: "No data" }),',

    # ---------- Data Table ----------
    'columns': 'columns: [{ key: "id", label: "ID" }],',
    'rows': 'rows: [{ id: 1, name: "John" }],',
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

    # =========================================================================
    # 4. COBERTURA COMPLETA DEL REGISTRO DE PROPS
    #
    # Cada clave de este bloque es una entrada del banco de datos de
    # `translateProps.js` que ninguna otra snippet usaba todavía. Los valores
    # siguen las reglas del motor: un número en un prop de unidad `rem` son
    # píxeles sobre base 16, los props `style: none` quieren la cadena CSS
    # exacta y los de tipo `attribute` se escriben como atributos DOM.
    # =========================================================================

    # ---------- Dimensiones (atajos) ----------
    'w': 'w: 240,',
    'h': 'h: 160,',
    'minW': 'minW: 120,',
    'maxW': 'maxW: 480,',
    'minH': 'minH: 80,',
    'minHeight': 'minHeight: 80,',
    'maxH': 'maxH: 320,',

    # ---------- Espaciado (atajo corto y su forma larga) ----------
    'p': 'p: 16,',
    'm': 'm: 12,',
    'pt': 'pt: 8,',
    'paddingTop': 'paddingTop: 8,',
    'pr': 'pr: 12,',
    'paddingRight': 'paddingRight: 12,',
    'pb': 'pb: 16,',
    'paddingBottom': 'paddingBottom: 16,',
    'pl': 'pl: 12,',
    'paddingLeft': 'paddingLeft: 12,',
    'mt': 'mt: 8,',
    'marginTop': 'marginTop: 8,',
    'mr': 'mr: 8,',
    'marginRight': 'marginRight: 8,',
    'mb': 'mb: 16,',
    'marginBottom': 'marginBottom: 16,',
    'ml': 'ml: 12,',
    'marginLeft': 'marginLeft: 12,',
    'px': 'px: 20,',
    'py': 'py: 12,',
    'mx': 'mx: 24,',
    'my': 'my: 16,',
    'marginHorizontal': 'marginHorizontal: 24,',
    'marginVertical': 'marginVertical: 16,',

    # ---------- Posición y capa ----------
    'pos': 'pos: "absolute",',
    'z': 'z: 10,',
    'inset': 'inset: 16,',

    # ---------- Fondo ----------
    'bg': 'bg: colors.surface,',
    'bgImage': "bgImage: \"url('/assets/hero.jpg')\",",
    'bgSize': 'bgSize: "cover",',
    'bgPosition': 'bgPosition: "center",',
    'bgRepeat': 'bgRepeat: "no-repeat",',

    # ---------- Tipografía ----------
    'fontWeight': 'fontWeight: "bold",',
    'lineH': 'lineH: 1.5,',
    'letterSpace': 'letterSpace: 1,',
    'textDecoration': 'textDecoration: "underline",',
    'textTransform': 'textTransform: "uppercase",',
    'whiteSpace': 'whiteSpace: "nowrap",',
    'wordBreak': 'wordBreak: "break-word",',
    'textOverflow': 'textOverflow: "ellipsis",',
    'buttonText': 'buttonText: "Save",',
    'textContent': 'textContent: "Plain text",',

    # ---------- Flex y layout ----------
    'display': 'display: "grid",',
    'justify': 'justify: "center",',
    'wrap': 'wrap: "wrap",',
    'flexGrow': 'flexGrow: 1,',
    'flexShrink': 'flexShrink: 0,',
    'flexBasis': 'flexBasis: 200,',
    'boxSizing': 'boxSizing: "border-box",',
    'overflowX': 'overflowX: "auto",',
    'overflowY': 'overflowY: "hidden",',
    'objectFit': 'objectFit: "cover",',

    # ---------- Bordes y esquinas ----------
    'borderTop': 'borderTop: "1px solid #e2e8f0",',
    'borderBottom': 'borderBottom: "1px solid #e2e8f0",',
    'borderLeft': 'borderLeft: "1px solid #e2e8f0",',
    'borderTopLeftRadius': 'borderTopLeftRadius: 8,',
    'borderTopRightRadius': 'borderTopRightRadius: 8,',
    'borderBottomLeftRadius': 'borderBottomLeftRadius: 8,',
    'borderBottomRightRadius': 'borderBottomRightRadius: 8,',
    'roundedTop': 'roundedTop: 12,',
    'roundedBottom': 'roundedBottom: 12,',
    'roundedLeft': 'roundedLeft: 12,',
    'roundedRight': 'roundedRight: 12,',
    'borderRadiusBottom': 'borderRadiusBottom: 12,',
    'borderRadiusLeft': 'borderRadiusLeft: 12,',
    'borderRadiusRight': 'borderRadiusRight: 12,',

    # ---------- Interacción y visibilidad ----------
    'visibility': 'visibility: "hidden",',
    'pointerEvents': 'pointerEvents: "none",',
    'userSelect': 'userSelect: "none",',
    'touchAction': 'touchAction: "none",',
    'willChange': 'willChange: "transform",',

    # ---------- Atributos DOM ----------
    'class': 'class: "panel",',
    'href': 'href: "https://fletbox.dev",',
    'role': 'role: "button",',
    'lang': 'lang: "es",',
    'dir': 'dir: "rtl",',
    'tabIndex': 'tabIndex: 0,',
    'draggable': 'draggable: true,',
    'hidden': 'hidden: true,',
    'for': 'for: "email-input",',
    'htmlFor': 'htmlFor: "email-input",',
    'autofocus': 'autofocus: true,',
    'spellcheck': 'spellcheck: false,',

    # ---------- Eventos del DOM ----------
    'onclick': 'onclick: () => console.log("clicked"),',
    'onKeyDown': 'onKeyDown: (e) => console.log(e.key),',
    'onKeyUp': 'onKeyUp: (e) => console.log(e.key),',
    'onKeyPress': 'onKeyPress: (e) => console.log(e.key),',
    'onMouseDown': 'onMouseDown: (e) => console.log(e.button),',
    'onMouseUp': 'onMouseUp: (e) => console.log(e.button),',
    'onMouseMove': 'onMouseMove: (e) => console.log(e.clientX, e.clientY),',
    'onTouchStart': 'onTouchStart: (e) => console.log(e.touches[0].clientX),',
    'onTouchMove': 'onTouchMove: (e) => console.log(e.touches[0].clientY),',
    'onTouchEnd': 'onTouchEnd: (e) => console.log(e.changedTouches[0].clientX),',

    # ---------- Posicionamiento dentro de un Stack ----------
    # `stackPosition` sólo actúa cuando el padre declara position: "stack".
    'stackStart': 'start: 16, // parent Stack needs position: "stack"',
    'stackEnd': 'end: 16, // parent Stack needs position: "stack"',
    'stackCenterX': 'centerX: true, // parent Stack needs position: "stack"',
    'stackCenterY': 'centerY: true, // parent Stack needs position: "stack"',
    'stackCenter': 'center: true, // parent Stack needs position: "stack"',
    'stackFullHeight': 'fullHeight: true, // parent Stack needs position: "stack"',
    'stackFull': 'full: true, // parent Stack needs position: "stack"',

    # ---------- Despliegue ----------
    'basePath': 'basePath: "/flet-box-docs",',

    # ---------- AppBar / Card / Carousel / Image / Input ----------
    'actionsGap': 'actionsGap: 12,',
    'showBorder': 'showBorder: false,',
    'buttonTop': 'buttonTop: "46%",',
    'imageCircular': 'circular: true,',
    'onIconPress': 'onIconPress: () => console.log("icon pressed"),',

    # ---------- ListTile ----------
    'titleProps': 'titleProps: { size: 16, weight: "bold" },',
    'subtitleProps': 'subtitleProps: { color: colors.textSecondary },',
    'descriptionProps': 'descriptionProps: { color: colors.textSecondary, size: 12 },',

    # ---------- DroppBox (estado activo del área de soltado) ----------
    'activeBorderStyle': 'activeBorderStyle: "dashed",',
    'activeBorderWidth': 'activeBorderWidth: 2,',
    'activeShadow': 'activeShadow: "0 0 12px rgba(99, 102, 241, 0.4)",',

    # ---------- Circular Bar ----------
    'gradientAngle': 'gradientAngle: 135,',
    'customValueFormatter': 'customValueFormatter: (value, max) => `${value}/${max} MB`,',

    # ---------- Circular Chart ----------
    'startAngle': 'startAngle: 0,',
    'endAngle': 'endAngle: Math.PI,',
    'innerRadius': 'innerRadius: 40,',
    'semiCircle': 'semiCircle: "top",',
    'defaultColors': 'defaultColors: ["#6366f1", "#22c55e", "#f59e0b"],',
    'sliceBorderColor': 'sliceBorderColor: "#ffffff",',
    'sliceBorderWidth': 'sliceBorderWidth: 2,',

    # ---------- Markdown (estilo de bloque) ----------
    'markdownSource': 'source: "# Hello\\n\\nSome **bold** text",',
    'headingMargin': 'headingMargin: "0.67em 0",',
    'codeFontFamily': 'codeFontFamily: "ui-monospace, Menlo, monospace",',
    'markdownCodeBorderRadius': 'codeBorderRadius: 4,',
    'codePadding': 'codePadding: "0.2em 0.45em",',
    'prePadding': 'prePadding: "1em",',
    'preMargin': 'preMargin: "1em 0",',
    'blockquoteColor': 'blockquoteColor: colors.textSecondary,',
    'blockquoteBorderWidth': 'blockquoteBorderWidth: 4,',
    'blockquotePadding': 'blockquotePadding: "0 1em",',
    'blockquoteMargin': 'blockquoteMargin: "1em 0",',
    'tableBorderColor': 'tableBorderColor: colors.gray300,',
    'tableCellPadding': 'tableCellPadding: "0.4em 0.75em",',
    'tableHeaderBgColor': 'tableHeaderBgColor: colors.gray100,',
    'listMargin': 'listMargin: "0em 0",',
    'listPadding': 'listPadding: "0 0 0 1em",',
    'listItemMargin': 'listItemMargin: "0.0em 0",',
    'imageMaxWidth': 'imageMaxWidth: "100%",',
    'imageBorderRadius': 'imageBorderRadius: 8,',

    # ---------- AdMob ----------
    'adId': 'adId: "ca-app-pub-3940256099942544/6300978111",',
    'interstitialId': 'interstitialId: "ca-app-pub-3940256099942544/4411468917",',
    'rewardedId': 'rewardedId: "ca-app-pub-3940256099942544/1751961742",',
    'isTesting': 'isTesting: true,',
    'autoShow': 'autoShow: false,',
    'autoInitialize': 'autoInitialize: true,',
    'admobPlugin': 'plugin: window.Capacitor?.Plugins?.AdMob,',
    'onLoaded': 'onLoaded: (widget) => console.log("banner ready"),',
    'onFailed': 'onFailed: (error) => console.error(error.message),',
    'onDismissed': 'onDismissed: () => console.log("ad dismissed"),',

    # ---------- AdSense ----------
    'adsenseClient': 'client: "ca-pub-1234567890123456",',
    'adsenseSlot': 'slot: "1234567890",',
    'adsenseResponsive': 'responsive: false,',
    'adsenseTest': 'test: true,',

    # =========================================================================
    # 5. UTILIDADES DE BAJO NIVEL DEL FRAMEWORK
    #
    # Exportaciones públicas que ninguna snippet alcanzaba: efectos visuales,
    # inserción en el DOM, PWA, HMR, router y utilidades de texto.
    # =========================================================================

    # ---------- Efectos visuales ----------
    'applyStripes': 'const bar = ProgressBar({ value: 60 });\napplyStripes(bar, { color: "rgba(255, 255, 255, 0.15)", size: 10, angle: 45, animated: true, duration: "0.5s" });',
    'removeStripes': 'const bar = ProgressBar({ value: 60 });\napplyStripes(bar, { animated: true });\nremoveStripes(bar);',
    'applyShimmer': 'const placeholder = Skeleton({ variant: "text" });\napplyShimmer(placeholder, { highlightColor: "rgba(255, 255, 255, 0.35)", baseColor: "rgba(0, 0, 0, 0.05)", duration: "1.5s" });',
    'applyGlow': 'const payButton = Button({ text: "Pay" });\napplyGlow(payButton, { color: "rgba(0, 122, 255, 0.5)", intensity: 12, duration: "2s" });',
    'applyIndeterminate': 'const track = Container({ height: 4 });\napplyIndeterminate(track, { duration: "1.5s", width: "50%" });',
    'applyPulse': 'const dot = Icon({ name: "circle" });\napplyPulse(dot, { scale: 1.05, duration: "0.3s" });',
    'injectKeyframes': 'injectKeyframes("float", "0% { transform: translateY(0); } 100% { transform: translateY(-8px); }");',
    'stackPosition': '// The public helper only records the offsets on the dataset; the parent Stack reads them.\nconst badge = Text({ text: "3" });\nstackPosition(badge, { top: 8, right: 8 });',

    # ---------- Animaciones ----------
    'stopAnimation': 'const box = Container({ width: 100, height: 100 });\nanimate(box, "opacity", 1, 0.2, 400);\nstopAnimation(box, "opacity");',

    # ---------- Inserción en el DOM ----------
    'insertBy': 'insertBy(Text({ text: "Mounted" }), "root");',
    'prependBy': 'prependBy(Text({ text: "First" }), "root");',
    'insertBefore': 'insertBefore(Text({ text: "Before" }), "target-id");',
    'insertAfter': 'insertAfter(Text({ text: "After" }), "target-id");',
    'replaceBy': 'replaceBy(Text({ text: "Replaced" }), "target-id");',
    'mountAll': 'mountAll(Card({ children: [Text({ text: "Shared" })] }), ["header", "footer"]);',
    'addNavigation': 'const box = Container({ width: 100, height: 100 });\naddNavigation(box);\nconsole.log(box.depth, box.path);',

    # ---------- PWA ----------
    'isPWAInstalled': 'if (isPWAInstalled()) console.log("running as installed app");',
    'installPWA': 'const btn = Button({ text: "Install", onPress: installPWA });',
    'updatePWA': 'const btn = Button({ text: "Update", onPress: updatePWA });',
    'removePWA': 'const btn = Button({ text: "Uninstall", onPress: removePWA });',

    # ---------- HMR y router ----------
    'initHMR': 'initHMR();',
    'getHMR': 'const socket = getHMR();',
    'getBasePath': 'const base = getBasePath();',

    # ---------- Texto y color ----------
    'print': 'print("Saved", "success", { timestamp: true, label: "sync" });',
    'palettes': 'const brand = palettes.light.primary;',
    'highlightColors': 'const keywordColor = highlightColors.keyword;',
    'tokenize': 'const tokens = tokenize("const x = 1;");',
    'parseMarkdown': 'const raw = parseMarkdown("# Hello");\nMarkdown({ text: raw });',
    'parseInlineMarkdown': 'const raw = parseInlineMarkdown("**bold**");\nText({ text: raw });',
}