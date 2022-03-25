module.exports = {
    devServer: {
        port: 8080,
        proxy: {
          '^/api': {
            target: 'http://localhost:3000', // redirect to good port
            ws: true,
            changeOrigin: true
          }
        }
      }
}
