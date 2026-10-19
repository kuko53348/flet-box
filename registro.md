# registro.md — Auditoría y reparación de widgets de FletBox

> **Documento vivo de traspaso.** Si te quedas sin tokens, otra IA (o tú mismo más tarde)
> debe poder continuar leyendo **solo este fichero**. Actualízalo al cerrar cada ronda:
> mueve lo hecho a *CORREGIDOS*, ajusta *PENDIENTES* y añade una línea al *Historial*.

- **Repo:** `flet-box` (framework puro). El backend `flet-box-server` está **fuera de alcance** por decisión del autor.
- **Branch:** `refactory`
- **Estado:** `npm test` verde · `npm run test:browser` **470 OK / 0 fallos** (44 guards)
- **Commits:** las rondas 1–6 están commiteadas y subidas (`refactory` → `065a3c9`, v1.0.4).
  **La ronda 7 está sin commitear** (13 ficheros modificados + `scripts/check-router-base.mjs`);
  `flet-box-docs` también tiene los deep links sin commitear. Lo decide el autor.
- **Rondas completadas:** 7

---

## 1. Cómo continuar (lee esto primero)

```bash
cd flet-box
npm test                # 3 chequeos estáticos: contrato de widgets + acoplamiento de API
                        # + base path del Router (9 casos, sin navegador)
npm run test:browser    # suite real en Chrome headless (470 aserciones, 6 harnesses)
npm run test:browser regression   # un solo harness (filtro por substring del nombre)
npm run test:browser --verbose    # consola de la página + cada aserción fallida con detalle
node --check <fichero>  # valida sintaxis de un fichero suelto
```

`npm run test:browser` necesita puppeteer + Chrome. Los resuelve del entorno:
`$FLETBOX_PUPPETEER` o `../flet-box-server/node_modules/puppeteer`, y
`$FLETBOX_CHROME` o `/Applications/Google Chrome.app/...`. Si falta alguno **se omite**
con aviso (exit 0), no rompe nada.

### Reglas de proceso (obligatorias, han demostrado su valor)

1. **Verifica el bug ANTES de tocar el código.** Crea un probe temporal (ver §7) y
   reproduce el fallo con números. Media docena de "bugs" de los informes resultaron
   ser falsos positivos al medirlos.
2. **Verifica DESPUÉS** con la misma prueba y comprueba que no hay regresión.
3. **Añade un guard por cada bug arreglado** en `tests/regression.test.js`. Cada guard
   debe **fallar antes** del arreglo. Ya han cazado 2 errores míos.
4. **Cuidado con los tests que fijan bugs.** Si arreglas algo y un test se pone rojo,
   lee el test: puede estar codificando el comportamiento incorrecto (pasó con
   `Inspector`). Verifica la documentación antes de decidir quién tiene razón.
5. **Al medir `requestAnimationFrame`, compensa el ruido de fondo.** Headless Chrome
   limita los frames, así que para detectar bucles usa un stub
   `rAF → setTimeout` **y** `cancelAnimationFrame → clearTimeout` (si solo sustituyes
   uno, el resultado es un artefacto).
6. **No commitees.** El autor decide (`npm run release` es el único que sube versión).

---

## 2. Infraestructura construida (lo que antes no existía)

| Fichero | Qué hace |
|---|---|
| `scripts/run-browser-tests.mjs` | Runner headless: sirve el repo, lanza Chrome vía puppeteer, recoge el global de cada harness. **Opcional** (no añade dependencias). `npm run test:browser` |
| `tests/regression.html` + `tests/regression.test.js` | **44 guards** de regresión, uno por bug corregido. Publica `window.__REGRESSION`. Añade aquí cada arreglo nuevo |
| `scripts/check-router-base.mjs` | El deep-link fix de GitHub Pages (base path auto-detectado, `options.base`, hosting en raíz, ruta desconocida → `/`) **no tenía cobertura automatizada**: 9 casos en Node puro, sin navegador. Integrado en `npm test` |
| `scripts/check-api-surface.mjs` | Verifica que las 3 superficies coinciden (runtime / `index.js` / `index.d.ts`). Integrado en `npm test` |
| `src/tools/dimensions.js` (fix) | El paquete **no se podía importar en Node** (`window` en ámbito de módulo) → SSR/tests/tooling rotos |

Harnesses existentes que **ninguna CI ejecutaba**: `/tests/smoke.html` (51), `/tests/index.html`
(43, contrato del factory), `/tests/widget-contract.html` (95), `/tests/doccheck*.html` (237).

---

## 3. CORREGIDOS (36 bugs)

### 3.1 Motor — el más grave de todos

**[MOTOR-1] `update()` borraba TODOS los hijos de un widget compuesto.**
- Causa: `processProps.js:24` usa `null` como centinela de "sin texto" y
  `assignProps.js:113` comparaba `!== undefined`; `null` pasaba el filtro y
  `widget.textContent = null` elimina todos los nodos hijos.
- Evidencia: `card.bgColor = "red"` → `innerHTML` pasaba de 954 bytes a `""`;
  `row.gap = 8` → 2 hijos → **0**.
- Arreglo: `assignProps.js` → `props.textContent !== undefined && props.textContent !== null`.
- **Afectaba a casi todos los widgets** con hijos, disparado por cualquier setter reactivo.
- Toca `src/widget-factory/`, que el proyecto trata como congelado: **el contrato del
  factory (43 aserciones) sigue verde**.

### 3.2 Críticos

| ID | Bug | Evidencia |
|---|---|---|
| **[QR-1]** | `QRCode` **no codificaba ningún dato**: `finalBits` quedaba vacío porque `pushBits` escribía en `bits` | 3 payloads daban matrices **idénticas**; ahora difieren. Además: conteo de 16 bits para versión ≥10 |
| **[SLIDER-1]** | `Slider` con `min === max` + `showMarks` → `i += 0` infinito, **cuelga la pestaña** | guarda `if (!(stepMark > 0)) return [currentMin]` |
| **[MD-XSS]** | `Markdown`: sanitizer con bypass. `/<[^<>]+>/g` corta en el primer `>`, incluso dentro de comillas → `<img src="x>y" onerror=...>` pasaba intacto | 5 clases de payload (comillas+`>`, `onerror`, `svg onload`, `javascript:`, `<script>`) ahora limpias |
| **[INPUT-1]** | `Input`: `input.label = "X"` **destruía el widget** (`label` es REACTIVE_PROP → `textContent`) | `innerHTML` 954 → **11 bytes** y `<input>` desaparecido. Ahora intacto |
| **[DT-1]** | `DataTable.updateColumns()` **vaciaba todas las filas** | `updateData(rows)` vaciaba el mismo array que luego esparcía. Ahora conserva 1 fila |
| **[DT-2]** | `DataTable.updateData()` 2ª llamada → `NotFoundError` (`tbody` era `const`) | ahora 2 updates OK |
| **[LV-1]** | `ListView.updateData()` → `RangeError` por recursión infinita (el setter de `data` llamaba a `updateData`, que asignaba `element.data`) | afectaba también a `GridView` |

### 3.3 Altos

| ID | Bug | Verificación |
|---|---|---|
| **[NAV-1..4]** | `AppBar`, `Tabs`, `DrawerItem`, `BottomNavigation`: sus recursos solo se liberaban en `_cleanup`, que el observer de lifecycle **nunca llama** | medido: 3 AppBars + 3 Tabs → `scroll`/`resize` **0 → 3 → 0** |
| **[SB-1]** | `SnackBar`: `close()` no idempotente → `onClose` N veces | 3 cierres → `onClose` **1** vez |
| **[SB-2]** | `SnackBar`: cerrar al instante → el rAF de `show()` lo hacía **parpadear visible** 300 ms | opacidad se queda en `"0"` |
| **[MR-1]** | `MatrixRain`: el bucle rAF **nunca paraba** al quitar el canvas del DOM (canvas crudo, sin `onUnmount`) | 210 frames/200 ms tras desmontar → ahora 4 (= ruido), y **sigue animando al montar** (30) |
| **[MR-2]** | `MatrixRain` modo `absolute`: `ResizeObserver` creado antes de montar → `observe()` nunca llamado y el lazy attach quedaba desactivado | observer creado y adjuntado al aparecer el padre; se re-adjunta si cambia |
| **[AB-1]** | `AnimatedBox`: un `<style>` **permanente por llamada** (`Date.now()` anulaba el dedupe); `AnimatedText` llama una vez **por letra** | 5 llamadas → **1** `<style>` (antes 5); 11 letras → 0 nuevos |
| **[AB-2]** | `AnimatedBox`: descriptor sin `from`/`to` → `TypeError` que **tumbaba el render entero** | avisa y salta el paso |
| **[TABS-1]** | `Tabs`: el panel de la pestaña activa inicial **nunca se montaba** | `updateContent()` en construcción (tras su definición, por TDZ) |
| **[FORM-1]** | `Checkbox`/`Switch`/`Radio`: cualquier `update()` **borraba el `onclick`** (`assignProps` hace `widget.onclick = null` y solo re-aplica handlers que vengan por props) | los 3 siguen respondiendo tras `update()` y tras setter reactivo |
| **[CHART-1]** | `Chart`: `Math.max(0, minVal)` invertía el rango con datos negativos → **todo dibujado fuera del canvas** | 0 píxeles → **28.870** (positivos: 34.669) |
| **[CC-1]** | `CircularChart`: el primer frame rAF no se trackeaba → el bucle sobrevivía al desmontaje y `startAnimation()` podía lanzar dos bucles | `animationId = requestAnimationFrame(...)` |
| **[IMG-1]** | `Image`: `fit` y `circular` documentados pero **muertos** (no están en la base de props → `style.fit` inerte); rompía también los `Avatar` con imagen no cuadrada | `object-fit: cover`, `border-radius: 50%` |
| **[MD-1]** | `Markdown.text` (REACTIVE_PROP → `textContent`) **destruía el render** | ahora re-renderiza: `<h1>Adios</h1>` |
| **[CV-1]** | `CodeViewer.title` (idem) destruía header + código | header actualizado, `innerHTML` 739 → 739 |
| **[AT-1]** | `AnimatedText`: leía `child._props`, que **nadie asigna nunca** → la herencia de estilos por letra documentada **nunca ocurría** | letras a `48px` y `rgb(255,0,0)` |
| **[INSP-1]** | `Inspector`: mismo `_props` inexistente → **no imprimía ni una prop**; además descartaba `child` cuando es un **array** (como lo usa `Button`) | antes `Span()`; ahora `Span({ text: 'Hello', ... })` |
| **[DRAWER-1]** | `Drawer.destroy()` **no se llamaba nunca**: `Scaffold` solo hacía `removeChild` del wrapper → el listener de resize del viewport, el handler de Escape y el timer de cierre sobrevivían, y `document.body` crecía en cada rebuild | medido: 3 Scaffold+Drawer → `body` 8→14→**8**, listeners de `dimensions` 0→**3**→**0** |
| **[DD-1]** | `Dropdown`: listener de `scroll` registrado con capture y borrado sin capture → **fuga por cada apertura** | 3 ciclos → 0→1→0, sin acumular |
| **[MODAL-1]** | `Modal`/`BottomSheet`: el timer que oculta tras la animación de cierre no se guardaba ni se cancelaba → reabrir dentro de la ventana de animación dejaba un **modal abierto pero invisible** | `close(); wait(100); open(); wait(350)` → `visibility` sigue `"visible"` |
| **[MODAL-2]** | `Modal`/`BottomSheet`: el listener `keydown` de `document` solo se quitaba en `close()`/`destroy()` → sobrevivía al desmontaje | registrado también vía `overlay.onUnmount(...)`, que además limpia el timer |
| **[ANIM-NAN]** | `animate.js`: `from: undefined` (API documentada) leía `""` → escribía `"NaN"` cada frame → **no animaba y no avisaba** | ahora escribe valores válidos (`opacity` acaba en `"1"`) |
| **[ANIM-DUR]** | `animate.js`: `duration` negativa → `progress` siempre < 1 → **bucle infinito** (y `animateAsync` nunca resolvía) | duración saneada; acotado a ~5 frames (antes infinito) y la promesa resuelve |
| **[AUDIO-1]** | `Audio`: el timer de respaldo de 2 s no se guardaba → tras el desmontaje hacía `fetch` del fichero completo + `AudioContext` + `onLoad` sobre un widget descartado (**una vez por cada rebuild**) | filtrado por URL: 0 fetch y 0 `AudioContext` atribuibles tras desmontar y esperar 2,4 s |
| **[AUDIO-2]** | `Audio`: `AudioContext.close()` solo en la rama de éxito → si fallaba el decode se filtraba el contexto (límite ~6 por página; los siguientes ya no arrancan) | `try { decode } finally { close() }` |
| **[PARALLAX-1]** | `ParallaxBox`: listener de `window scroll` + timers solo en el `_cleanup` parcheado, que el observer nunca llama | 0 → 3 al crear → **0** tras desmontaje por DOM plano |

### 3.4 Ronda 7 — los 4 altos de ciclos y reactividad (eram §4.1)

| ID | Bug | Verificación (guard en `tests/regression.test.js`) |
|---|---|---|
| **[ANIM-1]** | `animate.js`: bucles **incancelables**; dos animaciones sobre la misma prop se pisaban (la vieja reanudaba después de que la nueva terminara) y `pulse()` dejaba un `setTimeout` que lanzaba la 2ª fase sobre un widget **ya retirado** | registry `WeakMap<widget, Map<prop, loopState>>`; la nueva reemplaza a la vieja; `animate`/`fadeIn`/`fadeOut`/`pulse` devuelven función cancel; **`stopAnimation(widget, prop?)`** (nueva API, 3 superficies + `docs/tools/animation.md`); `pulse` es **un solo bucle** con curva triangular (sin timer); `animateAsync` resuelve también al cancelarse → ningún `await` queda colgado. Guards: `opacity` congelada tras `cancel()` y tras `stopAnimation`; la segunda animación gana (antes acababa en **1**, no en **0**); pulse no escala 260 ms después de cancelar |
| **[LV-2]** | `ListView`: rAF de scroll y de montaje **sin cancelar** (`onEndReached` se disparaba sobre un list desmontado → en scroll infinito, bucle de `fetch` sin fin); la altura del header estaba **contada dos veces** | `getItemTop` ya no suma el header (es HERMANO de `innerContainer`, no vive dentro) → fila 0 en `top: 0px` (antes `50px`) y `inner.height` = 20×40 = **800px** (antes **850px**: la lista se deslizaba un header + un footer de más). La ventana se calcula en espacio de items (`scrollTop − headerHeight`) y `scrollToIndex` vuelve a sumarlo. ids guardados + `cancelAnimationFrame` + flag `disposed` en `onUnmount`. **`ResizeObserver`** (fallback: `window resize`) re-renderiza al crecer el viewport. Guards: `onEndReached` **0** veces tras desmontar; geometría 800px/0px; filas **8 → 25** al pasar de 60px a 400px (antes se quedaba en 8) |
| **[SLIDER-2]** | `Slider`: `updateThumbPosition` se re-armaba con rAF **mientras el track midiera 0** — desmontado o nunca insertado, el bucle era de por vida | `thumbRaf` + `disposed` + `initTimer`, una sola cola pendiente por slider, todo cancelado en `onUnmount`. Guard con ventanas de igual duración (180 ms): bucle vivo ≈ 2× el ruido de fondo, y **0** frames atribuibles tras desmontar |
| **[STEPPER-1]** | `Stepper`: `showNavigation` declarado, tipado y documentado pero **nunca leído** → la navegación se renderizaba siempre | el contenedor de nav solo se construye si `showNavigation`; `updateUI()` ya se salta la rama cuando es `null`. Guard: sin nav → **2** secciones y ni "Next" ni "Back"; por defecto "Next" sigue presente |

### 3.5 `useState` / `reactiveValue` — auditoría y endurecimiento

Lo que **ya estaba bien** (verificado leyendo el flujo completo): un único dispatcher de RamStore
(O(1) por clave en vez de O(claves) por cambio), registro en dos niveles `clave → widget → props`
(idempotente, O(1) con 1.600 widgets), liberación por `onUnmount`, valor vivo con
`valueOf`/`toString`/`_value` para que `${count}` y `count + 1` funcionen, y las lecturas
estructurales acotadas a la pasada de render. **No hay import circular**: `reactiveValue.js`
no importa nada.

Defectos encontrados y corregidos:

1. **Claves estructurales pegajosas** (`reactiveValue.js`). El `Set` de claves leídas
   estructuralmente solo se vaciaba en `cleanupUseState`, así que **una** lectura en un template
   literal condenaba esa clave a rehacer toda la app **para siempre**, aunque después se pasara
   solo por props: la reactividad quirúrgica se apagaba sola y sin avisar. Ahora cada pasada abre
   su propio conjunto y `endRenderPass` lo publica (la pasada anterior vuelve a detectarlo todo).
   Guard: `useState: a key stops forcing full renders…` → con la clave ya solo en props:
   **0** rebuilds y el nodo se actualiza a `7` en el mismo elemento.
2. **`resolving` no era reentrante**: `resolveReactive` lo ponía a `false` en el `finally`, así que
   un valor reactivo que lee otro reactivo desmarcaba la lectura exterior y se contaba como
   estructural (rebuild gratis para el framework, coste para la app). Ahora guarda y restaura.
3. **`setState` comparaba contra el valor capturado** cuando corrió `useState`, no contra el store:
   si un `saveState` externo ya había movido la clave al valor que se quería poner, el setter
   **se saltaba el dispatch** y store, widgets y callbacks quedaban en desacuerdo. Ahora lee
   `getRam(key)` (y el updater `prev => …` recibe el valor actual, no el viejo).
   Guard: store 1 → 2 (externo) → `setN(1)` = **2** notificaciones y store en **1** (antes: 1 y seguía en 2).
4. **Fuga de registro**: la entrada de `widgetsByKey` sobrevivía cuando se liberaba el último widget.
   Ahora se borra la clave al quedar vacía.
5. **Código muerto o contradictorio**: fuera `unregisterWidget` (0 call sites y semántica errónea —
   borraba todas las props del widget); fuera el parche de `_cleanup` en `registerWidget`, que el
   propio comentario del fichero dice que el observer de lifecycle **nunca** llama (y es verdad:
   `addLifecycle` corre antes de `bindReactiveProps`, así que `onUnmount` siempre existe);
   `getUseStateStats()` informaba `widgetsCount` = número de **claves** (ahora `stateKeys` /
   `boundWidgets` / `watchers`); `subscribe` y `useWatchState` devolvían el `true/false` de
   `Set.delete` como si fuera el resultado del unsubscribe.

### 3.6 Tests corregidos (fijaban bugs)

- **`tests/doccheck-ch4.js`**: dos aserciones hardcodeaban el color del **tema claro**;
  en un Mac en modo oscuro fallaban. Ahora usan `rgbOf(colors.*)` como el resto del fichero.
- **`tests/doccheck-ch6.js`**: 3 aserciones de `Inspector` exigían `Span()` **sin props**
  (`eq(out, "Span()")`), justo lo contrario de lo que promete su documentación. Actualizadas
  a `Span({` + presencia de props.

---

## 4. PENDIENTES (priorizados, con evidencia ya recogida)

### 4.1 Altos — siguiente ronda

Los 4 altos de la ronda 7 (`[ANIM-1]`, `[LV-2]`, `[SLIDER-2]`, `[STEPPER-1]`) ya están
corregidos y con guard → ver **§3.4**. Promovidos desde §4.2 para la próxima ronda:

| ID | Bug | Dónde | Arreglo sugerido |
|---|---|---|---|
| **[LIST-1]** | `Accordion`: timers de animación (~310 ms) sin limpiar → `onPress`/`onToggle` se disparan **tras** el desmontaje; además `update({expanded})` es **no-op** (la API pública no puede colapsar un panel) | `Accordion.js:288-298, 318-329, 467-533` | guardar el id y cancelarlo en `onUnmount`; implementar `expanded` en `update()` (misma ruta que el toggle interno) |
| **[CAROUSEL-1]** | `Carousel`: el `setInterval` de autoplay arranca en **construcción**; si el widget nunca se monta, el orphan-prune de lifecycle lo retira del registro **sin** ejecutar unmount → el timer corre para siempre | `Carousel.js:281-285` | arrancarlo desde `onMount` y pararlo en `onUnmount` (patrón ya usado en `MatrixRain`) |
| **[INPUT-2]** | `Input`: `validation="safe"` **escapa el propio texto** del usuario (`a=b` → `a&#x3D;b`); la UI de validación inicial nunca se renderiza; `clearable`, `passwordToggle` y `onEnter` documentados y **sin implementar** | `Input.js:189-205, 216` | validar sin HTML-escapear el `value`, pintar el estado inicial en construcción, e implementar (o documentar como no-existentes) los 3 props muertos |
| **[MAX0-1]** | `ProgressBar` con `max:0` → `NaN%`; `CircularBar` con `max:0` pinta literalmente `"Infinity"` en el canvas | `ProgressBar.js:28`, `CircularBar.js:118-122,186,236,254` | guarda `max > 0 ? … : 0` compartida; un solo guard cubre ambos |

### 4.2 Medios

(List-1 / CAROUSEL-1 / INPUT-2 / MAX0-1 promovidos a §4.1)

- **[DROPBOX-1]** `DroppBox`: `activeBgColor`/`activeBorderColor` **muertos**; `invalidBgColor`/`invalidBorderColor` **inalcanzables** (`isValidDrag()` protege el único call site) (`DroppBox.js:28-29,105-113,139`).
- **[DRAGBOX-1]** `DraggBox`: el clon de arrastre se añade a `document.body` y solo se quita en su propio `dragend` → si el widget se desmonta en medio de un drag, queda huérfano (`DraggBox.js:43-59,94-110`).
- **[INSTALL-1]** `InstallButton`: `onPress` documentado **anula el instalador** (`...rest` se esparce después de `onPress: handleClick`); `onInstalled` se dispara **dos veces** en Chromium; un `beforeinstallprompt` anterior al montaje es **irrecuperable** (usa su propio `deferredPrompt` en vez del compartido de `src/core/pwa.js`).
- **[SLIDER-3]** `Slider`: el snapping ignora `min` (`Math.round(raw/step)*step` en vez de relativo a `min`, `Slider.js:360`); casi todas las props propias salvo min/max/step/value se las traga `update()` (`Slider.js:15-22 vs 459-481`).
- **[DROPDOWN-2]** `Dropdown`: `width`/`portal` aceptados pero ignorados por `update()`; `clearable` solo se evalúa en construcción; `onChange` nunca recibe el 2º argumento `label` documentado (`Dropdown.js:352`).
- **[TEXT-1]** `Text`: `italic` y `decoration` documentados e **ignorados**; `styles: null` → `TypeError` durante el render (`Text.js:19-32,62`).
- **[CONTAINER-1]** `Container`: `expand` documentado e **ignorado** (`Container.js:9-17`).
- **[STACK-1]** `Stack`: `alignment` documentado e **ignorado** (`Stack.js:8-17`).
- **[DIVIDER-1]** `Divider`: los márgenes por lado se los come el `margin = 16` por defecto (prioridad invertida, `Divider.js:32-44`); el color por defecto es `colors.surface` → **un Divider por defecto es invisible** (`Divider.js:10`).
- **[ICON-1]** `Icon`: un `className` del usuario **sustituye** `material-icons` y el glifo se rompe (`Icon.js:21,29`).
- **[CARD-1]** `Card`: `elevation` escribe `box-shadow: 4px` (inválido) → **sin sombra** (`Card.js:11,27`).
- **[AVATAR-1]** `Avatar`: `updateContent()` hace cirugía manual del DOM → el contenido **revierte** en el siguiente update; geometría obsoleta/NaN al cambiar `size` (`Avatar.js:147-205,53,154-162`); listeners de hover anónimos sin `onUnmount` (`Avatar.js:128-133`).
- **[CHART-2]** `Chart`: `showValues` ignorado en barras si no hay `labels`; `data: []` devuelve `null` → `updateData()` revienta; sin `devicePixelRatio` (borroso en HiDPI).
- **[CC-2]** `CircularChart`: porcentaje de etiqueta divide por el ángulo del sector en vez del total (`CircularChart.js:274-277`); `strokeWidth` ignorado sin `size`; semicírculo a la mitad del radio; `shadowBlur`/`shadowColor`/`glowColor` muertos.
- **[QR-2]** `QRCode`: patrones de alineación que caen sobre la fila/columna de timing se saltan → corrompe versiones 7–10 (`QRCode.js:208-211`); sin `devicePixelRatio`; `setTimeout` fuera de `onUnmount`.
- **[MODAL-3]** `Modal`: `closeOnOverlayClick` documentado y **muerto** (handler comentado); `setLoading(false)` restaura el contenido de construcción y descarta `updateContent()`.
- **[BOTTOMSHEET-1]** `BottomSheet`: `closeOnOverlayClick` muerto; `...rest` no se reenvía (props extra descartadas); `touchmove` sin `{passive:false}`.
- **[SHEET-2]** `BottomSheet`: `mousemove` comentado → el arrastre con ratón está muerto.
- **[BODY-1]** `Badge`: la suscripción al tema es **inalcanzable** (`if (!bgColor && !color)` con defaults ya aplicados) → un cambio de tema deja el color viejo (`Badge.js:137-141`).
- **[ADS-1]** `AdMob`/`AdSense`: `label: null` → `TypeError` en el render (`AdSense.js:177,189`, `AdMob.js:189,196`); el latch `disposed` es de una sola dirección → cualquier desmontaje transitorio **mata el slot para siempre**; `AdMob.initPromise` es global y **no está keyed por plugin**; `dispose()` ignora el fallback `hideBanner` y no quita el banner nativo si `autoInitialize` se apagó.
- **[SCAFFOLD-1]** `Scaffold._cleanup` no hace el `registeredWidgets.delete` que sí hace lifecycle → un scaffold re-adjuntado antes del prune queda registrado y desconectado.
- **[PAGINATION-1]** `Pagination`: `pageSize: 0` → `totalPages = Infinity` (botón "Infinity"); `maxButtons: 0` → botón suelto.
- **[RATING-1]** (sospechoso) `Rating` no usa `composeUpdate`: `rating.update({value})` deja las estrellas obsoletas mientras `rating.value = 4` sí funciona — los dos caminos públicos discrepan.

### 4.3 Bajos

`ListView.onEndReached` sin guarda de re-armado (dispara en cada scroll cerca del final) ·
`ListView.finalHeight` calculado y nunca usado · `TreeView` llama a `ref` dos veces (codificado
en un test) · `Inspector` escapa `'` pero no `\` en valores de objeto · `Inspector` da prioridad a
`TAG_NAMES` sobre `_widgetName` (`Inspector(Chart(...))` imprime `Div`) · `CodeViewer.syncScroll`
es código muerto · `CodeViewer` `padding/2` → `NaNpx` con `padding` string · `Markdown` deja pasar
`<style>`/`<iframe>`/`<svg>` · `Chart` serie de 1 punto no dibuja nada · `CircularChart` docs dicen
`startAngle` en grados pero el código usa radianes · `QRCode` devuelve `null` sin `value` (viola la
regla 3 del contrato) · `prefers-reduced-motion` no soportado en animaciones.

---

## 5. IMPLEMENTADO — reactividad quirúrgica con sintaxis React

**Petición del autor:** conservar `const [color, setColor] = useState("color", "red")` +
`Container({ bgColor: color })` y que `setColor("blue")` actualice **solo ese widget**.
(Estaba a medias: las docs prometían *"Update one widget without touching the app"* pero el
código rebuildaba siempre.)

### Qué se hizo (5 ficheros)

1. **Nuevo `src/widget-factory/reactiveValue.js`** — el protocolo compartido:
   `isReactive`, `reactiveKeyOf`, `resolveReactive` y `createReactiveValue`.
2. **`useState` devuelve un valor VIVO** (`createReactiveValue(() => getRam(key), key)`): es
   una **función** (así `resolveReactive` la llama y siempre lee el valor actual) decorada con
   `valueOf`/`toString` (para `${count}` y aritmética) y un getter `_value` (compatibilidad).
   **La firma `[valor, setState, subscribe]` no cambia.**
3. **`widgetFactory` registra el vínculo automáticamente** (`bindReactiveProps`): si una prop
   es un valor reactivo con `_stateKey`, llama a `registerWidget(key, widget, prop)`.
   Se hace al construir y en cada `update()` (solo con las claves entrantes).
4. **El suscriptor de RamStore ya no rebuilda cuando hay vínculo**:
   ```js
   const bound = widgetsByKey.get(key);
   let handled = 0;
   if (bound) bound.forEach(({widget, propName}) => { widget.update({[propName]: newValue}); handled++; });
   if (handled === 0) triggerRender();   // ← solo si NADIE está ligado
   ```
   Regla clave: **si no hay widget ligado, se rebuilda (camino declarativo intacto); si lo
   hay, se parchea y no se rebuilda.**
5. **`registerWidget` libera con `onUnmount`** (no con el monkey-patch de `_cleanup`, que el
   observer nunca llama → fugaba) y es idempotente (no apila duplicados al reconstruir).
6. **`processProps` resuelve el valor reactivo una vez** antes de aplicar la unidad: así
   `width: count` recibe un **número** y obtiene su `rem`/`px` (antes el objeto/función
   llegaba a CSS y se descartaba).

### Verificación (medida)

| Caso | Resultado |
|---|---|
| `Container({ bgColor: color })` + `setColor("blue")` | bg rojo → **azul**, **0 rebuilds**, **mismo nodo** ✅ |
| `Container({ width: n })` + `setN(50)` | `3.125rem` (=50px) y **0 rebuilds** ✅ |
| Derivado: `Text({ text: "N=" + n })` | **sí rebuilda** y muestra `N=1` ✅ |
| Condicional: `n > 2 ? Text("MUCHO") : null` | **sí rebuilda** y aparece `MUCHO` ✅ |
| Forma de 4 argumentos `useState(k, v, widget, p)` | sigue funcionando ✅ |
| Desmontar el widget y cambiar la clave | el nodo desconectado **ya no se actualiza** ✅ |
| `npm test` + suite | **470 OK / 0 fallos** (44 guards; los 8 guards de la ronda 7 incluyen los 2 nuevos de `useState` de §3.5) |

Guards nuevos en `tests/regression.test.js`: quirúrgico (0 rebuilds + mismo nodo) · derivado
sigue rebuildando · el desmontaje libera el vínculo.

### Rendimiento (medido, no estimado)

**Ganancia del camino quirúrgico** — árbol de 402 widgets:

| | Coste por cambio de estado |
|---|---|
| Rebuild (derivado, camino actual) | **8,7 ms** de reconstrucción del árbol (+ teardown y reflow del DOM, no medidos) |
| Quirúrgico (vínculo directo) | **~0,9 µs** (un `widget.update()`: 8,6 ms / 10.000 = 0,86 µs) |
| **Diferencia** | **~10.000× menos trabajo**, y el DOM no se toca (sin teardown, sin 127 `defineProperty` por widget) |

**Coste añadido por la implementación** — despreciable:
- Construir 1.000 widgets: **16,9 ms** (~0,017 ms/widget). El escaneo extra de props (`bindReactiveProps`) + `resolveReactive` por prop ya están incluidos, y el número es el mismo que antes dentro del ruido.

**Dos problemas de escalado que la medición destapó — y que se arreglaron:**

1. **`RamStore` notificaba a TODOS los suscriptores en cada `saveRam`** (`subscribers` es un array plano) y `useState` añadía **uno por clave que nunca se liberaba**. Resultado: **cada cambio de estado costaba O(número de claves)**.

   | Claves | Antes (µs/`saveRam`) | Ahora |
   |---|---|---|
   | 0–100 | 0,5 → 1,0 | **0,33** |
   | 600 | 2,5 | **0,33** |
   | 2.100 | 9,0 | **0** |
   | 5.100 | **19,5** (y creciendo) | **0** |

   *Esto era pre-existente y afectaba a cualquier app con muchas claves.* Arreglo: **un único dispatcher** en `useState` que indexa por clave, en vez de un suscriptor de RamStore por clave.

2. **`registerWidget` deduplicaba con `[...bound].some(...)`** → O(n) por registro → **O(N²)** al ligar N widgets a la misma clave. *Este lo introduje yo.*

   | Widgets a la misma clave | Antes | Ahora |
   |---|---|---|
   | 400 | — | 6,4 ms |
   | 1.600 | ~44 ms | 32,8 ms |
   | 3.200 | (no terminaba) | 58,6 ms |
   | ratio 3200/400 | ~cuadrático | **9,2** (lineal ≈ 8) |

   Arreglo: `widgetsByKey` con dos niveles (`clave → widget → Set<prop>`) → búsqueda O(1).

3. **🔴 Prop desconocida = ~400× más lenta, en CADA `update()`** *(encontrado al comparar `widget.prop` con `useState`)*

   Medía un widget con varias props y saltó un acantilado: 11 props → 3,7 µs; **31 props → 1.212 µs**.

   **Causa raíz:** `warnUnknownProp` (`src/widget-factory/warnings.js`) **no tenía deduplicación**.
   En cada prop no registrada hacía `getCallLocation()` → `new Error().stack` + recorrer los ~60
   patrones de una lista de exclusión + **~8 `console.log` con CSS**. Y como `update()` **re-aplica
   TODAS las props originales** (no solo la cambiada), un widget con **una** prop desconocida pagaba
   ese coste en **cada `update()`, durante toda su vida**.

   **Las 9 props que lo disparaban** (todas CSS legítimas que simplemente no están en la base de
   datos): `columnGap`, `rowGap`, `textIndent`, `wordSpacing`, `outlineWidth`, `borderTopWidth`,
   `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`.

   | Medición (µs por `update()`) | Antes | Ahora |
   |---|---|---|
   | Widget con 1 prop desconocida (`columnGap`) | **132** | **2,2** |
   | Widget de 31 props (9 desconocidas) | **1.212** | **12,3** |
   | `processProps` con prop desconocida | **136,9** | ~0,3 |
   | Prop conocida (referencia) | 1,5 | 1,5 |
   | DOM crudo (`el.style.columnGap`) | 0,07 | 0,07 |

   **Mejora: ~99× en el widget de 31 props.** Arreglo: un `Set` de props ya avisadas →
   `if (warnedProps.has(propName)) return;` (ídem `warnDeprecatedProp`). Guard: espía de
   `console.group` (funcional, no de tiempos).

   **Observación pendiente (no arreglada):** `IS_DEV` es
   `typeof FLETBOX_DEV !== 'undefined' ? FLETBOX_DEV : true` → **por defecto `true`**, así que las
   apps en producción siguen pagando los warnings. Convendría invertir el valor por defecto.

**Comparativa de los tres caminos de escritura** (µs/op, estables y sin fuga al repetir 54.000 veces):

| Camino | µs/op |
|---|---|
| `widget.update({...})` directo | **1,15 – 1,47** |
| `useState` ligado (quirúrgico) | 1,77 |
| `widget.prop = value` (accessor) | 1,4 – 2,1 |

Los tres son el **mismo orden de magnitud**, y `widget.prop = value` es el **más lento** porque
escribe la prop dos veces (`_originalProps` y otra vez vía `update()`). **Elegir entre ellos no es
una decisión de rendimiento.**

### 🐛 BUG INTRODUCIDO Y ARREGLADO — el caso mixto

**Síntoma:** con la MISMA clave usada a la vez **directa** (prop) y **estructuralmente**
(condicional/plantilla), el widget directo se actualizaba pero el derivado **no**:

```js
const [n, setN] = useState("mix", 0);
Column({ children: [
  Text({ text: n }),                                // ← directo (se parcheaba)
  n.valueOf() > 2 ? Text({ text: "MUCHO" }) : null, // ← estructural (NO se reevaluaba)
]});
setN(3);   // → "3" pero SIN "MUCHO"  🔴
```

**Causa:** la primera versión saltaba el rebuild con solo `if (handled === 0)`. Si había
cualquier widget ligado no se rebuildaba, y entonces lo que el componente **calcula** quedaba
obsoleto. *Lo destapó una pregunta del autor sobre cuándo usar cada estilo.*

**Arreglo (detección de lectura estructural):** distinguir **quién lee** el valor:

| Quién lee | Cómo se detecta | ¿Necesita rebuild? |
|---|---|---|
| El **factory** (rellenar una prop) | `resolveReactive` pone `resolving = true` alrededor de la llamada | No → quirúrgico |
| El **componente** (plantilla, condicional, lista) | la lectura ocurre dentro del *render pass* del componente | **Sí** |
| Un **handler** (`onPress`) o un timer | fuera del *render pass* | No → sigue quirúrgico |

`createReactiveValue` avisa por `setImperativeReadListener` cuando lo lee el componente durante el
render; `useState` guarda esas claves en `imperativeKeys` y el dispatcher hace
`if (handled === 0 || imperativeKeys.has(key)) triggerRender();`.
`runApp` envuelve la llamada a `App()` en `beginRenderPass()` / `endRenderPass()`.

**Verificado:** mixto → renders 1→2 con `3MUCHO` ✅ · vínculo puro → **0 rebuilds**, mismo nodo ✅ ·
lectura en un handler → **0 rebuilds** ✅. Dos guards nuevos (**459 OK**).

### Lo que esto habilita

---

- El **camino dirigido pasa a ser persistente**: nadie destruye el nodo, así que
  `widget.prop = x` sobrevive a los rebuilds que ocurran por otras claves.
- La tabla de `docs/tools/reactivity.md` §10 ya dice la verdad (antes prometía algo que el
  código no hacía).
- **Pendiente (Nivel 2):** los casos derivados/condicionales/listas siguen reconstruyendo el
  árbol. El siguiente paso es **reutilizar elementos por firma de forma** — que no es un
  virtual DOM — para que ese rebuild también sea barato.

---

## 6. ¿Todos los widgets siguen el mismo patrón? — **No.** (medido sobre 65 ficheros)

| Regla del contrato | Cumplen |
|---|---|
| `WidgetFactory` como raíz | **51/65** |
| `widgetName` declarado | 46/65 |
| **`composeUpdate` (el patrón correcto para props propias)** | **8/65** |
| Sobrescriben `update` directamente | 0/65 ✅ (lo vigila el checker) |
| **Monkey-patchean `_cleanup`** (prohibido por el contrato) | **7/65** |
| Registran `onUnmount` | 22/65 |
| Declaran `*_PROP_KEYS` | 5/65 |
| `@file` header | 50/65 |
| `export default` | 64/65 |

**Hay tres niveles de facto:**

1. **Canónicos (17)** — factory + `widgetName` + `onUnmount` + `@file`: `Accordion`, `AdMob`,
   `AdSense`, `Audio`, `Badge`, `Carousel`, `Chart`, `CircularBar`, `CircularChart`, `CodeViewer`,
   `Dropdown`, `ListTile`, `ListView`, `Markdown`, `Rating`, `Slider`, `Tooltip`.
2. **Factory pero ad-hoc** — el resto: usan `WidgetFactory` pero sin `composeUpdate` ni
   `onUnmount`, o con `_cleanup` parcheado. Aquí viven la mayoría de los bugs de estado/fuga.
3. **DOM crudo / a medida (14)** — **no** usan el factory como raíz: `AlertDialog`,
   `FloatingActionButton`, `GridView`, `Inspector`, `InstallButton`, `Pagination`,
   `AdaptiveScaffold`, `Drawer`, `DrawerItem`, `Router`, `AnimatedBox`, `AnimatedText`,
   `MatrixRain`, `animate.js` (y es el único sin `export default`).

**Consecuencias prácticas:**

- El **checker estático solo escanea `src/widgets/`**, así que `src/navigations/` y
  `src/animations/` **escapan** a las 8 reglas (por eso sus 7 `_cleanup` parcheados y sus fugas
  no aparecían en el "0 deuda técnica").
- `composeUpdate` existe justo para el problema que causó los bugs de `Input.label`,
  `Markdown.text` y `CodeViewer.title`, y solo lo usa el **12 %** de los ficheros.
- La regla "`_cleanup` es el único hook de limpieza" **no es cierta en la práctica**: el
  observer de lifecycle nunca lo llama, así que cualquier recurso liberado solo ahí **fuga**.
  Los arreglos `[NAV-1..4]` siguen exactamente ese patrón.

**Recomendación para una futura ronda de refactor** (no urgente): ampliar
`scripts/check-widgets.mjs` a `navigations/` y `animations/`, y migrar los widgets del nivel 2 al
nivel 1 (`composeUpdate` + `onUnmount`), que es donde están los bugs que quedan.

---

## 7. Ficheros tocados hasta ahora

```
M  src/widget-factory/assignProps.js     [MOTOR-1]
M  src/tools/dimensions.js               import en Node
M  src/utils/getWidgetProps.js           [INSP-1] lee _originalProps
M  src/widgets/Accordion.js              icono (setAttribute → textContent)
M  src/widgets/Chart.js                  [CHART-1]
M  src/widgets/Checkbox.js               [FORM-1]
M  src/widgets/CircularChart.js          [CC-1]
M  src/widgets/CodeViewer.js             [CV-1]
M  src/widgets/DataTable.js              [DT-1][DT-2]
M  src/widgets/Dropdown.js               [DD-1]
M  src/widgets/Image.js                  [IMG-1]
M  src/widgets/Input.js                  [INPUT-1]
M  src/widgets/Inspector.js              [INSP-1] child array
M  src/widgets/ListView.js               [LV-1]
M  src/widgets/Markdown.js               [MD-XSS][MD-1]
M  src/widgets/QRCode.js                 [QR-1]
M  src/widgets/Radio.js                  [FORM-1]
M  src/widgets/Slider.js                 [SLIDER-1]
M  src/widgets/SnackBar.js               [SB-1][SB-2]
M  src/widgets/Switch.js                 [FORM-1]
M  src/widgets/TreeView.js               updateNodes conserva selección
M  src/navigations/AppBar.js             [NAV-1]
M  src/navigations/BottomNavigation.js   [NAV-4]
M  src/navigations/DrawerItem.js         [NAV-3]
M  src/navigations/Tabs.js               [TABS-1][NAV-2]
M  src/animations/AnimatedBox.js         [AB-1][AB-2]
M  src/animations/AnimatedText.js        [AT-1]
M  src/animations/MatrixRain.js          [MR-1][MR-2]
M  src/index.d.ts                        acoplamiento de las 3 superficies
M  package.json                          npm test + test:browser
M  AGENTS.md / docs/CONTRIBUTING.md      documentación
M  tests/doccheck-ch4.js                 tema claro hardcodeado
M  tests/doccheck-ch6.js                 aserciones que fijaban el bug de Inspector
?? scripts/check-api-surface.mjs
?? scripts/run-browser-tests.mjs
?? tests/regression.html
?? tests/regression.test.js
```

### Ronda 7 (commiteada)

```
M  src/animations/animate.js             [ANIM-1] registry WeakMap + runAnimation + stopAnimation
M  src/animations/index.js               re-exporta stopAnimation
M  src/index.js                          superficie pública: stopAnimation
M  src/index.d.ts                        tipos: stopAnimation + retorno cancelable
M  src/create-index.sh                   plantilla de animaciones (estaba desactualizada)
M  src/widget-factory/reactiveValue.js   §3.5: passKeys por pasada, resolving reentrante
M  src/tools/useState.js                 §3.5: dispatcher, registro, setState contra el store
M  src/widgets/ListView.js               [LV-2] + ResizeObserver + geometría del header
M  src/widgets/Slider.js                 [SLIDER-2] thumbRaf / initTimer / disposed
M  src/widgets/Stepper.js                [STEPPER-1] showNavigation
M  docs/tools/animation.md               stopAnimation + regla de reemplazo
M  package.json                          npm test suma check-router-base.mjs
M  tests/regression.test.js              10 guards nuevos (34 → 44)
M  registro.md                           este documento
?? scripts/check-router-base.mjs         base path del Router, 9 casos en Node
```

**Implementación quirúrgica (§5) — ficheros concretos:**

```
?? src/widget-factory/reactiveValue.js   NUEVO: isReactive/reactiveKeyOf/resolveReactive/createReactiveValue
M  src/tools/useState.js                 valor vivo + no rebuild si hay vínculo + release con onUnmount
M  src/widget-factory/widgetFactory.js   bindReactiveProps (auto-registro del vínculo)
M  src/widget-factory/processProps.js    resuelve el valor reactivo antes de aplicar la unidad
M  src/widget-factory/assignProps.js     usa el resolvedor compartido
M  docs/tools/reactivity.md              §10: "resolved, not subscribed" → "resolved AND bound"
M  tests/regression.test.js              3 guards nuevos (quirúrgico · derivado · release)
```

---

## 8. Apéndice: cómo montar el probe temporal

Se crea y se borra en cada ronda (no se commitea). Sirve para ejecutar JS arbitrario en
una página real con el repo servido:

```js
// .diag/<nombre>.mjs  →  node .diag/<nombre>.mjs '<sentencias js>'
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".woff2":"font/woff2" };
const server = await new Promise((r) => { const s = createServer(async (req,res) => { try {
  const p = decodeURIComponent((req.url||"/").split("?")[0]);
  const t = join(root, normalize(p).replace(/^(\.\.[/\\])+/,""));
  const i = await stat(t); const f = i.isDirectory() ? join(t,"index.html") : t;
  res.writeHead(200,{"Content-Type":MIME[extname(f)]||"application/octet-stream"}).end(await readFile(f));
} catch { res.writeHead(404).end("nf"); } }); s.listen(0,"127.0.0.1",()=>r(s)); });
const pp = [process.env.FLETBOX_PUPPETEER, join(root,"node_modules/puppeteer"), join(root,"..","flet-box-server","node_modules/puppeteer")].filter(Boolean).find(p=>existsSync(join(p,"package.json")));
const cp = [process.env.FLETBOX_CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].filter(Boolean).find(p=>existsSync(p));
const { default: puppeteer } = await import(join(pp,"lib","esm","puppeteer","puppeteer.js"));
const b = await puppeteer.launch({ executablePath: cp, headless: true, args: ["--no-sandbox"] });
const pg = await b.newPage();
pg.on("pageerror", (e) => console.log("[pageerror]", e.message));
await pg.goto(`http://127.0.0.1:${server.address().port}/tests/smoke.html`, { waitUntil: "load" });
try { const r = await pg.evaluate(`(async () => { ${process.argv[2]} })()`);
  console.log(typeof r === "string" ? r : JSON.stringify(r, null, 2)); }
catch (e) { console.log("EVAL ERROR:", e.message); }
await b.close(); server.close();
```

Uso típico: `const W = await import("/src/index.js"); const el = W.Chart({...}); ...`

---

## 9. Historial

| Ronda | Qué se hizo | Suite al cerrar |
|---|---|---|
| 1 | Runner headless + baseline (426). Bug del **motor** (hijos borrados). `QRCode` sin payload, `Slider` cuelgue, `Tabs` panel inicial, `DataTable` ×2, `ListView` recursión, `SnackBar` ×2, `MatrixRain` ×2, `AnimatedBox` ×2. 2 tests que fijaban el tema claro. Guards: 0 → 9 | 435 OK |
| 2 | **XSS de `Markdown`**, `Input.label`, `Checkbox`/`Switch`/`Radio` onclick, `Chart` negativos, `CircularChart` rAF, `Accordion` icono, `TreeView` selección, `Image` fit/circular. Guards: 9 → 16 | 442 OK |
| 3 | `Markdown.text`, `CodeViewer.title`, fugas de `AppBar`/`Tabs`/`DrawerItem`/`BottomNavigation`, `AnimatedText` herencia, `Inspector` props + child array, `Dropdown` capture flag. Guards: 16 → 22 | **448 OK** |
| 4 | `[DRAWER-1]` (`Scaffold` llama a `drawer.destroy()`), `[MODAL-1]`+`[MODAL-2]` (timer de cierre y listener de `keydown` en `Modal`/`BottomSheet`), `[ANIM-NAN]`, `[ANIM-DUR]`. Guards: 23 → 26 | **452 OK** |
| 5 | `[AUDIO-1]`+`[AUDIO-2]` (timer de respaldo de 2 s y `AudioContext` sin `close()`), `[PARALLAX-1]` (`onUnmount` para el listener de scroll). Guards: 26 → 28 | **454 OK** |
| 6 | **FEATURE (§5): reactividad quirúrgica con sintaxis React** — `useState` devuelve un valor vivo, el factory auto-registra el vínculo, y el rebuild se salta cuando la clave está ligada. Ficheros: `reactiveValue.js` (nuevo), `useState.js`, `widgetFactory.js`, `processProps.js`, `assignProps.js`, `warnings.js`, `runApp.js`, `docs/tools/reactivity.md`. Guards: 28 → 34 | **457 OK** |
| 7 | **Los 4 altos de ciclos** (`[ANIM-1]` con la nueva API `stopAnimation` en las 3 superficies + `docs/tools/animation.md`, `[LV-2]` con `ResizeObserver` y geometría del header corregida, `[SLIDER-2]`, `[STEPPER-1]`) **y la auditoría de `useState`/`reactiveValue`** (§3.5): claves estructurales ahora acotadas a cada pasada, `resolving` reentrante, `setState` comparando contra el store, fuga de registro vacío y código muerto fuera. Además: deep links de GitHub Pages asegurados en CI con `scripts/check-router-base.mjs` (9 casos). Guards: 34 → 44 | **470 OK / 0 fallos** |
| 8 | Mitad *lectura/reparación* del contrato: `flet-box unpack` (cruza `index.d.ts`, registro, fuente del widget y su página) y `flet-box audit-fix` (reescribe sólo lo demostrable), `check-api` validando también los imports propios de la app, y el contrato de agente que genera `flet-box create` con sistema de diseño (1 color de marca, escala 8·12·16·18·24·32·48). Arreglos del CLI: hot reload del dev server (raíces en vez de globs, recarga por socket, RAM de `useState` restaurada) y `flet-box cloudflare` sobre el bundle con `<base href>` y `update.url` correctos | checkers estáticos (sin guards de navegador) |
| 9 | **`Maps` nuevo**: proyección Web Mercator, rejilla de teselas, pines y API imperativa **sin librería de mapas, sin CDN y sin API key**. Cableado en las 5 superficies (exports, `index.d.ts`, `ALL_PROPS`, `docs/widget/Maps.md`, snippets) con cobertura total de props. Bugs cazados con sonda en Chrome real, no en el harness: flechas que paneaban al revés, las props propias ligadas a `useState` ni resueltas ni suscritas (la fábrica no las ve), la `setPointerCapture` en `pointerdown` que **se comía el clic del pin**, `wrapLng` devolviendo `2.352200000000039`, `locate()` sin opciones útiles ni códigos de error, y la línea de crédito oculta | **503 OK / 0 fallos** |
| 10 | Capa vectorial de `Maps` (`polylines`, `polylineColor`, canvas bajo los pines) y modo seguimiento (`followUser`, `onUserUpdate`) con su documentación; volver a aplicar el mismo `center` ya no cuenta como cambio de vista; `Dropdown` honra `value`/`options` ligados a `useState`; la punta del pin cae sobre su coordenada y no a su lado; las 4 props nuevas entran al registro (INTERNAL 4 → 0). Guards: 44 → 63 | **512 OK / 0 fallos** |
