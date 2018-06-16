module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "app.js",
    path: __dirname + "/build"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /examples\/.*\.js$/, loader: "raw-loader" },
      { test: /\.tsx?$/, loader: "ts-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  externals: {
    fs: 'fs',
    child_process: 'child_process'
  }
};
