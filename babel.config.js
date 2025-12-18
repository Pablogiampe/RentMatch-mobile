module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ✅ Plugin para cargar variables de entorno
      [
        'inline-dotenv',
        {
          path: '.env', // Ruta al archivo .env
          safe: false,
          systemVar: 'overwrite',
        },
      ],
      // Otros plugins...
    ],
  }
}