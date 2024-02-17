import { waitFor } from "./delay.js"
import { get as getLocal } from "./localstore.js"
import { getAddon, getAddonVersion, updateManifest } from "./manifest.js"
import { playerSettingsLoaded } from "./playerstore.js"
import { get } from "./settings.js"
import { showAsyncModal } from "./ui.js"

let skipLoading = false
let firstLoad = true

const lastSessionStatusKey = "fusam.lastSessionStatus"
const lastErrorKey = "fusam.lastError"
const lastSessionHadError =
	localStorage?.getItem?.(lastSessionStatusKey) === "error" || false
setLastSessionStatus("ok")

window.addEventListener("error", (event) => {
	console.error("Uncaught error", event)
	setLastError(
		JSON.stringify({
			message: event.message,
			file: event.filename,
			line: event.lineno,
		})
	)
})

function setLastSessionStatus(status) {
	localStorage?.setItem?.(lastSessionStatusKey, status)
}

function setLastError(error) {
	localStorage?.setItem?.(lastErrorKey, error)
	setLastSessionStatus("error")
}

export function getLastError() {
	return localStorage?.getItem?.(lastErrorKey)
}

export async function loadAddons() {
	if (skipLoading) return
	if (lastSessionHadError && firstLoad) {
		firstLoad = false
		const lastError = localStorage?.getItem?.(lastErrorKey)
		console.warn("The previous session had an error", lastError)
		const [answer] = await showAsyncModal({
			prompt:
				"The previous session had an error. Do you want to skip loading addons?",
			buttons: {
				submit: "Yes",
				cancel: "No",
			},
		})
		if (answer === "submit") {
			skipLoading = true
			return
		}
	}
	firstLoad = false
	await updateManifest()

	// Skip loading device addons if the player is already logged in
	if (!playerSettingsLoaded()) {
		const addons = getLocal()
		await load(addons.enabledDistributions)
	}

	await waitFor(() => playerSettingsLoaded())
	const addons = get()
	await load(addons.enabledDistributions)
}

/**
 * @param {Record<string, string>} settings
 */
async function load(settings) {
	for (const [id, distribution] of Object.entries(settings)) {
		if (id in window.FUSAM.addons) continue

		window.FUSAM.addons[id] = {
			distribution,
			status: "loading",
		}

		const addon = getAddon(id)
		const version = getAddonVersion(id, distribution)
		if (!version) {
			console.warn(`Addon ${id} or its distribution ${distribution} not found`)
			window.FUSAM.addons[id].status = "error"
			continue
		}
		console.debug(`Loading addon ${id} from ${distribution}`)
		try {
			const onload = () => {
				window.FUSAM.addons[id].status = "loaded"
			}
			const onerror = () => {
				window.FUSAM.addons[id].status = "error"
				setLastError(`Failed to load addon ${id}`)
			}
			switch (addon.type) {
				case "eval":
					await evalAddon(version.source)
					window.FUSAM.addons[id].status = "loaded"
					break
				case "module":
					await import(`${version.source}?v=${Date.now()}`)
					window.FUSAM.addons[id].status = "loaded"
					break
				case "script":
					scriptAddon(version.source, "text/javascript", onload, onerror)
					break
			}
		} catch (e) {
			console.error(`Failed to load addon ${id}`, e)
			window.FUSAM.addons[id].status = "error"
			setLastError(`Failed to load addon ${id}: ${e}`)
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
	script.crossOrigin = "anonymous"
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
