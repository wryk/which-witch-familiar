const resolve = require('path').resolve

const Clean = require('clean-webpack-plugin')
const ExtractText = require('extract-text-webpack-plugin')
const Favicons = require('favicons-webpack-plugin')
const Html = require('html-webpack-plugin')

const DIST = resolve(__dirname, 'dist')
const SRC = resolve(__dirname, 'src')

module.exports = {
	entry: resolve(SRC, 'index.js'),
	output: {
		path: DIST,
		filename: 'app.js'
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
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: [
						'css-loader',
						'stylus-loader'
					]
				})
			}
		]
	},
	plugins: [
		new Clean([resolve(DIST, '*')]),
		new Favicons(resolve(SRC, 'favicon.png')),
		new Html({
			template: resolve(SRC, 'index.pug'),
			hash: false
		}),
		new ExtractText('app.css')
	]
}
