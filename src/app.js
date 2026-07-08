// app.js - Botón que se modifica a sí mismo
import { runApp, Container, Button } from "./index.js";

const App = () => {
  let clickCount = 0;

  const miBoton = Button({
    text: "Click me",
    onPress: (btn) => {
      clickCount++;
      btn.text = `Clicked ${clickCount} times`;

      // Cambia color después de 5 clicks
      if (clickCount >= 5) {
        btn.bgColor = "#ff4444";
        btn.textColor = "white";
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
