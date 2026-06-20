// app.js - Prueba de visibilidad de texto e iconos
import { runApp, Container, Text, Icon, colors } from "./index.js";

const App = () => {
  return Container({
    // Fondo oscuro para todo el cuerpo
    bgColor: "#1a1a2e",
    // Centrar vertical y horizontalmente
    justifyContent: "center",
    alignItems: "center",
    // Ocupa toda la pantalla
    expand: true,

    child: Container({
      // Fondo visible (azul oscuro)
      bgCOlor: "#16213e",
      padding: 30,
      rounded: 12,
      // Contenido apilado verticalmente
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      children: [
        // 🔤 Texto grande y visible
        Text({
          text: "¡Hola FletBox!",
          color: "#e94560", // Rojo/rosa vibrante
          size: 32, // Tamaño grande
          weight: "bold",
        }),
        // 📝 Texto secundario
        Text({
          text: "Esto es un texto visible",
          color: colors.textSecondary,
          size: 16,
        }),
        // 🎨 Icono (usando 'icon' o 'name')
        Icon({
          icon: "favorite", // o 'name: "favorite"'
          size: 48,
          color: "#e94560",
        }),
        // 🏠 Otro icono con 'name'
        Icon({
          name: "home",
          size: 36,
          color: "#4ade80",
        }),
      ],
    }),
  });
};

runApp(App, "root");
