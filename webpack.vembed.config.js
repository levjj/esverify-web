module.exports = {
  entry: "./src/vembed.tsx",
  output: {
    filename: "vembed.js",
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
