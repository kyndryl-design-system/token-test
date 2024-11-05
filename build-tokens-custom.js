import { promises } from 'fs';

async function run() {
  const prefix = '--kd-color';
  const palette = JSON.parse(await promises.readFile('tokens/Color Palette/Color.json', 'utf8'));
  const light = JSON.parse(await promises.readFile('tokens/Themes/Light.json', 'utf8'));
  const dark = JSON.parse(await promises.readFile('tokens/Themes/Dark.json', 'utf8'));

  async function buildCss() {
    // build palette variables file
    let content = ':root {\n';
    for (const [key, value] of Object.entries(palette)) {
      if (value.$value) {
        // loop level 1 (token)
        const token = cleanKey(key);
        const attr = `${prefix}-palette-${token}`;
        const val = value.$value;

        content += `  ${attr}: ${val};\n`;
      } else {
        // loop level 1 (category)
        for (const [key2, value2] of Object.entries(value)) {
          // loop level 2 (token)
          const category = cleanKey(key);
          const token = cleanKey(key2);
          const attr = `${prefix}-palette-${category}-${token}`;
          const val = value2.$value;

          content += `  ${attr}: ${val};\n`;
        }
      }
    }
    content += '}';
    promises.writeFile('varsPalette.css', content);

    // build semantic variables file
    content = ':root {\n';
    for (const [key, value] of Object.entries(light)) {
      // loop level 1 (category)
      for (const [key2, value2] of Object.entries(value)) {
        if (value2.$value) {
          // loop level 2 (token)
          const category = cleanKey(key);
          const token = cleanKey(key2);
          const attr = `${prefix}-${category}-${token}`;
          const valKey = cleanValue(value2.$value);
          const darkValKey = cleanValue(dark[key][key2].$value);
          const val = `light-dark(var(${prefix}-palette-${valKey}), var(${prefix}-palette-${darkValKey}))`;

          content += `  ${attr}: ${val};\n`;
        } else {
          // loop level 2 (subcategory)
          for (const [key3, value3] of Object.entries(value2)) {
            // loop level 3 (token)
            const category = cleanKey(key);
            const subCategory = cleanKey(key2);
            const token = cleanKey(key3);
            const attr = `${prefix}-${category}-${subCategory}-${token}`;
            const valKey = cleanValue(value3.$value);
            const darkValKey = cleanValue(dark[key][key2][key3].$value);
            const val = `light-dark(var(${prefix}-palette-${valKey}), var(${prefix}-palette-${darkValKey}))`;

            content += `  ${attr}: ${val};\n`;
          }
        }
      }
    }
    content += '}';
    promises.writeFile('varsSemantic.css', content);
  }

  function cleanKey(key) {
    return key.toLowerCase().split(' ').join('-');
  }

  function cleanValue(token) {
    return token
      .toLowerCase()
      .split(' ')
      .join('-')
      .split('.')
      .join('-')
      .split('{')
      .join('')
      .split('}')
      .join('');
    // .split('(')
    // .join('-')
    // .split(')')
    // .join('');
  }

  await Promise.all([palette, light, dark]).then(buildCss());
}

run();
