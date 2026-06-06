// app.js - Dashboard Pro Corregido
import { 
    runApp, 
    Container, 
    Column, 
    Row, 
    Text, 
    Card, 
    Chart, 
    DataTable, 
    Button,
    Icon,
    colors,
    Scaffold,
    AppBar,
    Drawer,
    DrawerItem,
    openDrawer,
    closeDrawer
} from './index.js';

// Abrir drawer automáticamente al cargar
setTimeout(function() {
    openDrawer();
}, 100);

// ========== MOCK DATA ==========
const kpiData = [
    { title: 'Total Revenue', value: '$1,248,582', change: '+12.5%', icon: 'trending_up', color: colors.success },
    { title: 'Active Users', value: '8,472', change: '+8.2%', icon: 'people', color: colors.primary },
    { title: 'BTC Price', value: '$68,432', change: '+3.1%', icon: 'currency_bitcoin', color: colors.warning },
    { title: 'Conversion Rate', value: '24.8%', change: '+2.4%', icon: 'insights', color: colors.info }
];

const monthlySales = [28, 35, 42, 48, 55, 62, 70, 78, 85, 82, 75, 90];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 50 days of Bitcoin data
const generateBTCPrices = function() {
    let price = 65000;
    const data = [];
    for (let i = 0; i < 50; i++) {
        const change = (Math.random() - 0.5) * 0.04;
        const open = price;
        const close = price * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.015);
        const low = Math.min(open, close) * (1 - Math.random() * 0.015);
        data.push({ open: open, high: high, low: low, close: close });
        price = close;
    }
    return data;
};

const btcData = generateBTCPrices();
const btcDays = [];
for (let i = 0; i < 50; i++) {
    btcDays.push('D' + (i + 1));
}

const transactions = [];
for (let i = 0; i < 15; i++) {
    const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Carlos Ruiz'];
    const statuses = ['Completed', 'Pending', 'Failed'];
    transactions.push({
        id: i + 1,
        date: '2024-' + (Math.floor(Math.random() * 12) + 1) + '-' + (Math.floor(Math.random() * 28) + 1),
        customer: customers[Math.floor(Math.random() * 5)],
        amount: '$' + (Math.random() * 5000 + 100).toFixed(0),
        status: statuses[Math.floor(Math.random() * 3)]
    });
}

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'date', label: 'Date' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'status', label: 'Status' }
];

const topProducts = [
    { rank: 1, name: 'FletBox Pro', sales: '$45,230' },
    { rank: 2, name: 'Analytics Suite', sales: '$32,150' },
    { rank: 3, name: 'Cloud Storage', sales: '$28,900' },
    { rank: 4, name: 'Security Pack', sales: '$21,450' },
    { rank: 5, name: 'API Gateway', sales: '$18,320' }
];

// ========== KPI CARD ==========
const KPICard = function(props) {
    const title = props.title;
    const value = props.value;
    const change = props.change;
    const icon = props.icon;
    const color = props.color;
    
    return Container({
        width: '100%',
        flex: 1,
        minWidth: 180,
        child: Card({
            padding: 16,
            bgColor: colors.surface,
            borderRadius: 16,
            shadow: '0 4px 12px rgba(0,0,0,0.05)',
            child: Row({
                alignItems: 'center',
                justifyContent: 'space-between',
                children: [
                    Column({
                        gap: 8,
                        children: [
                            Text({ text: title, size: 12, color: colors.textSecondary }),
                            Text({ text: value, size: 24, weight: 'bold', color: colors.text }),
                            Row({
                                alignItems: 'center',
                                gap: 4,
                                children: [
                                    Icon({ name: change.startsWith('+') ? 'arrow_upward' : 'arrow_downward', size: 14, color: change.startsWith('+') ? colors.success : colors.danger }),
                                    Text({ text: change, size: 11, color: change.startsWith('+') ? colors.success : colors.danger, weight: 'bold' })
                                ]
                            })
                        ]
                    }),
                    Container({
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        bgColor: color + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        child: Icon({ name: icon, size: 24, color: color })
                    })
                ]
            })
        })
    });
};

// ========== RECENT ACTIVITY ROW ==========
const ActivityRow = function(props) {
    const icon = props.icon;
    const text = props.text;
    const time = props.time;
    const color = props.color;
    
    return Row({
        alignItems: 'center',
        gap: 12,
        style: { padding: '10px 0', borderBottom: '1px solid ' + colors.border },
        children: [
            Container({
                width: 32,
                height: 32,
                borderRadius: 16,
                bgColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
                child: Icon({ name: icon, size: 16, color: color })
            }),
            Column({
                flex: 1,
                gap: 2,
                children: [
                    Text({ text: text, size: 13, color: colors.text }),
                    Text({ text: time, size: 10, color: colors.textSecondary })
                ]
            })
        ]
    });
};

// ========== TOP PRODUCTS LIST ==========
const TopProductsList = function() {
    return Column({
        gap: 12,
        children: topProducts.map(function(product) {
            return Row({
                alignItems: 'center',
                justifyContent: 'space-between',
                style: { padding: '8px 0', borderBottom: '1px solid ' + colors.border },
                children: [
                    Row({
                        alignItems: 'center',
                        gap: 12,
                        children: [
                            Container({
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                bgColor: colors.primary + '20',
                                justifyContent: 'center',
                                alignItems: 'center',
                                child: Text({ text: '#' + product.rank, size: 10, weight: 'bold', color: colors.primary })
                            }),
                            Text({ text: product.name, size: 13, color: colors.text })
                        ]
                    }),
                    Text({ text: product.sales, size: 13, weight: 'bold', color: colors.text })
                ]
            });
        })
    });
};

// ========== DASHBOARD CONTENT ==========
const DashboardContent = function() {
    return Column({
        width: '100%',
        gap: 24,
        children: [
            // Welcome Row
            Row({
                justifyContent: 'space-between',
                alignItems: 'center',
                children: [
                    Column({
                        gap: 4,
                        children: [
                            Text({ text: 'Welcome back, Admin', size: 24, weight: 'bold', color: colors.text }),
                            Text({ text: 'Here\'s what\'s happening with your business today.', size: 13, color: colors.textSecondary })
                        ]
                    }),
                    Button({
                        text: 'Export Report',
                        variant: 'outlined',
                        iconLeft: 'download',
                        size: 'small',
                        borderRadius: 8,
                        onPress: () => openDrawer(),
                    })
                ]
            }),
            
            // KPI Cards Row
            Row({
                gap: 16,
                flexWrap: 'wrap',
                children: [
                    KPICard({ title: kpiData[0].title, value: kpiData[0].value, change: kpiData[0].change, icon: kpiData[0].icon, color: kpiData[0].color }),
                    KPICard({ title: kpiData[1].title, value: kpiData[1].value, change: kpiData[1].change, icon: kpiData[1].icon, color: kpiData[1].color }),
                    KPICard({ title: kpiData[2].title, value: kpiData[2].value, change: kpiData[2].change, icon: kpiData[2].icon, color: kpiData[2].color }),
                    KPICard({ title: kpiData[3].title, value: kpiData[3].value, change: kpiData[3].change, icon: kpiData[3].icon, color: kpiData[3].color })
                ]
            }),
            
            // Charts Row
            Row({
                gap: 20,
                flexWrap: 'wrap',
                children: [
                    // Sales Chart
                    Container({
                        flex: 1.2,
                        minWidth: 350,
                        child: Card({
                            padding: 20,
                            bgColor: colors.surface,
                            borderRadius: 16,
                            shadow: '0 4px 12px rgba(0,0,0,0.05)',
                            child: Column({
                                gap: 16,
                                children: [
                                    Row({
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        children: [
                                            Text({ text: '📈 Revenue Trend', size: 16, weight: 'bold' }),
                                            Container({
                                                padding: '4px 12px',
                                                bgColor: colors.success + '20',
                                                borderRadius: 20,
                                                child: Text({ text: '+23% vs last year', size: 11, color: colors.success, weight: 'bold' })
                                            })
                                        ]
                                    }),
                                    Chart({
                                        type: 'area',
                                        data: monthlySales,
                                        labels: months,
                                        width: '100%',
                                        height: 280,
                                        lineColor: colors.primary,
                                        areaColor: colors.primary + '20',
                                        showGrid: true,
                                        showLabels: true,
                                        padding: { top: 20, right: 30, bottom: 30, left: 45 }
                                    })
                                ]
                            })
                        })
                    }),
                    
                    // BTC Chart
                    Container({
                        flex: 1,
                        minWidth: 350,
                        child: Card({
                            padding: 20,
                            bgColor: colors.surface,
                            borderRadius: 16,
                            shadow: '0 4px 12px rgba(0,0,0,0.05)',
                            child: Column({
                                gap: 16,
                                children: [
                                    Row({
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        children: [
                                            Text({ text: '₿ Bitcoin (50 days)', size: 16, weight: 'bold' }),
                                            Container({
                                                padding: '4px 12px',
                                                bgColor: colors.warning + '20',
                                                borderRadius: 20,
                                                child: Text({ text: 'Live', size: 11, color: colors.warning, weight: 'bold' })
                                            })
                                        ]
                                    }),
                                    Chart({
                                        type: 'candle',
                                        data: btcData,
                                        labels: btcDays,
                                        width: '100%',
                                        height: 280,
                                        candleWidth: 6,
                                        candleSpacing: 1,
                                        candleUpColor: colors.success,
                                        candleDownColor: colors.danger,
                                        showGrid: true,
                                        showLabels: false,
                                        padding: { top: 20, right: 30, bottom: 20, left: 45 }
                                    })
                                ]
                            })
                        })
                    })
                ]
            }),
            
            // Bottom Section - DataTable full width, Top Products and Activity in Row
            Column({
                gap: 20,
                children: [
                    // DataTable (full width)
                    Card({
                        padding: 20,
                        bgColor: colors.surface,
                        borderRadius: 16,
                        shadow: '0 4px 12px rgba(0,0,0,0.05)',
                        child: Column({
                            gap: 16,
                            children: [
                                Row({
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    children: [
                                        Text({ text: '📋 Recent Transactions', size: 16, weight: 'bold' }),
                                        Button({ text: 'View All', variant: 'text', size: 'small' })
                                    ]
                                }),
                                DataTable({
                                    columns: columns,
                                    rows: transactions.slice(0, 10),
                                    striped: true,
                                    hoverable: true,
                                    compact: true
                                })
                            ]
                        })
                    }),
                    
                    // Top Products and Recent Activity in ROW (side by side)
                    Row({
                        gap: 20,
                        flexWrap: 'wrap',
                        children: [
                            // Top Products
                            Container({
                                flex: 1,
                                minWidth: 250,
                                child: Card({
                                    padding: 20,
                                    bgColor: colors.surface,
                                    borderRadius: 16,
                                    shadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    child: Column({
                                        gap: 16,
                                        children: [
                                            Text({ text: '🏆 Top Products', size: 16, weight: 'bold' }),
                                            TopProductsList()
                                        ]
                                    })
                                })
                            }),
                            
                            // Recent Activity
                            Container({
                                flex: 1,
                                minWidth: 250,
                                child: Card({
                                    padding: 20,
                                    bgColor: colors.surface,
                                    borderRadius: 16,
                                    shadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    child: Column({
                                        gap: 16,
                                        children: [
                                            Text({ text: '🔄 Recent Activity', size: 16, weight: 'bold' }),
                                            ActivityRow({ icon: 'shopping_cart', text: 'New order from John Doe', time: '2 minutes ago', color: colors.success }),
                                            ActivityRow({ icon: 'person_add', text: 'New user registered', time: '15 minutes ago', color: colors.primary }),
                                            ActivityRow({ icon: 'payment', text: 'Payment received #3421', time: '1 hour ago', color: colors.info }),
                                            ActivityRow({ icon: 'warning', text: 'High server load detected', time: '3 hours ago', color: colors.warning })
                                        ]
                                    })
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
};

// ========== DRAWER MENU ==========
const drawer = Drawer({
    header: Container({
        padding: 24,
        bgColor: colors.primary,
        child: Column({
            gap: 8,
            children: [
                Container({
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    bgColor: '#ffffff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'dashboard', size: 28, color: colors.primary })
                }),
                Text({ text: 'FletBox Pro', size: 18, weight: 'bold', color: '#fff' }),
                Text({ text: 'admin@fletbox.com', size: 11, color: 'rgba(255,255,255,0.7)' })
            ]
        })
    }),
    body: [
        DrawerItem({ icon: 'dashboard', label: 'Overview', selected: true, onPress: function() { closeDrawer(); } }),
        DrawerItem({ icon: 'show_chart', label: 'Analytics' }),
        DrawerItem({ icon: 'attach_money', label: 'Revenue' }),
        DrawerItem({ icon: 'people', label: 'Users' }),
        DrawerItem({ icon: 'settings', label: 'Settings' })
    ]
});

// ========== APP ==========
const App = function() {
    return Scaffold({
        appBar: AppBar({
            title: 'FletBox Pro Dashboard',
            backgroundColor: colors.primary,
            titleColor: '#fff',
            elevation: 2,
            showBackButton: false
        }),
        drawer: drawer,
        body: Container({
            width: '100%',
            padding: 24,
            child: DashboardContent()
        }),
        backgroundColor: colors.background
    });
};

runApp(App, 'root');
