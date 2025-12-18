module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ✅ Configuración correcta de react-native-dotenv
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: false, // ✅ Esto forzará un error si las variables no existen
          verbose: false,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}