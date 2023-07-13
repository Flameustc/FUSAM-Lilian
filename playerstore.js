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
import { isSettingsV1 } from "./typeasserts.js"

let loaded = false
/** @type {import("./types/bcam").BCAMSettings} */
let settings = {
	enabledDistributions: {},
}

export function playerSettingsLoaded() {
	return loaded
}

export function get() {
	if (!Player?.OnlineSettings?.BCAMSettings) {
		return {
			enabledDistributions: {},
		}
	}
	const s =
		/** @type {import("./types/bcam").BCAMSettings | Record<string, string>} */ (
			JSON.parse(
				LZString.decompressFromBase64(Player.OnlineSettings?.BCAMSettings)
			)
		)
	// Migration from initial version
	if (isSettingsV1(s)) {
		return s
	}
	return {
		enabledDistributions: s || {},
	}
}

function set(value) {
	Player.OnlineSettings.BCAMSettings = LZString.compressToBase64(
		JSON.stringify(value)
	)
}

export function enableMod(id, distribution) {
	settings.enabledDistributions[id] = distribution
	save()
}

export function disableMod(id) {
	delete settings.enabledDistributions[id]
	save()
}

export function distribution(id) {
	return settings.enabledDistributions[id]
}

function save() {
	console.debug("Saving account settings", settings)
	set(settings)
}

;(async function () {
	await waitFor(() => !!Player?.OnlineSettings)
	settings = get()
	loaded = true
	console.debug("Loaded account settings", settings)
})()
