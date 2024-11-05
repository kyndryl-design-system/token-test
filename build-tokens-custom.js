import { promises } from 'fs';

async function run() {
  const palette = JSON.parse(await promises.readFile('tokens/Color Palette/Color.json', 'utf8'));
  const light = JSON.parse(await promises.readFile('tokens/Themes/Light.json', 'utf8'));
  const dark = JSON.parse(await promises.readFile('tokens/Themes/Dark.json', 'utf8'));

  async function buildCss() {
    // console.log(palette);

    // build palette variables file
    let content = ':root {\n';
    for (const [key, value] of Object.entries(palette)) {
      const attr = `--kd-color-palette-${key.toLowerCase()}`;
      const val = value.$value;
      // console.log(`${attr}: ${val}`);
      content += `  ${attr}: ${val};\n`;
    }
    content += '}';
    promises.writeFile('varsPalette.css', content);

    // build semantic variables file
    content = ':root {\n';
    for (const [key, value] of Object.entries(light)) {
      for (const [key2, value2] of Object.entries(value)) {
        const category = key.toLowerCase().split(' ').join('-').split('&-').join('');
        const token = key2.toLowerCase().split(' ').join('-');
        const attr = `--kd-color-${category}-${token}`;
        const valKey = value2.$value.toLowerCase().split('{').join('').split('}').join('');
        const darkValKey = dark[key][key2].$value
          .toLowerCase()
          .split('{')
          .join('')
          .split('}')
          .join('');
        const val = `light-dark(var(--kd-color-palette-${valKey}), var(--kd-color-palette-${darkValKey}))`;
        // console.log(`${attr}: ${val}`);
        content += `  ${attr}: ${val};\n`;
      }
    }
    content += '}';
    promises.writeFile('varsSemantic.css', content);
  }

  await Promise.all([palette, light, dark]).then(buildCss());
}

run();
