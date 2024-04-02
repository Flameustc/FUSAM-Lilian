/**
 *     FUSAM
 *  Copyright (C) 2023  Sid
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { BaseURL } from "./config.js"
import { canDebug, generateDebugReport } from "./debug.js"
import { waitFor } from "./delay.js"
import { loadAddons } from "./loader.js"
import {
	disableMod as disableLocal,
	enableMod as enableLocal,
	distribution as localDistribution,
} from "./localstore.js"
import { getManifest } from "./manifest.js"
import {
	disableMod as disableOnline,
	enableMod as enableOnline,
	distribution as onlineDistribution,
	playerSettingsLoaded,
} from "./playerstore.js"
import { HOOK_PRIORITY, SDK } from "./vendor/bcmodsdk.js"
import { render, signal } from "./vendor/reef.js"

const showButtonId = "fusam-show-button"
const addonManagerId = "fusam-addon-manager-container"
const addonManagerCloseButtonId = "fusam-addon-manager-close"

function showButton(args, next) {
	const button = document.createElement("button")
	button.id = showButtonId
	button.classList.add("button", "fusam")
	button.innerText = "Addon Manager"
	button.onclick = showAddonManager
	button.style.position = "absolute"
	document.body.appendChild(button)
	return next(args)
}

function hideButton(args, next) {
	document.getElementById(showButtonId)?.remove()
	return next(args)
}

async function showAddonManager() {
	const manager = document.createElement("div")
	manager.id = addonManagerId
	manager.classList.add("fusam")
	document.body.appendChild(manager)

	manager.textContent = "Loading..."

	await drawAddonManager()

	await waitFor(() => !!document.getElementById(addonManagerCloseButtonId))
	document.getElementById(addonManagerCloseButtonId).onclick = hideAddonManager

	registerEventListeners()
}

function drawHideButton() {
	return `<button id="${addonManagerCloseButtonId}" class="button">SAVE</button>`
}

/**
 * @param {MouseEvent} e
 */
function debugReport(e) {
	e?.preventDefault()
	const addon = this.getAttribute("data-addon")
	console.debug("Generating debug report for", addon)
	generateDebugReport(addon)
}

async function drawAddonManager() {
	const manifest = await getManifest()

	const s = /** @type {{ manifest: import("./manifest").Manifest }} */ (
		signal({
			manifest,
		})
	)

	render(`#${addonManagerId}`, draw(), { debugReport })

	function draw() {
		return `
			<div id="fusam-addon-manager-header">
				${drawHideButton()}
				<h1>Addon Manager</h1>
				<button onclick="debugReport()" class="button">Debug</button>
			</div>
			<div id="fusam-addon-manager-body">
				<p>
					A note on security: while addons that are found to be malicious
					will be removed from the Addon Manager, it is still possible for
					some to slip through the cracks.
				</p>
				${
					GameVersion.toLowerCase().includes("beta")
						? `<p class="warn">
							Beta versions of the club are generally not supported
							by addons and may cause unexpected behavior, including
							data loss. Use at your own risk.
						</p>`
						: ""
				}
				${s.manifest.addons
					.map((entry) => drawEntry(entry))
					.join("&bullet; &bullet; &bullet;")}
			</div>
		`
	}

	/**
	 * @param {import("./manifest").ManifestEntry} entry
	 */
	function drawEntry(entry) {
		const local = localDistribution(entry.id)
		const online = onlineDistribution(entry.id)
		const debuggable = canDebug(entry.id)

		return `
			<div class="fusam-addon-entry">
				<div>
					<h2>${entry.name}</h2>
					<span class="fusam-addon-entry-author">by ${entry.author}</span>
					<div class="fusam-addon-entry-description">
						<span>${entry.description}</span>
						${
							entry.website
								? `&bullet; <a rel="external" target="_blank" href="${entry.website}">website</a>`
								: ""
						}
						${
							entry.repository
								? `&bullet; <a rel="external" target="_blank" href="${entry.repository}">repository</a>`
								: ""
						}
						${
							debuggable
								? `&bullet; <a href="#" onclick="debugReport()" data-addon="${entry.id}">download debug report</a>`
								: ""
						}
					</div>
				</div>
				<div class="fusam-addon-entry-buttons">
					<div class="fusam-addon-entry-version-device">
						<h3>Device</h3>
						<select id="${entry.id}-device" data-addon="${entry.id}">
							<option value="none">None</option>
							${entry.versions.map((version) =>
								drawVersionOption(version, local === version.distribution)
							)}
						</select>
					</div>
					<div class="fusam-addon-entry-version-account">
						<h3>Account</h3>
						<select id="${entry.id}-account" data-addon="${entry.id}" ${
			!playerSettingsLoaded() ? "disabled" : ""
		}>
							<option value="none">None</option>
							${entry.versions.map((version) =>
								drawVersionOption(version, online === version.distribution)
							)}
						</select>
					</div>
				</div>
			</div>
		`
	}

	/**
	 * @param {import("./manifest").ManifestVersion} version
	 * @param {boolean} selected
	 */
	function drawVersionOption(version, selected) {
		return `
			<option value="${version.distribution}" ${selected ? "#selected" : ""}>${
			version.distribution
		}</option>
		`
	}
}

function registerEventListeners() {
	document.querySelectorAll(".fusam-addon-entry-version-device select").forEach(
		/**
		 * @param {HTMLSelectElement} select
		 */
		(select) => {
			const addon = select.getAttribute("data-addon")
			select.onchange = () => {
				const distribution = select.value
				if (distribution === "none") {
					disableLocal(addon)
				} else {
					enableLocal(addon, distribution)
				}
			}
		}
	)

	document
		.querySelectorAll(".fusam-addon-entry-version-account select")
		.forEach(
			/**
			 * @param {HTMLSelectElement} select
			 */
			(select) => {
				const addon = select.getAttribute("data-addon")
				select.onchange = () => {
					const distribution = select.value
					if (distribution === "none") {
						disableOnline(addon)
					} else {
						enableOnline(addon, distribution)
					}
				}
			}
		)
}

function hideAddonManager() {
	document.getElementById(addonManagerId).remove()
	if (playerSettingsLoaded()) {
		ServerAccountUpdate.QueueData({
			OnlineSettings: Player.OnlineSettings,
		})
	}
	loadAddons()
}

function loadCSS() {
	const stylesheet = document.createElement("link")
	stylesheet.setAttribute("rel", "stylesheet")
	stylesheet.setAttribute("href", BaseURL + "static/fusam.css")
	document.head.appendChild(stylesheet)
}

export function hookUI() {
	loadCSS()

	SDK.hookFunction("LoginLoad", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("PreferenceLoad", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("LoginDoLogin", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
	SDK.hookFunction("LoginResponse", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
	SDK.hookFunction("PreferenceExit", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
	SDK.hookFunction("DisclaimerLoad", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)

	if (CurrentScreen === "Preference" || CurrentScreen === "Login") {
		showButton(null, () => void 0)
	}
}

let disabledUntil = 0

/**
 * @param {import("./types/fusam.js").ModalOptions} opts
 */
export function showModal(opts) {
	disabledUntil = Date.now() + 500
	const modal = document.createElement("dialog")
	modal.style.zIndex = "1001"
	modal.style.display = "flex"
	modal.style.flexDirection = "column"
	modal.style.width = "50em"
	modal.style.fontFamily = "Arial, Helvetica, sans-serif"
	modal.open = true

	const prompt = document.createElement("div")
	if (typeof opts.prompt === "string") {
		prompt.textContent = opts.prompt
	} else {
		prompt.append(opts.prompt)
	}
	modal.append(prompt)
	document.body.append(modal)

	let inputValue = ""

	if (opts.input) {
		const input = document.createElement(opts.input.type)
		switch (opts.input.type) {
			case "input":
				{
					const el = /** @type {HTMLInputElement} */ (input)
					el.type = "text"
				}
				break
			case "textarea":
				{
					const el = /** @type {HTMLTextAreaElement} */ (input)
					el.rows = 10
				}
				break
			default:
				// This should never happen
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				throw new Error(`invalid input type ${opts.input.type}`)
		}
		input.style.width = "100%"
		input.readOnly = opts.input.readonly
		input.addEventListener("mouseover", () => {
			input.select()
		})
		input.addEventListener("focus", () => {
			input.select()
		})
		input.addEventListener("change", () => {
			inputValue = input.value
		})

		input.addEventListener("keydown", (e) => {
			// MBCHC compatibility: prevent chatroom keydown events from triggering at document level
			e.stopPropagation()
		})

		input.value = opts.input.initial
		modal.append(input)
	}

	const buttonContainer = document.createElement("div")
	buttonContainer.style.display = "flex"
	buttonContainer.style.flexDirection = "row"
	buttonContainer.style.justifyContent = "space-between"
	buttonContainer.style.marginTop = "1em"
	buttonContainer.style.width = "100%"
	modal.append(buttonContainer)

	const submit = document.createElement("button")
	submit.textContent = opts.buttons?.submit || "Submit"
	submit.addEventListener("click", () => {
		close("submit")
	})

	const buttons = [submit]
	for (const [k, v] of Object.entries(opts.buttons ?? {})) {
		if (k !== "submit") {
			const button = document.createElement("button")
			button.textContent = v
			button.addEventListener("click", () => {
				close(k)
			})
			buttons.push(button)
		}
	}

	for (const button of buttons) {
		button.style.padding = "0.5em"
		button.style.flexGrow = "1"
	}

	buttonContainer.append(...buttons)

	modal.addEventListener("click", (e) => {
		e.stopPropagation()
	})
	/**
	 * @param {KeyboardEvent} e
	 */
	const keyClick = (e) => {
		e.stopPropagation()
		if (e.key === "Escape") {
			close()
		}
	}
	document.addEventListener("keydown", keyClick)

	// Click-blocker
	const blocker = document.createElement("div")
	blocker.style.position = "fixed"
	blocker.style.top = "0"
	blocker.style.left = "0"
	blocker.style.width = "100vw"
	blocker.style.height = "100vh"
	blocker.style.zIndex = "1000"
	blocker.style.backgroundColor = "rgba(0, 0, 0, 0.9)"
	blocker.title = "Click to close the modal"
	blocker.addEventListener("click", () => {
		close()
	})
	blocker.addEventListener("focus", () => {
		close()
	})
	document.body.append(blocker)

	/**
	 * @param {string} action
	 */
	function close(action = "close") {
		if (Date.now() < disabledUntil) {
			return
		}
		disabledUntil = Date.now() + 500
		modal.close()
		modal.remove()
		blocker.remove()
		document.removeEventListener("keydown", keyClick)
		opts.callback(action, inputValue)
	}
}

/**
 * @param {Omit<import("./types/fusam.js").ModalOptions, "callback">} opts
 * @returns {Promise<[string, string | null]>}
 */
export function showAsyncModal(opts) {
	return new Promise((resolve) => {
		showModal({
			...opts,
			callback: (action, inputValue) => {
				resolve([action, inputValue ?? null])
			},
		})
	})
}
