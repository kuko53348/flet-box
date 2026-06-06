// app.js - Demo sin colores hardcodeados (usa solo el tema)
import { runApp, Container, Column, Row, Text, Button, Input, Card, Avatar, Icon, Switch, Divider, Slider, ProgressBar, Rating, Chip, Badge, Checkbox, Radio, ListTile, colors, toggleTheme, getTheme } from './index.js';
import { useState } from './utils/useState.js';

const App = () => {
    // ========== ESTADO ==========
    const [isDark, setIsDark] = useState('app_isDark', getTheme() === 'dark');
    const [checkValue, setCheckValue] = useState('app_checkValue', false);
    const [radioValue, setRadioValue] = useState('app_radioValue', false);
    const [switchValue, setSwitchValue] = useState('app_switchValue', false);
    const [sliderValue, setSliderValue] = useState('app_sliderValue', 50);
    const [ratingValue, setRatingValue] = useState('app_ratingValue', 3);
    const [inputValue, setInputValue] = useState('app_inputValue', '');
    const [count, setCount] = useState('app_count', 0);
    
    // ========== WIDGETS (sin colores hardcodeados) ==========
    const titleText = Text({ text: `FletBox Demo (${count})`, size: 24, weight: 'bold' });
    
    const themeBtn = Button({
        text: isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro',
        variant: 'filled',
        onPress: () => {
            const newTheme = toggleTheme();
            setIsDark(newTheme === 'dark');
            themeBtn.text = newTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
            // titleText.text = `FletBox Demo (${count})`;
        }
    });
    
    const counterBtn = Button({
        text: `Contador: ${count}`,
        variant: 'outlined',
        onPress: () => {
            setCount(count + 1);
            counterBtn.text = `Contador: ${count + 1}`;
            // titleText.text = `FletBox Demo (${count + 1})`;
        }
    });
    
    const demoInput = Input({
        placeholder: 'Escribe algo...',
        value: inputValue,
        fullWidth: true,
        borderRadius: 12,
        iconLeft: 'edit',
        onInput: (val) => setInputValue(val)
    });
    
    const slider = Slider({
        value: sliderValue,
        showValue: true,
        onChanged: (val) => setSliderValue(val)
    });
    
    const progress = ProgressBar({ value: sliderValue, showValue: true });
    
    const rating = Rating({
        value: ratingValue,
        showValue: true,
        onChange: (val) => setRatingValue(val)
    });
    
    const chip = Chip({ label: 'Ejemplo Chip', onPress: () => console.log('Chip clicked') });
    
    const badgeBtn = Button({ text: 'Notificaciones' });
    const badge = Badge({ value: '3', child: badgeBtn });
    
    const checkbox = Checkbox({
        checked: checkValue,
        onCheck: (val) => setCheckValue(val)
    });
    
    const radio = Radio({
        selected: radioValue,
        onSelect: (val) => setRadioValue(val)
    });
    
    const switchWidget = Switch({
        value: switchValue,
        onToggle: (val) => setSwitchValue(val)
    });
    
  // En app.js, asegúrate de que los iconos son widgets válidos
    const listTile = ListTile({
        title: 'Elemento de lista',
        subtitle: 'Subtítulo de ejemplo',
        leftItem: Icon({ name: 'star', color: colors.primary }),  // ← Icon widget
        rightItem: Icon({ name: 'chevron_right', color: colors.textSecondary })  // ← Icon widget
    });
    
    const avatar = Avatar({ name: 'FB', size: 40 });
    
    return Container({
        style: {
            width: '100%',
            minHeight: '100vh',
            backgroundColor: colors.background,
            padding: '20px',
            transition: 'background-color 0.3s ease'
        },
        child: Column({
            gap: 16,
            style: { maxWidth: 500, margin: '0 auto', width: '100%' },
            children: [
                Card({
                    padding: 20,
                    borderRadius: 20,
                    child: Row({
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        children: [avatar, themeBtn]
                    })
                }),
                Card({
                    padding: 16,
                    borderRadius: 16,
                    child: Column({ gap: 12, children: [
                        Text({ text: '📝 Input', size: 16, weight: 'bold' }),
                        demoInput
                    ] })
                }),
                Card({
                    padding: 16,
                    borderRadius: 16,
                    child: Column({ gap: 12, children: [
                        Text({ text: '🎚️ Slider & Progress', size: 16, weight: 'bold' }),
                        slider,
                        progress
                    ] })
                }),
                Card({
                    padding: 16,
                    borderRadius: 16,
                    child: Column({ gap: 12, children: [
                        Text({ text: '⭐ Rating', size: 16, weight: 'bold' }),
                        rating,
                        counterBtn
                    ] })
                }),
                Card({
                    padding: 16,
                    borderRadius: 16,
                    child: Row({ gap: 16, alignItems: 'center', children: [chip, badge] })
                }),
                Card({
                    padding: 16,
                    borderRadius: 16,
                    child: Row({ gap: 24, alignItems: 'center', children: [
                        Row({ gap: 6, alignItems: 'center', children: [checkbox, Text({ text: 'Check' })] }),
                        Row({ gap: 6, alignItems: 'center', children: [radio, Text({ text: 'Radio' })] }),
                        Row({ gap: 6, alignItems: 'center', children: [switchWidget, Text({ text: 'Switch' })] })
                    ] })
                }),
                Card({
                    padding: 0,
                    borderRadius: 16,
                    overflow: 'hidden',
                    child: listTile
                }),
                Text({
                    text: '✨ Todos los widgets se adaptan al tema ✨',
                    size: 11,
                    align: 'center'
                })
            ]
        })
    });
};

runApp(App, 'root');
