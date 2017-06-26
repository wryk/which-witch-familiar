import { html, pull } from 'inu'
import toPull from 'pull-promise'
import formToObject from 'form-to-object'

import { fetchAccountFamiliar } from './familiar'

export const init = () => ({
	model: {
		account: null,
		familiar: null,
		error: null
	}
})

export const update = (model, action) => {
	switch (action.type) {
		default:
			throw new Error('unknow action')

		case 'SUBMIT':
			return {
				model: {
					account: action.payload,
					familiar: null,
					error: null
				},
				effect: { type: 'FETCH', payload: action.payload }
			}

		case 'SET':
			return {
				model: {
					account: model.account,
					familiar: action.payload,
					error: null
				}
			}

		case 'SET_ERROR':
			return {
				model: {
					account: model.account,
					familiar: null,
					error: action.payload
				}
			}
	}
}

export const run = (effect) => {
	switch (effect.type) {
		default:
			throw new Error('unknow effet')

		case 'FETCH':
			const { instance, username } = effect.payload

			return pull(
				toPull.source(fetchAccountFamiliar(instance, username)),
				pull.map((familiar) => ({
					type: 'SET',
					payload: familiar
				}))
			)
	}
}

export const view = (model, dispatch) => {
	return html`
		<main>
			${formView(model, dispatch)}
			${resultView(model, dispatch)}
		</main>
	`
}

function formView(model, dispatch) {
	return html`
		<section class="form">
			<h2>Qui est tu ?</h2>

			<form onsubmit=${submit}>
				<label for="username">Nom</label>
				<input
					id="username"
					type="text"
					name="username"
					placeholder="Nom d'utilisateur (par exemple : wryk)"
					value="wryk"
				/>

				<label for="instance">Ville</label>
				<input
					id="instance"
					type="text"
					name="instance"
					placeholder="Instance (par exemple : witches.town)"
					value="witches.town"
				/>

				<button type="submit" class="button">Trouve mon familier !</button>
			</form>
		</section>
	`

	function submit(event) {
		event.preventDefault()

		dispatch({
			type: 'SUBMIT',
			payload: formToObject(event.target)
		})
	}
}

function resultView(model, dispatch) {
	const { account, familiar, error } = model

	return html`
		<section class="result">
			<h2>Ton familier !</h2>

			${account
				? familiar
					? successView(model, dispatch)
					: waitingRequestView(model, dispatch)
				: waitingSubmitView(model, dispatch)
			}
		</section>
	`

	function waitingSubmitView(mode, dispatch) {
		return html`
			<div>
				Sans ton nom et ta ville je ne peux rien faire... Cependant, une fois ces informations en ma connaissance je trouverai ton familier magique en un rien de temps. Tu doutes de mon pouvoir ? Tu ne devrais pas petit⋅e effronté⋅e. Ma connaissance de la sorcelerie de l'archimage Internet est excellente !
				Je peux utiliser ce savoir pour trouver ce que tes yeux d'ignorants ne peuvent voir. Je n'attend que toi pour te le prouver.
			</div>
		`
	}

	function waitingRequestView(mode, dispatch) {
		return html`
			<div>
				Patiente en peu, je suis en train de chercher.
			</div>
		`
	}

	function successView(mode, dispatch) {
		return html`
			<div>
				<p>
					Merci pour attente ${model.account.username}@${model.account.instance}. Non je plaisante, tu as été bluffé par ma sorcellerie !
					Bon, peu importe, je te présente ${model.familiar.name}, ton familier.
				</p>
				<div class="familiar">
					<header>
						<span class="familiar-name">${model.familiar.name}</span>
						<span class="familiar-emoji">${model.familiar.emoji}</span>
					</header>
					<p>
						C'est un⋅e ${model.familiar.race} !
						<br>
						${model.familiar.description}
					</p>
				</div>

			</div>
		`
	}
}
