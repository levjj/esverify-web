module.exports = {
  entry: "./src/tsembed.tsx",
  output: {
    filename: "tsembed.js",
    path: __dirname + "/build"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
  externals: {
    fs: 'fs',
    child_process: 'child_process'
  }
};
