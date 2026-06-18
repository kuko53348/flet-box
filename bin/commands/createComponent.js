// bin/commands/createComponent.js
import fs from 'fs';
import path from 'path';
import { c } from '../utils/colors.js';

const componentTemplate = (name) => `// components/${name}.js
import { Container, Text, colors } from 'flet-box';

export const ${name} = (props) => {
    const {
        title,
        children,
        ...rest
    } = props;

    return Container({
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.surface,
        ...rest,
        child: Text({ text: title || '${name} Component', size: 16, color: colors.text })
    });
};

export default ${name};
`;

export const createComponent = async (input) => {
    const projectRoot = process.cwd();
    const componentsDir = path.join(projectRoot, 'src', 'components');
    
    if (!fs.existsSync(componentsDir)) {
        console.error(c('red', '❌ Not a FletBox project. Run "flet-box create my-app" first.'));
        process.exit(1);
    }
    
    const componentNames = [];
    
    // Si es número, crear múltiples componentes
    if (!isNaN(input) && Number.isInteger(parseFloat(input))) {
        const count = Math.min(parseInt(input), 10);
        for (let i = 1; i <= count; i++) {
            componentNames.push(`Component${i}`);
        }
    } else {
        componentNames.push(input);
    }
    
    let created = 0;
    for (const name of componentNames) {
        const fileName = `${name}.js`;
        const filePath = path.join(componentsDir, fileName);
        
        if (fs.existsSync(filePath)) {
            console.log(c('yellow', `⚠️ ${fileName} already exists, skipping...`));
        } else {
            fs.writeFileSync(filePath, componentTemplate(name));
            console.log(c('green', `✅ Created: src/components/${fileName}`));
            created++;
        }
    }
    
    console.log(c('green', `\n✅ ${created} component(s) created!\n`));
};
