// bin/commands/package.js
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execCmd, getPackagePath } from '../utils/helpers.js';
import { c } from '../utils/colors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(resolve => rl.question(q, resolve));

export const packageManager = async () => {
    const PACKAGE = 'flet-box';
    const PKG_PATH = path.join(__dirname, '../..');
    
    while (true) {
        console.clear();
        console.log(`
${c('cyan', '╔════════════════════════════════════════════════════════════╗')}
${c('cyan', '║')}                    ${c('bold', '📦 FletBox Package Manager')}                    ${c('cyan', '║')}
${c('cyan', '╚════════════════════════════════════════════════════════════╝')}

${c('yellow', 'LOCAL DEVELOPMENT')}
  ${c('green', '1.')} link      - Create global link
  ${c('green', '2.')} use       - Use link in current project
  ${c('green', '3.')} unlink    - Remove link
  ${c('green', '4.')} list      - Show status

${c('yellow', 'NPM REGISTRY')}
  ${c('green', '5.')} publish   - Publish to npm
  ${c('green', '6.')} install   - npm install flet-box
  ${c('green', '7.')} uninstall - npm uninstall flet-box

${c('yellow', 'UTILS')}
  ${c('green', '8.')} whoami    - Show npm user
  ${c('green', '9.')} login     - Login to npm

  ${c('green', '0.')} exit

${c('gray', '────────────────────────────────────────────────────────────')}
${c('gray', 'Press Ctrl+C to exit at any time')}
`);
        
        const opt = await question(`${c('cyan', 'Select option')}: `);
        
        switch(opt) {
            case '1': 
                console.log(`\n${c('blue', '🔗 Creating global link...')}`);
                const linkResult = execCmd(`cd "${PKG_PATH}" && npm link`);
                if (linkResult) {
                    console.log(`${c('green', '✅ Package linked globally')}`);
                } else {
                    console.log(`${c('red', '❌ Failed to create link')}`);
                }
                break;
                
            case '2': 
                console.log(`\n${c('blue', '🔗 Using package in current project...')}`);
                const useResult = execCmd(`npm link ${PACKAGE}`);
                if (useResult) {
                    console.log(`${c('green', '✅ Now you can import from flet-box')}`);
                } else {
                    console.log(`${c('red', '❌ Failed to link package')}`);
                }
                break;
                
            case '3': 
                console.log(`\n${c('red', '🗑️ Unlinking...')}`);
                execCmd(`npm unlink ${PACKAGE}`);
                console.log(`${c('green', '✅ Unlinked')}`);
                break;
                
            case '4': 
                console.log(`\n${c('blue', '📋 Status:')}`);
                execCmd(`npm list -g --depth=0 2>/dev/null | grep ${PACKAGE} || echo "${c('gray', 'Not linked globally')}"`);
                
                const localPath = path.join(process.cwd(), 'node_modules', PACKAGE);
                if (fs.existsSync(localPath)) {
                    console.log(`${c('green', '✅ Installed locally')}`);
                } else {
                    console.log(`${c('gray', '❌ Not installed locally')}`);
                }
                break;
                
            case '5': 
                console.log(`\n${c('magenta', '🌍 Publishing to npm...')}`);
                const publishResult = execCmd(`cd "${PKG_PATH}" && npm publish`);
                if (publishResult) {
                    console.log(`${c('green', '✅ Published successfully')}`);
                } else {
                    console.log(`${c('red', '❌ Publishing failed')}`);
                }
                break;
                
            case '6': 
                console.log(`\n${c('magenta', '🌍 Installing from npm...')}`);
                execCmd(`npm install ${PACKAGE}`);
                break;
                
            case '7': 
                console.log(`\n${c('red', '🗑️ Uninstalling...')}`);
                execCmd(`npm uninstall ${PACKAGE}`);
                break;
                
            case '8': 
                console.log(`\n${c('blue', '👤 npm user:')}`);
                execCmd(`npm whoami 2>/dev/null || echo "${c('gray', 'Not logged in')}"`);
                break;
                
            case '9': 
                console.log(`\n${c('blue', '🔐 Login to npm...')}`);
                execCmd(`npm adduser`);
                break;
                
            case '0': 
                console.log(`\n${c('yellow', '👋 Bye!')}`);
                rl.close();
                return;
                
            default: 
                console.log(`\n${c('red', '❌ Invalid option')}`);
        }
        await question(`\n${c('gray', 'Press Enter to continue...')}`);
    }
};
