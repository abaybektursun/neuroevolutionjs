var path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: "build/"
  },
  module:{
    rules: [
      {
        test: /\.worker\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
    }
  ]
  }
};
