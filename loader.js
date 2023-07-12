import { waitFor } from "./delay.js"
import { get as getLocal } from "./localstore.js"
import { getAddon, getAddonVersion, updateManifest } from "./manifest.js"
import { playerSettingsLoaded } from "./playerstore.js"
import { get } from "./settings.js"

export async function loadAddons() {
	await updateManifest()

	// Skip loading device addons if the player is already logged in
	if (!playerSettingsLoaded()) {
		const addons = getLocal()
		await load(addons)
	}

	await waitFor(() => playerSettingsLoaded())
	const addons = get()
	await load(addons)
}

/**
 * @param {Record<string, string>} settings
 */
async function load(settings) {
	for (const [id, distribution] of Object.entries(settings)) {
		if (id in window.BCAM.addons) continue

		window.BCAM.addons[id] = {
			distribution,
			status: "loading",
		}

		const addon = getAddon(id)
		const version = getAddonVersion(id, distribution)
		if (!version) {
			console.warn(`Addon ${id} or its distribution ${distribution} not found`)
			window.BCAM.addons[id].status = "error"
			continue
		}
		console.debug(`Loading addon ${id} from ${distribution}`)
		try {
			const onload = () => {
				window.BCAM.addons[id].status = "loaded"
			}
			const onerror = () => {
				window.BCAM.addons[id].status = "error"
			}
			switch (addon.type) {
				case "eval":
					await evalAddon(version.source)
					window.BCAM.addons[id].status = "loaded"
					break
				case "module":
					scriptAddon(version.source, "module", onload, onerror)
					break
				case "script":
					scriptAddon(version.source, "text/javascript", onload, onerror)
					break
			}
		} catch (e) {
			console.error(`Failed to load addon ${id}`, e)
			window.BCAM.addons[id].status = "error"
			continue
		}
	}
}

/**
 * @param {string} source URL of the script
 * @param {'module' | 'text/javascript'} type Type of the script
 * @param {() => void} [onload] Callback when the script is loaded
 * @param {() => void} [onerror] Callback when the script fails to load
 */
function scriptAddon(source, type, onload, onerror) {
	const script = document.createElement("script")
	script.type = type
	script.src = `${source}?v=${Date.now()}`
	script.onload = onload
	script.onerror = onerror
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
