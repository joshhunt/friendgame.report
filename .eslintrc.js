module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],
  plugins: ['react', 'jsx-a11y', 'import', 'flowtype', 'prettier'],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  globals: {
    __DEV__: true,
  },
  rules: {
    'global-require': 0,
    'no-underscore-dangle': 0,
    'arrow-body-style': 0,
    'no-unused-expressions': 0,
    'jsx-a11y/media-has-caption': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'react/jsx-filename-extension': 0,
    'react/no-array-index-key': 0,
    'react/prop-types': 0,
    'react/require-default-props': 0,
    'react/sort-comp': 0,
    'prettier/prettier': ['error'],
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
};
