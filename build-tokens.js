import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';

// will register them on StyleDictionary object
// that is installed as a dependency of this package.
register(StyleDictionary, {
  excludeParentKeys: true,
});

// light/default mode
new StyleDictionary({
  // make sure to have source match your token files!
  // be careful about accidentally matching your package.json or similar files that are not tokens
  source: ['tokens.json'],
  preprocessors: ['tokens-studio'], // <-- since 0.16.0 this must be explicit
  platforms: {
    css: {
      transformGroup: 'tokens-studio', // <-- apply the tokens-studio transformGroup to apply all transforms
      transforms: ['name/kebab'], // <-- add a token name transform for generating token names, default is camel
      prefix: 'kd',
      buildPath: '',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            // this will keep token references intact so that we don't need
            // to generate *all* color resources for dark mode, only
            // the specific ones that change
            outputReferences: true,
          },
        },
      ],
    },
    js: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}).buildAllPlatforms();

// dark mode
// new StyleDictionary({
//   // make sure to have source match your token files!
//   // be careful about accidentally matching your package.json or similar files that are not tokens
//   source: ['tokens.json'],
//   preprocessors: ['tokens-studio'], // <-- since 0.16.0 this must be explicit
//   platforms: {
//     css: {
//       transformGroup: `css`,
//       buildPath: '',
//       files: [
//         {
//           destination: `variables-dark.css`,
//           format: `css/variables`,
//           // only outputting the tokens from files with '.dark' in the filepath
//           filter: (token) => token.filePath.indexOf(`.dark`) > -1,
//           options: {
//             // this will keep token references intact so that we don't need
//             // to generate *all* color resources for dark mode, only
//             // the specific ones that change
//             outputReferences: true,
//           },
//         },
//       ],
//     },
//     //...
//   },
// }).buildAllPlatforms();

// await sd.cleanAllPlatforms();
// await sd.buildAllPlatforms();
