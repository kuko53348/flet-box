// bin/commands/createComponent.js
import fs from "fs";
import path from "path";
import { c, gradient, rainbow, section } from "../utils/colors.js";

const componentTemplate = (name) => `// components/${name}.js
import { Container, Row, Text, Icon, colors } from 'flet-box';

export const ${name} = (props) => {
    const {
        title,
        icon = 'widgets',
        children,
        ...rest
    } = props;

    return Container({
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.surface,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        ...rest,
        child: Row({
            gap: 12,
            alignItems: 'center',
            children: [
                Icon({ name: icon, size: 24, color: colors.primary }),
                Text({ text: title || '${name} Component', size: 16, color: colors.text, weight: 'bold' }),
            ],
        }),
    });
};

export default ${name};
`;

export const createComponent = async (input) => {
  const projectRoot = process.cwd();
  const componentsDir = path.join(projectRoot, "src", "components");

  if (!fs.existsSync(componentsDir)) {
    console.error(
      c("red", '❌ Not a FletBox project. Run "flet-box create my-app" first.'),
    );
    process.exit(1);
  }

  const componentNames = [];

  // If it's a number, create multiple components
  if (!isNaN(input) && Number.isInteger(parseFloat(input))) {
    const count = Math.min(parseInt(input), 10);
    for (let i = 1; i <= count; i++) {
      componentNames.push(`Component${i}`);
    }
  } else {
    componentNames.push(input);
  }

  let created = 0;
  const createdFiles = [];
  for (const name of componentNames) {
    const fileName = `${name}.js`;
    const filePath = path.join(componentsDir, fileName);

    if (fs.existsSync(filePath)) {
      console.log(c("yellow", `  ⚠️ ${gradient(fileName, "#fbbf24", "#fb923c")} already exists, skipping ...`));
    } else {
      fs.writeFileSync(filePath, componentTemplate(name));
      createdFiles.push(fileName);
      created++;
    }
  }

  console.log(`\n${section("🧩", "COMPONENTS GENERATED")}`);
  createdFiles.forEach((f) =>
    console.log(`  ${c("brightGreen", "✔")} ${rainbow(f)}`),
  );

  console.log(
    `\n${gradient(" ✅ " + created + " component(s) created! ", "#34d399", "#22d3ee")}\n`,
  );
};
