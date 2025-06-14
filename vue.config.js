const path = require('path');

module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_BASE_URL,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
      // '^/functions': {
      //   target: 'https://asia-northeast1-gmapproject-2ea97.cloudfunctions.net',
      //   changeOrigin: true,
      //   pathRewrite: { '^/functions': '' },
      // }
    }
  }
};