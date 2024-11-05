import { register, permutateThemes } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import { promises } from 'fs';

register(StyleDictionary);

StyleDictionary.registerTransform({
  name: 'addTypePrefix',
  type: 'name',
  transform: function (token) {
    return token.name.split('kd-').join(`kd-${token.$type}-`);
  },
});

StyleDictionary.registerTransform({
  name: 'addPalettePrefix',
  type: 'name',
  filter: function (token) {
    return token.filePath.startsWith('tokens/Color Palette');
  },
  transform: function (token) {
    return token.name.split('kd-color-').join('kd-color-palette-');
  },
});

async function run() {
  const $themes = JSON.parse(await promises.readFile('tokens/$themes.json', 'utf-8'));
  const themes = permutateThemes($themes);
  const configs = Object.entries(themes).map(([name, tokensets]) => ({
    source: tokensets.map((tokenset) => `tokens/${tokenset}.json`),
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab', 'addTypePrefix', 'addPalettePrefix'],
        prefix: 'kd',
        files: [
          // palette
          {
            destination: 'varsPalette.css',
            format: 'css/variables',
            filter: (token) => {
              return token.filePath.startsWith('tokens/Color Palette');
            },
          },
          // themes
          {
            destination: `vars${name}.css`,
            format: 'css/variables',
            filter: (token) => {
              return token.filePath.startsWith(`tokens/Themes/${name}`);
            },
            options: {
              outputReferences: true,
            },
          },
        ],
      },
      // scss: {
      //   transformGroup: 'tokens-studio',
      //   transforms: [
      //     'name/kebab',
      //     // 'addTypePrefix',
      //     // 'addPalettePrefix'
      //   ],
      //   // prefix: 'kd',
      //   files: [
      //     // palette
      //     {
      //       destination: 'varsPalette.scss',
      //       format: 'scss/map-deep',
      //       filter: (token) => token.filePath.startsWith('tokens/Color Palette'),
      //       options: {
      //         outputReferences: true,
      //       },
      //     },
      //     // themes
      //     {
      //       destination: `vars${name}.scss`,
      //       format: 'scss/map-deep',
      //       filter: (token) => token.filePath.startsWith(`tokens/Themes/${name}`),
      //       options: {
      //         outputReferences: true,
      //       },
      //     },
      //   ],
      // },
    },
    log: {
      verbosity: 'verbose',
    },
  }));

  async function cleanAndBuild(cfg) {
    const sd = new StyleDictionary(cfg);
    await sd.cleanAllPlatforms();
    await sd.buildAllPlatforms();
  }

  await Promise.all(configs.map(cleanAndBuild));
}

run();
