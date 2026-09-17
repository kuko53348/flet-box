# FletBox

FletBox es un framework ligero para construir interfaces web con JavaScript vanilla usando una sintaxis declarativa inspirada en Flet, pero sin dependencias externas ni Virtual DOM.

## Descripción general

FletBox busca combinar lo mejor de una UI declarativa con el rendimiento del DOM nativo. Su objetivo es permitir crear aplicaciones web y apps móviles híbridas con componentes reutilizables, estado global, routing y utilidades integradas.

El proyecto está orientado a:

- construir interfaces rápidas y ligeras
- evitar dependencias pesadas
- usar DOM real en lugar de un árbol virtual
- facilitar prototipos, dashboards y apps pequeñas/medianas
- exportar una API simple y directa para desarrolladores frontend

## Características principales

- UI declarativa basada en widgets
- Runtime ligero para web
- Sistema de estado con `useState`
- Router para SPA
- Servicios para almacenamiento local y HTTP
- Soporte para theme, PWA y build de producción
- Compatibilidad con compilación para APK / móvil
- API con utilidades para layouts, texto, color, animaciones y más

## Instalación

```bash
npm install flet-box
```

## Documentación para empezar

La documentación está pensada para aprender FletBox desde cero:

- [Start here](docs/widget/START_HERE.md): conceptos básicos y primeros widgets.
- [Build your first FletBox app](docs/guides/app-templates.md): páginas, layouts, navegación y componentes.
- [Add FletBox to an existing page](docs/guides/embedding.md): integrar widgets sin reescribir tu aplicación.
- [Syntax philosophy](docs/guides/syntax-philosophy.md): aliases y sintaxis flexible para distintos perfiles de desarrollador.
- [State](docs/guides/state.md): estado compartido, `useState` y actualizaciones reactivas.
- [Routing](docs/guides/router.md): rutas, parámetros, query params e historial.
- [Utilities](docs/guides/utilities.md): layout, colores, listas, fechas, dispositivo y más.
- [Frontend services](docs/guides/frontend-services.md): estado en RAM, sesión, almacenamiento persistente y HTTP.
- [Compatibility](docs/guides/compatibility.md): navegadores, PWA, Android, iOS y desktop.
- [Mobile and platforms](docs/guides/mobile-and-platforms.md): Android, iOS, APK, AAB, PWA y desktop.
- [Minification and protection](docs/guides/minification-and-protection.md): reducir el bundle y proteger correctamente la aplicación.
- [FletBox CLI](docs/cli/README.md): crear proyectos, pantallas, componentes, ejecutar y compilar.
- [FletBox Server](docs/server/README.md): API, autenticación, seguridad, datos, servicios y despliegue.
- [Widgets](docs/widget/README.md): propiedades completas y ejemplos `basic`, `normal` y `full`.
- [Contributing](docs/CONTRIBUTING.md): estructura del proyecto, widgets, tipos, docs y validación.

## Inicio rápido

```javascript
import { runApp, Container, Text, Button, useState } from "flet-box";

const App = () => {
  const [count, setCount] = useState("count", 0);

  return Container({
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    child: [
      Text({
        text: `Contador: ${count}`,
        fontSize: 24,
        fontWeight: 700,
      }),
      Button({
        text: "Incrementar",
        onClick: () => setCount((v) => v + 1),
      }),
    ],
  });
};

runApp(App);
```

## Arquitectura

El proyecto está organizado en varias capas:

### 1. Capa pública

Archivo principal:

- [src/index.js](src/index.js)

Exporta toda la API pública: widgets, utilities, servicios, router y runtime.

### 2. Runtime del framework

Archivos clave:

- [src/core/runApp.js](src/core/runApp.js)
- [src/core/App.js](src/core/App.js)
- [src/core/pwa.js](src/core/pwa.js)

Aquí se gestiona:

- montaje de la app en el `root`
- render inicial y actualización
- theme del sistema
- PWA
- router integration

### 3. Widget factory

Archivo principal:

- [src/widget-factory/widgetFactory.js](src/widget-factory/widgetFactory.js)

Es el corazón del framework. Define cómo un widget se convierte en un `HTMLElement` real con:

- props
- style
- eventos
- children
- lifecycle
- reactividad
- update

Submodules relevantes:

- [src/widget-factory/createWidget.js](src/widget-factory/createWidget.js)
- [src/widget-factory/processProps.js](src/widget-factory/processProps.js)
- [src/widget-factory/assignProps.js](src/widget-factory/assignProps.js)
- [src/widget-factory/reactivity.js](src/widget-factory/reactivity.js)
- [src/widget-factory/addChildren.js](src/widget-factory/addChildren.js)
- [src/widget-factory/effects.js](src/widget-factory/effects.js)

### 4. Estado

Archivo clave:

- [src/tools/useState.js](src/tools/useState.js)

El framework usa un sistema basado en claves, almacenamiento RAM y suscriptores para actualizar widgets conectados a un valor concreto.

### 5. Router

Archivo clave:

- [src/navigations/Router.js](src/navigations/Router.js)

Permite rutas, rutas con parámetros, query strings y navegación por historial del navegador.

### 6. Servicios y utilidades

Carpetas clave:

- [src/services](src/services)
- [src/tools](src/tools)
- [src/utils](src/utils)

Incluyen:

- storage local
- sesión
- HTTP client
- utilidades de texto, fecha, dimensiones, color, grid, margin, padding, animación, etc.

## Estructura del proyecto

```text
flet-box/
├── bin/
├── dist/
├── demos/
├── src/
│   ├── animations/
│   ├── core/
│   ├── navigations/
│   ├── services/
│   ├── tools/
│   ├── utils/
│   ├── widget-factory/
│   ├── widgets/
│   ├── app.js
│   ├── index.js
│   └── index.d.ts
├── index.html
├── manifest.json
├── package.json
├── createBundle.sh
├── createBundlePSP.sh
├── install.sh
├── run.sh
├── service-worker.js
└── README.md
```

## Comandos principales

```bash
npm install
npm run dev
npm run build
```

### Scripts disponibles

- `npm run dev`: arranca el entorno de desarrollo con el CLI
- `npm run build`: genera el bundle de producción
- `npm test`: actualmente no tiene pruebas reales configuradas

## Build y despliegue

El proyecto incluye scripts de bundle para:

- web estático
- bundle de producción para navegador
- exportación para PSP
- soporte PWA
- compilación para APK mediante capacidades móviles o wrappers nativos

Archivos relevantes:

- [createBundle.sh](createBundle.sh)
- [createBundlePSP.sh](createBundlePSP.sh)
- [index.html](index.html)
- [manifest.json](manifest.json)
- [service-worker.js](service-worker.js)

## API principal

### `runApp`

Ejecuta la app en el contenedor raíz.

```javascript
runApp(App, "root");
```

### `App`

Crea la app raíz y reemplaza el contenido del contenedor principal.

### `Container`

Contenedor base con layout flexible.

```javascript
Container({
  display: "flex",
  flexDirection: "column",
  child: [
    Text({ text: "Hola" }),
    Button({ text: "Aceptar" }),
  ],
});
```

### `useState`

Gestión de estado local/global simple.

```javascript
const [count, setCount] = useState("count", 0);
```

### `Router`

Navegación por rutas:

```javascript
initRouter({
  "/": Home,
  "/about": About,
  "/user/:id": User,
});
```

## Ventajas

- Ligero
- Sin dependencias principales en runtime
- Fácil de compilar
- Buen rendimiento en móvil y web
- API accesible y expresiva
- útil para MVPs y apps pequeñas

## Limitaciones actuales

- no tiene sistema de pruebas robusto
- reactividad global puede ser difícil de escalar
- render completo del contenedor principal puede limitar rendimiento en apps grandes
- hay ciertas partes con arquitectura todavía en evolución
- la API necesita consolidación para una etapa más madura

## Estado del proyecto

FletBox está bien posicionado como un framework de UI ligero con base sólida, pero todavía necesita un proceso de maduración para convertirse en una solución más profesional, con:

- mejores tests
- arquitectura más uniforme
- API más estable
- documentación extensa y ejemplos reales
- refactor de render/estado

## Roadmap sugerido

1. consolidar WidgetFactory y reactividad
2. reducir render global
3. añadir pruebas unitarias
4. estabilizar API pública
5. documentar componentes y ejemplos
6. preparar release más formal

## Enlaces útiles

- [src/index.js](src/index.js)
- [src/core/runApp.js](src/core/runApp.js)
- [src/widget-factory/widgetFactory.js](src/widget-factory/widgetFactory.js)
- [src/navigations/Router.js](src/navigations/Router.js)
- [src/tools/useState.js](src/tools/useState.js)
- [docs/arquitectura.md](docs/arquitectura.md)

## Conclusión

FletBox tiene una base técnica sólida, una idea clara y un rendimiento prometedor. El principal trabajo pendiente no es “hacerlo funcionar”, sino consolidar la arquitectura y la disciplina de desarrollo para convertirlo en un proyecto más maduro, mantenible y profesional.
