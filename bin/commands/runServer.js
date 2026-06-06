// bin/commands/runServer.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { c } from '../utils/colors.js';

// Detectar si estamos en el directorio del framework
const isFrameworkRoot = (projectRoot) => {
    const packageJson = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJson)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
            return pkg.name === 'flet-box';
        } catch (e) {
            return false;
        }
    }
    return false;
};

export const runDevServer = async (options = {}) => {
    const { 
        spaMode = false, 
        hotReload = true, 
        port = process.env.PORT || 8000,
        logRequests = process.env.LOG_REQUESTS !== 'false'
    } = options;
    
    const projectRoot = process.cwd();
    const clients = new Set();
    let watcher = null;
    
    // Detectar si estamos en el framework
    const isFramework = isFrameworkRoot(projectRoot);
    
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
    };
    
    const broadcast = (message) => {
        const msg = typeof message === 'string' ? message : JSON.stringify(message);
        clients.forEach(client => {
            if (client.readyState === WebSocketServer.OPEN) {
                client.send(msg);
            }
        });
    };
    
    const extractExports = (content) => {
        const exports = [];
        const patterns = [
            /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
            /export\s+default\s+(?:function\s+)?(\w+)/g,
            /export\s+\{\s*([^}]+)\s*\}/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (match[1]) {
                    if (match[1].includes(',')) {
                        const names = match[1].split(',').map(s => s.trim());
                        exports.push(...names);
                    } else {
                        exports.push(match[1]);
                    }
                }
            }
        }
        return [...new Set(exports)];
    };
    
    const getChangeType = (filePath, oldContent, newContent) => {
        if (filePath.endsWith('.css')) return 'css';
        if (filePath.endsWith('.html')) return 'full-reload';
        
        if (oldContent && newContent) {
            const oldExports = extractExports(oldContent);
            const newExports = extractExports(newContent);
            
            if (JSON.stringify(oldExports) !== JSON.stringify(newExports)) {
                return 'exports-changed';
            }
        }
        return 'code-changed';
    };
    
    const server = http.createServer((req, res) => {
        try {
            let url = req.url;
            try { url = decodeURIComponent(url); } catch(e) { url = req.url; }
            
            const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, '');
            let filePath = path.join(projectRoot, safePath === '/' ? 'index.html' : safePath);
            let ext = path.extname(filePath).toLowerCase();
            
            fs.access(filePath, fs.constants.F_OK, (err) => {
                // SPA fallback: si el archivo no existe y no tiene extensión, servir index.html
                if (err && spaMode && (!ext || ext === '')) {
                    filePath = path.join(projectRoot, 'index.html');
                    ext = '.html';
                }
                
                fs.readFile(filePath, (err2, content) => {
                    if (err2) {
                        if (logRequests) {
                            console.log(`${c('red', '404')} ${req.method} ${url}`);
                        }
                        res.writeHead(404);
                        res.end('404 - File Not Found');
                        return;
                    }
                    
                    const contentType = mimeTypes[ext] || 'text/plain';
                    
                    if (logRequests) {
                        const sizeKB = (content.length / 1024).toFixed(1);
                        console.log(`${c('green', '200')} ${req.method} ${url} → ${contentType} ${sizeKB}KB`);
                    }
                    
                    // Inyectar HMR solo en HTML
                    if (ext === '.html' && hotReload) {
                        let html = content.toString('utf-8');
                        
                        let hmrScript;
                        if (isFramework) {
                            // ✅ Estamos en el framework: usar ruta directa
                            hmrScript = `
                                <script type="module">
                                    import { initHMR } from '/src/core/hmr-client.js';
                                    initHMR();
                                </script>
                            `;
                            if (logRequests) console.log(c('blue', '🔧 Framework mode: using direct HMR import'));
                        } else {
                            // ✅ Proyecto normal: importar desde módulo npm
                            hmrScript = `
                                <script type="module">
                                    import('flet-box').then(({ initHMR }) => {
                                        if (typeof initHMR === 'function') {
                                            initHMR();
                                        }
                                    }).catch(e => console.warn('HMR not available:', e));
                                </script>
                            `;
                        }
                        
                        if (!html.includes('initHMR')) {
                            if (html.includes('</body>')) {
                                html = html.replace('</body>', `${hmrScript}</body>`);
                            } else {
                                html += hmrScript;
                            }
                            content = html;
                        }
                    }
                    
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            if (!res.headersSent) {
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        }
    });
    
    // WebSocket para HMR
    if (hotReload) {
        const wss = new WebSocketServer({ server });
        
        wss.on('connection', (ws) => {
            clients.add(ws);
            console.log(c('green', '🔌 HMR client connected'));
            ws.send(JSON.stringify({ type: 'request-modules' }));
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'register-modules') {
                        console.log(c('gray', `📦 Registered ${message.modules?.length || 0} modules`));
                    }
                } catch (e) {}
            });
            ws.on('close', () => {
                clients.delete(ws);
                console.log(c('gray', '🔌 HMR client disconnected'));
            });
        });
        
        const watchPaths = ['src/**/*.js', 'src/**/*.mjs', 'src/**/*.css', 'index.html'];
        const moduleVersions = new Map();
        
        watcher = chokidar.watch(watchPaths, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            cwd: projectRoot,
            ignoreInitial: true
        });
        
        watcher.on('change', async (filePath) => {
            const fullPath = path.join(projectRoot, filePath);
            try {
                const newContent = fs.readFileSync(fullPath, 'utf-8');
                const oldContent = moduleVersions.get(filePath);
                const changeType = getChangeType(filePath, oldContent, newContent);
                moduleVersions.set(filePath, newContent);
                console.log(c('yellow', `📝 Changed: ${filePath} (${changeType})`));
                broadcast(JSON.stringify({ type: 'hmr', file: filePath, changeType, timestamp: Date.now() }));
            } catch (err) {
                console.error(c('red', `Error reading file: ${filePath}`));
            }
        });
        
        watcher.on('add', (filePath) => {
            console.log(c('green', `➕ Added: ${filePath}`));
            broadcast(JSON.stringify({ type: 'reload', reason: 'file-added' }));
        });
        
        watcher.on('unlink', (filePath) => {
            console.log(c('red', `➖ Removed: ${filePath}`));
            broadcast(JSON.stringify({ type: 'reload', reason: 'file-removed' }));
        });
        
        console.log(c('blue', '👀 Watching for file changes...'));
    }
    
    server.listen(port, () => {
        console.log(c('green', `✅ Server running at http://localhost:${port}`));
        console.log(c('gray', `🎯 SPA Mode: ${spaMode ? 'ON' : 'OFF'}`));
        console.log(c('gray', `🔥 Hot Reload: ${hotReload ? 'ON' : 'OFF'}`));
        console.log(c('gray', `📊 Logging: ${logRequests ? 'ON' : 'OFF'}`));
        if (isFramework) {
            console.log(c('blue', `🔧 Framework mode detected - using direct HMR imports`));
        }
        console.log(c('gray', '\nPress Ctrl+C to stop\n'));
    });
    
    const cleanup = () => {
        console.log(c('yellow', '\n👋 Shutting down...'));
        if (watcher) watcher.close();
        clients.forEach(client => client.close());
        server.close(() => process.exit(0));
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    return server;
};

export default runDevServer;
