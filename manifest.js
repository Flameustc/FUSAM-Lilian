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

/**
 * @typedef {'cheats' | 'enhancements' | 'expansion' | 'automation'} Tag
 */

/**
 * @typedef {Object} Manifest
 * @property {string} version - Version of the manifest
 * @property {ManifestEntry[]} addons - List of available addons
 */

/**
 * @typedef {Object} ManifestEntry
 * @property {string} id - Short name of the addon, alphanumeric, no spaces
 * @property {string} name - Full name of the addon
 * @property {string} description - Short description of the addon
 * @property {string} author - Name of the addon author
 * @property {string} [repository] - URL of the addon repository
 * @property {Tag[]} tags - Tags of the addon
 * @property {'eval' | 'module' | 'script'} type - Type of the addon
 * @property {string} [website] - URL of the addon website
 * @property {ManifestVersion[]} versions - Version of the addon
 */

/**
 * @typedef {Object} ManifestVersion
 * @property {'stable' | 'beta' | 'dev'} distribution - URL of the addon distribution
 * @property {string} source - URL of the addon source entrypoint or eval source
 */

/** @type Manifest */
let manifest = {
	version: "",
	addons: [],
}

export async function updateManifest() {
	const response = await fetch(
		"https://sidiousious.gitlab.io/bc-addon-loader/manifest.json?v=" +
			Date.now()
	)
	manifest = /** @type {Manifest} */ (await response.json())
}

export async function getManifest() {
	if (manifest.version === "") await updateManifest()
	return manifest
}

export function getAddon(id) {
	return manifest.addons.find((addon) => addon.id === id)
}

export function getAddonVersion(id, distribution) {
	const addon = getAddon(id)
	if (!addon) return null
	return addon.versions.find((version) => version.distribution === distribution)
}
