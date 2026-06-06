// app.js
import { 
    runApp, 
    Container, 
    Column,
    DraggBox, 
    DroppBox, 
    Text, 
    Button,
    Modal,
    CodeViewer,
    Inspector,
    colors
} from './index.js';

// ========== DATOS ==========
const task = { id: 1, name: 'Drag me!', color: 'blue' };

// ========== ESTADO ==========
let droppedItems = [];
let inspectorModal = null;

// ========== INSPECTOR MODAL ==========
const showInspector = (widget, title) => {
    const code = Inspector(widget);
    
    if (inspectorModal) inspectorModal.close();
    
    inspectorModal = Modal({
        title: `🔍 ${title}`,
        width: 600,
        maxWidth: '90%',
        maxHeight: '70%',
        content: CodeViewer({
            code: code,
            maxHeight: 500,
            fontSize: 11
        }),
        actions: [
            Button({
                text: 'Close',
                variant: 'filled',
                bgColor: colors.primary,
                color: '#fff',
                onPress: () => inspectorModal?.close()
            })
        ]
    });
    
    inspectorModal.open();
};

// ========== DROP ZONE CON INSPECTOR ==========
let dropZoneRef = null;
let dropItemsContainer = null;

const updateDropZoneDisplay = () => {
    if (!dropItemsContainer) return;
    
    // Clear container
    while (dropItemsContainer.firstChild) {
        dropItemsContainer.removeChild(dropItemsContainer.firstChild);
    }
    
    if (droppedItems.length === 0) {
        dropItemsContainer.appendChild(
            Text({ text: '✨ Drop here', color: colors.textSecondary, align: 'center' })
        );
    } else {
        droppedItems.forEach((item, idx) => {
            const itemWidget = Container({
                padding: 8,
                bgColor: colors.success + '20',
                borderRadius: 6,
                margin: 4,
                child: Container({
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    children: [
                        Text({ text: `✅ ${item.name}`, size: 12, color: colors.success }),
                        Button({
                            text: '🔍',
                            variant: 'text',
                            size: 'small',
                            onPress: () => showInspector(itemWidget, `Item: ${item.name}`)
                        })
                    ]
                })
            });
            dropItemsContainer.appendChild(itemWidget);
        });
    }
    
    // Add inspect button for the drop zone itself
    const inspectZoneBtn = Button({
        text: '🔍 Inspect Drop Zone',
        variant: 'outlined',
        size: 'small',
        marginTop: 12,
        onPress: () => showInspector(dropZoneRef, 'Drop Zone Widget')
    });
    dropItemsContainer.appendChild(inspectZoneBtn);
};

// Create the container for dropped items
dropItemsContainer = Container({ id: 'dropped-items' });

// Create drop zone
const dropZone = DroppBox({
    acceptGroups: ['tasks'],
    onDrop: (data) => {
        droppedItems.push(data);
        updateDropZoneDisplay();
        console.log('✅ Dropped:', data);
    },
    onDragEnter: () => {
        console.log('🔥 Drag entered drop zone');
    },
    onDragLeave: () => {
        console.log('👋 Drag left drop zone');
    },
    // Normal styles
    bgColor: colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.border,
    padding: 20,
    width: 300,
    minHeight: 200,
    // Active styles (when dragging over)
    activeBgColor: `${colors.primary}15`,
    activeBorderColor: colors.primary,
    activeBorderWidth: 2,
    activeBorderStyle: 'dashed',
    child: Column({
        gap: 12,
        children: [
            Text({ text: '🎯 Drop Zone', size: 14, weight: 'bold', color: colors.text }),
            dropItemsContainer
        ]
    })
});

dropZoneRef = dropZone;
updateDropZoneDisplay();

// ========== DRAGGABLE BOX CON INSPECTOR ==========
const draggableCard = DraggBox({
    data: task,
    group: 'tasks',
    child: Container({
        width: 200,
        padding: 20,
        bgColor: colors.primary,
        borderRadius: 12,
        shadow: '0 4px 12px rgba(0,0,0,0.15)',
        child: Column({
            gap: 12,
            alignItems: 'center',
            children: [
                Text({ text: '📦 ' + task.name, size: 16, weight: 'bold', color: '#fff' }),
                Text({ text: 'Drag this box', size: 11, color: 'rgba(255,255,255,0.8)' }),
                Button({
                    text: '🔍 Inspect',
                    variant: 'text',
                    size: 'small',
                    color: '#fff',
                    onPress: () => showInspector(draggableCard, 'Draggable Box')
                })
            ]
        })
    })
});

// ========== RESET BUTTON ==========
const resetButton = Button({
    text: '🗑️ Reset Drop Zone',
    variant: 'outlined',
    bgColor: colors.danger,
    color: colors.danger,
    marginTop: 20,
    onPress: () => {
        droppedItems = [];
        updateDropZoneDisplay();
    }
});

// ========== APP ==========
const App = () => {
    return Container({
        width: '100%',
        minHeight: '100vh',
        bgColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        child: Column({
            gap: 30,
            alignItems: 'center',
            children: [
                Text({ 
                    text: '🎯 Drag & Drop Demo', 
                    size: 24, 
                    weight: 'bold', 
                    color: colors.primary 
                }),
                Text({ 
                    text: 'Drag the blue box to the drop zone | Click 🔍 to inspect', 
                    size: 12, 
                    color: colors.textSecondary 
                }),
                // Draggable box
                draggableCard,
                // Drop zone
                dropZone,
                // Reset button
                resetButton
            ]
        })
    });
};

runApp(App, 'root');
