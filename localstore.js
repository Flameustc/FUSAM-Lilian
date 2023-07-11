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

const storageKey = "bcam.settings"

export function get() {
	return /** @type {Record<string, string>} */ (
		JSON.parse(window.localStorage.getItem(storageKey))
	)
}

function set(value) {
	window.localStorage.setItem(storageKey, JSON.stringify(value))
}

const settings = get() || {}

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
	console.debug("Saving local settings", settings)
	set(settings)
}
