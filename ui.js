/**
 *     BCAM Loader
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

import { getManifest, updateManifest } from "./manifest"
import { HOOK_PRIORITY, SDK } from "./vendor/bcmodsdk"
import { component, store } from "./vendor/reef"

const showButtonId = "bcam-show-button"
const addonManagerId = "bcam-addon-manager-container"

function showButton() {
	const button = document.createElement("button")
	button.id = showButtonId
	button.innerText = "Addon Manager"
	button.onclick = showAddonManager
	button.style.position = "absolute"
	document.appendChild(button)
}

function hideButton() {
	document.getElementById(showButtonId).remove()
}

async function showAddonManager() {
	const manager = document.createElement("div")
	manager.id = addonManagerId
	manager.style.position = "absolute"
	manager.style.width = "100%"
	manager.style.height = "100%"
	manager.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
	document.appendChild(manager)

	manager.textContent = "Loading..."

	await updateManifest()
	drawAddonManager()
}

function drawAddonManager() {
	const manifest = getManifest()

	const s = /** @type {{ manifest: import("./manifest").Manifest }} */ (
		store({
			manifest,
		})
	)

	component(`#${addonManagerId}`, draw)

	function draw() {
		return `
			<div id="bcam-addon-manager">
				<div id="bcam-addon-manager-header">
					<h1>Addon Manager</h1>
					<button id="bcam-addon-manager-close">X</button>
				</div>
				<div id="bcam-addon-manager-body">
					<li>
						${s.manifest.addons.map((addon) => {
							return `
											<div>
												<h2>${addon.name}</h2>
												<p>${addon.description}</p>
											</div>
										`
						})}
					</li>
				</div>
			</div>
		`
	}
}

function hideAddonManager() {
	document.getElementById(addonManagerId).remove()
}

export function hookUI() {
	SDK.hookFunction("LoginLoad", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("PreferenceLoad", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
	SDK.hookFunction("LoginExit", HOOK_PRIORITY.ADD_BEHAVIOR, showButton)
	SDK.hookFunction("PreferenceExit", HOOK_PRIORITY.ADD_BEHAVIOR, hideButton)
}
