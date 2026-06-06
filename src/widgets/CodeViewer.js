// widgets/CodeViewer.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';
import { generateHighlightedHtml } from '../utils/syntaxHighlight.js';

export const CodeViewer = (props) => {
    const {
        code,
        title,
        maxHeight = 400,
        fontSize = 12,
        backgroundColor = colors.gray100,
        padding = 12,
        borderRadius = 8,
        showHeader = true,
        showLineNumbers = false,
        startingLineNumber = 1,
        lineNumberWidth = 40,
        lineNumberColor = colors.secondary,
        
        // Color props for consistency
        headerBgColor = colors.primary,
        headerTextColor = '#ffffff',
        borderColor = colors.border,
        
        ...rest
    } = props;

    // Get the code as string
    const codeString = typeof code === 'string' 
        ? code 
        : JSON.stringify(code, null, 2);
    
    // Split code into lines
    const lines = codeString.split('\n');
    const lineCount = lines.length;
    
    // Generate highlighted HTML for each line
    const highlightedLines = lines.map(line => generateHighlightedHtml(line));
    
    // Create main container with WidgetFactory
    const container = WidgetFactory({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...rest
    });
    
    // Add title header if provided
    let header = null;
    if (title && showHeader) {
        header = WidgetFactory({
            tag: 'div',
            padding: '8px 12px',
            backgroundColor: headerBgColor,
            borderTopLeftRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            borderTopRightRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            color: headerTextColor,
            fontSize: '14px',
            fontWeight: 'bold',
            textContent: title
        });
        container.appendChild(header);
    }
    
    // Create wrapper with horizontal scroll using WidgetFactory
    const scrollWrapper = WidgetFactory({
        tag: 'div',
        backgroundColor: backgroundColor,
        borderRadius: title ? `0 0 ${typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius} ${typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius}` : (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius),
        overflow: 'auto',
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        overflowX: 'auto',
        overflowY: 'auto'
    });
    
    if (showLineNumbers) {
        // ========== WITH LINE NUMBERS ==========
        // Create flex container with WidgetFactory
        const flexContainer = WidgetFactory({
            tag: 'div',
            display: 'flex',
            flexDirection: 'row',
            minWidth: '100%',
            width: 'fit-content'
        });
        
        // Line numbers column using WidgetFactory
        const lineNumbersCol = WidgetFactory({
            tag: 'div',
            backgroundColor: backgroundColor,
            borderRight: `1px solid ${borderColor}`,
            padding: `${padding}px 0`,
            fontFamily: 'monospace',
            fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
            lineHeight: '1.5',
            textAlign: 'right',
            color: lineNumberColor,
            userSelect: 'none',
            width: `${lineNumberWidth}px`,
            flexShrink: 0
        });
        
        // Add line numbers (manual DOM manipulation needed for dynamic content)
        for (let i = 0; i < lineCount; i++) {
            const lineNumber = startingLineNumber + i;
            const numberDiv = WidgetFactory({
                tag: 'div',
                padding: `0 ${padding / 2}px 0 ${padding}px`,
                whiteSpace: 'pre',
                textContent: String(lineNumber)
            });
            lineNumbersCol.appendChild(numberDiv);
        }
        
        // Code column using WidgetFactory
        const codeCol = WidgetFactory({
            tag: 'div',
            padding: `${padding}px`,
            fontFamily: 'monospace',
            fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
            lineHeight: '1.5',
            whiteSpace: 'pre',
            flex: 1,
            overflowX: 'visible'
        });
        
        // Add highlighted code lines (manual DOM for innerHTML)
        for (let i = 0; i < lineCount; i++) {
            const lineDiv = WidgetFactory({
                tag: 'div',
                whiteSpace: 'pre',
                minHeight: '1.5em'
            });
            lineDiv.innerHTML = highlightedLines[i] || '&nbsp;';
            codeCol.appendChild(lineDiv);
        }
        
        flexContainer.appendChild(lineNumbersCol);
        flexContainer.appendChild(codeCol);
        scrollWrapper.appendChild(flexContainer);
        
        // Sync scroll between line numbers and code (direct DOM needed)
        const syncScroll = () => {
            lineNumbersCol.scrollTop = codeCol.scrollTop;
        };
        
        codeCol.addEventListener('scroll', syncScroll);
        
        // Store cleanup
        const originalCleanup = scrollWrapper._cleanup;
        scrollWrapper._cleanup = () => {
            if (originalCleanup) originalCleanup();
            codeCol.removeEventListener('scroll', syncScroll);
        };
        
    } else {
        // ========== WITHOUT LINE NUMBERS (default) ==========
        const codeWrapper = WidgetFactory({
            tag: 'div',
            padding: typeof padding === 'number' ? `${padding}px` : padding,
            fontFamily: 'monospace',
            fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
            whiteSpace: 'pre',
            lineHeight: '1.5'
        });
        codeWrapper.innerHTML = highlightedLines.join('\n');
        scrollWrapper.appendChild(codeWrapper);
    }
    
    container.appendChild(scrollWrapper);
    
    // ========== PUBLIC METHODS (manteniendo API existente) ==========
    
    // Update the displayed code
    container.updateCode = (newCode) => {
        const newCodeString = typeof newCode === 'string' 
            ? newCode 
            : JSON.stringify(newCode, null, 2);
        const newLines = newCodeString.split('\n');
        const newHighlighted = newLines.map(line => generateHighlightedHtml(line));
        
        if (showLineNumbers && flexContainer) {
            // Update line numbers
            const lineNumbersCol = flexContainer.children[0];
            const codeCol = flexContainer.children[1];
            
            // Clear and rebuild line numbers
            while (lineNumbersCol.firstChild) {
                lineNumbersCol.removeChild(lineNumbersCol.firstChild);
            }
            for (let i = 0; i < newLines.length; i++) {
                const lineNumber = startingLineNumber + i;
                const numberDiv = WidgetFactory({
                    tag: 'div',
                    padding: `0 ${padding / 2}px 0 ${padding}px`,
                    whiteSpace: 'pre',
                    textContent: String(lineNumber)
                });
                lineNumbersCol.appendChild(numberDiv);
            }
            
            // Clear and rebuild code
            while (codeCol.firstChild) {
                codeCol.removeChild(codeCol.firstChild);
            }
            for (let i = 0; i < newHighlighted.length; i++) {
                const lineDiv = WidgetFactory({
                    tag: 'div',
                    whiteSpace: 'pre',
                    minHeight: '1.5em'
                });
                lineDiv.innerHTML = newHighlighted[i] || '&nbsp;';
                codeCol.appendChild(lineDiv);
            }
        } else if (scrollWrapper.firstChild && !showLineNumbers) {
            const codeWrapper = scrollWrapper.firstChild;
            codeWrapper.innerHTML = newHighlighted.join('\n');
        }
    };
    
    // Update the title
    container.updateTitle = (newTitle) => {
        if (header) {
            header.textContent = newTitle;
        }
    };
    
    // Toggle line numbers (manteniendo funcionalidad)
    container.toggleLineNumbers = () => {
        console.warn('toggleLineNumbers: recreate the widget to change this prop');
    };
    
    // Scroll methods
    container.scrollTo = (x, y) => {
        scrollWrapper.scrollLeft = x;
        scrollWrapper.scrollTop = y;
    };
    
    container.scrollToStart = () => {
        scrollWrapper.scrollLeft = 0;
    };
    
    container.scrollToEnd = () => {
        scrollWrapper.scrollLeft = scrollWrapper.scrollWidth;
    };
    
    return container;
};

export default CodeViewer;
