// Definir Gradient
//
// Usar en Container
// background: Gradient('linear', ['red', 'blue'])
// background: Gradient('circle', ['white', 'black'])
// background: Gradient('conic', ['red', 'yellow', 'blue'])

const gradient = (type, colors, angle = 135) => {
    const stops = colors.join(', ');
    if (type === 'linear') return `linear-gradient(${angle}deg, ${stops})`;
    if (type === 'circle') return `radial-gradient(circle, ${stops})`;
    return `conic-gradient(from ${angle}deg, ${stops})`;
};

export default gradient;
