// app.js
import { 
    runApp, 
    Container, 
    Column, 
    ProgressBar, 
    Text, 
    Button, 
    Row,
    colors,
    useState 
} from './index.js';

const App = () => {
    const [progress, setProgress] = useState('progress', 0);

    const increase = () => setProgress(Math.min(progress + 10, 100));
    const decrease = () => setProgress(Math.max(progress - 10, 0));
    const reset = () => setProgress(0);

    return Container({
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        bgColor: colors.background,
        padding: 20,
        child: Column({
            gap: 24,
            alignItems: 'center',
            children: [
                Text({ 
                    text: '📊 ProgressBar Demo', 
                    size: 28, 
                    weight: 'bold', 
                    color: colors.primary 
                }),
                
                // Basic progress bar
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'Basic', size: 14, weight: 'bold' }),
                        ProgressBar({
                            value: progress,
                            width: 300,
                            height: 8,
                            color: colors.primary
                        })
                    ]
                }),

                // With label and percentage
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'With Label & Percentage', size: 14, weight: 'bold' }),
                        ProgressBar({
                            value: progress,
                            width: 300,
                            height: 10,
                            color: colors.success,
                            label: 'Loading',
                            showValue: true
                        })
                    ]
                }),

                // Striped
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'Striped', size: 14, weight: 'bold' }),
                        ProgressBar({
                            value: progress,
                            width: 300,
                            height: 12,
                            color: colors.warning,
                            striped: true
                        })
                    ]
                }),

                // Indeterminate
                Column({
                    gap: 8,
                    alignItems: 'center',
                    children: [
                        Text({ text: 'Indeterminate', size: 14, weight: 'bold' }),
                        ProgressBar({
                            width: 300,
                            height: 8,
                            color: colors.secondary,
                            indeterminate: true
                        })
                    ]
                }),

                // Value display
                Text({ 
                    text: `${progress}%`, 
                    size: 24, 
                    weight: 'bold', 
                    color: colors.primary 
                }),

                // Control buttons
                Row({
                    gap: 12,
                    children: [
                        Button({ text: '-10', variant: 'outlined', onPress: decrease }),
                        Button({ text: 'Reset', variant: 'filled', bgColor: colors.danger, color: '#fff', onPress: reset }),
                        Button({ text: '+10', variant: 'filled', bgColor: colors.success, color: '#fff', onPress: increase })
                    ]
                })
            ]
        })
    });
};

runApp(App, 'root');
