// app.js
import { runApp, Container, Column, TreeView, Text, Button, Row, colors } from './index.js';

const fileSystem = [
    {
        id: 1,
        label: 'Documents',
        children: [
            { id: 2, label: 'resume.pdf' },
            { id: 3, label: 'cover-letter.pdf' },
            {
                id: 4,
                label: 'Projects',
                children: [
                    { id: 5, label: 'fletbox.js' },
                    { id: 6, label: 'README.md' }
                ]
            }
        ]
    },
    {
        id: 7,
        label: 'Images',
        children: [
            { id: 8, label: 'logo.png' },
            { id: 9, label: 'screenshot.jpg' }
        ]
    }
];

const App = () => {
    let treeRef = null;
    let statusText = null;

    const handleExpandAll = () => {
        console.log('Expand All clicked');
        if (treeRef) {
            treeRef.expandAll();
            if (statusText) statusText.text = 'Status: All expanded';
        } else {
            console.log('treeRef is still null');
        }
    };

    const handleCollapseAll = () => {
        console.log('Collapse All clicked');
        if (treeRef) {
            treeRef.collapseAll();
            if (statusText) statusText.text = 'Status: All collapsed';
        } else {
            console.log('treeRef is still null');
        }
    };

    return Container({
        width: '100%',
        minHeight: '100vh',
        bgColor: colors.background,
        padding: 20,
        child: Column({
            gap: 20,
            children: [
                Text({ text: '🌳 TreeView Demo', size: 28, weight: 'bold', color: colors.primary }),
                
                Row({
                    gap: 10,
                    children: [
                        Button({
                            text: 'Expand All',
                            variant: 'outlined',
                            size: 'small',
                            onPress: handleExpandAll
                        }),
                        Button({
                            text: 'Collapse All',
                            variant: 'outlined',
                            size: 'small',
                            onPress: handleCollapseAll
                        })
                    ]
                }),
                
                (() => {
                    const text = Text({ text: 'Status: Ready', size: 12, color: colors.success });
                    statusText = text;
                    return text;
                })(),
                
                TreeView({
                    nodes: fileSystem,
                    defaultExpanded: false,
                    indent: 20,
                    showIcons: true,
                    selectable: true,
                    onSelect: (node) => {
                        console.log('Selected:', node.label);
                        if (statusText) statusText.text = `Selected: ${node.label}`;
                    },
                    onToggle: (id, expanded) => {
                        console.log(`Node ${id} expanded: ${expanded}`);
                    },
                    ref: (ref) => {
                        console.log('TreeView ref assigned:', ref);
                        treeRef = ref;
                    }
                })
            ]
        })
    });
};

runApp(App, 'root');
