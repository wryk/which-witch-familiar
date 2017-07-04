// @flow

import { html, pull } from 'inu'
import pullPromise from 'pull-promise'
import pullCatch from 'pull-catch'
import formToObject from 'form-to-object'

import { ResponseError } from './crawler'
import { fetchAccountFamiliar } from './familiar'

type Model = {
	instance: Instance,
	username: Username,
	account: ?Account,
	familiar : ?Familiar,
	error: ?Object
}

type Instance = string
type Username = string

type Account = {
	instance: Instance,
	username: Username
}

type Familiar = {
	name: string,
	race: string,
	emoji: string,
	description: string
}

type Action
	= { type: 'SET_INSTANCE', payload: Instance }
	| { type: 'SET_USERNAME', payload: Username }
	| { type: 'SUBMIT', payload: Account }
	| { type: 'SET_FAMILIAR', payload: Familiar }
	| { type: 'SET_FAMILIAR_ERROR', payload: Object }

type Effect
	= { type: 'FETCH_FAMILIAR', payload: Account }

export const init = (): { model: Model, effect?: Effect } => ({
	model: {
		instance: '',
		username: '',
		account: null,
		familiar: null,
		error: null
	}
})

export const update = (model: Model, action: Action): { model: Model, effect?: Effect } => {
	switch (action.type) {
		default:
			throw new Error('unknow action')

		case 'SET_INSTANCE':
			return {
				model: {
					instance: action.payload,
					username: model.username,
					account: model.account,
					familiar: model.familiar,
					error: model.error
				}
			}

		case 'SET_USERNAME':
			return {
				model: {
					instance: model.instance,
					username: action.payload,
					account: model.account,
					familiar: model.familiar,
					error: model.error
				}
			}

		case 'SUBMIT':
			return {
				model: {
					instance: model.instance,
					username: model.username,
					account: action.payload,
					familiar: null,
					error: null
				},
				effect: { type: 'FETCH_FAMILIAR', payload: action.payload }
			}

		case 'SET_FAMILIAR':
			return {
				model: {
					instance: model.instance,
					username: model.username,
					account: model.account,
					familiar: action.payload,
					error: null
				}
			}

		case 'SET_FAMILIAR_ERROR':
			return {
				model: {
					instance: model.instance,
					username: model.username,
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
		<section class="form">
			<form onsubmit=${submit}>
				<p>
					Renseigne ton <label for="username">nom (pseudonyme)</label> et ta <label for="instance">ville (instance)</label> :
				</p>


				<input
					required
					id="username"
					type="text"
					name="username"
					placeholder="wryk"
					value="${model.username}"
					oninput=${setUsername}
				/>@<input
					required
					id="instance"
					type="text"
					name="instance"
					placeholder="witches.town"
					value="${model.instance}"
					oninput=${setInstance}
				/>

				<button type="submit" class="button">Trouve mon familier !</button>
			</form>
		</section>
	`

	function setInstance(event) {
		dispatch({
			type: 'SET_INSTANCE',
			payload: event.target.value
		})
	}

	function setUsername(event) {
		dispatch({
			type: 'SET_USERNAME',
			payload: event.target.value
		})
	}

	function submit(event) {
		event.preventDefault()

		dispatch({
			type: 'SUBMIT',
			payload: formToObject(event.target)
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
					Voici <b>${familiar.name}</b>, le familier de <b>${account.username}@${account.instance}</b>.
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
