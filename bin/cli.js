#!/usr/bin/env node

// bin/cli.js - FletBox CLI with Hot Reload Support
import { createProject } from './commands/create.js';
import { packageManager } from './commands/package.js';
import { createBundle } from './commands/createBundle.js';
import { runDevServer } from './commands/runServer.js';
import { c, setupCtrlC } from './utils/colors.js';

// Activate global Ctrl+C handler
setupCtrlC();

const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

console.clear();

const showHelp = () => {
    console.log(`
${c('cyan', '╔════════════════════════════════════════════════════════════╗')}
${c('cyan', '║')}                       ${c('bold', '🚀 FletBox CLI')}                       ${c('cyan', '║')}
${c('cyan', '╚════════════════════════════════════════════════════════════╝')}

  ${c('yellow', 'Commands:')}

  ${c('green', 'flet-box create <name>')}     Create new project
  ${c('green', 'flet-box createBundle')}      Bundle project for production
  ${c('green', 'flet-box bundle')}            Alias for createBundle
  ${c('green', 'flet-box build')}             Alias for createBundle

  ${c('green', 'flet-box pkg')}               Open package manager
  ${c('green', 'flet-box package')}           Alias for pkg
  ${c('green', 'flet-box manager')}           Alias for pkg

  ${c('green', 'flet-box run')}               Start dev server (static mode)
  ${c('green', 'flet-box run-spa')}           Start dev server (SPA mode + hot reload)
  ${c('green', 'flet-box dev')}               Alias for run
  ${c('green', 'flet-box serve')}             Alias for run

  ${c('green', 'flet-box --version')}         Show version
  ${c('green', 'flet-box -v')}                Show version
  ${c('green', 'flet-box --help')}            Show this help
  ${c('green', 'flet-box -h')}                Show this help

  ${c('yellow', 'Options:')}
  ${c('gray', '--port <number>')}             Set custom port (default: 8000)
  ${c('gray', '--quiet')}                     Disable request logging

  ${c('yellow', 'Examples:')}
  ${c('gray', 'flet-box create my-app')}
  ${c('gray', 'cd my-app')}
  ${c('gray', 'flet-box run-spa')}            # SPA mode + hot reload
  ${c('gray', 'flet-box run')}                # Static files mode
  ${c('gray', 'flet-box createBundle')}
  ${c('gray', 'flet-box pkg')}

${c('gray', '────────────────────────────────────────────────────────────')}
`);
};

const version = '1.0.0';

// Parse command line flags
const parseFlags = () => {
    const flags = {
        port: 8000,
        logRequests: true
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--port' && args[i + 1]) {
            const port = parseInt(args[i + 1]);
            if (!isNaN(port) && port > 0 && port < 65536) {
                flags.port = port;
            }
            i++;
        } else if (arg === '--quiet') {
            flags.logRequests = false;
        }
    }
    
    return flags;
};

async function main() {
    try {
        const flags = parseFlags();
        
        switch (command) {
            case 'create':
            case 'new':
                if (!projectName) {
                    console.error(c('red', '❌ Error: Project name required'));
                    console.log(c('gray', 'Usage: flet-box create <project-name>'));
                    process.exit(1);
                }
                if (!/^[a-z0-9-]+$/i.test(projectName)) {
                    console.error(c('red', '❌ Error: Invalid project name. Use only letters, numbers, and hyphens.'));
                    process.exit(1);
                }
                await createProject(projectName);
                break;

            case 'createBundle':
            case 'bundle':
            case 'build':
                await createBundle();
                break;
            
            case 'pkg':
            case 'package':
            case 'manager':
                await packageManager();
                break;
                
            case 'run':
            case 'dev':
            case 'serve':
                await runDevServer({ 
                    spaMode: false,
                    hotReload: false,
                    port: flags.port,
                    logRequests: flags.logRequests
                });
                break;
            
            case 'run-spa':
            case 'runSpa':
            case 'spa':
                await runDevServer({ 
                    spaMode: true,
                    hotReload: true,
                    port: flags.port,
                    logRequests: flags.logRequests
                });
                break;

            case '--version':
            case '-v':
                console.log(`flet-box v${version}`);
                break;
                
            case '--help':
            case '-h':
            case 'help':
                showHelp();
                break;
                
            default:
                if (command) {
                    console.error(c('red', `❌ Unknown command: ${command}`));
                    console.log('');
                    showHelp();
                } else {
                    showHelp();
                }
                process.exit(1);
        }
    } catch (error) {
        console.error(c('red', '❌ CLI Error:'), error.message);
        if (process.env.DEBUG) console.error(error);
        process.exit(1);
    }
}

main();
