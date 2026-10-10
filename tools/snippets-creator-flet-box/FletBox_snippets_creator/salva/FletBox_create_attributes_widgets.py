attrs_all_placeholders_complete = {
# ============================================
# 📁 fletbox_create_styles.py
# ESTILOS COMPLETOS PARA REACT NATIVE
# ============================================
# CLASE 1: WIDGETS BÁSICOS (View, Text, TextInput, Image)
# ============================================
# ============================================
# 📦 VIEW - ESTILOS POR CATEGORÍA
# ============================================

"st.view.layout": """
// LAYOUT - Flexbox
card: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    alignSelf: 'stretch',
},
""",

"st.view.spacing": """
// SPACING - Padding y Margin
card: {
    padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    margin: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 16,
    marginRight: 16,
},
""",

"st.view.color": """
// COLOR - Fondo
card: {
    backgroundColor: '#fff',
    opacity: 1,
},
""",

"st.view.border": """
// BORDER - Bordes
card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#ddd',
    borderBottomColor: '#ddd',
    borderLeftColor: '#ddd',
    borderRightColor: '#ddd',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderStyle: 'solid',
},
""",

"st.view.position": """
// POSITION - Posicionamiento
card: {
    position: 'relative',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
},
""",

"st.view.dimensions": """
// DIMENSIONS - Tamaño
card: {
    width: 'auto',
    height: 'auto',
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 0,
    maxHeight: undefined,
    aspectRatio: undefined,
},
""",

"st.view.shadow": """
// SHADOW - Sombra
card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
""",

"st.view.overflow": """
// OVERFLOW - Desbordamiento
card: {
    overflow: 'visible',
    opacity: 1,
},
""",

"st.view.complete": """
// COMPLETO - Todos los estilos juntos
card: {
    // LAYOUT
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    alignSelf: 'stretch',
    
    // SPACING
    padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    margin: 0,
    marginHorizontal: 16,
    marginVertical: 8,
    
    // COLOR
    backgroundColor: '#fff',
    opacity: 1,
    
    // BORDER
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderStyle: 'solid',
    
    // SHADOW
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    
    // POSITION
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    
    // DIMENSIONS
    width: 'auto',
    height: 'auto',
    minWidth: 0,
    minHeight: 0,
    
    // OVERFLOW
    overflow: 'visible',
},
""",
# ---------- VIEW ----------
    "st.view.default": """
view: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
},
""",
    "st.view.common": """
view: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    margin: 0,
    alignItems: 'center',
    // flexDirection: 'column',
    // border
    // borderWidth: 0,
    // borderColor: 'transparent',
    // borderRadius: 0,
    // borderStyle: 'solid',  // solid, dotted, dashed
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
},
""",
    "st.view.full": """
view: {
    // LAYOUT
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    position: 'relative',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    aspectRatio: undefined,
    overflow: 'visible',
    opacity: 1,
    
    // DIMENSIONES
    width: 'auto',
    height: 'auto',
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 0,
    maxHeight: undefined,
    
    // PADDING
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    
    // MARGIN
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    
    // BORDES
    borderWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderStyle: 'solid',  // solid, dotted, dashed
    
    // SOMBRA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    
    // FONDO
    backgroundColor: '#fff',
},
""",
    
    # ---------- TEXT ----------
    "st.text.default": """
text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
},
""",
    "st.text.full": """
text: {
    // TAMAÑO
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    
    // PESO Y ESTILO
    fontWeight: 'normal',  // normal, bold, 100-900
    fontStyle: 'normal',  // normal, italic
    fontFamily: 'System',
    
    // COLOR
    color: '#333',
    
    // ALINEACIÓN
    textAlign: 'left',  // left, center, right, justify, auto
    textAlignVertical: 'auto',  // auto, top, bottom, center
    
    // DECORACIÓN
    textDecorationLine: 'none',  // none, underline, line-through, underline line-through
    textDecorationStyle: 'solid',  // solid, double, dotted, dashed
    textDecorationColor: '#333',
    
    // TRANSFORMACIÓN
    textTransform: 'none',  // none, uppercase, lowercase, capitalize
    
    // CORTE
    numberOfLines: 0,
    ellipsizeMode: 'tail',  // head, middle, tail, clip
    
    // SOMBRA DE TEXTO (iOS)
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
    
    // ESPACIADO
    padding: 0,
    margin: 0,
},
""",
    
    # ---------- TEXTINPUT ----------
    "st.input.default": """
input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
},
""",
    "st.input.full": """
input: {
    // DIMENSIONES
    height: 48,
    minHeight: 48,
    width: '100%',
    
    // BORDES
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    
    // RELLENO
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    
    // TEXTO
    fontSize: 16,
    fontWeight: 'normal',
    color: '#333',
    textAlign: 'left',
    
    // FONDO
    backgroundColor: '#fff',
    
    // MARGEN
    marginVertical: 8,
    marginHorizontal: 0,
    
    // SOMBRA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
},
""",
    
    # ---------- IMAGE ----------
    "st.image.default": """
image: {
    width: 100,
    height: 100,
    borderRadius: 8,
},
""",
    "st.image.full": """
image: {
    // DIMENSIONES
    width: 100,
    height: 100,
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 0,
    maxHeight: undefined,
    
    // BORDES
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    
    // POSICIÓN
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    
    // MARGEN
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    
    // RESIZE
    resizeMode: 'cover',  // cover, contain, stretch, repeat, center
    
    // OPACIDAD
    opacity: 1,
    
    // FONDO
    backgroundColor: '#f0f0f0',
},
""",
    
    # ---------- TOUCHABLEOPACITY / BUTTON ----------
    "st.button.default": """
button: {
    // paddingVertical: 12,
    // paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    // BORDES
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    // FONDO
    backgroundColor: '#2196f3',
    // ALINEACIÓN
    alignItems: 'center',
    justifyContent: 'center',
    // SOMBRA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    // OPACIDAD
    opacity: 1,
},
""",
    "st.button.full": """
button: {
    // DIMENSIONES
    minWidth: 64,
    height: 48,
    
    // RELLENO
    paddingVertical: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
    
    // BORDES
    borderRadius: 8,
    borderWidth: 0,
    borderColor: 'transparent',
    
    // FONDO
    backgroundColor: '#2196f3',
    
    // ALINEACIÓN
    alignItems: 'center',
    justifyContent: 'center',
    
    // MARGEN
    marginVertical: 8,
    marginHorizontal: 0,
    
    // SOMBRA
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    
    // OPACIDAD
    opacity: 1,
},
buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
},
""",
    
    # ---------- ICON ----------
    "st.icon.default": """
icon: {
    width: 24,
    height: 24,
},
""",
    "st.icon.full": """
icon: {
    // DIMENSIONES
    width: 24,
    height: 24,
    
    // COLOR
    tintColor: '#000',
    
    // MARGEN
    margin: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    
    // POSICIÓN
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
},
""",
    
    # ============================================
    # CLASE 2: BOTONES (Elevated, Text, Outlined, Filled, Tonal)
    # ============================================
    
    "st.elevatedButton.default": """
elevatedButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
elevatedButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
},
""",
    "st.textButton.default": """
textButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
},
textButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
},
""",
    "st.outlinedButton.default": """
outlinedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
    backgroundColor: 'transparent',
},
outlinedButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
},
""",
    "st.filledButton.default": """
filledButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
},
filledButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
},
""",
    "st.tonalButton.default": """
tonalButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
},
tonalButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
},
""",
    
    # ============================================
    # CLASE 3: LAYOUT (Row, Column, Center, Card, etc.)
    # ============================================
    
    "st.row.default": """
row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
},
""",
    "st.row.full": """
row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    paddingHorizontal: 16,
    paddingVertical: 0,
    margin: 0,
    backgroundColor: 'transparent',
},
""",
    
    "st.column.default": """
column: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
},
""",
    "st.column.full": """
column: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    margin: 0,
    backgroundColor: 'transparent',
},
""",
    
    "st.center.default": """
center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
""",
    "st.center.full": """
center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: 0,
    margin: 0,
},
""",
    
    "st.card.view.default": """
card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
""",
    "st.card.view.full": """
card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
    borderColor: 'transparent',
},
""",
    
    "st.safearea.default": """
safeArea: {
    flex: 1,
    backgroundColor: '#fff',
},
""",
    "st.scrollview.default": """
scrollView: {
    flex: 1,
    backgroundColor: '#fff',
},
""",
    "st.divider.default": """
divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
},
""",
    
    # ============================================
    # CLASE 4: LISTAS (FlatList, Grid, etc.)
    # ============================================
    
    "st.list.default": """
list: {
    flex: 1,
    backgroundColor: '#fff',
},
""",
    "st.item.default": """
item: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
},
""",
    "st.grid.default": """
grid: {
    flex: 1,
    backgroundColor: '#fff',
},
""",
    "st.gridItem.default": """
gridItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
},
""",
    "st.gridText.default": """
gridText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
},
""",
    "st.sectionHeader.default": """
sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
},
""",
    
    # ============================================
    # CLASE 5: FORMULARIOS (Switch, Checkbox, Radio, Slider)
    # ============================================
    
    "st.switch.default": """
switch: {
    marginVertical: 8,
},
""",
    "st.checkbox.default": """
checkbox: {
    marginVertical: 8,
    marginRight: 8,
},
""",
    "st.radio.default": """
radio: {
    marginVertical: 8,
},
""",
    "st.slider.default": """
slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
},
""",
    "st.picker.default": """
picker: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 8,
},
""",
    
    # ============================================
    # CLASE 6: FEEDBACK (Modal, Dialog, Badge, Banner)
    # ============================================
    
    "st.modalContainer.default": """
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
},
modalText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
},
""",
    
    "st.dialogOverlay.default": """
dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
dialogContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
},
dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
},
dialogMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
},
dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
},
dialogButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
},
dialogButtonText: {
    fontSize: 16,
    color: '#2196f3',
    fontWeight: '600',
},
""",
    
    "st.badge.default": """
badge: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
},
badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
},
""",
    
    "st.banner.default": """
banner: {
    backgroundColor: '#ff9800',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
},
bannerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
},
bannerButton: {
    padding: 8,
},
bannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
},
""",
    
    "st.loader.default": """
loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
""",
    "st.progress.default": """
progress: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
},
""",
    
    # ============================================
    # CLASE 8: UTILIDADES (Shadow, Border, Absolute)
    # ============================================
    "st.shadow.style.default": """
shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
},
""",
    "st.border.style.default": """
border: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
},
""",
    "st.rounded.style.default": """
rounded: {
    borderRadius: 8,
},
""",
    "st.circle.style.default": """
circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
},
""",
    "st.absolute.style.default": """
absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
},
""",
    "st.absoluteCenter.style.default": """
absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
},
""",
    "st.padding.style.default": """
padding: {
    padding: 16,
},
""",
    "st.margin.style.default": """
margin: {
    margin: 16,
},
""",
# ============================================
# PADDING (Espaciado interno)
# ============================================
    
    "st.padding.default": """
padding: 16,  // aplica a los 4 lados
""",
    "st.padding.full": """
padding: 16,  // number | string (auto)
// También puedes usar:
// paddingHorizontal: 16,  // izquierda + derecha
// paddingVertical: 12,   // arriba + abajo
// paddingTop: 8,
// paddingBottom: 8,
// paddingLeft: 8,
// paddingRight: 8,
// EJEMPLOS:
// padding: 16,  // 16 en todos los lados
// padding: 10,  // 10 en todos los lados
// paddingHorizontal: 20,  // solo izquierda y derecha
// paddingVertical: 15,    // solo arriba y abajo
""",
    
    "st.paddingHorizontal.default": """
paddingHorizontal: 16,  // izquierda + derecha
""",
    "st.paddingVertical.default": """
paddingVertical: 12,  // arriba + abajo
""",
    "st.paddingTop.default": """
paddingTop: 8,
""",
    "st.paddingBottom.default": """
paddingBottom: 8,
""",
    "st.paddingLeft.default": """
paddingLeft: 8,
""",
    "st.paddingRight.default": """
paddingRight: 8,
""",
    
    # ============================================
    # MARGIN (Espaciado externo)
    # ============================================
    
    "st.margin.default": """
margin: 16,  // aplica a los 4 lados
""",
    "st.margin.full": """
margin: 16,  // number | string (auto)
// También puedes usar:
// marginHorizontal: 16,  // izquierda + derecha
// marginVertical: 12,    // arriba + abajo
// marginTop: 8,
// marginBottom: 8,
// marginLeft: 8,
// marginRight: 8,
// margin: 'auto',  // centrado horizontal
// EJEMPLOS:
// margin: 10,  // 10 en todos los lados
// margin: 'auto',  // centrado horizontal
// marginHorizontal: 20,  // auto centrado horizontal
// marginVertical: 15,
""",
    
    "st.marginHorizontal.default": """
marginHorizontal: 16,  // izquierda + derecha
""",
    "st.marginVertical.default": """
marginVertical: 12,  // arriba + abajo
""",
    "st.marginTop.default": """
marginTop: 8,
""",
    "st.marginBottom.default": """
marginBottom: 8,
""",
    "st.marginLeft.default": """
marginLeft: 8,
""",
    "st.marginRight.default": """
marginRight: 8,
""",
    
    # ============================================
    # BORDER (Bordes)
    # ============================================
    
    "st.border.default": """
borderWidth: 1,
borderColor: '#ddd',
borderRadius: 8,
""",
    "st.border.full": """
// ANCHO DEL BORDE:
borderWidth: 1,           // number: aplica a todos los lados
borderTopWidth: 1,        // number: solo arriba
borderBottomWidth: 1,     // number: solo abajo
borderLeftWidth: 1,       // number: solo izquierda
borderRightWidth: 1,      // number: solo derecha

// COLOR DEL BORDE:
borderColor: '#ddd',      // string: color para todos los lados
borderTopColor: '#ddd',   // string: color arriba
borderBottomColor: '#ddd',// string: color abajo
borderLeftColor: '#ddd',  // string: color izquierda
borderRightColor: '#ddd', // string: color derecha

// RADIO DEL BORDE:
borderRadius: 8,          // number: todas las esquinas
borderTopLeftRadius: 8,   // number: esquina superior izquierda
borderTopRightRadius: 8,  // number: esquina superior derecha
borderBottomLeftRadius: 8,// number: esquina inferior izquierda
borderBottomRightRadius: 8,// number: esquina inferior derecha

// ESTILO DEL BORDE (solo iOS):
borderStyle: 'solid',     // 'solid' | 'dotted' | 'dashed'

// EJEMPLOS:
// Círculo:
borderRadius: 50,
width: 100,
height: 100,

// Tarjeta con borde:
borderWidth: 1,
borderColor: '#f0f0f0',
borderRadius: 12,

// Solo borde inferior:
borderBottomWidth: 1,
borderBottomColor: '#e0e0e0',
""",
    
    "st.borderWidth.default": """
borderWidth: 1,
""",
    "st.borderColor.default": """
borderColor: '#ddd',
""",
    "st.borderRadius.default": """
borderRadius: 8,
""",
    "st.borderRadius.full": """
borderRadius: 8,  // todas las esquinas
// Esquinas individuales:
// borderTopLeftRadius: 8,
// borderTopRightRadius: 8,
// borderBottomLeftRadius: 8,
// borderBottomRightRadius: 8,
// EJEMPLOS:
// Círculo perfecto: borderRadius: width/2
// Semicírculo: borderRadius: height/2
// Esquinas solo arriba: borderTopLeftRadius: 8, borderTopRightRadius: 8
""",
    
    # ============================================
    # SHADOW (Sombra)
    # ============================================
    
    "st.shadow.full": """
// SOMBRA EN iOS:
shadowColor: '#000',        // string: color de la sombra
shadowOffset: {             // object: desplazamiento
    width: 0,               // number: desplazamiento horizontal
    height: 2               // number: desplazamiento vertical
},
shadowOpacity: 0.1,         // number: 0 - 1, opacidad de la sombra
shadowRadius: 4,            // number: radio de desenfoque

// SOMBRA EN Android:
elevation: 3,               // number: 0 - 24, solo Android

// EJEMPLOS:
// Sombra pequeña (inset):
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.05,
shadowRadius: 2,
elevation: 2,

// Sombra mediana:
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 4,

// Sombra grande:
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.3,
shadowRadius: 12,
elevation: 10,

// Sombra hacia abajo:
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.2,
shadowRadius: 6,
elevation: 6,

// Sombra hacia todos lados:
shadowOffset: { width: 0, height: 0 },
shadowRadius: 10,
shadowOpacity: 0.2,
""",
    
    "st.shadowColor.default": """
shadowColor: '#000',
""",
    "st.shadowOffset.default": """
shadowOffset: { width: 0, height: 2 },
""",
    "st.shadowOpacity.default": """
shadowOpacity: 0.1,
""",
    "st.shadowRadius.default": """
shadowRadius: 4,
""",
    "st.elevation.default": """
elevation: 3,  // solo Android, 0-24
""",
    
    # ============================================
    # FLEX (Flexbox)
    # ============================================
    
    "st.flex.default": """
flex: 1,
""",
    "st.flex.full": """
// FLEX PRINCIPAL:
flex: 1,              // number: proporción de espacio
flexGrow: 1,          // number: capacidad de crecer
flexShrink: 1,        // number: capacidad de encoger
flexBasis: 'auto',    // number | 'auto': tamaño base

// ALINEACIÓN DEL HIJO:
alignSelf: 'stretch', // auto, flex-start, flex-end, center, stretch, baseline

// EJEMPLOS:
// Ocupar todo el espacio disponible:
flex: 1,

// Crecer 2 veces más que los demás:
flexGrow: 2,

// No encoger:
flexShrink: 0,

// Tamaño base fijo:
flexBasis: 100,
""",
    
    "st.flexGrow.default": """
flexGrow: 1,  // capacidad de crecer
""",
    "st.flexShrink.default": """
flexShrink: 1,  // capacidad de encoger
""",
    "st.flexBasis.default": """
flexBasis: 'auto',  // tamaño base
""",
    "st.alignSelf.default": """
alignSelf: 'center',  // auto, flex-start, flex-end, center, stretch, baseline
""",
    
    # ============================================
    # ALIGNMENT (Alineación)
    # ============================================
    
    "st.alignItems.default": """
alignItems: 'center',  
// flex-start, flex-end, center, stretch, baseline
""",
    "st.alignItems.full": """
alignItems: 'center',  
// alineación en el eje transversal
// Opciones:
// 'flex-start'  : al inicio
// 'flex-end'    : al final
// 'center'      : al centro
// 'stretch'     : estirar (default)
// 'baseline'    : alineado por línea base
""",
    
    "st.justifyContent.default": """
justifyContent: 'center',  
// flex-start, flex-end, center, space-between, space-around, space-evenly
""",
    "st.justifyContent.full": """
justifyContent: 'center',  
// alineación en el eje principal
// Opciones:
// 'flex-start'      : al inicio
// 'flex-end'        : al final
// 'center'          : al centro
// 'space-between'   : espacio entre elementos
// 'space-around'    : espacio alrededor
// 'space-evenly'    : espacio igual entre todos
""",
    
    # ============================================
    # FLEX DIRECTION (Dirección)
    # ============================================
    
    "st.flexDirection.default": """
flexDirection: 'column',
// row, column, row-reverse, column-reverse
""",
    "st.flexDirection.full": """
flexDirection: 'column',
// 'row'           : horizontal (izquierda a derecha)
// 'column'        : vertical (arriba a abajo)
// 'row-reverse'   : horizontal inverso
// 'column-reverse': vertical inverso
""",
    
    "st.flexWrap.default": """
flexWrap: 'wrap',  // wrap, nowrap, wrap-reverse
""",
    
    # ============================================
    # POSITION (Posicionamiento)
    # ============================================
    
    "st.position.default": """
position: 'relative',
""",
    "st.position.full": """
position: 'relative',  // relative, absolute
// 'relative' : posicionamiento normal (default)
// 'absolute' : posicionamiento absoluto (con top, left, right, bottom)

// Cuando es absolute, usar con:
top: 0,
bottom: 0,
left: 0,
right: 0,
zIndex: 1,
""",
    
    "st.absolute.default": """
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
""",
    "st.absolute.full": """
position: 'absolute',
// Con coordenadas específicas:
top: 10,
bottom: 10,
left: 10,
right: 10,

// Centrado absoluto:
top: '50%',
left: '50%',
transform: [{ translateX: -50 }, { translateY: -50 }],

// Ejemplos:
// Fondo overlay: top:0, left:0, right:0, bottom:0
// Header fijo: top:0, left:0, right:0
// Footer fijo: bottom:0, left:0, right:0
// Centro: top:'50%', left:'50%', transform
""",
    
    "st.top.default": """
top: 10,
""",
    "st.bottom.default": """
bottom: 10,
""",
    "st.left.default": """
left: 10,
""",
    "st.right.default": """
right: 10,
""",
    "st.zIndex.default": """
zIndex: 1,  // orden de apilamiento, mayor valor = más arriba
""",
    
    # ============================================
    # DIMENSIONES (Width, Height)
    # ============================================
    
    "st.width.default": """
width: 100,
""",
    "st.width.full": """
width: 100,  // number | string
// Opciones:
// width: 100,        // píxeles fijos
// width: '50%',      // porcentaje
// width: 'auto',     // automático
// width: undefined,  // sin definir
""",
    "st.height.default": """
height: 100,
""",
    "st.minWidth.default": """
minWidth: 100,
""",
    "st.maxWidth.default": """
maxWidth: 500,
""",
    "st.minHeight.default": """
minHeight: 100,
""",
    "st.maxHeight.default": """
maxHeight: 500,
""",
    "st.aspectRatio.default": """
aspectRatio: 1.5,  // número, 1 = cuadrado
""",
    "st.aspectRatio.full": """
aspectRatio: 1,  // relación ancho/alto
// 1 = cuadrado
// 16/9 = 1.777 (pantalla ancha)
// 4/3 = 1.333 (foto tradicional)
// Ejemplos:
aspectRatio: 1,      // cuadrado
aspectRatio: 16/9,   // widescreen
aspectRatio: 4/3,    // foto tradicional
""",
    
    # ============================================
    # COLORES Y FONDO
    # ============================================
    
    "st.backgroundColor.default": """
backgroundColor: '#fff',
""",
    "st.backgroundColor.full": """
backgroundColor: '#fff',  // string
// Formatos:
// '#fff'                // hex 3 dígitos
// '#ffffff'             // hex 6 dígitos
// 'rgba(255,255,255,0.5)' // rgba
// 'rgb(255,255,255)'    // rgb
// 'transparent'         // transparente
// EJEMPLOS:
backgroundColor: '#f4511e',  // naranja
backgroundColor: 'rgba(0,0,0,0.5)',  // negro semi-transparente
backgroundColor: 'transparent',  // fondo transparente
""",
    
    "st.opacity.default": """
opacity: 0.5,  // 0 (transparente) - 1 (opaco)
""",
    "st.overflow.default": """
overflow: 'hidden',  // visible, hidden, scroll
""",
    
    # ============================================
    # TIPOGRAFÍA (Texto)
    # ============================================
    
    "st.fontSize.default": """
fontSize: 16,
""",
    "st.fontWeight.default": """
fontWeight: 'bold',  
// normal, bold, 100, 200, 300, 400, 
// 500, 600, 700, 800, 900
""",
    "st.fontFamily.default": """
fontFamily: 'System',
// 'System', 'Roboto', 'Arial', etc.
""",
    "st.lineHeight.default": """
lineHeight: 24,
""",
    "st.letterSpacing.default": """
letterSpacing: 0.5,
""",
    "st.textAlign.default": """
textAlign: 'center',  
// auto, left, right, center, justify
""",
    "st.textDecorationLine.default": """
textDecorationLine: 'underline',  
// none, underline, line-through, underline line-through
""",
    "st.textTransform.default": """
textTransform: 'uppercase',  
// none, uppercase, lowercase, capitalize
""",
    "st.numberOfLines.default": """
numberOfLines: 2,  
// número de líneas antes de truncar
""",
    "st.ellipsizeMode.default": """
ellipsizeMode: 'tail',  
// head, middle, tail, clip
""",
    
    # ============================================
    # UTILIDADES
    # ============================================
    
    "st.rounded.default": """
rounded: {
    borderRadius: 8,
},
""",
    "st.rounded.full": """
rounded: {
    borderRadius: 8,
},
// Variantes:
// roundedSm: { borderRadius: 4 },
// roundedMd: { borderRadius: 8 },
// roundedLg: { borderRadius: 12 },
// roundedXl: { borderRadius: 16 },
// roundedFull: { borderRadius: 9999 },
""",
    
    "st.circle.default": """
circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
},
""",
    "st.circle.full": """
circle: {
    width: 50,
    height: 50,
    borderRadius: 25,  // debe ser width/2
},
// Para círculo perfecto:
circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
},
""",
    
    "st.absoluteCenter.default": """
absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
},
""",
    "st.absoluteCenter.full": """
absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
},
// Variantes:
// absoluteCenterHorizontal: { position: 'absolute', left: '50%', transform: [{ translateX: -50 }] },
// absoluteCenterVertical: { position: 'absolute', top: '50%', transform: [{ translateY: -50 }] },
""",
    
    "st.fill.default": """
fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
},
""",
    
    "st.hidden.default": """
hidden: {
    display: 'none',
},
""",
    
    "st.visible.default": """
visible: {
    display: 'flex',
},
""",
# ============================================
# 📦 5 TIPOS DE SHADOW MÁS USADOS
# ============================================

"st.shadow.default": """
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
""",

"st.shadow.light": """
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
""",

"st.shadow.medium": """
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
""",

"st.shadow.heavy": """
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
""",

"st.shadow.colored": """
    shadowColor: '#f4511e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
""",
# ============================================
# ANIMATIONS
# ============================================

"rn.animated.help":"""
// 📌 REGLA DE ORO:
// - Animaciones AUTOMÁTICAS (al abrir, al cambiar estado) → DENTRO de useEffect
// - Animaciones MANUALES (botones, gestos) → FUERA de useEffect

useEffect(() => {
    // Animaciones automáticas aquí
}, []);

const handler = () => {
    // Animaciones manuales aquí
};
""",

"rn.animated.Easing":"""
Easing.linear          // constante
Easing.ease            // suave al inicio y final
Easing.in(Easing.ease) // solo al inicio
Easing.out(Easing.ease)// solo al final
Easing.inOut(Easing.ease)// al inicio y final
Easing.bounce          // rebota al final
Easing.elastic(1)      // efecto elástico (1 = más elástico)
Easing.back(1.5)       // retrocede antes de avanzar
Easing.circle          // aceleración circular
Easing.quad            // cuadrática
Easing.cubic           // cúbica
Easing.sin             // sinusoidal
Easing.exp             // exponencial
""",

"rn.animated.timing":"""
Animated.timing(valor, {
  toValue: 1,           // ✅ Obligatorio: valor final
  duration: 300,        // ⚪ Opcional: duración en ms (default: 500)
  delay: 0,             // ⚪ Opcional: retraso antes de empezar (default: 0)
  easing: Easing.linear,// ⚪ Opcional: curva de aceleración (default: Easing.linear)
  useNativeDriver: true,// ⚪ Opcional: usar hilo nativo (default: false)
}).start();
""",

"rn.animated.spring":"""
Animated.spring(valor, {
  toValue: 1,           // ✅ Obligatorio: valor final
  friction: 5,          // ⚪ Opcional: resistencia (default: 7)
  tension: 40,          // ⚪ Opcional: fuerza (default: 40)
  speed: 12,            // ⚪ Opcional: velocidad (alternativa a friction/tension)
  bounciness: 8,        // ⚪ Opcional: rebote (alternativa a friction/tension)
  mass: 1,              // ⚪ Opcional: masa (default: 1)
  damping: 10,          // ⚪ Opcional: amortiguación (default: 10)
  stiffness: 100,       // ⚪ Opcional: rigidez (default: 100)
  overshootClamping: false, // ⚪ Opcional: evitar rebote excesivo
  restDisplacementThreshold: 0.01, // ⚪ Opcional: umbral de reposo
  restSpeedThreshold: 0.01, // ⚪ Opcional: velocidad de reposo
  useNativeDriver: true,// ⚪ Opcional: usar hilo nativo
}).start();
""",

"rn.animated.decay":"""
Animated.decay(valor, {
  velocity: 0.5,        // ✅ Obligatorio: velocidad inicial
  deceleration: 0.997,  // ⚪ Opcional: qué tan rápido frena (default: 0.997)
  useNativeDriver: true,// ⚪ Opcional: usar hilo nativo
}).start();
""",

"rn.animated.parallel":"""
Animated.parallel([
  Animated.timing(valor1, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.spring(valor2, { toValue: 0, friction: 5, useNativeDriver: true }),
]).start();
""",

"rn.animated.sequence":"""
Animated.sequence([
  Animated.timing(valor1, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(valor2, { toValue: 0, duration: 300, useNativeDriver: true }),
]).start();
""",

"rn.animated.stagger":"""
Animated.stagger(100, [
  Animated.timing(valor1, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(valor2, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.timing(valor3, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();
""",

"rn.animated.loop":"""
Animated.loop(
  Animated.sequence([
    Animated.timing(valor, { toValue: 1, duration: 300, useNativeDriver: true }),
    Animated.timing(valor, { toValue: 0, duration: 300, useNativeDriver: true }),
  ]),
  { iterations: -1 }  // -1 = infinito
).start();
""",

"rn.animated.interpolate":"""
valor.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 100],
  extrapolate: 'clamp',  // clamp, extend, identity
})
""",
# ============================================
# EJEMPLOS DE ANIMACIONES (dentro de useEffect)
# ============================================

"rn.animated.timing.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function TimingExample() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacity, padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>Aparezco en 1 segundo</Text>
    </Animated.View>
  );
}
""",

"rn.animated.spring.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function SpringExample() {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scale }], padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>¡Reboto al aparecer!</Text>
    </Animated.View>
  );
}
""",

"rn.animated.decay.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function DecayExample() {
  const translateX = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.decay(translateX, {
      velocity: 2,
      deceleration: 0.99,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX }], padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>Deslizo y me detengo</Text>
    </Animated.View>
  );
}
""",

"rn.animated.parallel.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function ParallelExample() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacity, transform: [{ translateY }], padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>Aparezco y subo al mismo tiempo</Text>
    </Animated.View>
  );
}
""",

"rn.animated.sequence.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function SequenceExample() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacity, padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>Parpadeo: aparece, desaparece, aparece</Text>
    </Animated.View>
  );
}
""",

"rn.animated.stagger.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function StaggerExample() {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(anims[0], { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(anims[1], { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View>
      <Animated.View style={{ opacity: anims[0], padding: 20, backgroundColor: '#f4511e', marginBottom: 10 }}>
        <Text style={{ color: '#fff' }}>Aparezco primero</Text>
      </Animated.View>
      <Animated.View style={{ opacity: anims[1], padding: 20, backgroundColor: '#f4511e' }}>
        <Text style={{ color: '#fff' }}>Aparezco después</Text>
      </Animated.View>
    </View>
  );
}
""",

"rn.animated.loop.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function LoopExample() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }], padding: 20, backgroundColor: '#f4511e' }}>
      <Text style={{ color: '#fff' }}>¡Pulso infinitamente!</Text>
    </Animated.View>
  );
}
""",

"rn.animated.interpolate.example":"""
import React, { useRef, useEffect } from 'react';
import { Animated, View, Text } from 'react-native';

export default function InterpolateExample() {
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrollY, { toValue: 100, duration: 2000, useNativeDriver: false }).start();
  }, []);

  const backgroundColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['#f4511e', '#2196f3'],
  });

  const size = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [50, 100],
  });

  return (
    <Animated.View style={{ backgroundColor, width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff' }}>{'Cambia'}</Text>
    </Animated.View>
  );
}
""",
}

