#!/bin/bash
echo "📦 Building FletBox project..."

if ! command -v esbuild &> /dev/null && ! npx esbuild --version &> /dev/null; then
    echo "esbuild not installed. Run: npm install --save-dev esbuild"
    exit 1
fi

rm -rf dist && mkdir -p dist

# Crear estructura dist/src/assets/fonts
mkdir -p dist/src/assets/fonts

# Copiar assets a dist/src/assets/
if [ -d "src/assets" ]; then
    cp -r src/assets/* dist/src/assets/ 2>/dev/null
fi

# Copiar fuentes específicamente
if [ -f "src/assets/fonts/icons.css" ]; then
    cp src/assets/fonts/icons.css dist/src/assets/fonts/
fi
if [ -f "src/assets/fonts/MaterialIcons-Regular.woff2" ]; then
    cp src/assets/fonts/MaterialIcons-Regular.woff2 dist/src/assets/fonts/
fi

# Copiar run.sh
[ -f "run.sh" ] && cp run.sh dist/

# Copiar index.html (sin modificar)
[ -f "index.html" ] && cp index.html dist/

echo "📦 Bundling app.js with tree shaking (only used widgets)..."
# Bundlear app.js dentro de dist/src/ con tree shaking activado
npx esbuild src/app.js \
    --bundle \
    --outfile=dist/src/app.js \
    --format=esm \
    --minify \
    --tree-shaking=true \
    --target=es2020 \
    --define:FLETBOX_DEV=false \
    --external:*.css \
    --external:*.woff2
    # --sourcemap \

# NOTA: lazyConfig.js eliminado - ya no se usa

# Copiar service-worker.js si existe
[ -f "service-worker.js" ] && cp service-worker.js dist/

echo ""
echo "✅ Build complete! Output in dist/"
echo ""
echo "📁 Estructura generada:"
echo "dist/"
echo "├── index.html"
echo "├── run.sh"
echo "├── src/"
echo "│   ├── app.js (con tree shaking - solo widgets usados)"
echo "│   ├── app.js.map"
echo "│   └── assets/"
echo "│       └── fonts/"
echo "│           ├── icons.css"
echo "│           └── MaterialIcons-Regular.woff2"
echo "└── service-worker.js"
echo ""
echo "🚀 Para ejecutar: cd dist && ./run.sh"
