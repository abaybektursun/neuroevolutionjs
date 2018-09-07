var path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: "build/"
  },
  module:{
    rules: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        plugins: ['syntax-dynamic-import'],
      },
      query:{
        presets: ['env']
      }
    }]
  }
};
