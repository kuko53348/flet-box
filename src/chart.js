// app.js
import { runApp, Container, Column, Chart, Text, colors } from './index.js';

// Generate random data for demos
const generateRandomData = (count, min = 10, max = 100) => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
};

// Generate Bitcoin-like data for candle chart
const generateCandleData = (days, startPrice = 50000) => {
    let price = startPrice;
    const data = [];
    for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.5) * 0.06;
        const open = price;
        const close = price * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.02);
        const low = Math.min(open, close) * (1 - Math.random() * 0.02);
        data.push({ open, high, low, close });
        price = close;
    }
    return data;
};

// Sample data
const salesData = [45, 62, 38, 55, 72, 68, 85, 90, 78, 65, 58, 70];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const tempData = generateRandomData(20, 15, 35);
const tempLabels = Array.from({ length: 20 }, (_, i) => `Day ${i + 1}`);
const btcData = generateCandleData(50, 50000);
const btcDays = Array.from({ length: 50 }, (_, i) => `Day ${i + 1}`);

const App = () => {
    return Container({
        width: '100%',
        minHeight: '100vh',
        bgColor: colors.background,
        padding: 20,
        child: Column({
            width: '100%',        // ← Asegura que la columna ocupe todo el ancho
            gap: 30,
            children: [
                Text({ text: '📊 FletBox Charts Demo', size: 28, weight: 'bold', color: colors.primary, align: 'center' }),
                
                // Bar Chart
                Text({ text: '📊 Bar Chart (Monthly Sales)', size: 18, weight: 'bold', marginTop: 10 }),
                Chart({
                    type: 'bar',
                    data: salesData,
                    labels: months,
                    width: '100%',
                    height: 300,
                    barColor: colors.primary,
                    showGrid: true,
                    showLabels: true,
                    showValues: true,
                    borderRadius: 12,
                    bgColor: colors.surface,
                    padding: { top: 20, right: 40, bottom: 40, left: 40 }
                }),
                
                // Line Chart
                Text({ text: '📈 Line Chart (Temperature Trend)', size: 18, weight: 'bold', marginTop: 20 }),
                Chart({
                    type: 'line',
                    data: tempData,
                    labels: tempLabels,
                    width: '100%',
                    height: 300,
                    lineColor: colors.warning,
                    showGrid: true,
                    showLabels: false,
                    showValues: false,
                    borderRadius: 12,
                    bgColor: colors.surface,
                    padding: { top: 20, right: 40, bottom: 30, left: 40 }
                }),
                
                // Area Chart
                Text({ text: '📊 Area Chart (Performance)', size: 18, weight: 'bold', marginTop: 20 }),
                Chart({
                    type: 'area',
                    data: [30, 45, 38, 55, 62, 58, 70, 85, 78, 68, 60, 55],
                    labels: months,
                    width: '100%',
                    height: 300,
                    lineColor: colors.success,
                    areaColor: `${colors.success}40`,
                    showGrid: true,
                    showLabels: true,
                    showValues: false,
                    borderRadius: 12,
                    bgColor: colors.surface,
                    padding: { top: 20, right: 40, bottom: 40, left: 40 }
                }),
                
                // Candlestick Chart (Bitcoin)
                Text({ text: '₿ Candlestick Chart (Bitcoin 50 days)', size: 18, weight: 'bold', marginTop: 20 }),
                Chart({
                    type: 'candle',
                    data: btcData,
                    labels: btcDays,
                    width: '100%',
                    height: 400,
                    candleWidth: 8,
                    candleSpacing: 2,
                    candleUpColor: colors.success,
                    candleDownColor: colors.danger,
                    showGrid: true,
                    showLabels: false,
                    showValues: false,
                    borderRadius: 12,
                    bgColor: colors.surface,
                    yAxisColor: colors.primary,
                    padding: { top: 20, right: 60, bottom: 30, left: 60 }
                }),
                
                Text({ text: '💡 Tip: Scroll horizontally to see all candles', size: 11, color: colors.textDisabled, align: 'center', marginTop: 10, marginBottom: 20 })
            ]
        })
    });
};

runApp(App, 'root');
