import { waitFor } from "./delay.js"
import { get as getLocal } from "./localstore.js"
import { getAddon, getAddonVersion, updateManifest } from "./manifest.js"
import { playerSettingsLoaded } from "./playerstore.js"
import { get } from "./settings.js"

export async function loadAddons() {
	await updateManifest()

	// Skip loading device addons if the player is already logged in
	if (!playerSettingsLoaded()) {
		load(getLocal())
	}

	await waitFor(() => playerSettingsLoaded())
	load(get())
}

/**
 * @param {Record<string, string>} settings
 */
async function load(settings) {
	for (const [id, distribution] of Object.entries(settings)) {
		const addon = getAddon(id)
		const version = getAddonVersion(id, distribution)
		if (!version) {
			console.warn(`Addon ${id} or its distribution ${distribution} not found`)
			continue
		}
		console.debug(`Loading addon ${id} from ${distribution}`)
		switch (addon.type) {
			case "eval":
				await evalAddon(version.source)
				break
			case "module":
				scriptAddon(version.source, "module")
				break
			case "script":
				scriptAddon(version.source, "text/javascript")
				break
		}
	}
}

function scriptAddon(source, type) {
	const script = document.createElement("script")
	script.type = type
	script.src = `${source}?v=${Date.now()}`
	document.head.appendChild(script)
}

async function evalAddon(source) {
	const sourceRequestUrl = `${source}?v=${Date.now()}`
	await fetch(sourceRequestUrl)
		.then((resp) => resp.text())
		.then((resp) => {
			resp = resp.replace(
				/sourceMappingURL=.*?.map/u,
				`sourceMappingURL=${source}.map`
			)
			eval?.(resp)
		})
}
