// bin/commands/create.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createFile, copyFile, makeExecutable } from '../utils/helpers.js';
import * as templates from '../utils/templates.js';
import { c } from '../utils/colors.js';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProject = async (projectName) => {
    if (!projectName) {
        console.error(c('red', '❌ Please specify a project name'));
        console.log(c('gray', 'Example: flet-box create my-app'));
        process.exit(1);
    }

    const projectPath = path.join(process.cwd(), projectName);
    
    // Check if directory already exists
    if (fs.existsSync(projectPath)) {
        console.error(c('red', `❌ Folder "${projectName}" already exists`));
        process.exit(1);
    }

    console.log(`\n${c('cyan', '📦 Creating project:')} ${projectName}\n`);
    
    // Create directory structure
    const dirs = [
        '', 'src', 'src/assets/fonts', 'src/components', 
        'src/screens', 'src/database', 'src/services'
    ];
    
    for (const dir of dirs) {
        const fullPath = path.join(projectPath, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`${c('green', '📁')} Created: ${dir || '.'}`);
        }
    }
    
    // Create main files
    createFile(path.join(projectPath, 'index.html'), templates.indexHtml());
    createFile(path.join(projectPath, 'src/app.js'), templates.appJs());
    createFile(path.join(projectPath, 'src/screens/RootScreen.js'), templates.rootScreenJs());
    createFile(path.join(projectPath, 'src/screens/HomeScreen.js'), templates.homeScreenJs());
    createFile(path.join(projectPath, 'src/database/themes.js'), templates.themesJs());
    createFile(path.join(projectPath, 'run.sh'), templates.runSh());
    createFile(path.join(projectPath, 'src/screens/AboutScreen.js'), templates.aboutScreenJs());
    createFile(path.join(projectPath, 'src/components/DrawerMenu.js'), templates.drawerMenuJs());

    createFile(path.join(projectPath, 'manifest.json'), templates.manifest());
    // createFile(path.join(projectPath, 'createBundle.sh'), templates.createBundleSh());
    createFile(path.join(projectPath, 'service-worker.js'), templates.serviceWorkerJs());
    createFile(path.join(projectPath, 'package.json'), templates.packageJson(projectName));
    createFile(path.join(projectPath, '.gitignore'), templates.gitignore());
    createFile(path.join(projectPath, 'README.md'), templates.readme(projectName));
    
    // Make scripts executable
    makeExecutable(path.join(projectPath, 'run.sh'));
    // makeExecutable(path.join(projectPath, 'createBundle.sh'));
    
    // Copy fonts and assets from package
    const sourcePackageDir = path.join(__dirname, '..', '..');
    const sourceFontsDir = path.join(sourcePackageDir, 'src/fonts');
    const destFontsDir = path.join(projectPath, 'src/assets/fonts');
    
    if (fs.existsSync(sourceFontsDir)) {
        const iconsCss = path.join(sourceFontsDir, 'icons.css');
        const woff = path.join(sourceFontsDir, 'MaterialIcons-Regular.woff2');
        
        if (fs.existsSync(iconsCss)) {
            copyFile(iconsCss, path.join(destFontsDir, 'icons.css'));
        }
        if (fs.existsSync(woff)) {
            copyFile(woff, path.join(destFontsDir, 'MaterialIcons-Regular.woff2'));
        }
    } else {
        console.log(c('yellow', '⚠️ Warning: Fonts directory not found, skipping...'));
    }
    
    // Copy additional assets
    const sourceAssetsDir = path.join(sourcePackageDir, 'src/assets');
    const destAssetsDir = path.join(projectPath, 'src/assets');

    if (fs.existsSync(sourceAssetsDir)) {
        // logo
        const logo = path.join(sourceAssetsDir, 'logo.png');
        if (fs.existsSync(logo)) {
            copyFile(logo, path.join(destAssetsDir, 'logo.png'));
        }

        // icon 192
        const iconSmall = path.join(sourceAssetsDir, 'icon-192.png');
        const iconSmallMaskared = path.join(sourceAssetsDir, 'icon-192-maskable.png');

        if (fs.existsSync(iconSmall)) {
            copyFile(iconSmall, path.join(destAssetsDir, 'icon-192.png')); // ✅ copia el icono correcto
        }
        if (fs.existsSync(iconSmallMaskared)) {
            copyFile(iconSmallMaskared, path.join(destAssetsDir, 'icon-192-maskable.png'));
        }

        // icon 512
        const iconBig = path.join(sourceAssetsDir, 'icon-512.png');
        const iconBigMaskared = path.join(sourceAssetsDir, 'icon-512-maskable.png');

        if (fs.existsSync(iconBig)) {
          copyFile(iconBig, path.join(destAssetsDir, 'icon-512.png'));
        }
        if (fs.existsSync(iconBigMaskared)) {
            copyFile(iconBigMaskared, path.join(destAssetsDir, 'icon-512-maskable.png'));
        }
    }

    
    console.log(`\n${c('green', '✅')} Project "${projectName}" created successfully!\n`);
    console.log(`  ${c('cyan', 'cd')} ${projectName}`);
    console.log(`  ${c('cyan', 'npm install')}`);
    console.log(`  ${c('cyan', 'npm run dev')}\n`);
    console.log(`${c('gray', '📱 Screens: RootScreen (welcome) and HomeScreen (likes counter)')}\n`);
};
