// app.js - Versión visible
import { runApp, Container, Text } from "./index.js";

const App = () => {
  return Container({
    // ✅ Fondo oscuro
    // bg: "#1a1a2e",
    // ✅ Centrado
    justifyContent: "center",
    alignItems: "center",
    expand: true,
    height: "100vh",
    // ✅ Ocupa toda la pantalla
    // height: "100vh",
    // ✅ Contenedor interno con fondo visible
    child: Container({
      bgColor: "#16213e", // ✅ Fondo visible
      padding: 30, // ✅ Padding
      rounded: 12, // ✅ Bordes redondeados
      child: Text({
        text: "Hello", // ✅ Texto
        color: "#e94560", // ✅ Color visible (rojo/rosa)
        size: 32, // ✅ Tamaño grande
        weight: "bold", // ✅ Negrita
      }),
    }),
  });
};

runApp(App, "root");
