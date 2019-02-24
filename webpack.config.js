// webpack.config.js
const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false
  },
  devtool: "nosources-source-map",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/,
        query: {
          presets: [ "@babel/preset-env", "react-app"],
          plugins: ["css-modules-transform"]
        }
      },
      {
        test: /\.(png|jp(e*)g|svg|JPG)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
              name: "images/[hash]-[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['css-loader']
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts/'
            }
        }]
    }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: "PairBNB/build", to: "build" }], {
      debug: "info"
    })
  ]
};