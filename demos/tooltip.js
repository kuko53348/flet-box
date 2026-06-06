// app.js
import { runApp, Container, Column, Tooltip, Button, Text, colors } from './index.js';

const App = () => {
    return Container({
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        bgColor: colors.background,
        child: Column({
            gap: 30,
            alignItems: 'center',
            children: [
                Text({ text: '🎯 Tooltip Demo', size: 28, weight: 'bold', color: colors.primary }),
                
                // Tooltip on top
                Tooltip({
                    text: 'This is a tooltip on top',
                    position: 'top',
                    child: Button({ text: 'Hover me - Top', variant: 'filled' })
                }),
                
                // Tooltip on bottom
                Tooltip({
                    text: 'This tooltip appears below',
                    position: 'bottom',
                    child: Button({ text: 'Hover me - Bottom', variant: 'outlined' })
                }),
                
                // Tooltip on left
                Tooltip({
                    text: 'Tooltip on the left side',
                    position: 'left',
                    child: Button({ text: 'Hover me - Left', variant: 'filled' })
                }),
                
                // Tooltip on right
                Tooltip({
                    text: 'Tooltip on the right side',
                    position: 'right',
                    child: Button({ text: 'Hover me - Right', variant: 'outlined' })
                }),
                
                // Custom styled tooltip
                Tooltip({
                    text: '✨ Custom styled tooltip!',
                    position: 'top',
                    bgColor: colors.success,
                    textColor: '#fff',
                    fontSize: 14,
                    padding: '8px 16px',
                    borderRadius: 8,
                    delay: 200,
                    child: Button({ 
                        text: 'Hover me - Custom', 
                        variant: 'filled',
                        bgColor: colors.success,
                        color: '#fff'
                    })
                })
            ]
        })
    });
};

runApp(App, 'root');
