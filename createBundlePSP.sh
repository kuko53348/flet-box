#!/bin/bash
echo "🎮 Building FletBox for PSP - Single File Bundle"

# ============ LIMPIAR ============
rm -rf dist-psp
mkdir -p dist-psp

# ============ BUNDLE TODO EN UN SOLO ARCHIVO ============
echo "📦 Bundling everything into ONE file..."

npx esbuild src/app.js \
    --bundle \
    --outfile=dist-psp/app.js \
    --format=iife \
    --minify \
    --tree-shaking=true \
    --target=es5 \
    --global-name=FletBox \
    --external:*.css \
    --external:*.woff2 \
    --define:global=window \
    --define:process.env.NODE_ENV='"production"'

# ============ CREAR INDEX.HTML CON TODO INCLUIDO ============
echo "📄 Creating index.html with everything included..."

cat > dist-psp/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FletBox PSP</title>
  
  <!-- CSS básico (todo aquí) -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f0f0; font-family: sans-serif; padding: 10px; }
    
    /* Layout con tablas (alternativa a flex) */
    .container { display: table; width: 100%; }
    .row { display: table-row; }
    .col { display: table-cell; padding: 4px; vertical-align: top; }
    
    /* Componentes */
    .card { background: white; padding: 16px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; }
    .btn { background: #4CAF50; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
    .btn:hover { background: #45a049; }
    .text-center { text-align: center; }
    .mt-10 { margin-top: 10px; }
    .mb-10 { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <!-- TODO EL JS EN UN SOLO ARCHIVO -->
  <script src="app.js"></script>
  
  <!-- Iniciar app -->
  <script>
    if (window.FletBox) {
      window.FletBox.runApp(window.FletBox.App, 'root');
    } else {
      console.error('❌ FletBox no cargado');
      document.getElementById('root').innerHTML = 
        '<div class="card"><h2>❌ Error</h2><p>No se pudo cargar la app</p></div>';
    }
  </script>
</body>
</html>
EOF

echo ""
echo "✅ BUILD COMPLETADO!"
echo "📁 dist-psp/"
echo "   ├── index.html  (con CSS incluido)"
echo "   └── app.js      (TODO el código en UN solo archivo)"
echo ""
echo "🚀 Copia TODO a la PSP:"
echo "   dist-psp/ -> PSP/COMMON/"
