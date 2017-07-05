// @flow

import phonetic from 'phonetic'

import { fetchAccountId } from './crawler'
import data from './app.json'
import type { Instance, Username, Familiar } from './model'


export function fetchAccountFamiliar(instance: Instance, username: Username): Promise<Familiar> {
	return fetchAccountId(instance, username)
		.then(id => {
			const familiarId = digitalRoot(10, id)

			const familiar = Object.assign(
				{},
				data.familiars[familiarId],
				{ name: generateName(instance, username) }
			)

			return familiar
		})
}

export function generateName(instance: Instance, username: Username): string {
	return phonetic.generate({
		seed: `@${username}@${instance}`
	})
}

export function digitalRoot(base: number, number: number): number {
	while (number >= base) {
		number = digitalSum(base, number)
	}

	return number
}

export function digitalSum(base: number, number: number): number {
	let sum = 0

	while (number) {
		sum += number % base
		number = Math.floor(number / base)
	}

	return sum
}
