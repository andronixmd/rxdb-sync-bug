module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        'root': ['./src'],
        'extensions': [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.jsx',
          '.js',
          '.json'
        ],
        'alias': {
          'pouchdb-md5': 'react-native-pouchdb-md5',
          'pouchdb-binary-utils': '@craftzdog/pouchdb-binary-utils-react-native',
        },
      },
    ],
  ],
  // env: {
  //   production: {
  //     plugins: ['transform-remove-console']
  //   }
  // }
};
