import { bcModSdk } from "./vendor/bcmodsdk"

/**
 * @type {Map<string, () => string | Promise<string>>}
 */
const debugMethods = new Map()

/**
 * @param {string} name
 * @param {() => string | Promise<string>} callback
 */
export function registerDebugMethod(name, callback) {
	debugMethods.set(name, callback)
}

/**
 * @param {string} [addon]
 */
export async function generateDebugReport(addon) {
	const now = Date.now()
	if (addon) {
		if (debugMethods.has(addon)) {
			const debugBlob = await getValue(debugMethods.get(addon)())
			saveBlobAsFile(new Blob([debugBlob]), filename(addon, now))
			return
		}
		console.warn(`Addon ${addon} not found`)
		return
	}

	for (const [name, method] of debugMethods) {
		const value = await getValue(method())
		saveBlobAsFile(new Blob([value]), filename(name, now))
	}
}

/**
 * @param {string} addon
 */
export function canDebug(addon) {
	return debugMethods.has(addon)
}

async function getValue(value) {
	if (value instanceof Promise) {
		return await value
	}
	return value
}

function saveBlobAsFile(blob, filename) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export function registerFUSAMDebugMethod() {
	registerDebugMethod("FUSAM", () => {
		let d = `Version: LOCAL_FUSAM\n`
		d += `Browser: ${navigator.userAgent}\n`
		d += `Local storage: ${
			isLocalStorageAvailable() ? "available" : "unavailable"
		}\n`
		d += `Domain used: ${window.location.host}\n`
		d += `FUSAM-enabled addons:\n - ${Object.entries(window.FUSAM.addons)
			.map(([addon, ver]) => `${addon}:${JSON.stringify(ver)}`)
			.join("\n - ")}\n`
		d += `SDK-enabled addons:\n - ${bcModSdk
			.getModsInfo()
			.map((m) => `${m.name} @ ${m.version}`)
			.join("\n- ")}`
		return d
	})
}

function isLocalStorageAvailable() {
	var test = "fusam_test"
	try {
		localStorage.setItem(test, test)
		const val = localStorage.getItem(test)
		localStorage.removeItem(test)
		return test === val
	} catch (e) {
		return false
	}
}

/**
 * @param {string} addon
 * @param {number} now
 */
function filename(addon, now) {
	return `FUSAM-debug-${addon}-${now}.txt`
}
