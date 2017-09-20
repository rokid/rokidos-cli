'use strict';
const cwd = process.cwd();
const path = require('path');
const webpack = require('webpack');
const pkgInfo = require(cwd + '/package.json');
const pkgName = pkgInfo.name.replace(/^(@rokid|@rokidapp)\//, '');

module.exports = {
  target: 'node',
  entry: './app.js',
  output: {
    path: cwd,
    filename: `${pkgName}@${pkgInfo.version}.rpp`,
    libraryTarget: 'commonjs2',
  },
  externals: [
    function(context, request, callback) {
      if (/^(@rokid)\//.test(request))
        return callback(null, request);
      callback();
    },
  ],
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: true,
    }),
  ]
};
