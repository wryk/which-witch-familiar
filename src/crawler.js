export class ResponseError extends Error {
	constructor(response) {
		super(response.statusText)
		this.response = response
	}
}

export function fetchAccountId(instance, username) {
	return fetch(profileUrl(instance, username))
		.then(handleResponse)
		.then(extractAccountId)
}

function handleResponse(response) {
	if (response.ok) {
		return response.text()
	} else {
		const error = new ResponseError(response)
		console.log(error)
		throw error
	}
}

function extractAccountId(text) {
	return +document
		.createRange()
		.createContextualFragment(text)
		.querySelector('link[rel="salmon"]')
		.href
		.split('/')
		.pop()
}

export function profileUrl(instance, username) {
	return `https://${instance}/@${username}`
}
