const path = require('path');

module.exports = {
  outputDir : path.resolve("../vuemap-back/public"),
  devServer: {
    proxy: {
      '^/api': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
      '^/functions': {
        target: 'https://asia-northeast1-gmapproject-2ea97.cloudfunctions.net',
        changeOrigin: true,
        pathRewrite: { '^/functions': '' },
      }
    }
  }
};