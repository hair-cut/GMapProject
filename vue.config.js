const path = require('path');

module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: process.env.VUE_APP_API_BASE_URL,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      }
    }
  },// GithubPages経路設定
  publicPath: process.env.NODE_ENV === 'production' ? '/GMapProject/' : '/',
  outputDir: "./docs"
};