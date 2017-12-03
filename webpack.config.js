const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

function createConfig (name, isProduction = false) {
  const output = name === 'index' ? 'feathers-memory' : name;
  const commons = {
    entry: `./lib/${name}.js`,
    output: {
      library: ['feathers', 'memory'],
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      filename: `${output}.js`
    },
    module: {
      rules: [{
        test: /\.js/,
        exclude: /node_modules\/(?!(@feathersjs))/,
        loader: 'babel-loader'
      }]
    }
  };

  const dev = {
    devtool: 'source-map'
  };

  const production = {
    devtool: 'cheap-module-source-map',
    output: {
      filename: `${output}.min.js`
    },
    plugins: [
      new UglifyJSPlugin({
        uglifyOptions: {
          ie8: false,
          comments: false,
          sourceMap: false
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  };

  return merge(commons, isProduction ? production : dev);
}

module.exports = [
  createConfig('index'),
  createConfig('index', true)
];
