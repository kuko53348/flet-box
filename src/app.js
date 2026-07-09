// app.js - Asignación directa
import { runApp, Container, colors, Button } from "./index.js";

const App = () => {
  let clickCount = 0;

  const miBoton = Button({
    text: "Click me hello",
    bgColor: colors.surface,
    onPress: () => {
      clickCount++;

      // ✅ Asigna directamente al widget reactivo
      miBoton.text = `Clicked ${clickCount} times`;

      if (clickCount >= 5) {
        miBoton.bgColor = "#ff4444";
        miBoton.textColor = "white";
      }
    },
  });

  return Container({
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    child: miBoton,
  });
};

runApp(App, "root");
