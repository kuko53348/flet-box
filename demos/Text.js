// app.js - Text con lista de estilos
import { Container, runApp, Text } from './index.js';

const MyApp = () => {
    const main = Container({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        width: '100%',
        minHeight: '100vh',
        bgColor: '#1a1a2e',
        padding: 40
    });

    // 1. H1 con bold, italic, underline
    main.appendChild(Text({ 
        value: 'Título H1', 
        type: 'h1', 
        styles: ['bold', 'italic', 'underline'],
        color: '#ff0066'
    }));

    // 2. H2 con bold y strikethrough
    main.appendChild(Text({ 
        value: 'Subtítulo', 
        type: 'h2', 
        styles: ['bold', 'strikethrough'],
        color: '#ffcc00'
    }));

    // 3. Párrafo con bold, italic, underline, mark
    main.appendChild(Text({ 
        value: 'Texto con múltiples estilos', 
        type: 'p', 
        styles: ['bold', 'italic', 'underline', 'mark'],
        color: '#ffffff'
    }));

    // 4. Solo bold
    main.appendChild(Text({ 
        value: 'Solo negrita', 
        styles: ['bold'],
        color: '#00ffcc'
    }));

    // 5. Solo italic
    main.appendChild(Text({ 
        value: 'Solo cursiva', 
        styles: ['italic'],
        color: '#ffaa00'
    }));

    // 6. bold + italic + underline + small + mark (todos)
    main.appendChild(Text({ 
        value: 'Todos los estilos juntos', 
        styles: ['bold', 'italic', 'underline', 'small', 'mark', 'strikethrough'],
        color: '#ff66cc',
        size: 20
    }));

    // 7. Con código
    main.appendChild(Text({ 
        value: 'console.log("Hola")', 
        styles: ['code'],
        color: '#00ff88'
    }));

    return main;
};

runApp(MyApp, 'root');
