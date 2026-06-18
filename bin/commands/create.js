// bin/commands/create.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createFile, copyFile, makeExecutable } from '../utils/helpers.js';
import * as templates from '../utils/templates.js';
import { c } from '../utils/colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse arguments to detect --adaptive flag
const parseCreateArgs = (args) => {
    let template = 'basic'; // default
    let projectName = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--adaptive') {
            template = 'adaptive';
        } else if (args[i] === '--blank') {
            template = 'blank';
        } else if (args[i] === '--full') {
            template = 'full';
        } else if (args[i] === '--sidebar') {
            template = 'sidebar';
        } else if (!args[i].startsWith('--')) {
            projectName = args[i];
        }
    }
    return { template, projectName };
};

export const createProject = async (projectName, rawArgs = []) => {
    const { template, projectName: name } = parseCreateArgs([projectName, ...rawArgs]);
    const finalName = name || projectName;
    if (!finalName) {
        console.error(c('red', '❌ Project name required'));
        console.log(c('gray', 'Usage: flet-box create <name> [--adaptive|--blank|--full|--sidebar]'));
        process.exit(1);
    }

    const projectPath = path.join(process.cwd(), finalName);
    if (fs.existsSync(projectPath)) {
        console.error(c('red', `❌ Folder "${finalName}" already exists`));
        process.exit(1);
    }

    console.log(`\n${c('cyan', '📦 Creating project:')} ${finalName} (${template} template)\n`);

    // Create directories
    const commonDirs = ['src', 'src/assets/fonts', 'src/database'];
    const extraDirs = template === 'blank' ? [] : ['src/screens', 'src/components'];
    if (template === 'sidebar' || template === 'adaptive') {
        extraDirs.push('src/components/layouts');
    }
    const allDirs = [...commonDirs, ...extraDirs];
    for (const dir of allDirs) {
        const fullPath = path.join(projectPath, dir);
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`${c('green', '📁')} Created: ${dir}`);
    }

    // Create common files
    createFile(path.join(projectPath, 'index.html'), templates.indexHtml());
    createFile(path.join(projectPath, 'package.json'), templates.packageJson(finalName));
    createFile(path.join(projectPath, '.gitignore'), templates.gitignore());
    createFile(path.join(projectPath, 'README.md'), templates.readme(finalName, template));
    createFile(path.join(projectPath, 'run.sh'), templates.runSh());
    createFile(path.join(projectPath, 'service-worker.js'), templates.serviceWorkerJs());
    createFile(path.join(projectPath, 'manifest.json'), templates.manifest());
    createFile(path.join(projectPath, 'src/database/themes.js'), templates.themesJs());

    // Copy fonts (same as before)
    const sourcePackageDir = path.join(__dirname, '..', '..');
    const sourceFontsDir = path.join(sourcePackageDir, 'src/fonts');
    const destFontsDir = path.join(projectPath, 'src/assets/fonts');
    if (fs.existsSync(sourceFontsDir)) {
        const iconsCss = path.join(sourceFontsDir, 'icons.css');
        const woff = path.join(sourceFontsDir, 'MaterialIcons-Regular.woff2');
        if (fs.existsSync(iconsCss)) copyFile(iconsCss, path.join(destFontsDir, 'icons.css'));
        if (fs.existsSync(woff)) copyFile(woff, path.join(destFontsDir, 'MaterialIcons-Regular.woff2'));
    }

    // Create screens and components based on template
    if (template === 'blank') {
        createFile(path.join(projectPath, 'src/app.js'), templates.blankAppJs());
    } else {
        // Shared screens
        createFile(path.join(projectPath, 'src/screens/RootScreen.js'), templates.rootScreenJs());
        createFile(path.join(projectPath, 'src/screens/HomeScreen.js'), templates.homeScreenJs());
        createFile(path.join(projectPath, 'src/screens/AboutScreen.js'), templates.aboutScreenJs());
        if (template === 'adaptive') {
            createFile(path.join(projectPath, 'src/screens/ProfileScreen.js'), templates.profileScreenJs());
            createFile(path.join(projectPath, 'src/screens/index.js'), templates.screensIndexJs());
        }
        // Layout components
        if (template !== 'blank') {
            createFile(path.join(projectPath, 'src/components/layouts/AppBarComponent.js'), templates.appBarComponentJs());
            if (template === 'full' || template === 'adaptive') {
                createFile(path.join(projectPath, 'src/components/layouts/BottomNav.js'), templates.bottomNavJs());
            }
            if (template === 'sidebar' || template === 'adaptive') {
                createFile(path.join(projectPath, 'src/components/layouts/Sidebar.js'), templates.sidebarJs());
            }
            // DrawerMenu (use modular version for adaptive/full, simple for basic)
            if (template === 'basic') {
                createFile(path.join(projectPath, 'src/components/DrawerMenu.js'), templates.drawerMenuJs()); // original simple
            } else {
                createFile(path.join(projectPath, 'src/components/layouts/DrawerMenu.js'), templates.drawerMenuModularJs());
            }
        }
        // Main app.js
        switch (template) {
            case 'basic':
                createFile(path.join(projectPath, 'src/app.js'), templates.basicAppJs());
                break;
            case 'full':
                createFile(path.join(projectPath, 'src/app.js'), templates.fullAppJs());
                break;
            case 'sidebar':
                createFile(path.join(projectPath, 'src/app.js'), templates.sidebarAppJs());
                break;
            case 'adaptive':
                createFile(path.join(projectPath, 'src/app.js'), templates.adaptiveAppJs());
                break;
            default:
                createFile(path.join(projectPath, 'src/app.js'), templates.basicAppJs());
        }
    }

    makeExecutable(path.join(projectPath, 'run.sh'));

    console.log(`\n${c('green', '✅')} Project "${finalName}" created successfully!\n`);
    console.log(`  ${c('cyan', 'cd')} ${finalName}`);
    console.log(`  ${c('cyan', 'npm install')}`);
    console.log(`  ${c('cyan', 'npm run dev')}\n`);
    console.log(`${c('gray', `📱 Template: ${template}`)}\n`);
};
