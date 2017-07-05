// @flow

import { html, pull } from 'inu'
import pullPromise from 'pull-promise'
import pullCatch from 'pull-catch'

import { ResponseError } from './crawler'
import { fetchAccountFamiliar } from './familiar'

import type { Instance, Username, Account, Familiar } from './model'

type Model = {
	search: Instance,
	account: ?Account,
	familiar : ?Familiar,
	error: ?Object
}

type Action
	= { type: 'SET_SEARCH', payload: string }
	| { type: 'SUBMIT', payload: Account }
	| { type: 'SET_FAMILIAR', payload: Familiar }
	| { type: 'SET_FAMILIAR_ERROR', payload: Object }

type Effect
	= { type: 'FETCH_FAMILIAR', payload: Account }

const RE = /^(?:@)?(.+)@(.+)$/

export const init = (): { model: Model, effect?: Effect } => ({
	model: {
		search: '',
		account: null,
		familiar: null,
		error: null
	}
})

export const update = (model: Model, action: Action): { model: Model, effect?: Effect } => {
	switch (action.type) {
		default:
			throw new Error('unknow action')

		case 'SET_SEARCH':
			return {
				model: {
					search: action.payload,
					account: model.account,
					familiar: model.familiar,
					error: model.error
				}
			}

		case 'SUBMIT':
			const [, username, instance] = action.payload.match(RE)
			const account = { username, instance }

			return {
				model: {
					search: model.search,
					account: account,
					familiar: null,
					error: null
				},
				effect: { type: 'FETCH_FAMILIAR', payload: account }
			}

		case 'SET_FAMILIAR':
			return {
				model: {
					search: model.search,
					account: model.account,
					familiar: action.payload,
					error: null
				}
			}

		case 'SET_FAMILIAR_ERROR':
			return {
				model: {
					search: model.search,
					account: model.account,
					familiar: null,
					error: action.payload
				}
			}
	}
}

export const run = (effect: Effect): Action => {
	switch (effect.type) {
		default:
			throw new Error('unknow effect')

		case 'FETCH_FAMILIAR':
			const { instance, username } = effect.payload

			return pull(
				pullPromise.source(fetchAccountFamiliar(instance, username)),
				pull.map((familiar) => ({
					type: 'SET_FAMILIAR',
					payload: familiar
				})),
				pullCatch((error) => ({
					type: 'SET_FAMILIAR_ERROR',
					payload: error
				}))
			)
	}
}

export const view = (model: Model, dispatch: (Action) => void): HTMLElement => {
	return html`
		<main>
			<h2>Découvre ton familier !</h2>

			${introView(model, dispatch)}
			${formView(model, dispatch)}
			${resultView(model, dispatch)}
		</main>
	`
}

function introView({ account }, dispatch) {
	if (!account) {
		return html`
			<section>
				<p>
					Envie de connaitre ton familier de sorcière ?
					<br>
					Avec mes connaissances et mon expérience je peux m'en occuper tout de suite.
					Ne t'inquiète pas, je ne suis pas pressé⋅e et ça ne me dérange vraiment pas.
					Je peux le chercher pour toi tout en surveillant ma potion sur le feu et en sirotant mon thé aux larmes salées de Homblacishet, facile.
				</p>
			</section>
		`
	} else {
		return html``
	}
}

function formView(model: Model, dispatch: (Action) => void): HTMLElement {
	return html`
		<form onsubmit=${submit}>
			<label for="search">Nom (pseudo@instance)</label>

			<input
				type="text"
				id="search"
				name="search"
				required
				pattern="${RE.source}"
				placeholder="wryk@witches.town"
				value="${model.search}"
				oninput=${setSearch}
			/>

			<button type="submit" class="submit">Trouve mon familier !</button>
		</form>
	`

	function setSearch(event) {
		dispatch({
			type: 'SET_SEARCH',
			payload: event.target.value
		})
	}


	function submit(event) {
		event.preventDefault()

		dispatch({
			type: 'SUBMIT',
			payload: model.search
		})
	}
}

function resultView(model: Model, dispatch: (Action) => void): HTMLElement {
	const { account, familiar, error } = model

	if (account) {
		if (error) {
			return errorResultView({ account, error }, dispatch)
		} else {
			if (familiar) {
				return familiarResultView({ account, familiar }, dispatch)
			} else {
				return searchingResultView({ account }, dispatch)
			}
		}
	} else {
		return html``
	}
}


function searchingResultView({ account }, dispatch) {
	return html`
		<section class="result">
			<h2>Abracadabra, par la barbe du patriarcat !</h2>

			<p>
				Patiente un peu, je suis en train de chercher le familier de <b>${account.username}@${account.instance}</b>.
			</p>
		</section>
	`
}

function familiarResultView({ account, familiar }, dispatch) {
	return html`
		<section class="result">
			<h2>Et voilà, je viens de trouver !</h2>

			<div class="familiar">
				<header>${familiar.emoji} ${familiar.name} ${familiar.emoji}</header>
				<p>
					Voici <b>${familiar.name}</b>, le familier de <a href="https://${account.instance}/@${account.username}">${account.username}@${account.instance}</a>.
					<br>
					C'est un⋅e <b>${familiar.race}</b> ${familiar.emoji}.
				</p>
			</div>
		</section>
	`
}

function errorResultView({ account, error }, dispatch) {
	if (error instanceof ResponseError && error.response.status === 404) {
		return html`
			<section class="result">
				<h2>Hum, tu n'as pas fait une petite erreur ?</h2>

				<p>
					Parce que <b>${account.username}@${account.instance}</b> n'existe pas ...
				</p>
				<p>
					Tu peux comprendre que c'est une tâche ardue, même pour moi, de trouver le familier de quelqu'un qui n'existe pas dans notre espace-temps ...
					<br>
					Tu peux vérifier de ne pas avoir fait d'erreur ?
				</p>
			</section>
		`
	} else {
		return html`
			<section class="result">
				<h2>Oups, je n'arrive pas à trouver ce familier ...</h2>

				<p>
					Je ne comprends pas pourquoi ça ne fonctionne pas.
					<br>
					Ton <b>ki(-nk)</b> résonne mal avec l'univers.
					<br>
					L'alignement des planètes ne doit pas être optimal aujourd'hui.
					<br>
					Il fait trop chaud pour faire quoi que ce soit.
				</p>

				<code>${error.message}</code>
			</section>
		`
	}
}
