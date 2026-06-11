// app.js - Demo sencillo de CircularChart
import { runApp, Container, Column, Row, Text, Button, CircularChart, colors, Slider } from 'flet-box';

let chart = null;
let slider = null;
let valueText = null;

const MyApp = () => {
    valueText = Text({ text: '75%', size: 16, weight: 'bold', color: colors.primary });

    return Column({
        gap: 24,
        alignItems: 'center',
        style: { padding: 40, backgroundColor: colors.background, minHeight: '100vh' },
        children: [
            Text({ text: '📊 Circular Chart Demo', size: 24, weight: 'bold', color: colors.primary }),
            
            CircularChart({
                value: 75,
                max: 100,
                size: 200,
                strokeWidth: 16,
                color: colors.primary,
                backgroundColor: colors.gray200,
                showValue: true,
                valueSize: 32,
                label: 'Progreso',
                labelSize: 14,
                animate: true,
                ref: (c) => chart = c
            }),
            
            valueText,
            
            Slider({
                width: 300,
                value: 75,
                min: 0,
                max: 100,
                onChanged: (val) => {
                    chart?.updateValue(val);
                    valueText.update({ text: `${Math.round(val)}%` });
                },
                ref: (s) => slider = s
            }),
            
            Row({ gap: 12, children: [
                Button({ text: 'Reset', onPress: () => {
                    slider?.setValue(0);
                    chart?.updateValue(0);
                    valueText.update({ text: '0%' });
                }, variant: 'outlined' }),
                Button({ text: '50%', onPress: () => {
                    slider?.setValue(50);
                    chart?.updateValue(50);
                    valueText.update({ text: '50%' });
                }, variant: 'outlined' }),
                Button({ text: '100%', onPress: () => {
                    slider?.setValue(100);
                    chart?.updateValue(100);
                    valueText.update({ text: '100%' });
                }, variant: 'outlined' })
            ] })
        ]
    });
};

runApp(MyApp, 'root');
