// app.js
import { 
    runApp, 
    Container, 
    Column,
    Carousel,
    Text, 
    Image,
    colors 
} from './index.js';

// Imágenes de ejemplo (usa URLs reales o locales)
const images = [
    'src/assets/logo.png',
    'src/assets/logo.png',
    'src/assets/logo.png',
    'src/assets/logo.png',
];

// O también puedes usar widgets como slides
const slides = [
    Container({
        bgColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        child: Text({ text: 'Slide 1 - Azul', color: '#fff', size: 24 })
    }),
    Container({
        bgColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        child: Text({ text: 'Slide 2 - Verde', color: '#fff', size: 24 })
    }),
    Container({
        bgColor: colors.warning,
        justifyContent: 'center',
        alignItems: 'center',
        child: Text({ text: 'Slide 3 - Naranja', color: '#fff', size: 24 })
    })
];

const App = () => {
    return Container({
        width: '100%',
        minHeight: '100vh',
        bgColor: colors.background,
        padding: 20,
        child: Column({
            gap: 30,
            children: [
                Text({ text: '🎠 Carousel con Imágenes', size: 24, weight: 'bold' }),
                Carousel({
                    items: images,
                    height: 300,
                    autoPlay: true,
                    interval: 3000,
                    showArrows: true,
                    showDots: true,
                    borderRadius: 16
                }),
                
                Text({ text: '🎠 Carousel con Widgets', size: 24, weight: 'bold', marginTop: 20 }),
                Carousel({
                    items: images,
                    height: 200,
                    autoPlay: false,
                    showArrows: true,
                    showDots: true,
                    borderRadius: 12
                })
            ]
        })
    });
};

runApp(App, 'root');
