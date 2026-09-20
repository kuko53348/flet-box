/**
 * @file bin/commands/createComponent.js
 * @description Generates one or more FletBox component files inside `src/components/`.
 *
 * Accepts either a component name (e.g. `UserCard`) or an integer (1–10) to
 * generate a numbered batch (`Component1`, `Component2`, …).
 */

import fs from "fs";
import path from "path";
import { c, gradient, rainbow, section } from "../utils/colors.js";

/**
 * Returns the source code for a new FletBox component module.
 *
 * The generated component is a named export that renders a `Container` with
 * a horizontal `Row` containing an icon and a text label.  Props are spread
 * onto the outer `Container` so callers can customise layout without wrapping.
 *
 * @param {string} name - PascalCase component name used for the export identifier.
 * @returns {string} JavaScript source code for the component file.
 */
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

/**
 * Scaffolds one or more component files in the current project's `src/components/` directory.
 *
 * When `input` is a numeric string the function generates that many components
 * (capped at 10) named `Component1` … `Component<n>`.  When it is a plain name
 * it generates a single file named `<input>.js`.
 *
 * Existing files are skipped with a warning — the command never overwrites work.
 *
 * @async
 * @param {string} input - Either a component name (e.g. `"UserCard"`) or a
 *   numeric string (e.g. `"3"`) to batch-create numbered components.
 * @returns {Promise<void>}
 */
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

  // Numeric input: create a batch of sequentially numbered components.
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
      // Skip silently with a warning — never overwrite existing components.
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
