// bin/commands/createScreen.js
import fs from 'fs';
import path from 'path';
import { c } from '../utils/colors.js';

const screenTemplate = (name) => `// screens/${name}Screen.js
import { Container, Column, Text, Button, colors } from 'flet-box';

export const ${name}Screen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        child: Column({
            gap: 16,
            alignItems: 'center',
            children: [
                Text({ text: '${name}', size: 28, weight: 'bold', color: colors.primary }),
                Text({ text: 'Pantalla ${name}', size: 16, color: colors.textSecondary }),
                Button({ text: '← Back', onPress: () => history.back(), variant: 'outlined' })
            ]
        })
    });
};

export default ${name}Screen;
`;

export const createScreen = async (input) => {
    const projectRoot = process.cwd();
    const screensDir = path.join(projectRoot, 'src', 'screens');
    
    if (!fs.existsSync(screensDir)) {
        console.error(c('red', '❌ Not a FletBox project. Run "flet-box create my-app" first.'));
        process.exit(1);
    }
    
    const screenNames = [];
    
    // Si es número, crear múltiples pantallas
    if (!isNaN(input) && Number.isInteger(parseFloat(input))) {
        const count = Math.min(parseInt(input), 10); // máximo 10
        for (let i = 1; i <= count; i++) {
            screenNames.push(`Screen${i}`);
        }
    } else {
        screenNames.push(input);
    }
    
    let created = 0;
    for (const name of screenNames) {
        const fileName = `${name}Screen.js`;
        const filePath = path.join(screensDir, fileName);
        
        if (fs.existsSync(filePath)) {
            console.log(c('yellow', `⚠️ ${fileName} already exists, skipping...`));
        } else {
            fs.writeFileSync(filePath, screenTemplate(name));
            console.log(c('green', `✅ Created: src/screens/${fileName}`));
            created++;
        }
    }
    
    if (created > 0) {
        console.log(c('blue', '\n📝 Add to your routes in src/app.js:\n'));
        screenNames.forEach(name => {
            console.log(c('gray', `import { ${name}Screen } from './screens/${name}Screen.js';`));
        });
        console.log('');
        screenNames.forEach(name => {
            console.log(c('gray', `    '/${name.toLowerCase()}': { body: ${name}Screen },`));
        });
    }
    
    console.log(c('green', `\n✅ ${created} screen(s) created successfully!\n`));
};
