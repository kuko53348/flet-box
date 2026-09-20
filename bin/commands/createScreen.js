// bin/commands/createScreen.js
import fs from "fs";
import path from "path";
import { c, banner, gradient, rainbow, section } from "../utils/colors.js";

const screenTemplate = (name) => `// screens/${name}Screen.js
import {
    Container, Column, Row, Text, Icon, Button, gradient, colors,
} from 'flet-box';

export const ${name}Screen = () => {
    return Container({
        flex: 1,
        padding: 20,
        child: Column({
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    gradient: gradient('linear', ['#6366f1', '#a855f7'], 135),
                    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.45)',
                    alignment: 'center',
                    child: Icon({ name: 'rocket_launch', size: 44, color: '#ffffff' }),
                }),
                Text({ text: '${name}', size: 26, weight: 'bold', color: colors.primary }),
                Text({
                    text: 'Touch the world with FletBox ✨',
                    size: 15,
                    color: colors.textSecondary,
                    textAlign: 'center',
                }),
                Row({
                    gap: 12,
                    alignItems: 'center',
                    children: [
                        Button({
                            text: 'Back',
                            variant: 'outlined',
                            iconLeft: 'arrow_back',
                            onPress: () => history.back(),
                        }),
                        Button({
                            text: 'Next',
                            iconRight: 'arrow_forward',
                            gradient: gradient('linear', ['#6366f1', '#8b5cf6'], 135),
                            onPress: () => console.log('Next'),
                        }),
                    ],
                }),
            ],
        }),
    });
};

export default ${name}Screen;
`;

export const createScreen = async (input) => {
  const projectRoot = process.cwd();
  const screensDir = path.join(projectRoot, "src", "screens");

  if (!fs.existsSync(screensDir)) {
    console.error(
      c("red", '❌ Not a FletBox project. Run "flet-box create my-app" first.'),
    );
    process.exit(1);
  }

  const screenNames = [];

  // If it's a number, create multiple screens
  if (!isNaN(input) && Number.isInteger(parseFloat(input))) {
    const count = Math.min(parseInt(input), 10); // max 10
    for (let i = 1; i <= count; i++) {
      screenNames.push(`Screen${i}`);
    }
  } else {
    screenNames.push(input);
  }

  let created = 0;
  const createdFiles = [];
  for (const name of screenNames) {
    const fileName = `${name}Screen.js`;
    const filePath = path.join(screensDir, fileName);

    if (fs.existsSync(filePath)) {
      console.log(c("yellow", `  ⚠️ ${gradient(fileName, "#fbbf24", "#fb923c")} already exists, skipping ...`));
    } else {
      fs.writeFileSync(filePath, screenTemplate(name));
      createdFiles.push(fileName);
      created++;
    }
  }

  console.log(`\n${section("🎨", "SCREENS GENERATED")}`);
  createdFiles.forEach((f) =>
    console.log(`  ${c("brightGreen", "✔")} ${rainbow(f)}`),
  );

  if (created > 0) {
    console.log(`\n${section("🔌", "WIRE THEM UP in src/app.js")}`);
    screenNames.forEach((name) => {
      console.log(`  ${c("brightCyan", "import")} { ${rainbow(`${name}Screen`)} } ${c("brightCyan", "from")} '${c("gray", `./screens/${name}Screen.js`)}';`);
    });
    console.log("");
    screenNames.forEach((name) => {
      console.log(
        `  ${c("brightMagenta", "·")} '/${c("brightMagenta", name.toLowerCase())}': { body: ${rainbow(`${name}Screen`)} },`,
      );
    });
  }

  console.log(
    `\n${gradient(" ✅ " + created + " screen(s) created! ", "#34d399", "#22d3ee")}\n`,
  );
};