module.exports = {
  entry: "./src/js/client.js",
  output: {
    path: __dirname + "/public/js",
    filename: "client.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    }]
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery"
    }
  }
};