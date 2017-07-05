// @flow

import type { Instance, Username, Familiar } from './model'

export class ResponseError extends Error {
	response: Response

	constructor(response: Response) {
		super(response.statusText)
		this.response = response
	}
}

export function fetchAccountId(instance: Instance, username: Username): Promise<number> {
	return fetch(profileUrl(instance, username))
		.then(handleResponse)
		.then(extractAccountId)
}

function handleResponse(response: Response): Promise<string> {
	if (response.ok) {
		return response.text()
	} else {
		throw new ResponseError(response)
	}
}

function extractAccountId(text: string): number {
	// $FlowFixMe : flow typing is wrong (createContextualFragment return a DocumentFragment, not a Node)
	return +document
		.createRange()
		.createContextualFragment(text)
		.querySelector('link[rel="salmon"]')
		.href
		.split('/')
		.pop()
}

export function profileUrl(instance: Instance, username: Username): string {
	return `https://${instance}/@${username}`
}
