import { fetchAccountId } from './crawler'
import { generateName } from './name'

import data from './app.json'

export function fetchAccountFamiliar(instance, username) {
	return fetchAccountId(instance, username)
		.then(id => {
			const familiarId = digitalRoot(10, id)

			const familiar = Object.assign(
				{},
				data.familiars[familiarId],
				{ name: generateName(instance, username, familiarId) }
			)

			return familiar
		})
}

// number -> number -> number
export function digitalRoot(base, number) {
	while (number >= base) {
		number = digitalSum(base, number)
	}

	return number
}

// number -> number -> number
export function digitalSum(base, number) {
	let sum = 0

	while (number) {
		sum += number % base
		number = Math.floor(number / base)
	}

	return sum
}
