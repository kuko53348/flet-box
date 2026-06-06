// widgets/QRCode.js
import { WidgetFactory } from '../widget-factory/index.js';
import { colors } from '../utils/themes.js';

export const QRCode = (props) => {
    const {
        value = '',
        size = 200,
        bgColor = '#ffffff',
        fgColor = '#000000',
        errorCorrection = 'M',
        margin = 4,
        ...rest
    } = props;

    if (!value) return null;

    let canvasRef = null;
    let currentValue = value;

    // Native QR code generation (simplified - for demo only)
    // Note: This is a simplified QR code generator. For production, use a proper library.
    const generateQRMatrix = () => {
        const data = [];
        for (let i = 0; i < currentValue.length; i++) {
            const code = currentValue.charCodeAt(i);
            for (let j = 0; j < 8; j++) {
                data.push((code >> (7 - j)) & 1);
            }
        }
        
        let matrixSize = 21;
        while (matrixSize * matrixSize < data.length + 200) {
            matrixSize += 2;
        }
        
        const matrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
        
        const addFinderPattern = (x, y) => {
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const nx = x + i;
                    const ny = y + j;
                    if (nx >= 0 && nx < matrixSize && ny >= 0 && ny < matrixSize) {
                        if (Math.abs(i) === 2 || Math.abs(j) === 2 || (Math.abs(i) === 0 && Math.abs(j) === 0)) {
                            matrix[nx][ny] = 1;
                        } else {
                            matrix[nx][ny] = 0;
                        }
                    }
                }
            }
        };
        
        addFinderPattern(2, 2);
        addFinderPattern(matrixSize - 3, 2);
        addFinderPattern(2, matrixSize - 3);
        
        for (let i = 8; i < matrixSize - 8; i++) {
            matrix[6][i] = i % 2;
            matrix[i][6] = i % 2;
        }
        
        const alignPos = matrixSize - 7;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (Math.abs(i) === 1 || Math.abs(j) === 1) {
                    matrix[alignPos + i][alignPos + j] = 1;
                } else {
                    matrix[alignPos + i][alignPos + j] = 0;
                }
            }
        }
        
        for (let i = 0; i < 8; i++) {
            matrix[8][i] = 1;
            matrix[i][8] = 1;
        }
        
        let dataIndex = 0;
        for (let row = 0; row < matrixSize && dataIndex < data.length; row++) {
            for (let col = 0; col < matrixSize && dataIndex < data.length; col++) {
                if (matrix[row][col] === 0) {
                    matrix[row][col] = data[dataIndex++];
                }
            }
        }
        
        return matrix;
    };

    const drawQR = () => {
        if (!canvasRef) return;
        
        const canvas = canvasRef;
        const ctx = canvas.getContext('2d');
        const matrix = generateQRMatrix();
        const moduleCount = matrix.length;
        const cellSize = size / (moduleCount + margin * 2);
        const offset = margin * cellSize;
        
        canvas.width = size;
        canvas.height = size;
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = fgColor;
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (matrix[row][col] === 1) {
                    const x = offset + col * cellSize;
                    const y = offset + row * cellSize;
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    };

    const canvas = document.createElement('canvas');
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.display = 'block';
    canvasRef = canvas;
    
    setTimeout(() => drawQR(), 10);
    
    // Main container using WidgetFactory
    const container = WidgetFactory({
        display: 'inline-block',
        ...rest
    });
    
    container.appendChild(canvas);
    
    container.updateValue = (newValue) => {
        currentValue = newValue;
        drawQR();
    };
    
    container.download = (filename = 'qrcode.png') => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    };
    
    container.getDataURL = () => canvas.toDataURL();
    container.getCanvas = () => canvas;
    container.getValue = () => currentValue;
    
    return container;
};

export default QRCode;
