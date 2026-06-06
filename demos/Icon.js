// app.js - Demo de Icon
import { Container, runApp, Icon, Icons, Text, Row, Column } from './index.js';

const MyApp = () => {
    // Ejemplo con diferentes iconos
    const demo = Column({
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        width: '100%',
        height: '100vh',
        bgColor: '#1a1a2e',
        children: [
            Text({ textContent: '🎨 ICONOS', fontSize: 24, color: '#ffffff', fontWeight: 'bold' }),
            
            // Iconos básicos
            Row({ gap: 20, children: [
                Icon({ name: 'home', size: 32, color: '#ff0066' }),
                Icon({ name: 'search', size: 32, color: '#00ff88' }),
                Icon({ name: 'settings', size: 32, color: '#ffcc00' }),
                Icon({ name: 'favorite', size: 32, color: '#ff0066' }),
                Icon({ name: 'star', size: 32, color: '#ffcc00' })
            ]}),
            
            // Iconos con diferentes tamaños
            Row({ gap: 20, children: [
                Icon({ name: 'home', size: 16, color: '#ffffff' }),
                Icon({ name: 'home', size: 24, color: '#ffffff' }),
                Icon({ name: 'home', size: 32, color: '#ffffff' }),
                Icon({ name: 'home', size: 48, color: '#ffffff' })
            ]}),
            
            // Usando Icons predefinidos
            Row({ gap: 20, children: [
                Icons.Home({ size: 32, color: '#ff0066' }),
                Icons.Search({ size: 32, color: '#00ff88' }),
                Icons.Settings({ size: 32, color: '#ffcc00' }),
                Icons.Star({ size: 32, color: '#ffff00' })
            ]}),
            
            // Iconos con texto
            Row({ gap: 20, children: [
                Container({ children: [Icon({ name: 'home', size: 20 }), Text({ textContent: ' Inicio', color: '#fff' })] }),
                Container({ children: [Icon({ name: 'settings', size: 20 }), Text({ textContent: ' Ajustes', color: '#fff' })] }),
                Container({ children: [Icon({ name: 'user', size: 20 }), Text({ textContent: ' Perfil', color: '#fff' })] })
            ]})
        ]
    });

    return demo;
};

runApp(MyApp, 'root');
