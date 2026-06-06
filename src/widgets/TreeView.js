// widgets/TreeView.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const TreeView = (props) => {
    const {
        nodes = [],
        onSelect,
        onToggle,
        expandedNodes = [],
        indent = 20,
        showIcons = true,
        folderIcon = 'folder',
        folderOpenIcon = 'folder_open',
        fileIcon = 'insert_drive_file',
        expandIcon = 'chevron_right',
        collapseIcon = 'expand_more',
        defaultExpanded = false,
        selectable = true,
        selectedNodeId = null,
        
        // Color props for consistency
        bgColor = 'transparent',
        hoverBgColor = colors.gray100,
        selectedBgColor = `${colors.primary}20`,
        textColor = colors.text,
        selectedTextColor = colors.primary,
        iconColor = colors.textSecondary,
        folderIconColor = colors.warning,
        borderColor = colors.border,
        
        // Spacing props
        nodePadding = '6px 4px',
        nodeGap = 4,
        childrenGap = 2,
        borderRadius = 6,
        
        // Font props
        fontSize = 14,
        iconSize = 18,
        
        // Animation
        transitionDuration = '0.2s',
        
        ...rest
    } = props;

    let expandedSet = new Set(expandedNodes);
    let currentSelectedId = selectedNodeId;
    let containerRef = null;
    let isRendering = false;

    // Initialize with default expanded if needed
    if (defaultExpanded && expandedNodes.length === 0) {
        const collectAllIds = (nodeList) => {
            for (const node of nodeList) {
                expandedSet.add(node.id);
                if (node.children && node.children.length) {
                    collectAllIds(node.children);
                }
            }
        };
        collectAllIds(nodes);
    }

    const collectAllIds = (nodeList) => {
        let ids = [];
        for (const node of nodeList) {
            ids.push(node.id);
            if (node.children && node.children.length) {
                ids = ids.concat(collectAllIds(node.children));
            }
        }
        return ids;
    };

    const renderNode = (node, level = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedSet.has(node.id);
        const isSelected = currentSelectedId === node.id;

        // Node wrapper
        const nodeWrapper = WidgetFactory({
            tag: 'div',
            display: 'flex',
            flexDirection: 'column'
        });

        // Node row
        const nodeRow = WidgetFactory({
            tag: 'div',
            display: 'flex',
            alignItems: 'center',
            gap: `${nodeGap}px`,
            cursor: selectable ? 'pointer' : 'default',
            backgroundColor: isSelected ? selectedBgColor : bgColor,
            padding: nodePadding,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            marginLeft: `${level * indent}px`,
            transition: `background-color ${transitionDuration} ease`,
            hoverBackgroundColor: hoverBgColor
        });

        // Add hover effect
        if (selectable && !isSelected) {
            nodeRow.addEventListener('mouseenter', () => {
                nodeRow.style.backgroundColor = hoverBgColor;
            });
            nodeRow.addEventListener('mouseleave', () => {
                nodeRow.style.backgroundColor = bgColor;
            });
        }

        // Selection handler
        if (selectable) {
            nodeRow.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onSelect) {
                    currentSelectedId = node.id;
                    onSelect(node);
                    rerender();
                }
            });
        }

        // Expand/collapse button
        if (hasChildren) {
            const toggleBtn = WidgetFactory({
                tag: 'div',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: `background-color ${transitionDuration} ease`,
                child: WidgetFactory({
                    tag: 'span',
                    className: 'material-icons',
                    fontSize: `${iconSize}px`,
                    color: iconColor,
                    textContent: isExpanded ? collapseIcon : expandIcon
                })
            });
            
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (expandedSet.has(node.id)) {
                    expandedSet.delete(node.id);
                } else {
                    expandedSet.add(node.id);
                }
                if (onToggle) onToggle(node.id, expandedSet.has(node.id));
                rerender();
            });
            
            nodeRow.appendChild(toggleBtn);
        } else {
            const spacer = WidgetFactory({
                tag: 'div',
                width: '24px'
            });
            nodeRow.appendChild(spacer);
        }

        // Node icon
        if (showIcons) {
            let iconName = node.icon;
            if (!iconName) {
                if (hasChildren) {
                    iconName = isExpanded ? folderOpenIcon : folderIcon;
                } else {
                    iconName = fileIcon;
                }
            }
            
            const iconSpan = WidgetFactory({
                tag: 'span',
                className: 'material-icons',
                fontSize: `${iconSize + 2}px`,
                color: node.iconColor || (hasChildren ? folderIconColor : iconColor),
                textContent: iconName
            });
            nodeRow.appendChild(iconSpan);
        }

        // Node label
        const labelSpan = WidgetFactory({
            tag: 'span',
            flex: 1,
            fontSize: `${fontSize}px`,
            fontWeight: isSelected ? 'bold' : 'normal',
            color: isSelected ? selectedTextColor : textColor,
            textContent: node.label
        });
        nodeRow.appendChild(labelSpan);

        // Badge
        if (node.badge) {
            const badge = WidgetFactory({
                tag: 'div',
                backgroundColor: colors.danger,
                borderRadius: '12px',
                padding: '2px 8px',
                child: WidgetFactory({
                    tag: 'span',
                    fontSize: '10px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    textContent: String(node.badge)
                })
            });
            nodeRow.appendChild(badge);
        }

        nodeWrapper.appendChild(nodeRow);

        // Children
        if (hasChildren && isExpanded) {
            const childrenContainer = WidgetFactory({
                tag: 'div',
                display: 'flex',
                flexDirection: 'column',
                gap: `${childrenGap}px`
            });
            
            node.children.forEach(child => {
                childrenContainer.appendChild(renderNode(child, level + 1));
            });
            nodeWrapper.appendChild(childrenContainer);
        }

        return nodeWrapper;
    };

    const rerender = () => {
        if (isRendering || !containerRef) return;
        isRendering = true;
        
        // Clear container
        while (containerRef.firstChild) {
            containerRef.removeChild(containerRef.firstChild);
        }
        
        // Build wrapper
        const wrapper = WidgetFactory({
            tag: 'div',
            display: 'flex',
            flexDirection: 'column',
            gap: `${childrenGap}px`
        });
        
        nodes.forEach(node => {
            wrapper.appendChild(renderNode(node, 0));
        });
        
        containerRef.appendChild(wrapper);
        isRendering = false;
    };

    // Main container using WidgetFactory
    const container = WidgetFactory({
        tag: 'div',
        width: '100%',
        overflow: 'auto',
        ...rest
    });
    
    containerRef = container;
    rerender();

    // ========== PUBLIC METHODS ==========
    
    container.updateNodes = (newNodes, selectedId = null) => {
        nodes.length = 0;
        nodes.push(...newNodes);
        if (selectedId !== undefined) currentSelectedId = selectedId;
        rerender();
    };
    
    container.expandAll = () => {
        const allIds = collectAllIds(nodes);
        allIds.forEach(id => expandedSet.add(id));
        rerender();
    };
    
    container.collapseAll = () => {
        expandedSet.clear();
        rerender();
    };
    
    container.expandTo = (nodeId) => {
        const findPath = (nodeList, targetId, path = []) => {
            for (const node of nodeList) {
                if (node.id === targetId) return [...path, node.id];
                if (node.children) {
                    const res = findPath(node.children, targetId, [...path, node.id]);
                    if (res) return res;
                }
            }
            return null;
        };
        const path = findPath(nodes, nodeId);
        if (path) {
            path.forEach(id => expandedSet.add(id));
            rerender();
        }
    };
    
    container.collapseTo = (nodeId) => {
        const findPath = (nodeList, targetId, path = []) => {
            for (const node of nodeList) {
                if (node.id === targetId) return [...path, node.id];
                if (node.children) {
                    const res = findPath(node.children, targetId, [...path, node.id]);
                    if (res) return res;
                }
            }
            return null;
        };
        const path = findPath(nodes, nodeId);
        if (path) {
            // Keep only the path to target, remove deeper expansions
            const toKeep = new Set(path);
            for (const id of expandedSet) {
                if (!toKeep.has(id)) expandedSet.delete(id);
            }
            rerender();
        }
    };
    
    container.getExpanded = () => Array.from(expandedSet);
    container.getSelected = () => currentSelectedId;
    container.setSelected = (nodeId) => {
        currentSelectedId = nodeId;
        rerender();
        if (onSelect) {
            const findNode = (nodeList, targetId) => {
                for (const node of nodeList) {
                    if (node.id === targetId) return node;
                    if (node.children) {
                        const found = findNode(node.children, targetId);
                        if (found) return found;
                    }
                }
                return null;
            };
            const node = findNode(nodes, nodeId);
            if (node) onSelect(node);
        }
    };

    if (typeof rest.ref === 'function') {
        rest.ref(container);
    }

    return container;
};

export default TreeView;
