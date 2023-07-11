/**
 *     BCAM
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

import { waitFor } from "./delay.js"
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
import { component, store } from "./vendor/reef.js"

const showButtonId = "bcam-show-button"
const addonManagerId = "bcam-addon-manager-container"
const addonManagerCloseButtonId = "bcam-addon-manager-close"

function showButton(args, next) {
	const button = document.createElement("button")
	button.id = showButtonId
	button.className = "button"
	button.innerText = "Addon Manager"
	button.onclick = showAddonManager
	button.style.position = "absolute"
	document.body.appendChild(button)
	return next(args)
}

function hideButton(args, next) {
	document.getElementById(showButtonId).remove()
	return next(args)
}

async function showAddonManager() {
	const manager = document.createElement("div")
	manager.id = addonManagerId
	document.body.appendChild(manager)

	manager.textContent = "Loading..."

	await drawAddonManager()

	await waitFor(() => !!document.getElementById(addonManagerCloseButtonId))
	document.getElementById(addonManagerCloseButtonId).onclick = hideAddonManager

	registerEventListeners()
}

function drawHideButton() {
	return `<button id="${addonManagerCloseButtonId}" class="button">X</button>`
}

async function drawAddonManager() {
	const manifest = await getManifest()

	const s = /** @type {{ manifest: import("./manifest").Manifest }} */ (
		store({
			manifest,
		})
	)

	component(`#${addonManagerId}`, draw)

	function draw() {
		return `
			<div id="bcam-addon-manager-header">
				${drawHideButton()}
				<h1>Addon Manager</h1>
				<div>&nbsp;</div>
			</div>
			<div id="bcam-addon-manager-body">
				<p>
					Device addons are stored locally on your device. Account
					addons are stored on the server and will be available on
					any device you log into. You can enable both device and
					account addons at the same time. If you have the same addon
					enabled for both device and account, the device addon will
					take priority. Account options are only available if you
					are logged in.
				</p>
				<p>
					A note on security: while addons that are found to be malicious
					will be removed from the Addon Manager, it is still possible for
					some to slip through the cracks.
				</p>
				<p>
					Changes made to your addons will not take effect until you
					restart the game by refreshing the page. Please close the
					Addon Manager and settings menus before refreshing to allow
					changes to be saved.
				</p>
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

		return `
			<div class="bcam-addon-entry">
				<div>
					<h2>${entry.name}</h2>
					<span class="bcam-addon-entry-author">by ${entry.author}</span>
					<div class="bcam-addon-entry-description">
						<span>${entry.description}</span>
						${entry.website ? `&bullet; <a href="${entry.website}">website</a>` : ""}
						${
							entry.repository
								? `&bullet; <a href="${entry.repository}">repository</a>`
								: ""
						}
					</div>
				</div>
				<div class="bcam-addon-entry-buttons">
					<div class="bcam-addon-entry-version-device">
						<h3>Device</h3>
						<select id="${entry.id}-device" data-addon="${entry.id}">
							<option value="none">None</option>
							${entry.versions.map((version) =>
								drawVersionOption(version, local === version.distribution)
							)}
						</select>
					</div>
					<div class="bcam-addon-entry-version-account">
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
	document.querySelectorAll(".bcam-addon-entry-version-device select").forEach(
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

	document.querySelectorAll(".bcam-addon-entry-version-account select").forEach(
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
}

function loadCSS() {
	const stylesheet = document.createElement("link")
	stylesheet.setAttribute("rel", "stylesheet")
	stylesheet.setAttribute(
		"href",
		"https://sidiousious.gitlab.io/bc-addon-loader/static/bcam.css"
	)
	document.head.appendChild(stylesheet)
}

export function hookUI() {
	loadCSS()

	SDK.hookFunction("LoginLoad", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("PreferenceLoad", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("LoginDoLogin", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
	SDK.hookFunction("PreferenceExit", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)

	if (CurrentScreen === "Preference" || CurrentScreen === "Login") {
		showButton(null, () => void 0)
	}
}
