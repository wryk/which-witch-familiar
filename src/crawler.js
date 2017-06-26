export class NotFoundError extends Error {
	constructor(instance, username, response) {
		super()
		this.instance = instance
		this.username = username
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
		if (response.status === 404) {
			throw new NotFoundError(instance, username)
		} else {
			throw new Error()
		}
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
