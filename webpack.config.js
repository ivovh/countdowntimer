module.exports = {
  entry: "./src/js/main.js",
  output: {
    path: __dirname + "/build/js",
    filename: "main.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  resolve: {
    alias: {
      jquery: "jquery/src/jquery"
    }
  }
};