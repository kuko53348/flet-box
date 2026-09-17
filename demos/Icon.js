// app.js
import { runApp, Container, Column, Row, Icon, Text, colors } from './index.js';

const App = () => {
    return Container({
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        bgColor: colors.background,
        padding: 20,
        child: Column({
            gap: 30,
            alignItems: 'center',
            children: [
                Text({ 
                    text: '🎨 Icon Demo', 
                    size: 28, 
                    weight: 'bold', 
                    color: colors.primary 
                }),
                
                Row({
                    gap: 20,
                    alignItems: 'center',
                    children: [
                        Icon({ name: 'favorite', size: 32, color: colors.danger }),
                        Icon({ name: 'star', size: 32, color: colors.warning }),
                        Icon({ name: 'home', size: 32, color: colors.primary }),
                        Icon({ name: 'settings', size: 32, color: colors.textSecondary }),
                        Icon({ name: 'person', size: 32, color: colors.success })
                    ]
                }),
                
                Row({
                    gap: 16,
                    alignItems: 'center',
                    children: [
                        Icon({ 
                            name: 'thumb_up', 
                            size: 48, 
                            color: colors.primary,
                            onClick: () => alert('👍 Like!'),
                            style: { cursor: 'pointer' }
                        }),
                        Icon({ 
                            name: 'delete', 
                            size: 48, 
                            color: colors.danger,
                            onClick: () => alert('🗑️ Delete!'),
                            style: { cursor: 'pointer' }
                        }),
                        Icon({ 
                            name: 'edit', 
                            size: 48, 
                            color: colors.success,
                            onClick: () => alert('✏️ Edit!'),
                            style: { cursor: 'pointer' }
                        })
                    ]
                }),
                
                Text({ 
                    text: 'Click on the icons below 👇', 
                    size: 12, 
                    color: colors.textSecondary 
                }),
                
                Row({
                    gap: 12,
                    children: [
                        Icon({ 
                            name: 'refresh', 
                            size: 24,
                            color: colors.primary,
                            padding: 8,
                            bgColor: colors.gray100,
                            borderRadius: 8,
                            onClick: () => alert('Refreshing...')
                        }),
                        Icon({ 
                            name: 'add', 
                            size: 24,
                            color: colors.success,
                            padding: 8,
                            bgColor: colors.gray100,
                            borderRadius: 8,
                            onClick: () => alert('Add new item')
                        }),
                        Icon({ 
                            name: 'close', 
                            size: 24,
                            color: colors.danger,
                            padding: 8,
                            bgColor: colors.gray100,
                            borderRadius: 8,
                            onClick: () => alert('Close')
                        })
                    ]
                }),
                
                Text({ 
                    text: 'All icons support: padding, margin, bgColor, borderRadius, onClick', 
                    size: 10, 
                    color: colors.textDisabled,
                    align: 'center'
                })
            ]
        })
    });
};

runApp(App, 'root');
