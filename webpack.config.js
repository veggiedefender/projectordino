const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  entry: {
    index: './src/index.ts',
    calibration: './src/calibration.ts',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Dino',
      filename: 'index.html',
      template: 'index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Calibration',
      filename: 'calibration.html',
      template: 'calibration.html',
      chunks: ['calibration'],
    }),
    new CopyPlugin({
      patterns: [{ from: 'images', to: 'images' }],
    }),
  ],
}
