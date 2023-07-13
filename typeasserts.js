/**
 * @param {any} settings
 * @returns {settings is import("./types/fusam").FUSAMSettings}
 */
export function isSettingsV1(settings) {
	return "enabledDistributions" in settings
}
