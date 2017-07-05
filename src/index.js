import { start, html, pull } from 'inu'

import './app.styl'
import * as app from './app'

const node = document.querySelector('main')
const { views } = start(app)

pull(
	views(),
	pull.drain(view => html.update(node, view))
)
