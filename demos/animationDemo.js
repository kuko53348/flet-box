
import { Container, AnimatedBox, runApp } from './index.js';

const MyApp = () => {
    const mainContainer = Container({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        bgColor: '#1a1a2e'
    });

    // Cajita con TODOS los efectos, incluyendo los nuevos (width, height, margin, padding, bordes)
    const cajita = AnimatedBox({
        animations: [
            // === TRANSFORMACIONES ORIGINALES ===
            { 
              effect: 'boxShadow', 
              from: '0px 10px 10px 0px rgba(0,255,0,0.3)', 
              to: '0px 0px 10px 0px rgba(255,0,0,0.8)', 
              duration: 1500, 
              loop: true, 
              reverse: true 
            },

            { 
              effect: 'gradient', 
              from: 'linear-gradient(45deg, #ff0066, #ffcc00)',
              to: 'linear-gradient(135deg, #00ffcc, #0066ff)',
              duration: 2000,
              loop: true,
              reverse: true 
            },
            // { effect: 'scale', from: 0.5, to: 1.3, duration: 800, loop: true, reverse: true },
            // { effect: 'rotate', from: 0, to: 360, duration: 2000, loop: true, reverse: false },
            // { effect: 'rotateY', from: 0, to: 360, duration: 2000, loop: true, reverse: false },
            // { effect: 'rotateX', from: 0, to: 360, duration: 2000, loop: true, reverse: false },
            // { effect: 'translateX', from: -30, to: 30, duration: 1000, loop: true, reverse: true },
            // { effect: 'translateY', from: -20, to: 20, duration: 800, loop: true, reverse: true },
            
            // === ESTILOS VISUALES ===
            // { effect: 'opacity', from: 0.4, to: 1, duration: 800, loop: true, reverse: true },
            // { effect: 'bgColor', from: '#e74c3c', to: '#3498db', duration: 1500, loop: true, reverse: true },
            // { effect: 'textColor', from: '#ffffff', to: '#f1c40f', duration: 1500, loop: true, reverse: true },
            // { effect: 'borderRadius', from: 4, to: 50, duration: 1000, loop: true, reverse: true },
            
            // === NUEVAS PROPIEDADES ANIMABLES ===
            // Ancho y alto que laten
            // { effect: 'width', from: 120, to: 200, duration: 1200, loop: true, reverse: true },
            // { effect: 'height', from: 80, to: 150, duration: 1200, loop: true, reverse: true },
            
            // Márgenes que se mueven (para simular "respiración" o desplazamiento suave)
            // { effect: 'marginTop', from: 10, to: 40, duration: 1000, loop: true, reverse: true },
            // { effect: 'marginBottom', from: 10, to: 40, duration: 1000, loop: true, reverse: true },
            
            // Padding que se expande y contrae
            // { effect: 'paddingTop', from: 20, to: 60, duration: 900, loop: true, reverse: true },
            // { effect: 'paddingBottom', from: 20, to: 60, duration: 900, loop: true, reverse: true },
            // { effect: 'paddingLeft', from: 20, to: 60, duration: 900, loop: true, reverse: true },
            // { effect: 'paddingRight', from: 20, to: 60, duration: 900, loop: true, reverse: true },
            
            // Borde que cambia de grosor y color
            // { effect: 'borderWidth', from: 2, to: 8, duration: 1100, loop: true, reverse: true },
            { effect: 'borderColor', from: '#ffffff', to: '#2ecc71', duration: 1100, loop: true, reverse: true }
        ],
        child: Container({
            padding: '40px',        // padding base (se sumará a la animación de paddingLeft/Right)
            textContent: '✨ ANIMADA TOTAL ✨',
            fontSize: '20px',
            fontWeight: 'bold',
            borderStyle: 'solid',   // Necesario para que borderWidth/borderColor sean visibles
            backgroundColor: '#e74c3c', // color base (será sobreescrito por bgColor)
            color: '#ffffff',
            display: 'inline-block',
            textAlign: 'center',
            onPress: (widget) => console.log(widget)
        })
    });
    
    mainContainer.appendChild(cajita);
    return mainContainer;
};

runApp(MyApp, 'root');
