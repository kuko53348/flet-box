// app.js - Direct reactive property assignment demo
import { runApp, Container, colors, Button } from "./index.js";

/**
 * Root application component.
 *
 * Demonstrates FletBox's reactive widget model: instead of triggering a full
 * tree rebuild, individual widget properties (e.g. `text`, `bgColor`) are
 * assigned directly on the returned widget instance. The framework detects the
 * assignment and patches only the affected element in the DOM.
 *
 * @returns {HTMLElement} A full-viewport centered container holding the demo button.
 */
const App = () => {
  let clickCount = 0;

  const miBoton = Button({
    text: "Click me hello",
    bgColor: colors.surface,
    onPress: () => {
      clickCount++;

      // ✅ Directly assign to the reactive widget — no re-render needed
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
