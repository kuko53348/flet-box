// src/core/App.js
// FletBox Kids - Ultra simple: solo recibe UN widget

export const App = (widget) => {
    const root = document.getElementById('root') || document.body;
    root.innerHTML = '';
    root.style.margin = '0';
    root.style.padding = '0';
    
    root.style.width = '100%';
    root.style.minHeight = '100vh';
    
    if (widget && widget.nodeType === 1) {
        widget.style.width = '100%';
        root.appendChild(widget);
    }
    
    return root;
};

export default App;
