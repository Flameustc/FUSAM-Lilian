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

let loaded = false
let settings = {}

export function playerSettingsLoaded() {
	return loaded
}

export function get() {
	if (!Player?.OnlineSettings?.BCAMSettings) {
		return {}
	}
	return /** @type {Record<string, string>} */ (
		JSON.parse(
			LZString.decompressFromBase64(Player.OnlineSettings?.BCAMSettings)
		)
	)
}

function set(value) {
	Player.OnlineSettings.BCAMSettings = LZString.compressToBase64(
		JSON.stringify(value)
	)
	// TODO: save to server, rate limiting
}

export function enableMod(id, distribution) {
	settings[id] = distribution
	save()
}

export function disableMod(id) {
	delete settings[id]
	save()
}

export function distribution(id) {
	return settings[id]
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
