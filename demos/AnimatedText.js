// app.js - Bordes visibles
import { Container, runApp, AnimatedText, Text } from './index.js';

const MyApp = () => {
    const columna = Container({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 25,
        width: '100%',
        minHeight: '100vh',
        bgColor: '#1a1a2e',
        padding: 40
    });

    const textos = [
        { text: 'ARRIBA', color: '#00ff88', effect: 'translateY', from: -30, to: 0, rev: true },
        { text: 'FLIP', color: '#ff0066', effect: 'rotateY', from: 0, to: 360, rev: false },
        { text: 'GIRO', color: '#ffcc00', effect: 'rotate', from: 0, to: 360, rev: false },
        { text: 'ESCALA', color: '#9b59b6', effect: 'scale', from: 1, to: 1.2, rev: true },
        { text: 'OPACO', color: '#00ffcc', effect: 'opacity', from: 1, to: 0.3, rev: true },
        { text: 'LATERAL', color: '#e74c3c', effect: 'translateX', from: -30, to: 0, rev: true },
        { text: 'COLOR', color: '#ffffff', effect: 'textColor', from: '#ffffff', to: '#ff0066', rev: true }
    ];

    textos.forEach(t => {
        // Tarjeta con borde grueso y visible
        const card = Container({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 350,
            height: 120,
            bgColor: '#0f0f2a',
            borderRadius: 16,
            borderWidth: 3,
            borderStyle: 'solid',
            borderColor: t.color,
            boxShadow: `0 0 15px ${t.color}80`
        });

        card.appendChild(AnimatedText({
            child: Text({ textContent: t.text, fontSize: 36, fontWeight: 'bold', color: t.color }),
            animations: [{ effect: t.effect, from: t.from, to: t.to, duration: 600, loop: true, reverse: t.rev }],
            delayBetween: 0.15
        }));

        columna.appendChild(card);
    });

    return columna;
};

runApp(MyApp, 'root');
