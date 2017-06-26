var HtmlWebpackPlugin = require('html-webpack-plugin');

var resolve = require('path').resolve.bind(null, __dirname);

module.exports = {
	entry: resolve('src/index.js'),
	output: {
		path: resolve('build'),
		filename: 'app.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: [
					'babel-loader'
				]
			},
			{
				test: /\.json$/,
				use: [
					'json-loader'
				]
			},
			{
				test: /\.pug$/,
				use: [
					'pug-loader'
				]
			},
			{
				test: /\.styl$/,
				use: [
					'style-loader',
					'css-loader',
					'stylus-loader'
				]
			}
		]
	},
	plugins: [new HtmlWebpackPlugin({
		template: resolve('src/index.pug'),
		hash: false
	})]
};
